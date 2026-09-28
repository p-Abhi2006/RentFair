package com.rentfair;

import com.rentfair.dto.MarketBaselineDto;
import com.rentfair.dto.RentalListingDto;
import com.rentfair.model.RentalListingEntity;
import com.rentfair.repository.RentalListingRepository;
import com.rentfair.service.FairnessEngineService;
import com.rentfair.service.MarketBaselineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatisticalEngineConsistencyTest {

    private FairnessEngineService engine;

    @Mock
    private RentalListingRepository rentalListingRepository;

    private MarketBaselineService baselineService;

    @BeforeEach
    void setUp() {
        engine = new FairnessEngineService();
        baselineService = new MarketBaselineService(rentalListingRepository, engine);
    }

    private RentalListingDto createListing(String id, String locality, Integer rent, Integer bhk,
                                          String propertyType, Integer area, String url, String title) {
        RentalListingDto dto = new RentalListingDto();
        dto.setId(id);
        dto.setTitle(title != null ? title : "Rental in " + locality);
        dto.setLocality(locality);
        dto.setRentAmount(rent);
        dto.setBhk(bhk);
        dto.setPropertyType(propertyType);
        dto.setCarpetAreaSqft(area);
        dto.setSourceUrl(url);
        dto.setFurnishing("SEMI_FURNISHED");
        dto.setBathrooms(2);
        dto.setSourcePlatform("MagicBricks");
        return dto;
    }

    @Test
    @DisplayName("1. Zero Comparables: Evaluates cleanly without error, returns null scores and false outlier")
    void testZeroComparables() {
        RentalListingDto target = createListing("t1", "Whitefield", 35000, 2, "APARTMENT", 1000, "https://example.com/t1", "2 BHK Whitefield");

        engine.evaluateListing(target, Collections.emptyList());

        assertEquals(0, target.getComparableCount());
        assertNull(target.getFairnessScore());
        assertNull(target.getFairnessCategory());
        assertNull(target.getVariancePercentage());
        assertFalse(target.getIsStatisticalOutlier(), "Zero comparables must never flag statistical outlier");
        assertTrue(target.getConfidenceScore() <= 0.40, "Zero sample confidence must be capped <= 0.40");
        assertTrue(target.getFairnessExplanation().contains("No comparable priced listings found"));
    }

    @Test
    @DisplayName("2. One Comparable: Capped confidence, no statistical outlier, non-authoritative wording")
    void testOneComparable() {
        RentalListingDto target = createListing("t1", "Whitefield", 35000, 2, "APARTMENT", 1000, "https://example.com/t1", "Target 2 BHK");
        RentalListingDto comp = createListing("c1", "Whitefield", 30000, 2, "APARTMENT", 1000, "https://example.com/c1", "Comp 2 BHK");

        engine.evaluateListing(target, List.of(comp));

        assertEquals(1, target.getComparableCount());
        // Median = 30000, variance = (35000 - 30000) / 30000 = +16.7%
        assertEquals(16.7, target.getVariancePercentage());
        assertEquals("ABOVE_TYPICAL", target.getFairnessCategory());
        assertFalse(target.getIsStatisticalOutlier(), "N=1 sample cannot reliably establish IQR fences; isStatisticalOutlier must be false");
        assertTrue(target.getConfidenceScore() <= 0.40, "Confidence for N=1 must be capped at <= 0.40");
        assertTrue(target.getFairnessExplanation().contains("Limited comparable sample: only 1"));
        assertTrue(target.getFairnessExplanation().contains("indicative baseline"));
    }

    @Test
    @DisplayName("3. Two Comparables: Capped confidence, no statistical outlier even with extreme variance")
    void testTwoComparables() {
        RentalListingDto target = createListing("t1", "Whitefield", 60000, 2, "APARTMENT", 1000, "https://example.com/t1", "Target Luxury");
        RentalListingDto c1 = createListing("c1", "Whitefield", 28000, 2, "APARTMENT", 1000, "https://example.com/c1", "Comp 1");
        RentalListingDto c2 = createListing("c2", "Whitefield", 32000, 2, "APARTMENT", 1000, "https://example.com/c2", "Comp 2");

        engine.evaluateListing(target, List.of(c1, c2));

        assertEquals(2, target.getComparableCount());
        // Median = 30000, variance = +100.0%
        assertEquals(100.0, target.getVariancePercentage());
        assertEquals("SIGNIFICANTLY_ABOVE_TYPICAL", target.getFairnessCategory());
        assertFalse(target.getIsStatisticalOutlier(), "N=2 sample cannot reliably establish IQR fences; isStatisticalOutlier must be false");
        assertTrue(target.getConfidenceScore() <= 0.40, "Confidence for N=2 must be capped at <= 0.40");
        assertTrue(target.getFairnessExplanation().contains("Limited comparable sample: only 2"));
    }

    @Test
    @DisplayName("4. Three or More Comparables: Full statistical analysis with uncapped confidence and IQR fences")
    void testThreeOrMoreComparables() {
        RentalListingDto target = createListing("t1", "Whitefield", 30000, 2, "APARTMENT", 1000, "https://example.com/t1", "Target");
        RentalListingDto c1 = createListing("c1", "Whitefield", 28000, 2, "APARTMENT", 1000, "https://example.com/c1", "C1");
        RentalListingDto c2 = createListing("c2", "Whitefield", 30000, 2, "APARTMENT", 1000, "https://example.com/c2", "C2");
        RentalListingDto c3 = createListing("c3", "Whitefield", 32000, 2, "APARTMENT", 1000, "https://example.com/c3", "C3");

        engine.evaluateListing(target, List.of(c1, c2, c3));

        assertEquals(3, target.getComparableCount());
        assertEquals(0.0, target.getVariancePercentage());
        assertEquals(100, target.getFairnessScore());
        assertEquals("FAIR", target.getFairnessCategory());
        assertFalse(target.getIsStatisticalOutlier());
        assertTrue(target.getConfidenceScore() > 0.40, "Confidence for N=3 with Tier 1 and full details should exceed 0.40");
        assertFalse(target.getFairnessExplanation().contains("Limited comparable sample"));
    }

    @Test
    @DisplayName("5. Exact Median: Variance 0.0%, Fairness Score 100, Category FAIR, Non-outlier")
    void testExactMedian() {
        List<RentalListingDto> pool = List.of(
                createListing("c1", "HSR", 25000, 2, "APARTMENT", 1000, "u1", "HSR Flat 1"),
                createListing("c2", "HSR", 30000, 2, "APARTMENT", 1000, "u2", "HSR Flat 2"),
                createListing("c3", "HSR", 35000, 2, "APARTMENT", 1000, "u3", "HSR Flat 3")
        );

        RentalListingDto target = createListing("t", "HSR", 30000, 2, "APARTMENT", 1000, "ut", "Target HSR");
        engine.evaluateListing(target, pool);

        assertEquals(0.0, target.getVariancePercentage());
        assertEquals(100, target.getFairnessScore());
        assertEquals("FAIR", target.getFairnessCategory());
        assertFalse(target.getIsStatisticalOutlier());
        assertTrue(target.getFairnessExplanation().contains("aligns with the locality median"));
    }

    @Test
    @DisplayName("6. Statistical Lower Outlier: Below lower fence, isStatisticalOutlier = true, category SIGNIFICANTLY_BELOW_TYPICAL")
    void testStatisticalLowerOutlier() {
        // 8 values: 20k, 22k, 24k, 26k, 28k, 30k, 32k, 34k
        // Q1 = 23k, Q3 = 31k, IQR = 8k, lower fence = 11k, upper fence = 43k
        List<RentalListingDto> comparables = new ArrayList<>();
        int[] rents = {20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000};
        for (int i = 0; i < rents.length; i++) {
            comparables.add(createListing("c" + i, "Koramangala", rents[i], 2, "APARTMENT", 1000, "u" + i, "Comp " + i));
        }

        RentalListingDto lowerOutlier = createListing("t-low", "Koramangala", 9000, 2, "APARTMENT", 1000, "u-low", "Underpriced Studio");
        engine.evaluateListing(lowerOutlier, comparables);

        assertTrue(lowerOutlier.getIsStatisticalOutlier(), "Rent 9,000 < 11,000 must be marked as statistical outlier");
        assertEquals("SIGNIFICANTLY_BELOW_TYPICAL", lowerOutlier.getFairnessCategory());
        assertTrue(lowerOutlier.getFairnessExplanation().contains("statistical lower outlier"));
        assertTrue(lowerOutlier.getFairnessExplanation().contains("below the lower fence"));
    }

    @Test
    @DisplayName("7. Statistical Upper Outlier: Above upper fence, isStatisticalOutlier = true, category SIGNIFICANTLY_ABOVE_TYPICAL")
    void testStatisticalUpperOutlier() {
        List<RentalListingDto> comparables = new ArrayList<>();
        int[] rents = {20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000};
        for (int i = 0; i < rents.length; i++) {
            comparables.add(createListing("c" + i, "Koramangala", rents[i], 2, "APARTMENT", 1000, "u" + i, "Comp " + i));
        }

        RentalListingDto upperOutlier = createListing("t-high", "Koramangala", 48000, 2, "APARTMENT", 1000, "u-high", "Luxury Penthouse");
        engine.evaluateListing(upperOutlier, comparables);

        assertTrue(upperOutlier.getIsStatisticalOutlier(), "Rent 48,000 > 43,000 must be marked as statistical outlier");
        assertEquals("SIGNIFICANTLY_ABOVE_TYPICAL", upperOutlier.getFairnessCategory());
        assertTrue(upperOutlier.getFairnessExplanation().contains("statistical upper outlier"));
        assertTrue(upperOutlier.getFairnessExplanation().contains("exceeding the upper fence"));
    }

    @Test
    @DisplayName("8. High Variance But Non-Outlier: Inside IQR fence with >20% variance remains isStatisticalOutlier = false")
    void testHighVarianceButNonOutlier() {
        // Median 27k, Q1 23k, Q3 31k, Lower fence 11k, Upper fence 43k
        List<RentalListingDto> comparables = new ArrayList<>();
        int[] rents = {20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000};
        for (int i = 0; i < rents.length; i++) {
            comparables.add(createListing("c" + i, "Koramangala", rents[i], 2, "APARTMENT", 1000, "u" + i, "Comp " + i));
        }

        // Upper: Rent 35,000 (variance +29.6%, > 20% variance, but strictly < 43k upper fence)
        RentalListingDto highPremium = createListing("t-prem", "Koramangala", 35000, 2, "APARTMENT", 1000, "u-prem", "Premium Flat");
        engine.evaluateListing(highPremium, comparables);

        assertFalse(highPremium.getIsStatisticalOutlier(), "Rent within upper fence must NEVER be marked as statistical outlier");
        assertEquals("SIGNIFICANTLY_ABOVE_TYPICAL", highPremium.getFairnessCategory(), "Variance > 25% is categorized as SIGNIFICANTLY_ABOVE_TYPICAL");
        assertFalse(highPremium.getFairnessExplanation().contains("outlier"));
        assertTrue(highPremium.getFairnessExplanation().contains("+29.6% above the locality median"));

        // Lower: Rent 15,000 (variance -44.4%, but strictly > 11k lower fence)
        RentalListingDto deepDiscount = createListing("t-disc", "Koramangala", 15000, 2, "APARTMENT", 1000, "u-disc", "Discount Flat");
        engine.evaluateListing(deepDiscount, comparables);

        assertFalse(deepDiscount.getIsStatisticalOutlier(), "Rent within lower fence must NEVER be marked as statistical outlier");
        assertEquals("SIGNIFICANTLY_BELOW_TYPICAL", deepDiscount.getFairnessCategory());
        assertFalse(deepDiscount.getFairnessExplanation().contains("outlier"));
        assertTrue(deepDiscount.getFairnessExplanation().contains("below the locality median"));
    }

    @Test
    @DisplayName("9. Target Exclusion: Handles null IDs, matching canonical URLs, distinct object identity, and duplicate records")
    void testTargetExclusion() {
        RentalListingDto target = createListing(null, "Whitefield", 30000, 2, "APARTMENT", 1000,
                "https://www.example.com/property-100?utm_source=serp", "Prestige Shantiniketan 2BHK");

        // A. Same object reference
        assertTrue(engine.isSameListing(target, target));

        // B. Null IDs on both, matching canonical URL (ignoring https, www, tracking params)
        RentalListingDto compUrlMatch = createListing(null, "Whitefield", 30000, 2, "APARTMENT", 1000,
                "http://example.com/property-100/", "Different Scraped Title");
        assertTrue(engine.isSameListing(target, compUrlMatch));

        // C. Different explicit IDs, but matching canonical URL
        RentalListingDto compDiffIdSameUrl = createListing("diff-id", "Whitefield", 30000, 2, "APARTMENT", 1000,
                "https://example.com/property-100", "Title C");
        assertTrue(engine.isSameListing(target, compDiffIdSameUrl));

        // D. Duplicate record: null IDs, different/null URLs, but matching platform, locality, rent, BHK, and title
        RentalListingDto compDuplicateRecord = createListing(null, "Whitefield", 30000, 2, "APARTMENT", 1000,
                null, "Prestige Shantiniketan 2BHK");
        compDuplicateRecord.setSourcePlatform("MagicBricks");
        assertTrue(engine.isSameListing(target, compDuplicateRecord));

        // E. Distinct valid comparable: different non-null IDs AND different URLs
        RentalListingDto distinctComp = createListing("valid-comp-id", "Whitefield", 30000, 2, "APARTMENT", 1000,
                "https://example.com/another-property-200", "Brigade Cosmopolis 2BHK");
        assertFalse(engine.isSameListing(target, distinctComp));

        // Full candidate evaluation set test
        List<RentalListingDto> candidates = List.of(target, compUrlMatch, compDiffIdSameUrl, compDuplicateRecord, distinctComp);
        List<RentalListingDto> selected = engine.selectComparables(target, candidates);

        assertEquals(1, selected.size(), "Only genuine distinct listing must be selected as comparable");
        assertEquals("valid-comp-id", selected.get(0).getId());
    }

    @Test
    @DisplayName("10. Missing Rent: Excluded from statistical calculations, displays informative unpriced state")
    void testMissingRent() {
        RentalListingDto unpricedTarget = createListing("unpriced", "Whitefield", null, 2, "APARTMENT", 1000, "u-unpriced", "Unpriced Flat");
        RentalListingDto comp1 = createListing("c1", "Whitefield", 30000, 2, "APARTMENT", 1000, "u1", "C1");
        RentalListingDto comp2 = createListing("c2", "Whitefield", 32000, 2, "APARTMENT", 1000, "u2", "C2");

        engine.evaluateListing(unpricedTarget, List.of(comp1, comp2));

        assertNull(unpricedTarget.getRentAmount());
        assertNull(unpricedTarget.getPricePerSqft());
        assertNull(unpricedTarget.getFairnessScore());
        assertNull(unpricedTarget.getFairnessCategory());
        assertNull(unpricedTarget.getVariancePercentage());
        assertNull(unpricedTarget.getComparableCount());
        assertNull(unpricedTarget.getConfidenceScore());
        assertFalse(unpricedTarget.getIsStatisticalOutlier());
        assertTrue(unpricedTarget.getFairnessExplanation().contains("Pricing is unlisted or incomplete"));
    }

    @Test
    @DisplayName("11. Missing Area: Preserves rent statistics while strictly nulling price/sqft")
    void testMissingArea() {
        RentalListingDto missingAreaTarget = createListing("no-area", "Whitefield", 30000, 2, "APARTMENT", null, "u-no-area", "Target No Area");
        RentalListingDto comp1 = createListing("c1", "Whitefield", 28000, 2, "APARTMENT", 1000, "u1", "C1");
        RentalListingDto comp2 = createListing("c2", "Whitefield", 30000, 2, "APARTMENT", null, "u2", "C2 (No Area)");
        RentalListingDto comp3 = createListing("c3", "Whitefield", 32000, 2, "APARTMENT", 1000, "u3", "C3");

        engine.evaluateListing(missingAreaTarget, List.of(comp1, comp2, comp3));

        // Rent statistics work perfectly
        assertEquals(3, missingAreaTarget.getComparableCount());
        assertEquals(0.0, missingAreaTarget.getVariancePercentage());
        assertEquals(100, missingAreaTarget.getFairnessScore());
        assertEquals("FAIR", missingAreaTarget.getFairnessCategory());

        // Price per sqft is strictly null
        assertNull(missingAreaTarget.getPricePerSqft(), "Missing carpet area must result in null price/sqft");

        // Baseline price/sqft calculation excludes comp2 (which has null area)
        FairnessEngineService.BaselineStats stats = engine.computeBaselineStats(List.of(comp1, comp2, comp3), 1);
        assertEquals(3, stats.getSampleSize());
        assertEquals(30000, stats.getMedianRent());
        // comp1: 28000/1000 = 28.0; comp3: 32000/1000 = 32.0 -> median = 30.0
        assertNotNull(stats.getMedianPricePerSqft());
        assertEquals(30.0, stats.getMedianPricePerSqft());
    }

    @Test
    @DisplayName("12. Shared Calculation Consistency: MarketBaselineService and FairnessEngineService produce identical metrics")
    void testSharedCalculationConsistency() {
        RentalListingEntity e1 = new RentalListingEntity();
        e1.setId("e1"); e1.setLocality("Whitefield"); e1.setBhk(2); e1.setRentAmount(25000); e1.setCarpetAreaSqft(1000);
        RentalListingEntity e2 = new RentalListingEntity();
        e2.setId("e2"); e2.setLocality("Whitefield"); e2.setBhk(2); e2.setRentAmount(30000); e2.setCarpetAreaSqft(1200);
        RentalListingEntity e3 = new RentalListingEntity();
        e3.setId("e3"); e3.setLocality("Whitefield"); e3.setBhk(2); e3.setRentAmount(35000); e3.setCarpetAreaSqft(1000);

        when(rentalListingRepository.findValidListingsByLocalityAndBhk(anyString(), any())).thenReturn(List.of(e1, e2, e3));

        MarketBaselineDto baseline = baselineService.getBaseline("Whitefield", 2);

        RentalListingDto d1 = createListing("e1", "Whitefield", 25000, 2, "APARTMENT", 1000, "u1", "D1");
        RentalListingDto d2 = createListing("e2", "Whitefield", 30000, 2, "APARTMENT", 1200, "u2", "D2");
        RentalListingDto d3 = createListing("e3", "Whitefield", 35000, 2, "APARTMENT", 1000, "u3", "D3");

        FairnessEngineService.BaselineStats stats = engine.computeBaselineStats(List.of(d1, d2, d3), 1);

        assertEquals(stats.getSampleSize(), baseline.getSampleSize());
        assertEquals(stats.getMedianRent(), baseline.getMedianRent());
        assertEquals(stats.getAverageRent(), baseline.getAverageRent());
        assertEquals(stats.getMedianPricePerSqft(), baseline.getMedianPricePerSqft());
        assertEquals(stats.getQ1(), baseline.getRentIqr().getQ1());
        assertEquals(stats.getQ3(), baseline.getRentIqr().getQ3());
        assertEquals(stats.getMinTypical(), baseline.getRentIqr().getMinTypical());
        assertEquals(stats.getMaxTypical(), baseline.getRentIqr().getMaxTypical());
    }
}
