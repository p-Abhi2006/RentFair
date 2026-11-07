-- V3__add_query_indexes.sql
-- Add indexes supporting verified repository query patterns
-- Compatible with PostgreSQL and H2 (MODE=PostgreSQL)

CREATE INDEX idx_search_queries_searched_at ON search_queries(searched_at DESC);
CREATE INDEX idx_rental_listings_bhk_rent ON rental_listings(bhk, rent_amount);
