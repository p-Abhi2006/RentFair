package com.rentfair.repository;

import com.rentfair.model.SearchQueryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchQueryRepository extends JpaRepository<SearchQueryEntity, Long> {
    List<SearchQueryEntity> findTop10ByOrderBySearchedAtDesc();
}
