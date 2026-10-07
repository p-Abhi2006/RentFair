package com.rentfair.service;

import com.rentfair.dto.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class MarketComparisonService {

    private final FairnessEngineService fairnessEngineService;

    public MarketComparisonService(FairnessEngineService fairnessEngineService) {
        this.fairnessEngineService = fairnessEngineService;
    }

    /**
     * Builds cross-locality comparison using strictly market-level aggregates.
     * Never uses individual listing fairness scores to rank or evaluate localities.
     * Never uses subjective terms like 'cheaper' or 'more expensive' without explicit underlying metrics.
     */
    public LocationComparisonResponse buildComparison(LocationComparisonRequest request,
                                                      Map<String, List<RentalListingDto>> localityDatasets) {
        LocationComparisonResponse response = new LocationComparisonResponse();
        response.setBhk(request.getBhk());
        response.setPropertyType(request.getPropertyType());
        response.setFurnishing(request.getFurnishing());
        response.setMinArea(request.getMinArea());
        response.setMaxArea(request.getMaxArea());
        response.setGeneratedAt(Instant.now().toString());

        List<LocalityMarketStatsDto> localityStatsList = new ArrayList<>();

        for (Map.Entry<String, List<RentalListingDto>> entry : localityDatasets.entrySet()) {
            String locationInput = entry.getKey();
            List<RentalListingDto> rawListings = entry.getValue() != null ? entry.getValue() : Collections.emptyList();

            LocalityMarketStatsDto statsDto = computeLocalityStats(locationInput, rawListings);
            localityStatsList.add(statsDto);
        }

        response.setLocalities(localityStatsList);
        response.setComparisonSummary(generateSummary(localityStatsList));

        return response;
    }

    public LocalityMarketStatsDto computeLocalityStats(String locationInput, List<RentalListingDto> listings) {
        LocalityMarketStatsDto dto = new LocalityMarketStatsDto();

        String locality = cleanLocalityName(locationInput);
        String city = cleanCityName(locationInput);
        if (!listings.isEmpty()) {
            if (listings.get(0).getLocality() != null && !listings.get(0).getLocality().trim().isEmpty()) {
                locality = listings.get(0).getLocality().trim();
            }
            if (listings.get(0).getCity() != null && !listings.get(0).getCity().trim().isEmpty()) {
                String candidateCity = listings.get(0).getCity().trim();
                if (!candidateCity.equalsIgnoreCase(locality)) {
                    city = candidateCity;
                }
            }
        }

        if (city != null && city.equalsIgnoreCase(locality)) {
            city = null;
        }

        dto.setLocality(locality);
        dto.setCity(city);
        dto.setTotalListingCount(listings.size());
        dto.setSourceListingCount(listings.size());

        // 1. Filter valid priced listings
        List<RentalListingDto> validPriced = listings.stream()
                .filter(l -> l.getRentAmount() != null && l.getRentAmount() > 0)
                .toList();

        dto.setValidPricedListingCount(validPriced.size());
        dto.setSampleSize(validPriced.size());

        // 2. Filter listings with valid area
        List<RentalListingDto> withArea = validPriced.stream()
                .filter(l -> l.getCarpetAreaSqft() != null && l.getCarpetAreaSqft() > 0)
                .toList();
        dto.setListingsWithAreaCount(withArea.size());

        dto.setDataTimestamp(Instant.now().toString());

        // 3. Delegate mathematical calculations to shared FairnessEngineService
        FairnessEngineService.BaselineStats stats = fairnessEngineService.computeBaselineStats(validPriced, 1);
        dto.setStatisticalSampleSize(stats.getSampleSize());

        if (stats.getSampleSize() == 0) {
            dto.setMedianRent(null);
            dto.setAverageRent(null);
            dto.setQ1(null);
            dto.setQ3(null);
            dto.setIqr(null);
            dto.setMinTypical(null);
            dto.setMaxTypical(null);
            dto.setMedianPricePerSqft(null);
            dto.setDataQuality("INSUFFICIENT");
            dto.setDataQualityDescription("No valid priced rental listings found in current search results.");
            dto.setSampleListings(Collections.emptyList());
            return dto;
        }

        dto.setMedianRent(stats.getMedianRent());
        dto.setAverageRent(stats.getAverageRent());
        dto.setQ1(stats.getQ1());
        dto.setQ3(stats.getQ3());
        dto.setIqr(stats.getIqr());
        dto.setMinTypical(stats.getMinTypical());
        dto.setMaxTypical(stats.getMaxTypical());

        // Median price per sqft strictly if area data is present
        if (!withArea.isEmpty()) {
            dto.setMedianPricePerSqft(stats.getMedianPricePerSqft());
        } else {
            dto.setMedianPricePerSqft(null);
        }

        // Data quality assessment based strictly on sample size
        int n = stats.getSampleSize();
        if (n >= 10) {
            dto.setDataQuality("ROBUST");
            dto.setDataQualityDescription(String.format(Locale.US, "Robust market sample (%d valid listings)", n));
        } else if (n >= 5) {
            dto.setDataQuality("MODERATE");
            dto.setDataQualityDescription(String.format(Locale.US, "Moderate market sample (%d valid listings)", n));
        } else if (n >= 3) {
            dto.setDataQuality("INDICATIVE");
            dto.setDataQualityDescription(String.format(Locale.US, "Small sample (%d valid listings) - indicative baseline", n));
        } else {
            dto.setDataQuality("LIMITED");
            dto.setDataQualityDescription(String.format(Locale.US, "Limited sample (%d valid listing(s)) - wide variance", n));
        }

        dto.setSampleListings(validPriced);
        return dto;
    }

    public MarketComparisonSummaryDto generateSummary(List<LocalityMarketStatsDto> localities) {
        MarketComparisonSummaryDto summary = new MarketComparisonSummaryDto();
        List<String> observations = new ArrayList<>();

        List<LocalityMarketStatsDto> validMarkets = localities.stream()
                .filter(l -> l.getMedianRent() != null && l.getMedianRent() > 0)
                .toList();

        if (validMarkets.size() < 2) {
            summary.setObservations(List.of("Insufficient priced market data across selected locations to generate comparative spread analysis."));
            return summary;
        }

        // 1. Lowest & Highest Median Monthly Rent with exact metrics
        LocalityMarketStatsDto lowestMedianLoc = validMarkets.stream()
                .min(Comparator.comparingInt(LocalityMarketStatsDto::getMedianRent))
                .orElse(null);

        LocalityMarketStatsDto highestMedianLoc = validMarkets.stream()
                .max(Comparator.comparingInt(LocalityMarketStatsDto::getMedianRent))
                .orElse(null);

        if (lowestMedianLoc != null && highestMedianLoc != null) {
            summary.setLowestMedianRent(new MarketComparisonSummaryDto.MetricLeader(
                    lowestMedianLoc.getLocality(),
                    "Median Monthly Rent",
                    String.format(Locale.US, "\u20B9%,d/mo", lowestMedianLoc.getMedianRent()),
                    lowestMedianLoc.getMedianRent().doubleValue()
            ));

            summary.setHighestMedianRent(new MarketComparisonSummaryDto.MetricLeader(
                    highestMedianLoc.getLocality(),
                    "Median Monthly Rent",
                    String.format(Locale.US, "\u20B9%,d/mo", highestMedianLoc.getMedianRent()),
                    highestMedianLoc.getMedianRent().doubleValue()
            ));

            int spread = highestMedianLoc.getMedianRent() - lowestMedianLoc.getMedianRent();
            summary.setRentSpread(spread);

            double pctDifference = lowestMedianLoc.getMedianRent() > 0
                    ? Math.round(((double) spread / lowestMedianLoc.getMedianRent()) * 1000.0) / 10.0
                    : 0.0;

            String spreadDesc = String.format(Locale.US,
                    "Spread of \u20B9%,d/mo (+%.1f%%) between lowest median (%s at \u20B9%,d/mo) and highest median (%s at \u20B9%,d/mo).",
                    spread, pctDifference, lowestMedianLoc.getLocality(), lowestMedianLoc.getMedianRent(),
                    highestMedianLoc.getLocality(), highestMedianLoc.getMedianRent());
            summary.setRentSpreadDescription(spreadDesc);

            observations.add(String.format(Locale.US,
                    "%s recorded the lowest median rent at \u20B9%,d/mo (sample size: %d listings, IQR: \u20B9%,d/mo).",
                    lowestMedianLoc.getLocality(), lowestMedianLoc.getMedianRent(),
                    lowestMedianLoc.getSampleSize(), lowestMedianLoc.getIqr()));

            observations.add(String.format(Locale.US,
                    "%s recorded the highest median rent at \u20B9%,d/mo (sample size: %d listings, IQR: \u20B9%,d/mo), representing a \u20B9%,d/mo (+%.1f%%) difference compared to %s.",
                    highestMedianLoc.getLocality(), highestMedianLoc.getMedianRent(),
                    highestMedianLoc.getSampleSize(), highestMedianLoc.getIqr(),
                    spread, pctDifference, lowestMedianLoc.getLocality()));
        }

        // 2. Lowest & Highest Price per Sqft with exact metrics (only if area data is present)
        List<LocalityMarketStatsDto> validPpsMarkets = localities.stream()
                .filter(l -> l.getMedianPricePerSqft() != null && l.getMedianPricePerSqft() > 0)
                .toList();

        if (validPpsMarkets.size() >= 2) {
            LocalityMarketStatsDto lowestPpsLoc = validPpsMarkets.stream()
                    .min(Comparator.comparingDouble(LocalityMarketStatsDto::getMedianPricePerSqft))
                    .orElse(null);

            LocalityMarketStatsDto highestPpsLoc = validPpsMarkets.stream()
                    .max(Comparator.comparingDouble(LocalityMarketStatsDto::getMedianPricePerSqft))
                    .orElse(null);

            if (lowestPpsLoc != null && highestPpsLoc != null) {
                summary.setLowestPricePerSqft(new MarketComparisonSummaryDto.MetricLeader(
                        lowestPpsLoc.getLocality(),
                        "Median Rent per Sq Ft",
                        String.format(Locale.US, "\u20B9%.1f/sqft", lowestPpsLoc.getMedianPricePerSqft()),
                        lowestPpsLoc.getMedianPricePerSqft()
                ));

                summary.setHighestPricePerSqft(new MarketComparisonSummaryDto.MetricLeader(
                        highestPpsLoc.getLocality(),
                        "Median Rent per Sq Ft",
                        String.format(Locale.US, "\u20B9%.1f/sqft", highestPpsLoc.getMedianPricePerSqft()),
                        highestPpsLoc.getMedianPricePerSqft()
                ));

                double ppsSpread = Math.round((highestPpsLoc.getMedianPricePerSqft() - lowestPpsLoc.getMedianPricePerSqft()) * 10.0) / 10.0;
                summary.setPricePerSqftSpread(ppsSpread);

                summary.setPricePerSqftSpreadDescription(String.format(Locale.US,
                        "Price density spread of \u20B9%.1f/sqft between %s (\u20B9%.1f/sqft) and %s (\u20B9%.1f/sqft).",
                        ppsSpread, lowestPpsLoc.getLocality(), lowestPpsLoc.getMedianPricePerSqft(),
                        highestPpsLoc.getLocality(), highestPpsLoc.getMedianPricePerSqft()));

                observations.add(String.format(Locale.US,
                        "On an area-normalized basis, %s has a median rate of \u20B9%.1f/sqft (from %d listings with area) vs %s at \u20B9%.1f/sqft (from %d listings with area).",
                        lowestPpsLoc.getLocality(), lowestPpsLoc.getMedianPricePerSqft(), lowestPpsLoc.getListingsWithAreaCount(),
                        highestPpsLoc.getLocality(), highestPpsLoc.getMedianPricePerSqft(), highestPpsLoc.getListingsWithAreaCount()));
            }
        } else if (validPpsMarkets.size() == 1) {
            observations.add(String.format(Locale.US,
                    "Only %s had sufficient area disclosure to compute median rate (\u20B9%.1f/sqft from %d listings); other locations lacked carpet area disclosures.",
                    validPpsMarkets.get(0).getLocality(), validPpsMarkets.get(0).getMedianPricePerSqft(),
                    validPpsMarkets.get(0).getListingsWithAreaCount()));
        }

        summary.setObservations(observations);
        return summary;
    }

    private String cleanLocalityName(String raw) {
        if (raw == null || raw.trim().isEmpty()) return "Unknown Locality";
        String[] parts = raw.split(",");
        return parts[0].trim();
    }

    private String cleanCityName(String raw) {
        if (raw == null || raw.trim().isEmpty()) return null;
        String[] parts = raw.split(",");
        if (parts.length > 1) {
            String candidateCity = parts[parts.length - 1].trim();
            if (!candidateCity.equalsIgnoreCase(parts[0].trim()) && !candidateCity.isEmpty()) {
                return candidateCity;
            }
        }
        return null;
    }
}
