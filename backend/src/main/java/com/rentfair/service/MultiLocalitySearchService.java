package com.rentfair.service;

import com.rentfair.client.SerpApiClient;
import com.rentfair.client.dto.SerpApiResponse;
import com.rentfair.dto.*;
import com.rentfair.exception.InvalidSearchParameterException;
import com.rentfair.model.RentalListingEntity;
import com.rentfair.model.SearchQueryEntity;
import com.rentfair.repository.RentalListingRepository;
import com.rentfair.repository.SearchQueryRepository;
import com.rentfair.util.RentalQueryBuilder;
import com.rentfair.util.SerpApiResultParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MultiLocalitySearchService {

    private static final Logger log = LoggerFactory.getLogger(MultiLocalitySearchService.class);

    private final SerpApiClient serpApiClient;
    private final RentalQueryBuilder queryBuilder;
    private final SerpApiResultParser resultParser;
    private final SearchQueryRepository searchQueryRepository;
    private final RentalListingRepository rentalListingRepository;
    private final MarketComparisonService marketComparisonService;

    public MultiLocalitySearchService(SerpApiClient serpApiClient,
                                      RentalQueryBuilder queryBuilder,
                                      SerpApiResultParser resultParser,
                                      SearchQueryRepository searchQueryRepository,
                                      RentalListingRepository rentalListingRepository,
                                      MarketComparisonService marketComparisonService) {
        this.serpApiClient = serpApiClient;
        this.queryBuilder = queryBuilder;
        this.resultParser = resultParser;
        this.searchQueryRepository = searchQueryRepository;
        this.rentalListingRepository = rentalListingRepository;
        this.marketComparisonService = marketComparisonService;
    }

    /**
     * Executes live SerpApi searches across 2 to 5 locations, parses and normalizes
     * listings using existing components, and delegates market statistics computation
     * to MarketComparisonService.
     */
    public LocationComparisonResponse compareLocations(LocationComparisonRequest request) {
        if (request == null || request.getLocations() == null) {
            throw new InvalidSearchParameterException("Locations list must be provided.");
        }

        List<String> validLocations = request.getLocations().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .toList();

        if (validLocations.size() < 2 || validLocations.size() > 5) {
            throw new InvalidSearchParameterException(
                    "Cross-locality comparison requires between 2 and 5 distinct locations. Provided: " + validLocations.size()
            );
        }

        Map<String, List<RentalListingDto>> localityDatasets = new LinkedHashMap<>();

        String bhkStr = request.getBhk() != null ? String.valueOf(request.getBhk()) : "all";
        String propertyType = request.getPropertyType() != null ? request.getPropertyType() : "all";
        String furnishing = request.getFurnishing() != null ? request.getFurnishing() : "all";

        for (String location : validLocations) {
            RentalSearchRequest searchRequest = new RentalSearchRequest(
                    location,
                    bhkStr,
                    propertyType,
                    null,
                    null,
                    request.getMinArea(),
                    request.getMaxArea(),
                    furnishing,
                    "fairness"
            );

            String query = queryBuilder.buildQuery(searchRequest);
            log.info("Executing cross-locality search for '{}' with query '{}'", location, query);

            List<RentalListingDto> listings = Collections.emptyList();
            try {
                // 1. Dispatch to real SerpApi endpoint
                SerpApiResponse serpResponse = serpApiClient.search(query);

                // 2. Parse, normalize, and deduplicate with existing parser
                listings = resultParser.parseResults(serpResponse.getOrganicResults(), location, bhkStr);

                // 3. Apply optional area range filters if specified
                if (request.getMinArea() != null || request.getMaxArea() != null) {
                    listings = listings.stream()
                            .filter(item -> {
                                if (request.getMinArea() != null && item.getCarpetAreaSqft() != null && item.getCarpetAreaSqft() < request.getMinArea()) {
                                    return false;
                                }
                                if (request.getMaxArea() != null && item.getCarpetAreaSqft() != null && item.getCarpetAreaSqft() > request.getMaxArea()) {
                                    return false;
                                }
                                return true;
                            })
                            .toList();
                }

                // 4. Record search and persist listings for future baseline calculations
                saveLocalityQueryAndListings(query, searchRequest, listings);

            } catch (Exception e) {
                log.warn("Search failed for locality '{}' during comparison: {}", location, e.getMessage());
            }

            localityDatasets.put(location, listings);
        }

        // 5. Delegate market statistics computation to MarketComparisonService
        return marketComparisonService.buildComparison(request, localityDatasets);
    }

    private void saveLocalityQueryAndListings(String query, RentalSearchRequest request, List<RentalListingDto> listings) {
        try {
            SearchQueryEntity queryLog = new SearchQueryEntity(
                    query,
                    request.getLocation(),
                    request.getBhk(),
                    request.getPropertyType(),
                    request.getMinRent(),
                    request.getMaxRent(),
                    request.getMinArea(),
                    request.getMaxArea(),
                    request.getFurnishing(),
                    listings.size()
            );
            searchQueryRepository.save(queryLog);

            for (RentalListingDto dto : listings) {
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
                entity.setImageUrl(dto.getImageUrl());
                rentalListingRepository.save(entity);
            }
        } catch (Exception e) {
            log.warn("Non-fatal database persistence warning for locality query: {}", e.getMessage());
        }
    }
}
