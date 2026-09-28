package com.rentfair.repository;

import com.rentfair.model.RentalListingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalListingRepository extends JpaRepository<RentalListingEntity, String> {
    List<RentalListingEntity> findByLocalityIgnoreCase(String locality);

    @Query("SELECT r FROM RentalListingEntity r WHERE (LOWER(r.locality) LIKE LOWER(CONCAT('%', :locality, '%')) OR LOWER(:locality) LIKE LOWER(CONCAT('%', r.locality, '%'))) AND (:bhk IS NULL OR r.bhk = :bhk) AND r.rentAmount IS NOT NULL AND r.rentAmount > 0")
    List<RentalListingEntity> findValidListingsByLocalityAndBhk(@Param("locality") String locality, @Param("bhk") Integer bhk);

    @Query("SELECT r FROM RentalListingEntity r WHERE (LOWER(r.locality) LIKE LOWER(CONCAT('%', :locality, '%')) OR LOWER(:locality) LIKE LOWER(CONCAT('%', r.locality, '%'))) AND (:bhk IS NULL OR r.bhk = :bhk)")
    List<RentalListingEntity> findAllListingsByLocalityAndBhk(@Param("locality") String locality, @Param("bhk") Integer bhk);
}

