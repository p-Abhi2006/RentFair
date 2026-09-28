package com.rentfair.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "search_queries")
public class SearchQueryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String searchQuery;

    @Column(length = 100)
    private String location;

    @Column(length = 20)
    private String bhk;

    @Column(length = 50)
    private String propertyType;

    private Integer minRent;
    private Integer maxRent;
    private Integer minArea;
    private Integer maxArea;

    @Column(length = 50)
    private String furnishing;

    private Integer resultCount;

    @Column(nullable = false)
    private Instant searchedAt;

    public SearchQueryEntity() {
        this.searchedAt = Instant.now();
    }

    public SearchQueryEntity(String searchQuery, String location, String bhk, String propertyType,
                             Integer minRent, Integer maxRent, Integer minArea, Integer maxArea,
                             String furnishing, Integer resultCount) {
        this.searchQuery = searchQuery;
        this.location = location;
        this.bhk = bhk;
        this.propertyType = propertyType;
        this.minRent = minRent;
        this.maxRent = maxRent;
        this.minArea = minArea;
        this.maxArea = maxArea;
        this.furnishing = furnishing;
        this.resultCount = resultCount;
        this.searchedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBhk() {
        return bhk;
    }

    public void setBhk(String bhk) {
        this.bhk = bhk;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public Integer getMinRent() {
        return minRent;
    }

    public void setMinRent(Integer minRent) {
        this.minRent = minRent;
    }

    public Integer getMaxRent() {
        return maxRent;
    }

    public void setMaxRent(Integer maxRent) {
        this.maxRent = maxRent;
    }

    public Integer getMinArea() {
        return minArea;
    }

    public void setMinArea(Integer minArea) {
        this.minArea = minArea;
    }

    public Integer getMaxArea() {
        return maxArea;
    }

    public void setMaxArea(Integer maxArea) {
        this.maxArea = maxArea;
    }

    public String getFurnishing() {
        return furnishing;
    }

    public void setFurnishing(String furnishing) {
        this.furnishing = furnishing;
    }

    public Integer getResultCount() {
        return resultCount;
    }

    public void setResultCount(Integer resultCount) {
        this.resultCount = resultCount;
    }

    public Instant getSearchedAt() {
        return searchedAt;
    }

    public void setSearchedAt(Instant searchedAt) {
        this.searchedAt = searchedAt;
    }
}
