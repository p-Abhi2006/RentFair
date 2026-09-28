package com.rentfair.controller;

import com.rentfair.dto.MarketBaselineDto;
import com.rentfair.service.MarketBaselineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MarketBaselineController {

    private final MarketBaselineService baselineService;

    public MarketBaselineController(MarketBaselineService baselineService) {
        this.baselineService = baselineService;
    }

    @GetMapping({"/api/v1/market-baseline", "/api/market-baseline"})
    public ResponseEntity<MarketBaselineDto> getMarketBaseline(
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer bhk
    ) {
        String effectiveLocality = (locality != null && !locality.trim().isEmpty())
                ? locality
                : ((location != null && !location.trim().isEmpty()) ? location : "Whitefield, Bangalore");
        MarketBaselineDto baseline = baselineService.getBaseline(effectiveLocality, bhk);
        return ResponseEntity.ok(baseline);
    }
}
