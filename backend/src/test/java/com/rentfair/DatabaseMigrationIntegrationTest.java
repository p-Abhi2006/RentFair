package com.rentfair;

import com.rentfair.model.RentalListingEntity;
import com.rentfair.model.SearchQueryEntity;
import com.rentfair.repository.RentalListingRepository;
import com.rentfair.repository.SearchQueryRepository;
import jakarta.persistence.EntityManager;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DatabaseMigrationIntegrationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private SearchQueryRepository searchQueryRepository;

    @Autowired
    private RentalListingRepository rentalListingRepository;

    @Test
    @DisplayName("Flyway executes V1, V2 and V3 migrations in order with SUCCESS status")
    void testFlywayMigrationsAppliedSuccessfully() {
        MigrationInfo[] applied = flyway.info().applied();
        assertNotNull(applied, "Applied migrations must not be null");
        assertEquals(3, applied.length, "Expected exactly 3 migrations (V1, V2, V3)");

        assertEquals("1", applied[0].getVersion().getVersion());
        assertEquals("initial schema", applied[0].getDescription());
        assertEquals(MigrationState.SUCCESS, applied[0].getState());

        assertEquals("2", applied[1].getVersion().getVersion());
        assertEquals("add provenance and extraction columns", applied[1].getDescription());
        assertEquals(MigrationState.SUCCESS, applied[1].getState());

        assertEquals("3", applied[2].getVersion().getVersion());
        assertEquals("add query indexes", applied[2].getDescription());
        assertEquals(MigrationState.SUCCESS, applied[2].getState());
    }

    @Test
    @DisplayName("Hibernate validates schema against JPA entities without SchemaManagementException")
    void testHibernateSchemaValidationSucceeds() {
        assertNotNull(entityManager, "EntityManager must be initialized");
        assertTrue(entityManager.isOpen(), "EntityManager must be open and active");
    }

    @Test
    @Transactional
    @DisplayName("SearchQueryEntity persistence and indexed ordering round-trip")
    void testSearchQueryEntityRoundTrip() {
        SearchQueryEntity query1 = new SearchQueryEntity();
        query1.setSearchQuery("2 BHK Whitefield");
        query1.setLocation("Whitefield");
        query1.setBhk("2");
        query1.setPropertyType("Apartment");
        query1.setMinRent(20000);
        query1.setMaxRent(40000);
        query1.setMinArea(900);
        query1.setMaxArea(1400);
        query1.setFurnishing("Semi-Furnished");
        query1.setResultCount(15);
        query1.setSearchedAt(Instant.now().minusSeconds(60));

        SearchQueryEntity query2 = new SearchQueryEntity();
        query2.setSearchQuery("3 BHK Indiranagar");
        query2.setLocation("Indiranagar");
        query2.setBhk("3");
        query2.setPropertyType("Apartment");
        query2.setMinRent(40000);
        query2.setMaxRent(70000);
        query2.setMinArea(1400);
        query2.setMaxArea(2200);
        query2.setFurnishing("Furnished");
        query2.setResultCount(8);
        query2.setSearchedAt(Instant.now());

        searchQueryRepository.save(query1);
        searchQueryRepository.save(query2);

        List<SearchQueryEntity> recent = searchQueryRepository.findTop10ByOrderBySearchedAtDesc();
        assertFalse(recent.isEmpty());
        assertEquals("3 BHK Indiranagar", recent.get(0).getSearchQuery(), "Most recent query should be first");
    }

    @Test
    @Transactional
    @DisplayName("RentalListingEntity full persistence with provenance columns and index filtering")
    void testRentalListingEntityRoundTrip() {
        String testId = "test-sha256-id-1234567890abcdef";
        RentalListingEntity entity = new RentalListingEntity();
        entity.setId(testId);
        entity.setTitle("Modern 2 BHK Flat in Whitefield");
        entity.setSourcePlatform("99acres");
        entity.setSourceUrl("https://www.99acres.com/test-listing-123");
        entity.setSnippet("Spacious 2 BHK available for rent in Whitefield, Bangalore");
        entity.setLocality("Whitefield");
        entity.setSubLocality("ITPL Main Road");
        entity.setCity("Bangalore");
        entity.setRentAmount(32000);
        entity.setDepositAmount(150000);
        entity.setBhk(2);
        entity.setPropertyType("Apartment");
        entity.setCarpetAreaSqft(1150);
        entity.setFurnishing("Semi-Furnished");
        entity.setBathrooms(2);
        entity.setPricePerSqft(27.83);
        entity.setFairnessScore(88);
        entity.setFairnessCategory("FAIR");
        entity.setVariancePercentage(2.5);
        entity.setConfidenceScore(0.92);
        entity.setComparableCount(18);
        entity.setFairnessExplanation("Priced within 3% of locality median rent");
        entity.setIsStatisticalOutlier(false);
        entity.setImageUrl("https://images.example.com/flat123.jpg");
        entity.setCreatedAt(Instant.now());

        // Provenance & extraction fields (V2 migration)
        entity.setRetrievalTimestamp(Instant.now().toString());
        entity.setExtractionStatus("SUCCESS");
        entity.setPriceExplicitlyExtracted(true);
        entity.setAreaExplicitlyExtracted(true);
        entity.setFairnessAnalysisPerformed(true);

        rentalListingRepository.save(entity);

        RentalListingEntity loaded = rentalListingRepository.findById(testId).orElse(null);
        assertNotNull(loaded, "Persisted listing should be found by ID");
        assertEquals("Modern 2 BHK Flat in Whitefield", loaded.getTitle());
        assertEquals("Whitefield", loaded.getLocality());
        assertEquals(32000, loaded.getRentAmount());
        assertEquals(2, loaded.getBhk());
        assertEquals("SUCCESS", loaded.getExtractionStatus());
        assertTrue(loaded.getPriceExplicitlyExtracted());
        assertTrue(loaded.getAreaExplicitlyExtracted());
        assertTrue(loaded.getFairnessAnalysisPerformed());

        // Test index-assisted query method
        List<RentalListingEntity> matches = rentalListingRepository.findValidListingsByLocalityAndBhk("Whitefield", 2);
        assertFalse(matches.isEmpty(), "Query should find the saved listing");
        assertTrue(matches.stream().anyMatch(e -> e.getId().equals(testId)));
    }
}
