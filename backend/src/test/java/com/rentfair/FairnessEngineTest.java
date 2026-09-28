package com.rentfair;

import com.rentfair.dto.RentalListingDto;
import com.rentfair.service.FairnessEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FairnessEngineTest {

    private FairnessEngineService engine;

    @BeforeEach
    void setUp() {
        engine = new FairnessEngineService();
    }

    private RentalListingDto createListing(String id, String locality, int rent, Integer bhk,
                                          String propertyType, Integer area, String url) {
        RentalListingDto dto = new RentalListingDto();
        dto.setId(id);
        dto.setTitle("Rental in " + locality);
        dto.setLocality(locality);
        dto.setRentAmount(rent);
        dto.setBhk(bhk);
        dto.setPropertyType(propertyType);
        dto.setCarpetAreaSqft(area);
        dto.setSourceUrl(url);
        dto.setFurnishing("SEMI_FURNISHED");
        dto.setBathrooms(2);
        return dto;
    }

    @Test
    void testTargetExclusionFromComparableSet() {
        RentalListingDto target = createListing("target-1", "Whitefield", 30000, 2, "APARTMENT", 1000, "https://example.com/target");

        // Candidates include target itself (by ID, by reference, and by URL) and other properties
        RentalListingDto duplicateById = createListing("target-1", "Whitefield", 30000, 2, "APARTMENT", 1000, "https://example.com/other-url");
        RentalListingDto duplicateByUrl = createListing("other-id", "Whitefield", 30000, 2, "APARTMENT", 1000, "https://example.com/target");
        RentalListingDto validComp1 = createListing("comp-1", "Whitefield", 28000, 2, "APARTMENT", 1050, "https://example.com/comp1");
        RentalListingDto validComp2 = createListing("comp-2", "Whitefield", 32000, 2, "APARTMENT", 980, "https://example.com/comp2");
        RentalListingDto validComp3 = createListing("comp-3", "Whitefield", 30000, 2, "APARTMENT", 1020, "https://example.com/comp3");

        List<RentalListingDto> all = List.of(target, duplicateById, duplicateByUrl, validComp1, validComp2, validComp3);

        List<RentalListingDto> selected = engine.selectComparables(target, all);

        assertEquals(3, selected.size(), "Target and duplicate ID/URL variants must be excluded from comparables");
        for (RentalListingDto comp : selected) {
            assertNotEquals("target-1", comp.getId());
            assertNotEquals("https://example.com/target", comp.getSourceUrl());
        }

        // Full evaluation check
        engine.evaluateListing(target, all);
        assertEquals(3, target.getComparableCount());
        // Median of 28k, 30k, 32k is 30,000.
        // If target was incorrectly included 4 times, calculations would be polluted.
        assertEquals(0.0, target.getVariancePercentage(), "Target at 30k vs median 30k must be 0% variance");
        assertEquals("FAIR", target.getFairnessCategory());
    }

    @Test
    void testMedianCalculationOddAndEven() {
        // Odd count: 20k, 25k, 30k -> 25k
        List<RentalListingDto> oddList = List.of(
                createListing("1", "Koramangala", 20000, 2, "APARTMENT", 1000, "u1"),
                createListing("2", "Koramangala", 25000, 2, "APARTMENT", 1000, "u2"),
                createListing("3", "Koramangala", 30000, 2, "APARTMENT", 1000, "u3")
        );
        FairnessEngineService.BaselineStats oddStats = engine.computeBaselineStats(oddList, 1);
        assertEquals(25000, oddStats.getMedianRent());
        assertEquals(25000, oddStats.getAverageRent());

        // Even count: 20k, 25k, 30k, 35k -> (25k + 30k) / 2 = 27,500
        List<RentalListingDto> evenList = List.of(
                createListing("1", "Koramangala", 20000, 2, "APARTMENT", 1000, "u1"),
                createListing("2", "Koramangala", 25000, 2, "APARTMENT", 1000, "u2"),
                createListing("3", "Koramangala", 30000, 2, "APARTMENT", 1000, "u3"),
                createListing("4", "Koramangala", 35000, 2, "APARTMENT", 1000, "u4")
        );
        FairnessEngineService.BaselineStats evenStats = engine.computeBaselineStats(evenList, 1);
        assertEquals(27500, evenStats.getMedianRent());
        assertEquals(27500, evenStats.getAverageRent());
    }

    @Test
    void testQuartilesAndIqrCalculation() {
        // 8 sorted values: [20k, 22k, 24k, 26k, 28k, 30k, 32k, 34k]
        // Lower half: [20k, 22k, 24k, 26k] -> Q1 = (22k + 24k)/2 = 23,000
        // Upper half: [28k, 30k, 32k, 34k] -> Q3 = (30k + 32k)/2 = 31,000
        // IQR = 31,000 - 23,000 = 8,000
        // minTypical = 23,000 - 1.5 * 8,000 = 11,000
        // maxTypical = 31,000 + 1.5 * 8,000 = 43,000
        List<RentalListingDto> listings = new ArrayList<>();
        int[] rents = {20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000};
        for (int i = 0; i < rents.length; i++) {
            listings.add(createListing("c-" + i, "Indiranagar", rents[i], 2, "APARTMENT", 1000, "u" + i));
        }

        FairnessEngineService.BaselineStats stats = engine.computeBaselineStats(listings, 1);

        assertEquals(27000, stats.getMedianRent()); // (26k + 28k) / 2
        assertEquals(23000, stats.getQ1());
        assertEquals(31000, stats.getQ3());
        assertEquals(8000, stats.getIqr());
        assertEquals(11000, stats.getMinTypical());
        assertEquals(43000, stats.getMaxTypical());
    }

    @Test
    void testIqrOutlierVsMarketPositionPrecedence() {
        // Build market baseline: [20k, 22k, 24k, 26k, 28k, 30k, 32k, 34k]
        // median = 27k, minTypical = 11k, maxTypical = 43k
        List<RentalListingDto> comparables = new ArrayList<>();
        int[] rents = {20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000};
        for (int i = 0; i < rents.length; i++) {
            comparables.add(createListing("c-" + i, "Indiranagar", rents[i], 2, "APARTMENT", 1000, "u" + i));
        }

        // 1. Statistical Upper Outlier: Rent 48,000 (> 43,000)
        RentalListingDto upperOutlier = createListing("outlier-up", "Indiranagar", 48000, 2, "APARTMENT", 1000, "out-u");
        engine.evaluateListing(upperOutlier, comparables);
        assertTrue(upperOutlier.getIsStatisticalOutlier(), "Rent 48k exceeds maxTypical 43k and must be flagged as statistical outlier");
        assertEquals("SIGNIFICANTLY_ABOVE_TYPICAL", upperOutlier.getFairnessCategory());
        assertTrue(upperOutlier.getFairnessExplanation().contains("statistical upper outlier"));

        // 2. Statistical Lower Outlier: Rent 9,000 (< 11,000)
        RentalListingDto lowerOutlier = createListing("outlier-low", "Indiranagar", 9000, 2, "APARTMENT", 1000, "out-l");
        engine.evaluateListing(lowerOutlier, comparables);
        assertTrue(lowerOutlier.getIsStatisticalOutlier(), "Rent 9k below minTypical 11k and must be flagged as statistical outlier");
        assertEquals("SIGNIFICANTLY_BELOW_TYPICAL", lowerOutlier.getFairnessCategory());
        assertTrue(lowerOutlier.getFairnessExplanation().contains("statistical lower outlier"));

        // 3. In-Fence, Fair Listing: Rent 27,000 (median 27k, variance 0.0%)
        RentalListingDto fairListing = createListing("fair-1", "Indiranagar", 27000, 2, "APARTMENT", 1000, "f1");
        engine.evaluateListing(fairListing, comparables);
        assertFalse(fairListing.getIsStatisticalOutlier(), "In-fence listing must not be marked as an IQR outlier");
        assertEquals("FAIR", fairListing.getFairnessCategory());
        assertEquals(0.0, fairListing.getVariancePercentage());
        assertEquals(100, fairListing.getFairnessScore());

        // 4. In-Fence, Above Typical: Rent 32,000 (variance +18.5%, <= 43,000)
        RentalListingDto aboveTypical = createListing("above-1", "Indiranagar", 32000, 2, "APARTMENT", 1000, "a1");
        engine.evaluateListing(aboveTypical, comparables);
        assertFalse(aboveTypical.getIsStatisticalOutlier());
        assertEquals("ABOVE_TYPICAL", aboveTypical.getFairnessCategory());
        assertEquals(18.5, aboveTypical.getVariancePercentage());

        // 5. In-Fence, Below Typical: Rent 22,000 (variance -18.5%, >= 11,000)
        RentalListingDto belowTypical = createListing("below-1", "Indiranagar", 22000, 2, "APARTMENT", 1000, "b1");
        engine.evaluateListing(belowTypical, comparables);
        assertFalse(belowTypical.getIsStatisticalOutlier());
        assertEquals("BELOW_TYPICAL", belowTypical.getFairnessCategory());
        assertEquals(-18.5, belowTypical.getVariancePercentage());

        // 6. In-Fence, Substantial Premium (> 25% over median): Rent 35,000 (variance +29.6%, but inside 43k fence)
        RentalListingDto highPremiumInFence = createListing("prem-1", "Indiranagar", 35000, 2, "APARTMENT", 1000, "p1");
        engine.evaluateListing(highPremiumInFence, comparables);
        assertFalse(highPremiumInFence.getIsStatisticalOutlier(), "Inside fence must not be flagged as IQR outlier");
        assertEquals("SIGNIFICANTLY_ABOVE_TYPICAL", highPremiumInFence.getFairnessCategory(), "Variance > 25% is categorized as SIGNIFICANTLY_ABOVE_TYPICAL");
    }

    @Test
    void testFairnessScoreFormula() {
        assertEquals(100, engine.calculateFairnessScore(0.0));
        assertEquals(80, engine.calculateFairnessScore(10.0));
        assertEquals(80, engine.calculateFairnessScore(-10.0));
        assertEquals(58, engine.calculateFairnessScore(20.8));
        assertEquals(50, engine.calculateFairnessScore(25.0));
        assertEquals(0, engine.calculateFairnessScore(50.0));
        assertEquals(0, engine.calculateFairnessScore(75.0));
        assertNull(engine.calculateFairnessScore(null));
    }

    @Test
    void testDeterministicConfidenceScore() {
        RentalListingDto target = createListing("t", "Whitefield", 30000, 2, "APARTMENT", 1000, "url");
        target.setFurnishing("SEMI_FURNISHED");
        target.setBathrooms(2);

        // High evidence: N >= 10 (0.50), Tier 1 (0.30), complete target (0.20) => 1.00
        assertEquals(1.00, engine.calculateConfidence(12, 1, target));

        // Moderate evidence: N = 6 (0.35), Tier 2 (0.20), complete target (0.20) => 0.75
        assertEquals(0.75, engine.calculateConfidence(6, 2, target));

        // Low evidence: N = 2 (0.10), Tier 3 (0.15), partial target (rent + area only: 0.14) => 0.39
        RentalListingDto partial = createListing("p", "Whitefield", 30000, 2, "APARTMENT", 1000, "url");
        partial.setFurnishing(null);
        partial.setBathrooms(null);
        assertEquals(0.39, engine.calculateConfidence(2, 3, partial));

        // Zero sample: 0 comparables => 0.00 + 0.10 + 0.20 = 0.30
        assertEquals(0.30, engine.calculateConfidence(0, 4, target));

        // Missing target rent => null
        RentalListingDto unpriced = new RentalListingDto();
        assertNull(engine.calculateConfidence(10, 1, unpriced));
    }

    @Test
    void testPricePerSqftRequiresBothValidRentAndArea() {
        RentalListingDto bothValid = createListing("1", "Whitefield", 35000, 2, "APARTMENT", 1000, "u1");
        engine.evaluateListing(bothValid, Collections.emptyList());
        assertEquals(35.0, bothValid.getPricePerSqft());

        RentalListingDto missingArea = createListing("2", "Whitefield", 35000, 2, "APARTMENT", null, "u2");
        engine.evaluateListing(missingArea, Collections.emptyList());
        assertNull(missingArea.getPricePerSqft(), "Missing area must result in null price per sqft");

        RentalListingDto zeroArea = createListing("3", "Whitefield", 35000, 2, "APARTMENT", 0, "u3");
        engine.evaluateListing(zeroArea, Collections.emptyList());
        assertNull(zeroArea.getPricePerSqft(), "Zero area must result in null price per sqft");
    }

    @Test
    void testComparableSelectionCascade() {
        RentalListingDto target = createListing("t", "Whitefield", 35000, 2, "APARTMENT", 1000, "ut");

        // Tier 1 matching candidates: exact BHK (2), compatible property type (APARTMENT), area within +-30% (700-1300)
        List<RentalListingDto> tier1Candidates = List.of(
                createListing("c1", "Whitefield", 32000, 2, "APARTMENT", 950, "u1"),
                createListing("c2", "Whitefield", 34000, 2, "BUILDER_FLOOR", 1050, "u2"),
                createListing("c3", "Whitefield", 36000, 2, "GATED_COMMUNITY", 1100, "u3")
        );

        List<RentalListingDto> selectedTier1 = engine.selectComparables(target, tier1Candidates);
        assertEquals(3, selectedTier1.size());

        // When tier 1 < 3, falls back to Tier 2 (area relaxed)
        List<RentalListingDto> tier2Candidates = List.of(
                createListing("c1", "Whitefield", 32000, 2, "APARTMENT", 1500, "u1"), // Area > 1300
                createListing("c2", "Whitefield", 34000, 2, "BUILDER_FLOOR", 1600, "u2"),
                createListing("c3", "Whitefield", 36000, 2, "GATED_COMMUNITY", 1700, "u3")
        );
        List<RentalListingDto> selectedTier2 = engine.selectComparables(target, tier2Candidates);
        assertEquals(3, selectedTier2.size(), "Should fall back to Tier 2 when area constraint has < 3 matches");

        // When property type differs (e.g. VILLA), falls back to Tier 3 (BHK match in locality)
        List<RentalListingDto> tier3Candidates = List.of(
                createListing("c1", "Whitefield", 45000, 2, "VILLA", 1800, "u1"),
                createListing("c2", "Whitefield", 48000, 2, "INDEPENDENT_HOUSE", 1900, "u2")
        );
        List<RentalListingDto> selectedTier3 = engine.selectComparables(target, tier3Candidates);
        assertEquals(2, selectedTier3.size(), "Should fall back to Tier 3 when compatible property type has < 3 matches");
    }

    @Test
    void testLowDataHandling() {
        RentalListingDto target = createListing("t", "Whitefield", 35000, 2, "APARTMENT", 1000, "ut");

        // 1. Zero comparables
        engine.evaluateListing(target, Collections.emptyList());
        assertEquals(0, target.getComparableCount());
        assertNull(target.getFairnessCategory());
        assertNull(target.getFairnessScore());
        assertNull(target.getVariancePercentage());
        assertTrue(target.getFairnessExplanation().contains("No comparable priced listings found"));

        // 2. Insufficient comparables (1-2 comparables)
        RentalListingDto comp1 = createListing("c1", "Whitefield", 32000, 2, "APARTMENT", 1000, "u1");
        RentalListingDto comp2 = createListing("c2", "Whitefield", 36000, 2, "APARTMENT", 1000, "u2");

        engine.evaluateListing(target, List.of(comp1, comp2));
        assertEquals(2, target.getComparableCount());
        assertNotNull(target.getFairnessCategory());
        assertNotNull(target.getFairnessScore());
        assertTrue(target.getConfidenceScore() <= 0.45, "Small sample of 2 must have low confidence <= 0.45");
        assertTrue(target.getFairnessExplanation().contains("Limited comparable sample: only 2"));

        // 3. Target has missing rent
        RentalListingDto unpricedTarget = createListing("t-no-rent", "Whitefield", 0, 2, "APARTMENT", 1000, "unpriced-url");
        unpricedTarget.setRentAmount(null);

        engine.evaluateListing(unpricedTarget, List.of(comp1, comp2));
        assertNull(unpricedTarget.getFairnessCategory());
        assertNull(unpricedTarget.getFairnessScore());
        assertNull(unpricedTarget.getVariancePercentage());
        assertNull(unpricedTarget.getPricePerSqft());
        assertNull(unpricedTarget.getComparableCount());
        assertNull(unpricedTarget.getConfidenceScore());
        assertTrue(unpricedTarget.getFairnessExplanation().contains("Pricing is unlisted or incomplete"));
    }
}
