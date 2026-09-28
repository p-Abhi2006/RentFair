package com.rentfair.dto;

import java.util.List;

public class LocationComparisonRequest {

    private List<String> locations;
    private Integer bhk;
    private String propertyType;
    private String furnishing;
    private Integer minArea;
    private Integer maxArea;

    public LocationComparisonRequest() {}

    public LocationComparisonRequest(List<String> locations, Integer bhk, String propertyType,
                                     String furnishing, Integer minArea, Integer maxArea) {
        this.locations = locations;
        this.bhk = bhk;
        this.propertyType = propertyType;
        this.furnishing = furnishing;
        this.minArea = minArea;
        this.maxArea = maxArea;
    }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

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
}
