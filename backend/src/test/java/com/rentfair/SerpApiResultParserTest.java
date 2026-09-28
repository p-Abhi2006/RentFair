package com.rentfair;

import com.rentfair.client.dto.SerpApiOrganicResult;
import com.rentfair.dto.RentalListingDto;
import com.rentfair.util.SerpApiResultParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SerpApiResultParserTest {

    private SerpApiResultParser parser;

    @BeforeEach
    void setUp() {
        parser = new SerpApiResultParser();
    }

    @Test
    void testParseOrganicResultsExtractsAttributes() {
        SerpApiOrganicResult sample = new SerpApiOrganicResult();
        sample.setPosition(1);
        sample.setTitle("2 BHK Apartment for Rent in Whitefield Bangalore");
        sample.setLink("https://www.magicbricks.com/propertyDetails/2bhk-whitefield-1001");
        sample.setDisplayedLink("https://www.magicbricks.com > Property Details");
        sample.setSnippet("Spacious 2 BHK semi furnished apartment with power backup, gym, 1180 sq ft carpet area. Rent: ₹38,000 per month, deposit 1.5L.");
        sample.setSource("MagicBricks");

        List<RentalListingDto> dtos = parser.parseResults(List.of(sample), "Whitefield, Bangalore", "2");

        assertNotNull(dtos);
        assertEquals(1, dtos.size());

        RentalListingDto dto = dtos.get(0);
        assertEquals("MagicBricks", dto.getSourcePlatform());
        assertEquals("https://magicbricks.com/propertyDetails/2bhk-whitefield-1001", dto.getSourceUrl());
        assertEquals(38000, dto.getRentAmount());
        assertEquals(2, dto.getBhk());
        assertEquals(1180, dto.getCarpetAreaSqft());
        assertEquals("SEMI_FURNISHED", dto.getFurnishing());
        assertEquals("Whitefield", dto.getLocality());
        assertFalse(dto.getIsPlaceholder());
        assertTrue(dto.getFeatures().contains("Power Backup"));
    }

    @Test
    void testParseDoesNotInventMissingFields() {
        SerpApiOrganicResult sample = new SerpApiOrganicResult();
        sample.setPosition(2);
        sample.setTitle("Rental in Bangalore North");
        sample.setLink("https://example.com/listing/99");
        sample.setSnippet("Contact owner for price and details. Prime location near metro.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(sample), "Bangalore", "all");
        assertEquals(1, dtos.size());
        RentalListingDto dto = dtos.get(0);

        // Missing fields must strictly remain null, never ₹0 or fabricated defaults
        assertNull(dto.getRentAmount(), "Missing rent must be null, never 0");
        assertNull(dto.getCarpetAreaSqft(), "Missing area must be null, never estimated or 0");
        assertNull(dto.getDepositAmount(), "Missing deposit must be null, never 3x rent");
        assertNull(dto.getBathrooms(), "Missing bathrooms must be null, never fabricated");
        assertNull(dto.getPricePerSqft(), "Price per sqft must be null when area or rent is missing");
        assertNull(dto.getFairnessScore(), "Fairness score must be null for unpriced listings");
        assertNull(dto.getFairnessCategory(), "Fairness category must be null for unpriced listings");
        assertNull(dto.getVariancePercentage(), "Variance percentage must be null for unpriced listings");
        assertNull(dto.getComparableCount(), "Comparable count must be null for unpriced listings");
        assertNull(dto.getConfidenceScore(), "Confidence score must be null for unpriced listings");
    }

    @Test
    void testUnpricedListingsExcludedFromMarketBaselineCalculations() {
        SerpApiOrganicResult valid1 = new SerpApiOrganicResult();
        valid1.setPosition(1);
        valid1.setTitle("2 BHK Apartment in Whitefield");
        valid1.setLink("https://example.com/1");
        valid1.setSnippet("Rent ₹40,000 per month. Carpet area 1000 sq ft.");

        SerpApiOrganicResult valid2 = new SerpApiOrganicResult();
        valid2.setPosition(2);
        valid2.setTitle("2 BHK Apartment in Whitefield");
        valid2.setLink("https://example.com/2");
        valid2.setSnippet("Rent ₹50,000 per month. Carpet area 1250 sq ft.");

        SerpApiOrganicResult unpriced = new SerpApiOrganicResult();
        unpriced.setPosition(3);
        unpriced.setTitle("2 BHK Flat in Whitefield");
        unpriced.setLink("https://example.com/3");
        unpriced.setSnippet("Call owner for pricing details. 2 BHK available immediately.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(valid1, valid2, unpriced), "Whitefield", "2");
        assertEquals(3, dtos.size());

        new com.rentfair.service.FairnessEngineService().evaluateAll(dtos);

        // Valid listings should have market statistics based ONLY on valid1 and valid2 (median = 45,000)
        RentalListingDto dto1 = dtos.get(0);
        RentalListingDto dto2 = dtos.get(1);
        RentalListingDto dto3 = dtos.get(2);

        assertEquals(40000, dto1.getRentAmount());
        assertEquals(40.0, dto1.getPricePerSqft()); // 40000 / 1000
        assertEquals(1, dto1.getComparableCount(), "Target listing excluded; only 1 comparable remains");
        assertNotNull(dto1.getFairnessScore());
        assertNotNull(dto1.getVariancePercentage());

        assertEquals(50000, dto2.getRentAmount());
        assertEquals(40.0, dto2.getPricePerSqft()); // 50000 / 1250
        assertEquals(1, dto2.getComparableCount());

        // Unpriced listing must be completely excluded from metrics
        assertNull(dto3.getRentAmount());
        assertNull(dto3.getPricePerSqft());
        assertNull(dto3.getFairnessScore());
        assertNull(dto3.getFairnessCategory());
        assertNull(dto3.getVariancePercentage());
        assertNull(dto3.getComparableCount());
        assertNull(dto3.getConfidenceScore());
    }

    @Test
    void testPricePerSqftRequiresBothValidRentAndArea() {
        SerpApiOrganicResult rentOnly = new SerpApiOrganicResult();
        rentOnly.setPosition(1);
        rentOnly.setTitle("1 BHK Flat");
        rentOnly.setLink("https://example.com/rent-only");
        rentOnly.setSnippet("Rent ₹25,000 per month. No area specified.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(rentOnly), "Whitefield", "1");
        assertEquals(1, dtos.size());

        RentalListingDto dto = dtos.get(0);
        assertEquals(25000, dto.getRentAmount());
        assertNull(dto.getCarpetAreaSqft());
        assertNull(dto.getPricePerSqft(), "Price per sqft must be null if carpet area is missing");
    }
}
