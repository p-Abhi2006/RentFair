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
}
