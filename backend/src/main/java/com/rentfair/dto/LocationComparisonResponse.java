package com.rentfair.dto;

import java.util.ArrayList;
import java.util.List;

public class LocationComparisonResponse {

    private Integer bhk;
    private String propertyType;
    private String furnishing;
    private Integer minArea;
    private Integer maxArea;
    private String generatedAt;
    private List<LocalityMarketStatsDto> localities = new ArrayList<>();
    private MarketComparisonSummaryDto comparisonSummary;

    public LocationComparisonResponse() {}

    public Integer getBhk() {
        return bhk;
    }

    public void setBhk(Integer bhk) {
        this.bhk = bhk;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public String getFurnishing() {
        return furnishing;
    }

    public void setFurnishing(String furnishing) {
        this.furnishing = furnishing;
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

    public String getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(String generatedAt) {
        this.generatedAt = generatedAt;
    }

    public List<LocalityMarketStatsDto> getLocalities() {
        return localities;
    }

    public void setLocalities(List<LocalityMarketStatsDto> localities) {
        this.localities = localities;
    }

    public MarketComparisonSummaryDto getComparisonSummary() {
        return comparisonSummary;
    }

    public void setComparisonSummary(MarketComparisonSummaryDto comparisonSummary) {
        this.comparisonSummary = comparisonSummary;
    }
}
