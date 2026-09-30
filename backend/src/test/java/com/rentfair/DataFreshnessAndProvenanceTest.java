package com.rentfair;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentfair.client.dto.SerpApiOrganicResult;
import com.rentfair.dto.MarketBaselineDto;
import com.rentfair.dto.RentalListingDto;
import com.rentfair.model.RentalListingEntity;
import com.rentfair.repository.RentalListingRepository;
import com.rentfair.service.FairnessEngineService;
import com.rentfair.service.MarketBaselineService;
import com.rentfair.util.SerpApiResultParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * RentFair System Integrity Fix 9 — Data Freshness and Provenance Test Suite
 *
 * Verifies end-to-end provenance traceability and freshness semantics:
 * SerpApi -> Parser -> Backend DTO -> REST Response -> Models
 */
@ExtendWith(MockitoExtension.class)
public class DataFreshnessAndProvenanceTest {

    private SerpApiResultParser parser;
    private FairnessEngineService fairnessEngine;
    private MarketBaselineService baselineService;
    private ObjectMapper objectMapper;

    @Mock
    private RentalListingRepository rentalListingRepository;

    @BeforeEach
    void setUp() {
        parser = new SerpApiResultParser();
        fairnessEngine = new FairnessEngineService();
        baselineService = new MarketBaselineService(rentalListingRepository, fairnessEngine);
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Scenario 1: SerpApi result -> parsed listing preserves all provenance fields")
    void testSerpApiResultToParsedListingProvenance() {
        SerpApiOrganicResult raw = new SerpApiOrganicResult();
        raw.setPosition(1);
        raw.setTitle("2 BHK Apartment for Rent in Whitefield Bangalore");
        raw.setLink("https://www.99acres.com/2-bhk-apartment-in-whitefield-bangalore-rent-prid123");
        raw.setSnippet("Rent ₹45,000 per month. Carpet Area 1200 sq ft. Semi-furnished, 2 Bathrooms.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(raw), "Whitefield", "2");
        assertEquals(1, dtos.size());

        RentalListingDto dto = dtos.get(0);

        // 1. Source platform preserved
        assertEquals("99acres", dto.getSourcePlatform(), "Source platform must be accurately detected");

        // 2. Source URL preserved (canonical normalization)
        assertEquals("https://99acres.com/2-bhk-apartment-in-whitefield-bangalore-rent-prid123", dto.getSourceUrl());

        // 3. Retrieval timestamp present and valid ISO-8601
        assertNotNull(dto.getRetrievalTimestamp(), "Retrieval timestamp must be present");
        assertNotNull(dto.getScrapedAt());
        assertEquals(dto.getRetrievalTimestamp(), dto.getScrapedAt(), "retrievalTimestamp and scrapedAt must be identical");
        assertDoesNotThrow(() -> Instant.parse(dto.getRetrievalTimestamp()), "Timestamp must be valid ISO-8601");

        // 4. Price extraction flag
        assertTrue(dto.getPriceExplicitlyExtracted(), "Price was explicitly extracted");
        assertEquals(45000, dto.getRentAmount());

        // 5. Area extraction flag
        assertTrue(dto.getAreaExplicitlyExtracted(), "Area was explicitly extracted");
        assertEquals(1200, dto.getCarpetAreaSqft());

        // 6. Extraction status
        assertEquals("COMPLETE", dto.getExtractionStatus(), "Both price and area extracted = COMPLETE");

        // 7. Initial fairness analysis state before engine evaluation
        assertFalse(dto.getFairnessAnalysisPerformed(), "fairnessAnalysisPerformed must be false before evaluation");
    }

    @Test
    @DisplayName("Scenario 2: Parsed listing -> backend DTO preserves provenance through fairness evaluation")
    void testProvenancePreservedThroughFairnessEvaluation() {
        SerpApiOrganicResult raw1 = new SerpApiOrganicResult();
        raw1.setPosition(1);
        raw1.setTitle("2 BHK Flat in Whitefield");
        raw1.setLink("https://housing.com/rent-2bhk-whitefield-1");
        raw1.setSnippet("Rent ₹40,000/month. 1000 sq ft carpet area.");

        SerpApiOrganicResult raw2 = new SerpApiOrganicResult();
        raw2.setPosition(2);
        raw2.setTitle("2 BHK Flat in Whitefield");
        raw2.setLink("https://housing.com/rent-2bhk-whitefield-2");
        raw2.setSnippet("Rent ₹44,000/month. 1100 sq ft carpet area.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(raw1, raw2), "Whitefield", "2");
        String originalTimestamp = dtos.get(0).getRetrievalTimestamp();

        fairnessEngine.evaluateAll(dtos);

        RentalListingDto dto1 = dtos.get(0);
        // Provenance must remain intact
        assertEquals("Housing.com", dto1.getSourcePlatform());
        assertEquals("https://housing.com/rent-2bhk-whitefield-1", dto1.getSourceUrl());
        assertEquals(originalTimestamp, dto1.getRetrievalTimestamp(), "Timestamp must not be mutated during analysis");
        assertTrue(dto1.getPriceExplicitlyExtracted());
        assertTrue(dto1.getAreaExplicitlyExtracted());
        assertEquals("COMPLETE", dto1.getExtractionStatus());

        // Fairness analysis successfully performed
        assertTrue(dto1.getFairnessAnalysisPerformed(), "fairnessAnalysisPerformed must be true after successful baseline evaluation");
        assertNotNull(dto1.getFairnessScore());
        assertNotNull(dto1.getFairnessCategory());
    }

    @Test
    @DisplayName("Scenario 3: Backend DTO -> REST response JSON serialization preserves all provenance fields")
    void testRestResponseJsonSerialization() throws Exception {
        RentalListingDto dto = new RentalListingDto();
        dto.setId("test-prov-1");
        dto.setTitle("Test Listing");
        dto.setSourcePlatform("MagicBricks");
        dto.setSourceUrl("https://www.magicbricks.com/property-1");
        dto.setRetrievalTimestamp("2026-09-27T10:00:00Z");
        dto.setExtractionStatus("COMPLETE");
        dto.setPriceExplicitlyExtracted(true);
        dto.setAreaExplicitlyExtracted(true);
        dto.setFairnessAnalysisPerformed(true);
        dto.setRentAmount(50000);
        dto.setCarpetAreaSqft(1200);

        String json = objectMapper.writeValueAsString(dto);
        JsonNode node = objectMapper.readTree(json);

        assertEquals("MagicBricks", node.get("sourcePlatform").asText());
        assertEquals("https://www.magicbricks.com/property-1", node.get("sourceUrl").asText());
        assertEquals("2026-09-27T10:00:00Z", node.get("retrievalTimestamp").asText());
        assertEquals("COMPLETE", node.get("extractionStatus").asText());
        assertTrue(node.get("priceExplicitlyExtracted").asBoolean());
        assertTrue(node.get("areaExplicitlyExtracted").asBoolean());
        assertTrue(node.get("fairnessAnalysisPerformed").asBoolean());
    }

    @Test
    @DisplayName("Scenario 4 & 6: Missing price -> priceExplicitlyExtracted=false, rentAmount=null, no fabricated values")
    void testMissingPriceProvenance() {
        SerpApiOrganicResult unpriced = new SerpApiOrganicResult();
        unpriced.setPosition(1);
        unpriced.setTitle("3 BHK in Koramangala");
        unpriced.setLink("https://example.com/unpriced-3bhk");
        unpriced.setSnippet("Luxury 3 BHK flat with pool and gym, 1800 sq ft. Call owner for price details.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(unpriced), "Koramangala", "3");
        RentalListingDto dto = dtos.get(0);

        assertFalse(dto.getPriceExplicitlyExtracted(), "priceExplicitlyExtracted must be false when rent is not in snippet");
        assertNull(dto.getRentAmount(), "Missing rent must remain null, never 0 or fabricated");
        assertTrue(dto.getAreaExplicitlyExtracted(), "Area was extracted");
        assertEquals("MINIMAL", dto.getExtractionStatus(), "Price missing/unlisted = MINIMAL");

        // Fairness engine evaluation
        fairnessEngine.evaluateListing(dto, dtos);

        assertFalse(dto.getFairnessAnalysisPerformed(), "fairnessAnalysisPerformed must be false when rent is missing");
        assertNull(dto.getFairnessScore(), "Fairness score must be null");
        assertNull(dto.getFairnessCategory(), "Fairness category must be null");
        assertNull(dto.getVariancePercentage(), "Variance percentage must be null");
    }

    @Test
    @DisplayName("Scenario 7: Missing area -> areaExplicitlyExtracted=false, carpetAreaSqft=null, pricePerSqft=null")
    void testMissingAreaProvenance() {
        SerpApiOrganicResult missingArea = new SerpApiOrganicResult();
        missingArea.setPosition(1);
        missingArea.setTitle("1 BHK Studio in Indiranagar");
        missingArea.setLink("https://example.com/indiranagar-1bhk");
        missingArea.setSnippet("Rent ₹22,000 per month. Walking distance to 100ft road. Great ventilation.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(missingArea), "Indiranagar", "1");
        RentalListingDto dto = dtos.get(0);

        assertTrue(dto.getPriceExplicitlyExtracted(), "Price was extracted");
        assertEquals(22000, dto.getRentAmount());
        assertFalse(dto.getAreaExplicitlyExtracted(), "areaExplicitlyExtracted must be false when area is not in snippet");
        assertNull(dto.getCarpetAreaSqft(), "Missing area must remain null, never 0 or estimated");
        assertNull(dto.getPricePerSqft(), "pricePerSqft must be null when area is absent");
        assertEquals("PARTIAL", dto.getExtractionStatus(), "Price present but area missing = PARTIAL");
    }

    @Test
    @DisplayName("Scenario 8: Fairness not performed when no comparables exist")
    void testFairnessNotPerformedWhenNoComparablesExist() {
        RentalListingDto target = new RentalListingDto();
        target.setId("solo-1");
        target.setLocality("Whitefield");
        target.setBhk(2);
        target.setRentAmount(35000);
        target.setCarpetAreaSqft(1000);
        target.setPriceExplicitlyExtracted(true);
        target.setAreaExplicitlyExtracted(true);
        target.setExtractionStatus("COMPLETE");

        // Evaluate with no other listings in candidates (target exclusion leaves empty comparables)
        fairnessEngine.evaluateListing(target, List.of(target));

        assertFalse(target.getFairnessAnalysisPerformed(), "fairnessAnalysisPerformed must be false when 0 comparables exist");
        assertNull(target.getFairnessScore(), "Fairness score must remain null");
        assertNull(target.getFairnessCategory(), "Fairness category must remain null");
        assertEquals(0, target.getComparableCount(), "Comparable count is 0");
    }

    @Test
    @DisplayName("Scenario 9: Market Baseline Provenance preserves source, valid priced, usable area counts, and timestamp")
    void testMarketBaselineProvenanceCounts() {
        RentalListingEntity pricedWithArea1 = new RentalListingEntity();
        pricedWithArea1.setId("p1"); pricedWithArea1.setLocality("Whitefield"); pricedWithArea1.setBhk(2);
        pricedWithArea1.setRentAmount(30000); pricedWithArea1.setCarpetAreaSqft(1000);

        RentalListingEntity pricedWithArea2 = new RentalListingEntity();
        pricedWithArea2.setId("p2"); pricedWithArea2.setLocality("Whitefield"); pricedWithArea2.setBhk(2);
        pricedWithArea2.setRentAmount(40000); pricedWithArea2.setCarpetAreaSqft(1200);

        RentalListingEntity pricedWithoutArea = new RentalListingEntity();
        pricedWithoutArea.setId("p3"); pricedWithoutArea.setLocality("Whitefield"); pricedWithoutArea.setBhk(2);
        pricedWithoutArea.setRentAmount(50000); pricedWithoutArea.setCarpetAreaSqft(null);

        RentalListingEntity unpricedListing = new RentalListingEntity();
        unpricedListing.setId("u1"); unpricedListing.setLocality("Whitefield"); unpricedListing.setBhk(2);
        unpricedListing.setRentAmount(null); unpricedListing.setCarpetAreaSqft(900);

        // findValidListings returns p1, p2, p3 (priced)
        when(rentalListingRepository.findValidListingsByLocalityAndBhk(eq("Whitefield"), eq(2)))
                .thenReturn(List.of(pricedWithArea1, pricedWithArea2, pricedWithoutArea));

        // findAllListings returns all 4 listings (source listings)
        when(rentalListingRepository.findAllListingsByLocalityAndBhk(eq("Whitefield"), eq(2)))
                .thenReturn(List.of(pricedWithArea1, pricedWithArea2, pricedWithoutArea, unpricedListing));

        MarketBaselineDto baseline = baselineService.getBaseline("Whitefield", 2);

        assertNotNull(baseline);
        assertEquals("Whitefield", baseline.getLocality(), "Locality must be preserved");
        assertEquals(2, baseline.getBhk(), "BHK must be preserved");
        assertEquals(4, baseline.getSourceListingCount(), "sourceListingCount must be total listings evaluated (4)");
        assertEquals(3, baseline.getValidPricedListingCount(), "validPricedListingCount must be 3");
        assertEquals(2, baseline.getListingsWithAreaCount(), "listingsWithAreaCount must be 2");
        assertEquals(3, baseline.getStatisticalSampleSize(), "statisticalSampleSize must be 3");
        assertEquals(3, baseline.getSampleSize());
        assertNotNull(baseline.getGeneratedAt(), "generation timestamp must be present");
        assertDoesNotThrow(() -> Instant.parse(baseline.getGeneratedAt()), "generation timestamp must be ISO-8601");
    }

    @Test
    @DisplayName("Scenario 10: Timestamp consistency across pipeline")
    void testTimestampConsistencyAcrossPipeline() {
        SerpApiOrganicResult raw = new SerpApiOrganicResult();
        raw.setPosition(1);
        raw.setTitle("2 BHK in HSR");
        raw.setLink("https://example.com/hsr-2bhk-sample");
        raw.setSnippet("Rent ₹32,000 per month. 900 sq ft.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(raw), "HSR Layout", "2");
        RentalListingDto dto = dtos.get(0);

        String initialTimestamp = dto.getRetrievalTimestamp();
        assertNotNull(initialTimestamp);

        // Run through fairness evaluation
        fairnessEngine.evaluateAll(dtos);

        assertEquals(initialTimestamp, dto.getRetrievalTimestamp(), "Timestamp must remain identical after fairness engine evaluation");
        assertEquals(initialTimestamp, dto.getScrapedAt(), "scrapedAt must match retrievalTimestamp");
    }

    @Test
    @DisplayName("Requirement: Terminology compliance - no forbidden verified claims in system explanations")
    void testTerminologyCompliance() {
        RentalListingDto unpriced = new RentalListingDto();
        unpriced.setId("unp-1");
        unpriced.setRentAmount(null);

        fairnessEngine.evaluateListing(unpriced, List.of(unpriced));
        String explanation = unpriced.getFairnessExplanation();

        assertNotNull(explanation);
        assertFalse(explanation.toLowerCase().contains("verified listing"), "Must not claim verified listing");
        assertFalse(explanation.toLowerCase().contains("verified property"), "Must not claim verified property");
        assertFalse(explanation.toLowerCase().contains("verified rent"), "Must not claim verified rent");
        assertFalse(explanation.toLowerCase().contains("guaranteed"), "Must not claim guaranteed availability");
    }

    @Test
    @DisplayName("Scenario 11: Entity to DTO mapping preserves all provenance and extraction status fields")
    void testEntityToDtoMappingPreservesProvenanceFields() {
        RentalListingEntity entity = new RentalListingEntity();
        entity.setId("test-prov-1");
        entity.setTitle("2 BHK Apartment in Whitefield");
        entity.setLocality("Whitefield");
        entity.setRentAmount(35000);
        entity.setBhk(2);
        entity.setRetrievalTimestamp("2026-09-29T10:00:00Z");
        entity.setExtractionStatus("COMPLETE");
        entity.setPriceExplicitlyExtracted(true);
        entity.setAreaExplicitlyExtracted(true);
        entity.setFairnessAnalysisPerformed(true);

        when(rentalListingRepository.findById("test-prov-1")).thenReturn(java.util.Optional.of(entity));

        com.rentfair.service.RentalSearchService mockSearchService = org.mockito.Mockito.mock(com.rentfair.service.RentalSearchService.class);
        com.rentfair.controller.RentalSearchController controller = new com.rentfair.controller.RentalSearchController(mockSearchService, rentalListingRepository);

        org.springframework.http.ResponseEntity<RentalListingDto> response = controller.getListingById("test-prov-1");
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        RentalListingDto dto = response.getBody();
        assertNotNull(dto);
        assertEquals("2026-09-29T10:00:00Z", dto.getRetrievalTimestamp(), "retrievalTimestamp must be preserved");
        assertEquals("COMPLETE", dto.getExtractionStatus(), "extractionStatus must be preserved");
        assertTrue(dto.getPriceExplicitlyExtracted(), "priceExplicitlyExtracted must be preserved");
        assertTrue(dto.getAreaExplicitlyExtracted(), "areaExplicitlyExtracted must be preserved");
        assertTrue(dto.getFairnessAnalysisPerformed(), "fairnessAnalysisPerformed must be preserved");
    }
}
