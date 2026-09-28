package com.rentfair.service;

import com.rentfair.dto.MarketBaselineDto;
import com.rentfair.dto.RentalListingDto;
import com.rentfair.model.RentalListingEntity;
import com.rentfair.repository.RentalListingRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class MarketBaselineService {

    private final RentalListingRepository rentalListingRepository;
    private final FairnessEngineService fairnessEngineService;

    public MarketBaselineService(RentalListingRepository rentalListingRepository, FairnessEngineService fairnessEngineService) {
        this.rentalListingRepository = rentalListingRepository;
        this.fairnessEngineService = fairnessEngineService;
    }

    /**
     * Calculates the statistical baseline for a given locality and BHK.
     * Strictly computes statistics only from listings with valid numeric rents.
     * Excludes listings without both valid rent and area from rent/sqft calculations.
     * Does not use prototype/mock values in the analysis path.
     */
    public MarketBaselineDto getBaseline(String locality, Integer bhk) {
        String cleanLocality = "Whitefield";
        String cleanCity = "Bangalore";

        if (locality != null && !locality.trim().isEmpty()) {
            String[] parts = locality.split(",");
            cleanLocality = parts[0].trim();
            if (parts.length > 1) {
                cleanCity = parts[parts.length - 1].trim();
            }
        }

        Integer bedroomCount = (bhk != null && bhk > 0) ? bhk : null;

        MarketBaselineDto dto = new MarketBaselineDto();
        dto.setLocality(cleanLocality);
        dto.setCity(cleanCity);
        dto.setBhk(bedroomCount != null ? bedroomCount : 2);
        dto.setGeneratedAt(Instant.now().toString());

        // 1. Fetch listings with valid rent from repository
        List<RentalListingEntity> validEntities = rentalListingRepository.findValidListingsByLocalityAndBhk(cleanLocality, bedroomCount);
        if (validEntities.isEmpty() && bedroomCount != null) {
            validEntities = rentalListingRepository.findValidListingsByLocalityAndBhk(cleanLocality, null);
        }

        // Also fetch total listings for locality & BHK to establish source listing count
        List<RentalListingEntity> allEntities = rentalListingRepository.findAllListingsByLocalityAndBhk(cleanLocality, bedroomCount);
        if ((allEntities == null || allEntities.isEmpty()) && bedroomCount != null) {
            allEntities = rentalListingRepository.findAllListingsByLocalityAndBhk(cleanLocality, null);
        }

        int totalCount = allEntities != null ? allEntities.size() : 0;
        int validCount = validEntities != null ? validEntities.size() : 0;
        int sourceCount = Math.max(totalCount, validCount);
        int areaCount = (int) (validEntities != null ? validEntities.stream()
                .filter(e -> e.getCarpetAreaSqft() != null && e.getCarpetAreaSqft() > 0)
                .count() : 0);

        dto.setSourceListingCount(sourceCount);
        dto.setValidPricedListingCount(validCount);
        dto.setListingsWithAreaCount(areaCount);

        // Align city from database entities if available
        if (!validEntities.isEmpty() && validEntities.get(0).getCity() != null && !validEntities.get(0).getCity().trim().isEmpty()) {
            dto.setCity(validEntities.get(0).getCity().trim());
        }

        // Convert entities to DTOs for statistical engine
        List<RentalListingDto> dtos = validEntities.stream()
                .map(e -> {
                    RentalListingDto d = new RentalListingDto();
                    d.setId(e.getId());
                    d.setRentAmount(e.getRentAmount());
                    d.setCarpetAreaSqft(e.getCarpetAreaSqft());
                    d.setBhk(e.getBhk());
                    d.setLocality(e.getLocality());
                    d.setPropertyType(e.getPropertyType());
                    return d;
                })
                .toList();

        FairnessEngineService.BaselineStats stats = fairnessEngineService.computeBaselineStats(dtos, 1);

        if (stats.getSampleSize() == 0) {
            // No valid rental data available yet for this locality: return null/unavailable statistics
            dto.setSampleSize(0);
            dto.setStatisticalSampleSize(0);
            dto.setMedianRent(null);
            dto.setAverageRent(null);
            dto.setMedianPricePerSqft(null);
            dto.setRentIqr(null);
            dto.setPriceDistribution(Collections.emptyList());
            dto.setIsPrototypeBaseline(false);
            return dto;
        }

        dto.setSampleSize(stats.getSampleSize());
        dto.setStatisticalSampleSize(stats.getSampleSize());
        dto.setIsPrototypeBaseline(false);
        dto.setMedianRent(stats.getMedianRent());
        dto.setAverageRent(stats.getAverageRent());
        dto.setMedianPricePerSqft(stats.getMedianPricePerSqft());
        dto.setRentIqr(new MarketBaselineDto.RentIqr(
                stats.getQ1(), stats.getQ3(), stats.getMinTypical(), stats.getMaxTypical()
        ));

        List<Integer> validRents = dtos.stream()
                .map(RentalListingDto::getRentAmount)
                .filter(r -> r != null && r > 0)
                .sorted()
                .toList();

        List<MarketBaselineDto.PriceDistributionBucket> buckets = computeDistributionBuckets(
                validRents, stats.getQ1(), stats.getMedianRent(), stats.getQ3()
        );
        dto.setPriceDistribution(buckets);

        return dto;
    }

    private List<MarketBaselineDto.PriceDistributionBucket> computeDistributionBuckets(List<Integer> rents, int q1, int median, int q3) {
        List<MarketBaselineDto.PriceDistributionBucket> buckets = new ArrayList<>();
        int total = rents.size();
        if (total == 0) return buckets;

        int b1Count = 0;
        int b2Count = 0;
        int b3Count = 0;
        int b4Count = 0;
        int b5Count = 0;

        for (int r : rents) {
            if (r < q1) {
                b1Count++;
            } else if (r < median) {
                b2Count++;
            } else if (r < q3) {
                b3Count++;
            } else if (r <= (q3 + (q3 - q1))) {
                b4Count++;
            } else {
                b5Count++;
            }
        }

        buckets.add(new MarketBaselineDto.PriceDistributionBucket("< \u20B9" + (q1 / 1000) + "k", b1Count, Math.round(((double) b1Count / total) * 1000.0) / 10.0));
        buckets.add(new MarketBaselineDto.PriceDistributionBucket("\u20B9" + (q1 / 1000) + "k - \u20B9" + (median / 1000) + "k", b2Count, Math.round(((double) b2Count / total) * 1000.0) / 10.0));
        buckets.add(new MarketBaselineDto.PriceDistributionBucket("\u20B9" + (median / 1000) + "k - \u20B9" + (q3 / 1000) + "k", b3Count, Math.round(((double) b3Count / total) * 1000.0) / 10.0));
        buckets.add(new MarketBaselineDto.PriceDistributionBucket("\u20B9" + (q3 / 1000) + "k - \u20B9" + ((q3 + (q3 - q1)) / 1000) + "k", b4Count, Math.round(((double) b4Count / total) * 1000.0) / 10.0));
        buckets.add(new MarketBaselineDto.PriceDistributionBucket("\u20B9" + ((q3 + (q3 - q1)) / 1000) + "k+", b5Count, Math.round(((double) b5Count / total) * 1000.0) / 10.0));

        return buckets;
    }
}

