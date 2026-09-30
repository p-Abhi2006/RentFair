package com.rentfair;

import com.rentfair.dto.MarketBaselineDto;
import com.rentfair.model.RentalListingEntity;
import com.rentfair.repository.RentalListingRepository;
import com.rentfair.service.MarketBaselineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarketBaselineServiceTest {

    @Mock
    private RentalListingRepository rentalListingRepository;

    private MarketBaselineService baselineService;

    @BeforeEach
    void setUp() {
        baselineService = new MarketBaselineService(rentalListingRepository, new com.rentfair.service.FairnessEngineService());
    }

    @Test
    void testEmptyRepositoryReturnsNullMetrics() {
        when(rentalListingRepository.findValidListingsByLocalityAndBhk(anyString(), any())).thenReturn(Collections.emptyList());

        MarketBaselineDto baseline = baselineService.getBaseline("Whitefield", 2);

        assertNotNull(baseline);
        assertEquals(0, baseline.getSampleSize());
        assertNull(baseline.getMedianRent(), "Median rent must be null when no valid listings exist");
        assertNull(baseline.getAverageRent());
        assertNull(baseline.getMedianPricePerSqft());
        assertNull(baseline.getRentIqr());
        assertTrue(baseline.getPriceDistribution().isEmpty());
    }

    @Test
    void testCalculatesMetricsStrictlyFromValidRents() {
        RentalListingEntity listing1 = new RentalListingEntity();
        listing1.setLocality("Whitefield");
        listing1.setBhk(2);
        listing1.setRentAmount(30000);
        listing1.setCarpetAreaSqft(1000); // 30/sqft

        RentalListingEntity listing2 = new RentalListingEntity();
        listing2.setLocality("Whitefield");
        listing2.setBhk(2);
        listing2.setRentAmount(40000);
        listing2.setCarpetAreaSqft(1000); // 40/sqft

        RentalListingEntity listing3 = new RentalListingEntity();
        listing3.setLocality("Whitefield");
        listing3.setBhk(2);
        listing3.setRentAmount(50000);
        listing3.setCarpetAreaSqft(null); // Area missing! Must be excluded from price/sqft

        when(rentalListingRepository.findValidListingsByLocalityAndBhk(eq("Whitefield"), eq(2)))
                .thenReturn(List.of(listing1, listing2, listing3));

        MarketBaselineDto baseline = baselineService.getBaseline("Whitefield", 2);

        assertNotNull(baseline);
        assertEquals(3, baseline.getSampleSize());
        assertEquals(40000, baseline.getMedianRent(), "Median of 30k, 40k, 50k is 40k");
        assertEquals(40000, baseline.getAverageRent());

        // Price per sqft should only consider listing1 (30.0) and listing2 (40.0) -> median 35.0
        assertNotNull(baseline.getMedianPricePerSqft());
        assertEquals(35.0, baseline.getMedianPricePerSqft());
        assertNotNull(baseline.getRentIqr());
    }

    @Test
    void testExcludesListingsWithoutAreaFromPricePerSqft() {
        RentalListingEntity listing = new RentalListingEntity();
        listing.setLocality("Whitefield");
        listing.setBhk(2);
        listing.setRentAmount(45000);
        listing.setCarpetAreaSqft(null); // No area

        when(rentalListingRepository.findValidListingsByLocalityAndBhk(eq("Whitefield"), eq(2)))
                .thenReturn(List.of(listing));

        MarketBaselineDto baseline = baselineService.getBaseline("Whitefield", 2);

        assertNotNull(baseline);
        assertEquals(1, baseline.getSampleSize());
        assertEquals(45000, baseline.getMedianRent());
        assertNull(baseline.getMedianPricePerSqft(), "Price/sqft must be null if no listings have area");
    }

    @Test
    void testBaselineCityDeduplication() {
        // When entity city is identical to locality, it must be suppressed (null)
        RentalListingEntity entityDup = new RentalListingEntity();
        entityDup.setLocality("Whitefield");
        entityDup.setCity("Whitefield");
        entityDup.setBhk(2);
        entityDup.setRentAmount(35000);

        when(rentalListingRepository.findValidListingsByLocalityAndBhk(eq("Whitefield"), eq(2)))
                .thenReturn(List.of(entityDup));

        MarketBaselineDto baselineDup = baselineService.getBaseline("Whitefield", 2);
        assertEquals("Whitefield", baselineDup.getLocality());
        assertNull(baselineDup.getCity(), "City must be null when equal to locality");

        // When entity city is distinct from locality, it must be preserved
        RentalListingEntity entityDistinct = new RentalListingEntity();
        entityDistinct.setLocality("Whitefield");
        entityDistinct.setCity("Bangalore");
        entityDistinct.setBhk(2);
        entityDistinct.setRentAmount(35000);

        when(rentalListingRepository.findValidListingsByLocalityAndBhk(eq("Whitefield"), eq(2)))
                .thenReturn(List.of(entityDistinct));

        MarketBaselineDto baselineDistinct = baselineService.getBaseline("Whitefield, Bangalore", 2);
        assertEquals("Whitefield", baselineDistinct.getLocality());
        assertEquals("Bangalore", baselineDistinct.getCity(), "Distinct city must be preserved");
    }
}
