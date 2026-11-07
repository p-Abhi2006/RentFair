-- V2__add_provenance_and_extraction_columns.sql
-- Add listing data provenance, extraction status, and analysis tracking columns
-- Compatible with PostgreSQL and H2 (MODE=PostgreSQL)

ALTER TABLE rental_listings ADD COLUMN retrieval_timestamp VARCHAR(50);
ALTER TABLE rental_listings ADD COLUMN extraction_status VARCHAR(20);
ALTER TABLE rental_listings ADD COLUMN price_explicitly_extracted BOOLEAN;
ALTER TABLE rental_listings ADD COLUMN area_explicitly_extracted BOOLEAN;
ALTER TABLE rental_listings ADD COLUMN fairness_analysis_performed BOOLEAN;
