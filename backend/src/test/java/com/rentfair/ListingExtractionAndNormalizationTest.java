package com.rentfair;

import com.rentfair.client.dto.SerpApiOrganicResult;
import com.rentfair.dto.RentalListingDto;
import com.rentfair.util.SerpApiResultParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ListingExtractionAndNormalizationTest {

    private SerpApiResultParser parser;

    @BeforeEach
    void setUp() {
        parser = new SerpApiResultParser();
    }

    @Test
    void testExtractRentFormats() {
        // Standard INR with /month
        assertEquals(35000, parser.extractRent("Beautiful flat rent ₹35,000 / month with parking"));
        assertEquals(28000, parser.extractRent("Rent: Rs. 28,000 per month in Whitefield"));
        assertEquals(42000, parser.extractRent("Asking 42,000 pm near ITPL"));

        // 'k/month' format
        assertEquals(25000, parser.extractRent("2 BHK flat rent 25k/month"));
        assertEquals(30000, parser.extractRent("Spacious home available for 30k pm"));
        assertEquals(45000, parser.extractRent("Rent: 45k"));

        // Lakh per month format
        assertEquals(120000, parser.extractRent("Luxury 4 BHK villa rent 1.2 Lakh/month"));
        assertEquals(150000, parser.extractRent("Penthouse rent: 1.5L/mo with private pool"));

        // Unparseable / missing rent
        assertNull(parser.extractRent("Call owner for pricing details. Deposit 1.5 Lakh"));
    }

    @Test
    void testExtractAreaFormats() {
        assertEquals(650, parser.extractArea("Cozy 1 BHK 650 sq ft apartment"));
        assertEquals(1200, parser.extractArea("Super built-up 1200 sqft in gated society"));
        assertEquals(1450, parser.extractArea("Carpet area: 1,450 sq.ft. with balcony"));
        assertEquals(2200, parser.extractArea("Independent duplex 2200 square feet"));
        assertEquals(950, parser.extractArea("Built-up area 950 sq feet near metro"));

        // Unparseable
        assertNull(parser.extractArea("Spacious apartment with large bedrooms and garden view"));
    }

    @Test
    void testExtractBhkFormats() {
        assertEquals(1, parser.extractBhk("1 BHK flat for rent"));
        assertEquals(2, parser.extractBhk("Spacious 2-BHK apartment with lift"));
        assertEquals(3, parser.extractBhk("3 bedroom flat in Whitefield"));
        assertEquals(4, parser.extractBhk("Luxury 4-bed villa"));
        assertEquals(1, parser.extractBhk("Cozy studio apartment near ITPL"));
        assertEquals(1, parser.extractBhk("1 RK furnished flat"));

        assertNull(parser.extractBhk("Commercial office space for lease"));
    }

    @Test
    void testDetectFurnishingTiers() {
        assertEquals("SEMI_FURNISHED", parser.detectFurnishing("2 BHK semi furnished apartment"));
        assertEquals("SEMI_FURNISHED", parser.detectFurnishing("Semi-furnished with modular kitchen"));
        assertEquals("SEMI_FURNISHED", parser.detectFurnishing("Semifurnished unit with wardrobes"));

        assertEquals("FULLY_FURNISHED", parser.detectFurnishing("Fully furnished luxury flat with TV and sofa"));
        assertEquals("FULLY_FURNISHED", parser.detectFurnishing("Well furnished 3 BHK"));

        assertEquals("UNFURNISHED", parser.detectFurnishing("Unfurnished bare shell flat"));
        assertEquals("UNFURNISHED", parser.detectFurnishing("Un-furnished 2 BHK ready to move"));

        assertNull(parser.detectFurnishing("Apartment with power backup and gym"));
    }

    @Test
    void testDetectBathrooms() {
        assertEquals(2, parser.extractBathrooms("2 BHK with 2 bathrooms and balcony"));
        assertEquals(3, parser.extractBathrooms("3 bed 3 bath luxury penthouse"));
        assertEquals(1, parser.extractBathrooms("1 BHK flat with 1 washroom"));

        assertNull(parser.extractBathrooms("Spacious apartment with modular kitchen"));
    }

    @Test
    void testNormalizeUrlStripsTrackingParameters() {
        String dirtyUrl = "https://www.magicbricks.com/propertyDetails/2bhk-whitefield?utm_source=google&utm_medium=cpc&ref=123#overview";
        String normalized = parser.normalizeUrl(dirtyUrl);

        assertEquals("https://magicbricks.com/propertyDetails/2bhk-whitefield", normalized);
    }

    @Test
    void testDeduplicateIdenticalUrls() {
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setPosition(1);
        r1.setTitle("2 BHK Flat in Whitefield");
        r1.setLink("https://www.magicbricks.com/property/101?utm_source=google");
        r1.setSnippet("Rent ₹35,000 per month. 1100 sq ft.");

        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setPosition(2);
        r2.setTitle("2 BHK Flat in Whitefield");
        r2.setLink("https://magicbricks.com/property/101?ref=organic");
        r2.setSnippet("Rent ₹35,000 per month. 1100 sq ft.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(r1, r2), "Whitefield", "2");

        assertEquals(1, dtos.size(), "Duplicate URL listing must be deduplicated");
    }

    @Test
    void testDeduplicateCompositeDuplicateSignatures() {
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setPosition(1);
        r1.setTitle("Sobha Dream Acres 2 BHK");
        r1.setLink("https://example.com/listing-a");
        r1.setSource("MagicBricks");
        r1.setSnippet("Rent ₹38,000 / month, 1200 sqft, Whitefield Bangalore.");

        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setPosition(2);
        r2.setTitle("Sobha Dream Acres 2 BHK Unit");
        r2.setLink("https://example.com/listing-b");
        r2.setSource("MagicBricks");
        r2.setSnippet("Rent ₹38,000 / month, 1200 sqft, Whitefield Bangalore.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(r1, r2), "Whitefield", "2");

        assertEquals(1, dtos.size(), "Duplicate cross-post listing from same platform with identical rent/bhk/area must be deduplicated");
    }

    @Test
    void testPreserveDistinctListingsSharingRentAndLocality() {
        // Two distinct properties that legitimately share locality, rent, and BHK must NOT be merged
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setPosition(1);
        r1.setTitle("Sobha Dream Acres 2 BHK");
        r1.setLink("https://example.com/sobha-101");
        r1.setSource("MagicBricks");
        r1.setSnippet("Rent ₹38,000 / month, 1200 sqft in Whitefield.");

        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setPosition(2);
        r2.setTitle("Prestige Lakeside Habitat 2 BHK");
        r2.setLink("https://example.com/prestige-202");
        r2.setSource("99acres");
        r2.setSnippet("Rent ₹38,000 / month, 1200 sqft in Whitefield.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(r1, r2), "Whitefield", "2");

        assertEquals(2, dtos.size(), "Distinct properties sharing rent and locality must NOT be deduplicated");
    }

    @Test
    void testGenericLocalityAndSublocalityNormalization() {
        // Pune
        RentalListingDto puneDto = new RentalListingDto();
        parser.extractLocalityAndCity(puneDto, "2 BHK flat in Kothrud, near Karve statue", "Kothrud, Pune");
        assertEquals("Kothrud", puneDto.getLocality());
        assertEquals("Pune", puneDto.getCity());

        // Mumbai
        RentalListingDto mumbaiDto = new RentalListingDto();
        parser.extractLocalityAndCity(mumbaiDto, "1 BHK apartment in Andheri West", "Andheri West, Mumbai");
        assertEquals("Andheri West", mumbaiDto.getLocality());
        assertEquals("Mumbai", mumbaiDto.getCity());

        // Gurgaon with Sector sublocality
        RentalListingDto gurgaonDto = new RentalListingDto();
        parser.extractLocalityAndCity(gurgaonDto, "Luxury 3 BHK in Sector 54 Gurgaon near Golf Course Road", "Sector 54, Gurgaon");
        assertEquals("Sector 54", gurgaonDto.getLocality());
        assertEquals("Gurgaon", gurgaonDto.getCity());
        assertEquals("Sector 54", gurgaonDto.getSubLocality());

        // Bangalore with Phase sublocality
        RentalListingDto blrDto = new RentalListingDto();
        parser.extractLocalityAndCity(blrDto, "Independent house in Electronic City Phase 1", "Electronic City, Bangalore");
        assertEquals("Electronic City", blrDto.getLocality());
        assertEquals("Bangalore", blrDto.getCity());
        assertEquals("Phase 1", blrDto.getSubLocality());
    }

    @Test
    void testExtractedAmenitiesAreExplicitlyPresent() {
        String text = "Spacious apartment with gymnasium, swimming pool, and power backup. No parking.";
        List<String> extracted = parser.detectFeatures(text);

        assertTrue(extracted.contains("Gym") || extracted.contains("Gymnasium"));
        assertTrue(extracted.contains("Swimming Pool"));
        assertTrue(extracted.contains("Power Backup"));

        // Must not contain amenities not present in text
        assertFalse(extracted.contains("Lift"));
        assertFalse(extracted.contains("Clubhouse"));
    }

    @Test
    void testEvidenceBasedConfidenceScore() {
        // High evidence: rent, area, bhk, furnishing, bathrooms, known platform
        SerpApiOrganicResult rich = new SerpApiOrganicResult();
        rich.setPosition(1);
        rich.setTitle("2 BHK Apartment in Whitefield");
        rich.setLink("https://www.housing.com/details/1");
        rich.setSource("Housing.com");
        rich.setSnippet("Rent ₹40,000 per month, 1150 sq ft, 2 bath, semi furnished.");

        List<RentalListingDto> dtos = parser.parseResults(List.of(rich), "Whitefield", "2");
        RentalListingDto dto = dtos.get(0);

        assertEquals(40000, dto.getRentAmount());
        assertEquals(1150, dto.getCarpetAreaSqft());
        assertEquals(2, dto.getBhk());
        assertEquals("SEMI_FURNISHED", dto.getFurnishing());
        assertEquals(2, dto.getBathrooms());

        com.rentfair.service.FairnessEngineService fairnessEngine = new com.rentfair.service.FairnessEngineService();
        Double richConf = fairnessEngine.calculateConfidence(10, 1, dto);
        assertNotNull(richConf);
        assertTrue(richConf >= 0.90, "Rich listing must have high evidence-based confidence >= 0.90");

        // Lower evidence: only rent
        SerpApiOrganicResult sparse = new SerpApiOrganicResult();
        sparse.setPosition(2);
        sparse.setTitle("Rental Property");
        sparse.setLink("https://unknown-domain.com/ad");
        sparse.setSnippet("Rent ₹30,000 per month. Contact owner.");

        List<RentalListingDto> sparseDtos = parser.parseResults(List.of(sparse), "Whitefield", "all");
        RentalListingDto sparseDto = sparseDtos.get(0);

        Double sparseConf = fairnessEngine.calculateConfidence(10, 1, sparseDto);
        assertNotNull(sparseConf);
        assertTrue(sparseConf < richConf, "Sparse listing must have lower confidence than rich listing");
    }
}

