package com.rentfair;

import com.rentfair.client.SerpApiClient;
import com.rentfair.client.dto.SerpApiOrganicResult;
import com.rentfair.client.dto.SerpApiResponse;
import com.rentfair.controller.MarketComparisonController;
import com.rentfair.dto.LocationComparisonRequest;
import com.rentfair.dto.LocationComparisonResponse;
import com.rentfair.dto.LocalityMarketStatsDto;
import com.rentfair.dto.RentalListingDto;
import com.rentfair.exception.InvalidSearchParameterException;
import com.rentfair.repository.RentalListingRepository;
import com.rentfair.repository.SearchQueryRepository;
import com.rentfair.service.FairnessEngineService;
import com.rentfair.service.MarketComparisonService;
import com.rentfair.service.MultiLocalitySearchService;
import com.rentfair.util.RentalQueryBuilder;
import com.rentfair.util.SerpApiResultParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarketComparisonTest {

    @Mock
    private SerpApiClient serpApiClient;

    @Mock
    private SearchQueryRepository searchQueryRepository;

    @Mock
    private RentalListingRepository rentalListingRepository;

    private RentalQueryBuilder queryBuilder;
    private SerpApiResultParser resultParser;
    private FairnessEngineService fairnessEngineService;
    private MarketComparisonService marketComparisonService;
    private MultiLocalitySearchService multiLocalitySearchService;
    private MarketComparisonController controller;

    @BeforeEach
    void setUp() {
        queryBuilder = new RentalQueryBuilder();
        resultParser = new SerpApiResultParser();
        fairnessEngineService = new FairnessEngineService();
        marketComparisonService = new MarketComparisonService(fairnessEngineService);
        multiLocalitySearchService = new MultiLocalitySearchService(
                serpApiClient,
                queryBuilder,
                resultParser,
                searchQueryRepository,
                rentalListingRepository,
                marketComparisonService
        );
        controller = new MarketComparisonController(multiLocalitySearchService);
    }

    private RentalListingDto createMockListing(String id, String locality, Integer rent, Integer bhk, Integer area) {
        RentalListingDto dto = new RentalListingDto();
        dto.setId(id);
        dto.setTitle(bhk + " BHK Apartment in " + locality);
        dto.setLocality(locality);
        dto.setCity("Bangalore");
        dto.setRentAmount(rent);
        dto.setBhk(bhk);
        dto.setCarpetAreaSqft(area);
        dto.setPropertyType("APARTMENT");
        dto.setFurnishing("SEMI_FURNISHED");
        dto.setBathrooms(2);
        dto.setSourceUrl("https://example.com/" + id);
        return dto;
    }

    @Test
    @DisplayName("Validation: Rejects less than 2 locations")
    void testRejectsLessThanTwoLocations() {
        LocationComparisonRequest req1 = new LocationComparisonRequest(List.of("Whitefield"), 2, "all", "all", null, null);
        assertThrows(InvalidSearchParameterException.class, () -> multiLocalitySearchService.compareLocations(req1));

        LocationComparisonRequest reqEmpty = new LocationComparisonRequest(Collections.emptyList(), 2, "all", "all", null, null);
        assertThrows(InvalidSearchParameterException.class, () -> multiLocalitySearchService.compareLocations(reqEmpty));

        LocationComparisonRequest reqDuplicates = new LocationComparisonRequest(List.of("Whitefield", "Whitefield"), 2, "all", "all", null, null);
        assertThrows(InvalidSearchParameterException.class, () -> multiLocalitySearchService.compareLocations(reqDuplicates));
    }

    @Test
    @DisplayName("Validation: Rejects more than 5 locations")
    void testRejectsMoreThanFiveLocations() {
        List<String> sixLocations = List.of("Whitefield", "Koramangala", "HSR Layout", "Indiranagar", "Bellandur", "Marathahalli");
        LocationComparisonRequest req = new LocationComparisonRequest(sixLocations, 2, "all", "all", null, null);
        assertThrows(InvalidSearchParameterException.class, () -> multiLocalitySearchService.compareLocations(req));
    }

    @Test
    @DisplayName("MarketComparisonService: Computes accurate market-level statistics across localities")
    void testMarketLevelStatisticsComputation() {
        // Locality A: Whitefield (median 30k, pps 30.0)
        List<RentalListingDto> whitefieldListings = List.of(
                createMockListing("w1", "Whitefield", 25000, 2, 1000),
                createMockListing("w2", "Whitefield", 30000, 2, 1000),
                createMockListing("w3", "Whitefield", 35000, 2, 1000)
        );

        // Locality B: Koramangala (median 45k, pps 45.0)
        List<RentalListingDto> koramangalaListings = List.of(
                createMockListing("k1", "Koramangala", 40000, 2, 1000),
                createMockListing("k2", "Koramangala", 45000, 2, 1000),
                createMockListing("k3", "Koramangala", 50000, 2, 1000)
        );

        // Locality C: HSR Layout (median 36k, pps 36.0, plus one unpriced listing)
        RentalListingDto unpriced = createMockListing("h-unpriced", "HSR Layout", null, 2, 1000);
        unpriced.setRentAmount(null);
        List<RentalListingDto> hsrListings = List.of(
                createMockListing("h1", "HSR Layout", 32000, 2, 1000),
                createMockListing("h2", "HSR Layout", 36000, 2, 1000),
                createMockListing("h3", "HSR Layout", 40000, 2, 1000),
                unpriced
        );

        Map<String, List<RentalListingDto>> datasets = new LinkedHashMap<>();
        datasets.put("Whitefield", whitefieldListings);
        datasets.put("Koramangala", koramangalaListings);
        datasets.put("HSR Layout", hsrListings);

        LocationComparisonRequest request = new LocationComparisonRequest(
                List.of("Whitefield", "Koramangala", "HSR Layout"),
                2, "all", "all", null, null
        );

        LocationComparisonResponse response = marketComparisonService.buildComparison(request, datasets);

        assertNotNull(response);
        assertEquals(3, response.getLocalities().size());

        // Verify Whitefield stats
        LocalityMarketStatsDto wStats = response.getLocalities().get(0);
        assertEquals("Whitefield", wStats.getLocality());
        assertEquals(3, wStats.getTotalListingCount());
        assertEquals(3, wStats.getValidPricedListingCount());
        assertEquals(3, wStats.getListingsWithAreaCount());
        assertEquals(30000, wStats.getMedianRent());
        assertEquals(30000, wStats.getAverageRent());
        assertEquals(25000, wStats.getQ1());
        assertEquals(35000, wStats.getQ3());
        assertEquals(10000, wStats.getIqr());
        assertEquals(30.0, wStats.getMedianPricePerSqft());

        // Verify Koramangala stats
        LocalityMarketStatsDto kStats = response.getLocalities().get(1);
        assertEquals("Koramangala", kStats.getLocality());
        assertEquals(45000, kStats.getMedianRent());
        assertEquals(45.0, kStats.getMedianPricePerSqft());

        // Verify HSR Layout stats: unpriced listing excluded from median calculations
        LocalityMarketStatsDto hStats = response.getLocalities().get(2);
        assertEquals("HSR Layout", hStats.getLocality());
        assertEquals(4, hStats.getTotalListingCount(), "Total listings includes unpriced");
        assertEquals(3, hStats.getValidPricedListingCount(), "Only 3 have valid price");
        assertEquals(3, hStats.getSampleSize());
        assertEquals(36000, hStats.getMedianRent());

        // Verify Market Comparison Summary
        assertNotNull(response.getComparisonSummary());
        assertEquals("Whitefield", response.getComparisonSummary().getLowestMedianRent().getLocality());
        assertEquals("₹30,000/mo", response.getComparisonSummary().getLowestMedianRent().getMetricValue());

        assertEquals("Koramangala", response.getComparisonSummary().getHighestMedianRent().getLocality());
        assertEquals("₹45,000/mo", response.getComparisonSummary().getHighestMedianRent().getMetricValue());

        assertEquals(15000, response.getComparisonSummary().getRentSpread());
        assertTrue(response.getComparisonSummary().getRentSpreadDescription().contains("₹15,000/mo (+50.0%)"));

        // Verify requirement: Never call cheaper/more expensive without underlying numbers
        for (String observation : response.getComparisonSummary().getObservations()) {
            assertTrue(observation.contains("₹"), "Observations must cite exact underlying currency figures");
        }
    }

    @Test
    @DisplayName("MarketComparisonService: Area-based price density statistics when carpet area exists")
    void testPricePerSqftStatistics() {
        List<RentalListingDto> locAListings = List.of(
                createMockListing("a1", "LocA", 30000, 2, 1000), // 30/sqft
                createMockListing("a2", "LocA", 40000, 2, 1000)  // 40/sqft -> median 35/sqft
        );

        List<RentalListingDto> locBListings = List.of(
                createMockListing("b1", "LocB", 50000, 2, 1000), // 50/sqft
                createMockListing("b2", "LocB", 60000, 2, 1000)  // 60/sqft -> median 55/sqft
        );

        Map<String, List<RentalListingDto>> datasets = Map.of("LocA", locAListings, "LocB", locBListings);
        LocationComparisonRequest request = new LocationComparisonRequest(List.of("LocA", "LocB"), 2, "all", "all", null, null);

        LocationComparisonResponse response = marketComparisonService.buildComparison(request, datasets);

        assertEquals(35.0, response.getComparisonSummary().getLowestPricePerSqft().getNumericValue());
        assertEquals(55.0, response.getComparisonSummary().getHighestPricePerSqft().getNumericValue());
        assertEquals(20.0, response.getComparisonSummary().getPricePerSqftSpread());
        assertTrue(response.getComparisonSummary().getPricePerSqftSpreadDescription().contains("₹20.0/sqft"));
    }

    @Test
    @DisplayName("MarketComparisonService: Locality with missing area data sets pricePerSqft to null")
    void testMissingAreaDataHandling() {
        List<RentalListingDto> locNoArea = List.of(
                createMockListing("na1", "LocNoArea", 30000, 2, null),
                createMockListing("na2", "LocNoArea", 35000, 2, null)
        );

        List<RentalListingDto> locWithArea = List.of(
                createMockListing("wa1", "LocWithArea", 40000, 2, 1000),
                createMockListing("wa2", "LocWithArea", 45000, 2, 1000)
        );

        Map<String, List<RentalListingDto>> datasets = Map.of("LocNoArea", locNoArea, "LocWithArea", locWithArea);
        LocationComparisonRequest request = new LocationComparisonRequest(List.of("LocNoArea", "LocWithArea"), 2, "all", "all", null, null);

        LocationComparisonResponse response = marketComparisonService.buildComparison(request, datasets);

        LocalityMarketStatsDto noAreaStats = response.getLocalities().stream()
                .filter(l -> l.getLocality().equals("LocNoArea"))
                .findFirst().orElseThrow();

        assertNull(noAreaStats.getMedianPricePerSqft(), "Locality lacking area data must have null medianPricePerSqft");
        assertEquals(0, noAreaStats.getListingsWithAreaCount());
        assertEquals(2, noAreaStats.getValidPricedListingCount());
    }

    @Test
    @DisplayName("End-to-End Controller POST: Accepts request and returns 200 OK with comparison")
    void testControllerPostEndpoint() {
        // Mock SerpApi client to return raw listings for 2 locations
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setTitle("2 BHK Apartment in Whitefield for Rent");
        r1.setSnippet("Rent is ₹32,000 per month, carpet area 1100 sqft, semi furnished.");
        r1.setLink("https://magicbricks.com/w1");

        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setTitle("2 BHK Flat in Koramangala for Rent");
        r2.setSnippet("Rent ₹45,000/month, built up 1200 sqft, 2 baths.");
        r2.setLink("https://housing.com/k1");

        SerpApiResponse resp1 = new SerpApiResponse();
        resp1.setOrganicResults(List.of(r1));

        SerpApiResponse resp2 = new SerpApiResponse();
        resp2.setOrganicResults(List.of(r2));

        when(serpApiClient.search(anyString())).thenReturn(resp1, resp2);

        LocationComparisonRequest request = new LocationComparisonRequest(
                List.of("Whitefield", "Koramangala"),
                2, "all", "all", null, null
        );

        ResponseEntity<LocationComparisonResponse> responseEntity = controller.compareMarketsPost(request);

        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCode().value());
        LocationComparisonResponse body = responseEntity.getBody();
        assertNotNull(body);
        assertEquals(2, body.getLocalities().size());
        assertEquals(2, body.getBhk());
        assertNotNull(body.getGeneratedAt());
        assertNotNull(body.getComparisonSummary());
    }

    @Test
    @DisplayName("End-to-End Controller GET: Accepts comma-separated locations and returns 200 OK")
    void testControllerGetEndpoint() {
        SerpApiOrganicResult r1 = new SerpApiOrganicResult();
        r1.setTitle("2 BHK in Indiranagar");
        r1.setSnippet("Rent ₹50,000/month 1200 sqft");
        r1.setLink("https://magicbricks.com/i1");

        SerpApiOrganicResult r2 = new SerpApiOrganicResult();
        r2.setTitle("2 BHK in HSR Layout");
        r2.setSnippet("Rent ₹38,000 per month 1100 sqft");
        r2.setLink("https://nobroker.com/h1");

        SerpApiResponse resp1 = new SerpApiResponse();
        resp1.setOrganicResults(List.of(r1));
        SerpApiResponse resp2 = new SerpApiResponse();
        resp2.setOrganicResults(List.of(r2));

        when(serpApiClient.search(anyString())).thenReturn(resp1, resp2);

        ResponseEntity<LocationComparisonResponse> responseEntity = controller.compareMarketsGet(
                "Indiranagar, HSR Layout",
                null,
                2,
                "all",
                "all",
                null,
                null
        );

        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCode().value());
        LocationComparisonResponse body = responseEntity.getBody();
        assertNotNull(body);
        assertEquals(2, body.getLocalities().size());
    }
}
