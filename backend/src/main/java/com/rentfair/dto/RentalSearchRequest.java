package com.rentfair.dto;

public class RentalSearchRequest {
    private String location;
    private String bhk;
    private String propertyType;
    private Integer minRent;
    private Integer maxRent;
    private Integer minArea;
    private Integer maxArea;
    private String furnishing;
    private String sortBy;

    public RentalSearchRequest() {}

    public RentalSearchRequest(String location, String bhk, String propertyType, Integer minRent,
                               Integer maxRent, Integer minArea, Integer maxArea, String furnishing, String sortBy) {
        this.location = location;
        this.bhk = bhk;
        this.propertyType = propertyType;
        this.minRent = minRent;
        this.maxRent = maxRent;
        this.minArea = minArea;
        this.maxArea = maxArea;
        this.furnishing = furnishing;
        this.sortBy = sortBy;
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

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }
}
