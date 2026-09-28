package com.rentfair;

import com.rentfair.client.dto.SerpApiOrganicResult;
import com.rentfair.dto.RentalListingDto;
import com.rentfair.service.FairnessEngineService;
import com.rentfair.util.SerpApiResultParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * System Integrity Fix 4 — Source Data Integrity Hardening Test Suite
 * Validates null-preservation, deduplication conservatism, and mathematical baseline purity.
 */
class SourceDataIntegrityTest {

    private SerpApiResultParser parser;
    private FairnessEngineService fairnessEngine;

    @BeforeEach
    void setUp() {
        parser = new SerpApiResultParser();
        fairnessEngine = new FairnessEngineService();
    }

    @Test
    void testMissingRentRemainsNullAndExcludedFromRentStatistics() {
        SerpApiOrganicResult unpriced = new SerpApiOrganicResult();
        unpriced.setPosition(1);
        unpriced.setTitle("Luxury 3 BHK in Whitefield");
        unpriced.setLink("https://example.com/unpriced-listing");
        unpriced.setSnippet("Spacious 3 BHK apartment with clubhouse, pool, 1800 sq ft. Contact owner for pricing details.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(unpriced), "Whitefield", "3");
        assertEquals(1, dtos.size(), "Unpriced listing must remain visible in results collection");

        RentalListingDto dto = dtos.get(0);
        assertNull(dto.getRentAmount(), "Missing rent must remain null, never 0");
        assertNull(dto.getPricePerSqft(), "Price per sqft must remain null when rent is missing");

        fairnessEngine.evaluateAll(dtos);

        assertNull(dto.getFairnessCategory(), "Unpriced listing must not be assigned a fairness category");
        assertNull(dto.getFairnessScore(), "Unpriced listing must not be assigned a fairness score");
        assertNull(dto.getVariancePercentage(), "Variance must be null when rent is missing");
        assertNull(dto.getComparableCount(), "Comparable count must be null for unpriced listing");
        assertNull(dto.getConfidenceScore(), "Confidence score must be null for unpriced listing");
        assertFalse(dto.getIsStatisticalOutlier(), "Unpriced listing must not be flagged as outlier");
        assertNotNull(dto.getFairnessExplanation());
    }

    @Test
    void testMissingAreaRemainsNullAndExcludedFromAreaStatistics() {
        SerpApiOrganicResult missingArea1 = new SerpApiOrganicResult();
        missingArea1.setPosition(1);
        missingArea1.setTitle("2 BHK Flat in Whitefield");
        missingArea1.setLink("https://example.com/no-area-1");
        missingArea1.setSnippet("Rent ₹30,000 per month. Great location near metro. No area mentioned.");

        SerpApiOrganicResult withArea = new SerpApiOrganicResult();
        withArea.setPosition(2);
        withArea.setTitle("2 BHK Flat in Whitefield");
        withArea.setLink("https://example.com/with-area");
        withArea.setSnippet("Rent ₹40,000 per month. Carpet area 1000 sq ft.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(missingArea1, withArea), "Whitefield", "2");
        assertEquals(2, dtos.size());

        RentalListingDto dto1 = dtos.get(0);
        RentalListingDto dto2 = dtos.get(1);

        assertNull(dto1.getCarpetAreaSqft(), "Missing area must remain null, never 0 or estimated");
        assertNull(dto1.getPricePerSqft(), "Price per sqft must be null when area is null");

        assertEquals(1000, dto2.getCarpetAreaSqft());
        assertEquals(40.0, dto2.getPricePerSqft());

        fairnessEngine.evaluateAll(dtos);

        // dto1 evaluated against dto2 for rent, but its pricePerSqft must strictly remain null
        assertNull(dto1.getPricePerSqft(), "Price per sqft must stay null after fairness evaluation");
        assertEquals(30000, dto1.getRentAmount());
        assertEquals(1, dto1.getComparableCount());

        // Baseline stats: validPps must only include dto2
        FairnessEngineService.BaselineStats stats = fairnessEngine.computeBaselineStats(dtos, 1);
        assertEquals(2, stats.getSampleSize(), "Both valid rents contribute to rent sample size");
        assertEquals(35000, stats.getMedianRent(), "Median of 30k and 40k is 35k");
        assertEquals(40.0, stats.getMedianPricePerSqft(), "Only dto2 (40.0) contributes to medianPricePerSqft");
    }

    @Test
    void testMissingDepositRemainsNull() {
        SerpApiOrganicResult sample = new SerpApiOrganicResult();
        sample.setPosition(1);
        sample.setTitle("2 BHK Flat in HSR");
        sample.setLink("https://example.com/hsr-rent");
        sample.setSnippet("Rent ₹28,000 per month, 1100 sqft semi furnished flat.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(sample), "HSR", "2");
        assertEquals(1, dtos.size());

        RentalListingDto dto = dtos.get(0);
        assertEquals(28000, dto.getRentAmount());
        assertNull(dto.getDepositAmount(), "Deposit must remain null when not explicitly stated in snippet");
    }

    @Test
    void testMissingBhkRemainsNull() {
        SerpApiOrganicResult sample = new SerpApiOrganicResult();
        sample.setPosition(1);
        sample.setTitle("Independent House for Rent in Indiranagar");
        sample.setLink("https://example.com/indiranagar-house");
        sample.setSnippet("Spacious independent house with car parking and garden. Rent ₹65,000 per month.");

        // Even though requestedBhk is "2", listing text does NOT contain BHK, so it must strictly remain null
        List<RentalListingDto> dtos = parser.parseResults(List.of(sample), "Indiranagar", "2");
        assertEquals(1, dtos.size());

        RentalListingDto dto = dtos.get(0);
        assertNull(dto.getBhk(), "Missing BHK must strictly remain null and never be fabricated from user search query");
    }

    @Test
    void testDuplicateUrlsDeduplicated() {
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setPosition(1);
        r1.setTitle("2 BHK Apartment in Whitefield");
        r1.setLink("https://www.99acres.com/2bhk-whitefield-101?utm_source=google&ref=search");
        r1.setSnippet("Rent ₹35,000 per month, 1000 sq ft.");

        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setPosition(2);
        r2.setTitle("2 BHK Apartment in Whitefield");
        r2.setLink("https://99acres.com/2bhk-whitefield-101?utm_medium=cpc&fbclid=abc123xyz");
        r2.setSnippet("Rent ₹35,000 per month, 1000 sq ft.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(r1, r2), "Whitefield", "2");
        assertEquals(1, dtos.size(), "Exact duplicate canonical URL must be deduplicated");
    }

    @Test
    void testSameTitleWithDifferentRentsNotDeduplicated() {
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setPosition(1);
        r1.setTitle("2 BHK Apartment in Prestige Lakeside Habitat, Whitefield");
        r1.setLink("https://www.99acres.com/listing-unit-a");
        r1.setSnippet("Unit on 5th floor. Rent ₹38,000 per month, 1150 sq ft.");

        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setPosition(2);
        r2.setTitle("2 BHK Apartment in Prestige Lakeside Habitat, Whitefield");
        r2.setLink("https://www.99acres.com/listing-unit-b");
        r2.setSnippet("Unit on 18th floor with lake view. Rent ₹48,000 per month, 1250 sq ft.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(r1, r2), "Whitefield", "2");
        assertEquals(2, dtos.size(), "Same title with different rents represents different units and must NOT be deduplicated");
    }

    @Test
    void testSamePropertyFromDifferentPortalsNotMerged() {
        SerpApiOrganicResult mb = new SerpApiOrganicResult();
        mb.setPosition(1);
        mb.setTitle("2 BHK Apartment in Prestige Lakeside Habitat, Whitefield");
        mb.setLink("https://www.magicbricks.com/property-mb-101");
        mb.setSnippet("Rent ₹40,000 per month. Carpet area 1200 sq ft.");
        mb.setSource("MagicBricks");

        SerpApiOrganicResult acres = new SerpApiOrganicResult();
        acres.setPosition(2);
        acres.setTitle("2 BHK Apartment in Prestige Lakeside Habitat, Whitefield");
        acres.setLink("https://www.99acres.com/property-99a-202");
        acres.setSnippet("Rent ₹40,000 per month. Carpet area 1200 sq ft.");
        acres.setSource("99acres");

        List<RentalListingDto> dtos = parser.parseResults(List.of(mb, acres), "Whitefield", "2");
        assertEquals(2, dtos.size(), "Listings from different portals have different source platforms and must conservatively NOT be merged");
    }

    @Test
    void testMalformedPriceRejectedAsNull() {
        // PIN codes, phone numbers, invalid characters should never be extracted as rent
        assertNull(parser.extractRent("Property located at Bangalore PIN 560066 near railway station"));
        assertNull(parser.extractRent("Call owner at 9845012345 for details and schedule visit"));
        assertNull(parser.extractRent("Price: ₹abc negotiable upon discussion"));
        assertNull(parser.extractRent("Rent: Rs. 0 / month"));
        assertNull(parser.extractRent("Deposit ₹1,00,000. Rent to be discussed with owner."));
    }

    @Test
    void testLakhKMonthPriceFormats() {
        // Lakh formats
        assertEquals(120000, parser.extractRent("Luxury villa rent 1.2 Lakh/month"));
        assertEquals(150000, parser.extractRent("Penthouse rent: 1.5L/mo in Koramangala"));
        assertEquals(200000, parser.extractRent("Duplex asking 2.0 lac per month"));

        // k / month formats
        assertEquals(25000, parser.extractRent("Cozy flat rent 25k/mo"));
        assertEquals(35000, parser.extractRent("Modern 2 BHK for 35k pm"));
        assertEquals(40000, parser.extractRent("Rent: 40k"));

        // Per month formats
        assertEquals(38000, parser.extractRent("Apartment rent ₹38,000 per month"));
        assertEquals(45000, parser.extractRent("Spacious flat 45000/month"));
        assertEquals(28000, parser.extractRent("Rent: 28,000 pm"));
    }

    @Test
    void testPriceOnRequestRemainsNull() {
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setPosition(1);
        r1.setTitle("3 BHK Villa in Whitefield");
        r1.setLink("https://example.com/villa-request");
        r1.setSnippet("Price on request. Contact builder for private viewing.");

        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setPosition(2);
        r2.setTitle("2 BHK Flat in HSR Layout");
        r2.setLink("https://example.com/hsr-call");
        r2.setSnippet("Call for price. Rent negotiable upon visit.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(r1, r2), "Bangalore", "all");
        assertEquals(2, dtos.size());

        for (RentalListingDto dto : dtos) {
            assertNull(dto.getRentAmount(), "Price on request snippets must produce null rent");
            assertNull(dto.getPricePerSqft());
        }

        fairnessEngine.evaluateAll(dtos);

        for (RentalListingDto dto : dtos) {
            assertNull(dto.getFairnessCategory(), "Price on request must not have fairness category");
            assertNull(dto.getFairnessScore(), "Price on request must not have fairness score");
            assertFalse(dto.getIsStatisticalOutlier());
        }
    }
}
