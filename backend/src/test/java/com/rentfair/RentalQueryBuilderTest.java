package com.rentfair;

import com.rentfair.dto.RentalSearchRequest;
import com.rentfair.util.RentalQueryBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RentalQueryBuilderTest {

    private RentalQueryBuilder queryBuilder;

    @BeforeEach
    void setUp() {
        queryBuilder = new RentalQueryBuilder();
    }

    @Test
    void testBasicQueryConstruction() {
        RentalSearchRequest request = new RentalSearchRequest();
        request.setLocation("Whitefield Bangalore");
        request.setBhk("1");
        request.setPropertyType("APARTMENT");

        String query = queryBuilder.buildQuery(request);
        assertEquals("1 BHK apartment for rent in Whitefield Bangalore", query);
    }

    @Test
    void testQueryWithFurnishing() {
        RentalSearchRequest request = new RentalSearchRequest();
        request.setLocation("HSR Layout Bangalore");
        request.setBhk("2");
        request.setPropertyType("GATED_COMMUNITY");
        request.setFurnishing("SEMI_FURNISHED");

        String query = queryBuilder.buildQuery(request);
        assertTrue(query.contains("2 BHK"));
        assertTrue(query.contains("gated community"));
        assertTrue(query.contains("HSR Layout"));
        assertTrue(query.contains("semi furnished"));
    }

    @Test
    void testDefaultQueryWhenEmpty() {
        RentalSearchRequest request = new RentalSearchRequest();
        String query = queryBuilder.buildQuery(request);
        assertEquals("for rent in Bangalore", query);
    }

    @Test
    void testDuplicateLocalityTokensNormalizedInQuery() {
        RentalSearchRequest req1 = new RentalSearchRequest();
        req1.setLocation("Whitefield, Whitefield");
        req1.setBhk("2");
        String q1 = queryBuilder.buildQuery(req1);
        assertEquals("2 BHK for rent in Whitefield", q1);

        RentalSearchRequest req2 = new RentalSearchRequest();
        req2.setLocation("HSR Layout, HSR Layout");
        req2.setBhk("2");
        String q2 = queryBuilder.buildQuery(req2);
        assertEquals("2 BHK for rent in HSR Layout", q2);

        RentalSearchRequest req3 = new RentalSearchRequest();
        req3.setLocation("Whitefield, Bangalore");
        req3.setBhk("2");
        String q3 = queryBuilder.buildQuery(req3);
        assertEquals("2 BHK for rent in Whitefield, Bangalore", q3);
    }

    @Test
    void testCleanLocationForQuery() {
        assertEquals("Whitefield", queryBuilder.cleanLocationForQuery("Whitefield, Whitefield"));
        assertEquals("HSR Layout", queryBuilder.cleanLocationForQuery("HSR Layout, HSR Layout"));
        assertEquals("Whitefield, Bangalore", queryBuilder.cleanLocationForQuery("Whitefield, Bangalore"));
        assertEquals("Whitefield", queryBuilder.cleanLocationForQuery("Whitefield"));
        assertEquals("Bangalore", queryBuilder.cleanLocationForQuery(null));
        assertEquals("Bangalore", queryBuilder.cleanLocationForQuery(""));
    }
}
