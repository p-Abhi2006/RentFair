package com.rentfair.controller;

import com.rentfair.dto.RentalListingDto;
import com.rentfair.dto.RentalSearchRequest;
import com.rentfair.exception.InvalidSearchParameterException;
import com.rentfair.service.RentalSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
public class RentalSearchController {

    private final RentalSearchService rentalSearchService;
    private final com.rentfair.repository.RentalListingRepository rentalListingRepository;

    public RentalSearchController(RentalSearchService rentalSearchService,
                                  com.rentfair.repository.RentalListingRepository rentalListingRepository) {
        this.rentalSearchService = rentalSearchService;
        this.rentalListingRepository = rentalListingRepository;
    }

    /**
     * Primary rental search endpoint matching both /api/rentals/search and /api/v1/rentals.
     * Dispatches query to SerpApi, parses organic results, and returns clean DTOs.
     */
    @GetMapping({"/api/rentals/search", "/api/v1/rentals"})
    public ResponseEntity<List<RentalListingDto>> searchRentals(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false, defaultValue = "all") String bhk,
            @RequestParam(required = false, defaultValue = "all") String propertyType,
            @RequestParam(required = false) Integer minRent,
            @RequestParam(required = false) Integer maxRent,
            @RequestParam(required = false) Integer minArea,
            @RequestParam(required = false) Integer maxArea,
            @RequestParam(required = false, defaultValue = "all") String furnishing,
            @RequestParam(required = false, defaultValue = "fairness") String sortBy
    ) {
        String effectiveLocation = (location != null && !location.trim().isEmpty())
                ? location
                : ((locality != null && !locality.trim().isEmpty()) ? locality : "Whitefield, Bangalore");

        // Validate search parameters
        if (minRent != null && minRent < 0) {
            throw new InvalidSearchParameterException("minRent must be a positive number.");
        }
        if (maxRent != null && maxRent < 0) {
            throw new InvalidSearchParameterException("maxRent must be a positive number.");
        }
        if (minRent != null && maxRent != null && minRent > maxRent) {
            throw new InvalidSearchParameterException("minRent cannot be greater than maxRent.");
        }

        RentalSearchRequest request = new RentalSearchRequest(
                effectiveLocation,
                bhk,
                propertyType,
                minRent,
                maxRent,
                minArea,
                maxArea,
                furnishing,
                sortBy
        );

        List<RentalListingDto> results = rentalSearchService.search(request);
        return ResponseEntity.ok(results);
    }

    /**
     * Comparison lookup endpoint for multiple listing IDs
     */
    @GetMapping("/api/v1/rentals/compare")
    public ResponseEntity<List<RentalListingDto>> compareRentals(
            @RequestParam(required = false, defaultValue = "") String ids
    ) {
        if (ids == null || ids.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<String> idList = Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        List<RentalListingDto> matched = rentalListingRepository.findAllById(idList).stream()
                .map(this::mapEntityToDto)
                .toList();

        return ResponseEntity.ok(matched);
    }

    /**
     * Single listing detail lookup
     */
    @GetMapping("/api/v1/rentals/{id}")
    public ResponseEntity<RentalListingDto> getListingById(@PathVariable String id) {
        return rentalListingRepository.findById(id)
                .map(this::mapEntityToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private RentalListingDto mapEntityToDto(com.rentfair.model.RentalListingEntity entity) {
        RentalListingDto dto = new RentalListingDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setSourcePlatform(entity.getSourcePlatform());
        dto.setSourceUrl(entity.getSourceUrl());
        dto.setSnippet(entity.getSnippet());
        dto.setLocality(entity.getLocality());
        dto.setSubLocality(entity.getSubLocality());
        dto.setCity(entity.getCity());
        dto.setRentAmount(entity.getRentAmount());
        dto.setDepositAmount(entity.getDepositAmount());
        dto.setBhk(entity.getBhk());
        dto.setPropertyType(entity.getPropertyType());
        dto.setCarpetAreaSqft(entity.getCarpetAreaSqft());
        dto.setFurnishing(entity.getFurnishing());
        dto.setBathrooms(entity.getBathrooms());
        dto.setPricePerSqft(entity.getPricePerSqft());
        dto.setFairnessScore(entity.getFairnessScore());
        dto.setFairnessCategory(entity.getFairnessCategory());
        dto.setVariancePercentage(entity.getVariancePercentage());
        dto.setConfidenceScore(entity.getConfidenceScore());
        dto.setComparableCount(entity.getComparableCount());
        dto.setFairnessExplanation(entity.getFairnessExplanation());
        dto.setIsStatisticalOutlier(entity.getIsStatisticalOutlier());
        dto.setImageUrl(entity.getImageUrl());
        dto.setIsPlaceholder(false);
        if (entity.getCreatedAt() != null) {
            dto.setScrapedAt(entity.getCreatedAt().toString());
        }
        dto.setRetrievalTimestamp(entity.getRetrievalTimestamp());
        dto.setExtractionStatus(entity.getExtractionStatus());
        dto.setPriceExplicitlyExtracted(entity.getPriceExplicitlyExtracted());
        dto.setAreaExplicitlyExtracted(entity.getAreaExplicitlyExtracted());
        dto.setFairnessAnalysisPerformed(entity.getFairnessAnalysisPerformed());
        return dto;
    }
}
