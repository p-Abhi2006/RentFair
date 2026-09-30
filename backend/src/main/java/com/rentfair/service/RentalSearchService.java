package com.rentfair.service;

import com.rentfair.client.SerpApiClient;
import com.rentfair.client.dto.SerpApiResponse;
import com.rentfair.dto.RentalListingDto;
import com.rentfair.dto.RentalSearchRequest;
import com.rentfair.model.RentalListingEntity;
import com.rentfair.model.SearchQueryEntity;
import com.rentfair.repository.RentalListingRepository;
import com.rentfair.repository.SearchQueryRepository;
import com.rentfair.util.RentalQueryBuilder;
import com.rentfair.util.SerpApiResultParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class RentalSearchService {

    private static final Logger log = LoggerFactory.getLogger(RentalSearchService.class);

    private final SerpApiClient serpApiClient;
    private final RentalQueryBuilder queryBuilder;
    private final SerpApiResultParser resultParser;
    private final FairnessEngineService fairnessEngineService;
    private final SearchQueryRepository searchQueryRepository;
    private final RentalListingRepository rentalListingRepository;

    public RentalSearchService(SerpApiClient serpApiClient,
                               RentalQueryBuilder queryBuilder,
                               SerpApiResultParser resultParser,
                               FairnessEngineService fairnessEngineService,
                               SearchQueryRepository searchQueryRepository,
                               RentalListingRepository rentalListingRepository) {
        this.serpApiClient = serpApiClient;
        this.queryBuilder = queryBuilder;
        this.resultParser = resultParser;
        this.fairnessEngineService = fairnessEngineService;
        this.searchQueryRepository = searchQueryRepository;
        this.rentalListingRepository = rentalListingRepository;
    }

    /**
     * Executes real SerpApi search, parses actual organic results, caches identical searches,
     * and returns clean frontend-compatible RentalListingDto items.
     * Cache key includes all location, configuration, post-filtering, and sorting parameters to prevent cross-filter cache collisions.
     */
    @Cacheable(value = "rentalSearches", key = "(#request.location != null && !#request.location.trim().isEmpty() ? #request.location.trim().toLowerCase() : 'blr') + '-' + " +
            "(#request.bhk != null && !#request.bhk.trim().isEmpty() ? #request.bhk.trim().toLowerCase() : 'all') + '-' + " +
            "(#request.propertyType != null && !#request.propertyType.trim().isEmpty() ? #request.propertyType.trim().toLowerCase() : 'all') + '-' + " +
            "(#request.furnishing != null && !#request.furnishing.trim().isEmpty() ? #request.furnishing.trim().toLowerCase() : 'all') + '-' + " +
            "(#request.minRent != null ? #request.minRent : 'none') + '-' + " +
            "(#request.maxRent != null ? #request.maxRent : 'none') + '-' + " +
            "(#request.minArea != null ? #request.minArea : 'none') + '-' + " +
            "(#request.maxArea != null ? #request.maxArea : 'none') + '-' + " +
            "(#request.sortBy != null && !#request.sortBy.trim().isEmpty() ? #request.sortBy.trim().toLowerCase() : 'fairness')")
    public List<RentalListingDto> search(RentalSearchRequest request) {
        String searchQuery = queryBuilder.buildQuery(request);
        log.info("Executing rental search with generated query: '{}'", searchQuery);

        // 1. Dispatch to real SerpApi endpoint
        SerpApiResponse serpResponse = serpApiClient.search(searchQuery);

        // 2. Parse actual Google organic results
        List<RentalListingDto> listings = resultParser.parseResults(
                serpResponse.getOrganicResults(),
                request.getLocation(),
                request.getBhk()
        );

        // 3. Evaluate statistical market fairness and IQR outlier detection across listings
        fairnessEngineService.evaluateAll(listings);

        // 4. Apply post-filters if present
        List<RentalListingDto> filtered = listings.stream()
                .filter(item -> {
                    if (request.getMaxRent() != null && item.getRentAmount() != null && item.getRentAmount() > request.getMaxRent()) {
                        return false;
                    }
                    if (request.getMinRent() != null && item.getRentAmount() != null && item.getRentAmount() < request.getMinRent()) {
                        return false;
                    }
                    if (request.getMinArea() != null && item.getCarpetAreaSqft() != null && item.getCarpetAreaSqft() < request.getMinArea()) {
                        return false;
                    }
                    if (request.getMaxArea() != null && item.getCarpetAreaSqft() != null && item.getCarpetAreaSqft() > request.getMaxArea()) {
                        return false;
                    }
                    return true;
                })
                .sorted(getComparator(request.getSortBy()))
                .toList();

        // 4. Record search query in database for audit and tracking
        try {
            SearchQueryEntity queryLog = new SearchQueryEntity(
                    searchQuery,
                    request.getLocation(),
                    request.getBhk(),
                    request.getPropertyType(),
                    request.getMinRent(),
                    request.getMaxRent(),
                    request.getMinArea(),
                    request.getMaxArea(),
                    request.getFurnishing(),
                    filtered.size()
            );
            searchQueryRepository.save(queryLog);

            // Persist all results to database
            for (RentalListingDto dto : filtered) {
                RentalListingEntity entity = new RentalListingEntity();
                entity.setId(dto.getId());
                entity.setTitle(dto.getTitle());
                entity.setSourcePlatform(dto.getSourcePlatform());
                entity.setSourceUrl(dto.getSourceUrl());
                entity.setSnippet(dto.getSnippet());
                entity.setLocality(dto.getLocality());
                entity.setSubLocality(dto.getSubLocality());
                entity.setCity(dto.getCity());
                entity.setRentAmount(dto.getRentAmount());
                entity.setDepositAmount(dto.getDepositAmount());
                entity.setBhk(dto.getBhk());
                entity.setPropertyType(dto.getPropertyType());
                entity.setCarpetAreaSqft(dto.getCarpetAreaSqft());
                entity.setFurnishing(dto.getFurnishing());
                entity.setBathrooms(dto.getBathrooms());
                entity.setPricePerSqft(dto.getPricePerSqft());
                entity.setFairnessScore(dto.getFairnessScore());
                entity.setFairnessCategory(dto.getFairnessCategory());
                entity.setVariancePercentage(dto.getVariancePercentage());
                entity.setConfidenceScore(dto.getConfidenceScore());
                entity.setComparableCount(dto.getComparableCount());
                entity.setFairnessExplanation(dto.getFairnessExplanation());
                entity.setIsStatisticalOutlier(dto.getIsStatisticalOutlier());
                entity.setImageUrl(dto.getImageUrl());
                entity.setRetrievalTimestamp(dto.getRetrievalTimestamp());
                entity.setExtractionStatus(dto.getExtractionStatus());
                entity.setPriceExplicitlyExtracted(dto.getPriceExplicitlyExtracted());
                entity.setAreaExplicitlyExtracted(dto.getAreaExplicitlyExtracted());
                entity.setFairnessAnalysisPerformed(dto.getFairnessAnalysisPerformed());
                rentalListingRepository.save(entity);
            }
        } catch (Exception e) {
            log.warn("Database record saving failed (non-fatal): {}", e.getMessage());
        }

        return filtered;
    }

    private Comparator<RentalListingDto> getComparator(String sortBy) {
        if ("price_low".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(
                    item -> item.getRentAmount() != null ? item.getRentAmount() : Integer.MAX_VALUE
            );
        }
        if ("price_high".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(
                    (RentalListingDto item) -> item.getRentAmount() != null ? item.getRentAmount() : 0
            ).reversed();
        }
        if ("area_desc".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(
                    (RentalListingDto item) -> item.getCarpetAreaSqft() != null ? item.getCarpetAreaSqft() : 0
            ).reversed();
        }
        if ("variance_asc".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(
                    item -> item.getVariancePercentage() != null ? item.getVariancePercentage() : 0.0
            );
        }
        // Default: highest fairness score first
        return Comparator.comparing(
                (RentalListingDto item) -> item.getFairnessScore() != null ? item.getFairnessScore() : 0
        ).reversed();
    }
}
