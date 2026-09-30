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
    void testSingleTokenLocalityDoesNotFabricateCity() {
        String[] localities = {"Whitefield", "Koramangala", "HSR Layout", "Indiranagar", "Jayanagar"};
        for (String loc : localities) {
            RentalListingDto dto = new RentalListingDto();
            parser.extractLocalityAndCity(dto, "2 BHK apartment in " + loc, loc);
            assertEquals(loc, dto.getLocality());
            assertNull(dto.getCity(), "City must be null for single-token locality search: " + loc);
        }
    }

    @Test
    void testDuplicateTokensInSearchLocationDoNotSetCity() {
        RentalListingDto dupDto = new RentalListingDto();
        parser.extractLocalityAndCity(dupDto, "2 BHK in Whitefield", "Whitefield, Whitefield");
        assertEquals("Whitefield", dupDto.getLocality());
        assertNull(dupDto.getCity(), "City must be null when equal to locality");

        RentalListingDto distinctDto = new RentalListingDto();
        parser.extractLocalityAndCity(distinctDto, "2 BHK in Whitefield Bangalore", "Whitefield, Bangalore");
        assertEquals("Whitefield", distinctDto.getLocality());
        assertEquals("Bangalore", distinctDto.getCity(), "Legitimate distinct city must be preserved");
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

    @Test
    void testRelevanceGateAcceptsValidResidentialRentals() {
        // Case 1: Standard 2 BHK flat for rent
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setTitle("2 BHK flat for rent in Whitefield Bangalore");
        r1.setLink("https://www.magicbricks.com/propertyDetails/2-bhk-flat-for-rent-in-whitefield");
        r1.setSnippet("Rent ₹35,000 / month. 1100 sqft carpet area in gated society.");
        assertTrue(parser.isRentalListingCandidate(r1), "2 BHK flat for rent must be accepted");

        // Case 2: 1100 sqft furnished apartment without price (unpriced legitimate listing)
        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setTitle("1100 sqft furnished apartment in Koramangala");
        r2.setLink("https://www.housing.com/details/apt-koramangala-101");
        r2.setSnippet("Spacious 1100 sq ft furnished apartment with 2 balconies. Contact owner for pricing details.");
        assertTrue(parser.isRentalListingCandidate(r2), "Unpriced furnished apartment must be accepted");

        // Case 3: 3 BHK villa in HSR Layout
        SerpApiOrganicResult r3 = new SerpApiOrganicResult();
        r3.setTitle("3 BHK villa in HSR Layout");
        r3.setLink("https://example-properties.com/hsr-villa-3bhk");
        r3.setSnippet("Independent 3 BHK villa in HSR Layout Sector 2, 2400 sqft, available for rent.");
        assertTrue(parser.isRentalListingCandidate(r3), "3 BHK villa in HSR Layout must be accepted");

        // Case 4: Unpriced listing with strong property signals
        SerpApiOrganicResult r4 = new SerpApiOrganicResult();
        r4.setTitle("Spacious 3 Bedroom House for rent in Indiranagar");
        r4.setLink("https://www.99acres.com/house-rent-indiranagar");
        r4.setSnippet("1800 sq ft, semi furnished independent duplex house for rent with car parking.");
        assertTrue(parser.isRentalListingCandidate(r4), "Unpriced listing with strong property signals must be accepted");

        // Case 5: Real-world Whitefield listing with unencoded braces in URL query
        SerpApiOrganicResult r5 = new SerpApiOrganicResult();
        r5.setTitle("2 BHK Flats for Rent in Whitefield, Bangalore");
        r5.setLink("https://www.nobroker.in/property/rent/bangalore/Whitefield/?searchParam={\"lat\":12.9698,\"lon\":77.75}");
        r5.setSnippet("2 BHK Flats for rent in Whitefield, Bangalore. Monthly 2 BHK rent typically ranges between ₹18000 to ₹28000.");
        assertTrue(parser.isRentalListingCandidate(r5), "Portal URL with unencoded query parameters must be accepted");

        // Case 6: RealEstateIndia portal listing
        SerpApiOrganicResult r6 = new SerpApiOrganicResult();
        r6.setTitle("Flats / Apartments on Rent in Whitefield, Bangalore");
        r6.setLink("https://www.realestateindia.com/bangalore-property/flats-apartments-for-rent-in-whitefield.htm");
        r6.setSnippet("2 BHK for Rent, Rs. 52000, 1333 Sq.ft. It's in a gated community with 80+ amenities.");
        assertTrue(parser.isRentalListingCandidate(r6), "RealEstateIndia portal listing must be accepted");

        // Case 7: 2 BHK House for rent (house keyword property type)
        SerpApiOrganicResult r7 = new SerpApiOrganicResult();
        r7.setTitle("2 BHK House for rent in Whitefield, Bangalore Without Brokerage");
        r7.setLink("https://www.99acres.com/2-bhk-independent-house-for-rent-in-whitefield-bangalore-east-without-brokerage-ffid");
        r7.setSnippet("2 Bedroom House for rent. Whitefield ₹23,000 / month • 2 bhk independent villa • offers 2 bedrooms.");
        assertTrue(parser.isRentalListingCandidate(r7), "2 BHK House for rent must be accepted");

        // Case 8: Non-portal direct owner classified with BHK + Rent
        SerpApiOrganicResult r8 = new SerpApiOrganicResult();
        r8.setTitle("2 BHK near ITPL Whitefield for rent");
        r8.setLink("https://bangalore-rentals-classifieds.in/view/2bhk-whitefield-101");
        r8.setSnippet("Spacious 2 BHK available immediately, rent 32,000 per month, 1200 sqft, semi-furnished.");
        assertTrue(parser.isRentalListingCandidate(r8), "Non-portal with BHK and rent context must be accepted");

        // Case 9: Unpriced Mc Fortune listing from live SerpApi results
        SerpApiOrganicResult r9 = new SerpApiOrganicResult();
        r9.setTitle("2 BHK Flats for Rent in Whitefield, Bangalore - Mc Fortune");
        r9.setLink("https://www.nobroker.in/2bhk-flats-for-rent-in-mc-fortune-whitefield-bangalore-prjtl");
        r9.setSnippet("Get Without Brokerage 2 BHK Gated Community Flats for Rent in Whitefield, Bangalore along with Rent Agreement and BEST Trusted local Packers And Movers.");
        assertTrue(parser.isRentalListingCandidate(r9), "Unpriced live Mc Fortune NoBroker listing must be accepted");
    }

    @Test
    void testRelevanceGateRejectsNonRentalOrganicResults() {
        // Case 5: Merriam-Webster RENT Definition & Meaning
        SerpApiOrganicResult r5 = new SerpApiOrganicResult();
        r5.setTitle("RENT Definition & Meaning - Merriam-Webster");
        r5.setLink("https://www.merriam-webster.com/dictionary/rent");
        r5.setSnippet("The meaning of RENT is property or money given as payment for the use of property.");
        assertFalse(parser.isRentalListingCandidate(r5), "Merriam-Webster dictionary definition must be rejected");

        // Case 6: Wikipedia Economic rent
        SerpApiOrganicResult r6 = new SerpApiOrganicResult();
        r6.setTitle("Economic rent - Wikipedia");
        r6.setLink("https://en.wikipedia.org/wiki/Economic_rent");
        r6.setSnippet("In economics, economic rent is any payment to an owner or factor of production in excess of the cost.");
        assertFalse(parser.isRentalListingCandidate(r6), "Wikipedia economic rent article must be rejected");

        // Case 7: IMDb Rent (2005)
        SerpApiOrganicResult r7 = new SerpApiOrganicResult();
        r7.setTitle("Rent (2005) - IMDb");
        r7.setLink("https://www.imdb.com/title/tt0294870/");
        r7.setSnippet("Directed by Chris Columbus. With Rosario Dawson, Taye Diggs. This musical film depicts young Bohemians in East Village.");
        assertFalse(parser.isRentalListingCandidate(r7), "IMDb movie must be rejected");

        // Case 8: UNDP Rental Subsidy scheme
        SerpApiOrganicResult r8 = new SerpApiOrganicResult();
        r8.setTitle("Rental Subsidy - UNDP");
        r8.setLink("https://www.undp.org/procurement/rental-subsidy-scheme");
        r8.setSnippet("Policy details and documentation regarding UN personnel rental subsidy scheme and eligibility.");
        assertFalse(parser.isRentalListingCandidate(r8), "UNDP rental subsidy policy must be rejected");

        // Case 9: Pet Shop Boys - Rent
        SerpApiOrganicResult r9 = new SerpApiOrganicResult();
        r9.setTitle("Pet Shop Boys – Rent (Official Music Video)");
        r9.setLink("https://www.youtube.com/watch?v=petshopboys-rent");
        r9.setSnippet("Official music video for Rent by Pet Shop Boys. Taken from the studio album Actually.");
        assertFalse(parser.isRentalListingCandidate(r9), "Pet Shop Boys song on YouTube must be rejected");

        // Case 10: Freedo Rentals Bike Rental App
        SerpApiOrganicResult r10 = new SerpApiOrganicResult();
        r10.setTitle("Freedo Rentals Bike Rental App - Apps on Google Play");
        r10.setLink("https://play.google.com/store/apps/details?id=com.freedo.rentals");
        r10.setSnippet("Affordable two-wheeler and bike rental app across Bangalore and Hyderabad. Rent scooty on daily/monthly basis.");
        assertFalse(parser.isRentalListingCandidate(r10), "Bike rental Google Play app must be rejected");

        // Case 11: Income Tax FAQs on TDS on Rent
        SerpApiOrganicResult r11 = new SerpApiOrganicResult();
        r11.setTitle("FAQs on TDS on Rent | Income Tax Department");
        r11.setLink("https://www.incometax.gov.in/iec/foportal/help/tds-on-rent");
        r11.setSnippet("Tax deducted at source under section 194-IB on payment of rent by individual and HUF.");
        assertFalse(parser.isRentalListingCandidate(r11), "TDS on rent tax guide must be rejected");

        // Case 12: CM Housing Rent Scheme
        SerpApiOrganicResult r12 = new SerpApiOrganicResult();
        r12.setTitle("CM Housing Rent Scheme and Guidelines");
        r12.setLink("https://housing.gov.in/schemes/cm-rent");
        r12.setSnippet("Guidelines and subsidies under Chief Minister housing rent assistance program.");
        assertFalse(parser.isRentalListingCandidate(r12), "Government housing scheme must be rejected");
    }

    @Test
    void testExcludedResultsDoNotBecomeListingsOrEnterBaseline() {
        // Valid listing 1 (priced)
        SerpApiOrganicResult valid1 = new SerpApiOrganicResult();
        valid1.setTitle("2 BHK Apartment for Rent in Whitefield");
        valid1.setLink("https://www.nobroker.in/property/rent/2bhk-whitefield-1");
        valid1.setSnippet("Rent ₹36,000 / month, 1150 sq ft carpet area, 2 bathrooms.");

        // Valid listing 2 (unpriced legitimate listing)
        SerpApiOrganicResult valid2 = new SerpApiOrganicResult();
        valid2.setTitle("1200 sqft furnished flat in Whitefield");
        valid2.setLink("https://www.magicbricks.com/property/whitefield-2");
        valid2.setSnippet("Spacious 2 BHK furnished flat in gated society. Contact owner for rent quote.");

        // 5 Non-rental results
        SerpApiOrganicResult nonRental1 = new SerpApiOrganicResult();
        nonRental1.setTitle("RENT Definition & Meaning - Merriam-Webster");
        nonRental1.setLink("https://www.merriam-webster.com/dictionary/rent");

        SerpApiOrganicResult nonRental2 = new SerpApiOrganicResult();
        nonRental2.setTitle("Economic rent - Wikipedia");
        nonRental2.setLink("https://en.wikipedia.org/wiki/Economic_rent");

        SerpApiOrganicResult nonRental3 = new SerpApiOrganicResult();
        nonRental3.setTitle("Rent (2005) - IMDb");
        nonRental3.setLink("https://www.imdb.com/title/tt0294870/");

        SerpApiOrganicResult nonRental4 = new SerpApiOrganicResult();
        nonRental4.setTitle("Rental Subsidy - UNDP");
        nonRental4.setLink("https://www.undp.org/subsidy");

        SerpApiOrganicResult nonRental5 = new SerpApiOrganicResult();
        nonRental5.setTitle("Pet Shop Boys - Rent");
        nonRental5.setLink("https://www.youtube.com/watch?v=12345");

        List<SerpApiOrganicResult> rawResults = List.of(
                valid1, nonRental1, nonRental2, valid2, nonRental3, nonRental4, nonRental5
        );

        List<RentalListingDto> dtos = parser.parseResults(rawResults, "Whitefield", "2");

        // Exactly 2 listings must survive the relevance gate
        assertEquals(2, dtos.size(), "Only genuine residential rental listings must be returned");
        assertEquals("2 BHK Apartment for Rent in Whitefield", dtos.get(0).getTitle());
        assertEquals(36000, dtos.get(0).getRentAmount());

        // Unpriced listing is preserved with null rent
        assertEquals("1200 sqft furnished flat in Whitefield", dtos.get(1).getTitle());
        assertNull(dtos.get(1).getRentAmount(), "Unpriced listing must have null rent, never 0 or fabricated");
        assertEquals(1200, dtos.get(1).getCarpetAreaSqft());
    }
}

