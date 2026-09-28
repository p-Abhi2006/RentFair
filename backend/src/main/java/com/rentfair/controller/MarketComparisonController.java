package com.rentfair.controller;

import com.rentfair.dto.LocationComparisonRequest;
import com.rentfair.dto.LocationComparisonResponse;
import com.rentfair.exception.InvalidSearchParameterException;
import com.rentfair.service.MultiLocalitySearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
public class MarketComparisonController {

    private final MultiLocalitySearchService multiLocalitySearchService;

    public MarketComparisonController(MultiLocalitySearchService multiLocalitySearchService) {
        this.multiLocalitySearchService = multiLocalitySearchService;
    }

    /**
     * Cross-locality market comparison via POST with JSON body.
     */
    @PostMapping({"/api/v1/market-comparison", "/api/market-comparison"})
    public ResponseEntity<LocationComparisonResponse> compareMarketsPost(
            @RequestBody LocationComparisonRequest request
    ) {
        if (request == null) {
            throw new InvalidSearchParameterException("Request body must not be null.");
        }
        LocationComparisonResponse response = multiLocalitySearchService.compareLocations(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Cross-locality market comparison via GET with query parameters.
     */
    @GetMapping({"/api/v1/market-comparison", "/api/market-comparison"})
    public ResponseEntity<LocationComparisonResponse> compareMarketsGet(
            @RequestParam(required = false) String locations,
            @RequestParam(required = false, name = "location") List<String> locationList,
            @RequestParam(required = false, defaultValue = "2") Integer bhk,
            @RequestParam(required = false, defaultValue = "all") String propertyType,
            @RequestParam(required = false, defaultValue = "all") String furnishing,
            @RequestParam(required = false) Integer minArea,
            @RequestParam(required = false) Integer maxArea
    ) {
        List<String> locs;
        if (locations != null && !locations.trim().isEmpty()) {
            locs = Arrays.stream(locations.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        } else if (locationList != null && !locationList.isEmpty()) {
            locs = locationList.stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        } else {
            throw new InvalidSearchParameterException("Locations parameter must be provided.");
        }

        LocationComparisonRequest request = new LocationComparisonRequest(
                locs,
                bhk,
                propertyType,
                furnishing,
                minArea,
                maxArea
        );

        LocationComparisonResponse response = multiLocalitySearchService.compareLocations(request);
        return ResponseEntity.ok(response);
    }
}
