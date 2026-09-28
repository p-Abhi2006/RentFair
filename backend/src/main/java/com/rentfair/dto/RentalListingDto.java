package com.rentfair.dto;

import java.util.ArrayList;
import java.util.List;

public class RentalListingDto {
    private String id;
    private String title;
    private String locality;
    private String subLocality;
    private String city;
    private Integer rentAmount;
    private Integer depositAmount;
    private Integer bhk;
    private String propertyType;
    private Integer carpetAreaSqft;
    private String furnishing;
    private Integer bathrooms;
    private Double pricePerSqft;
    private Integer fairnessScore;
    private String fairnessCategory;
    private Double variancePercentage;
    private Double confidenceScore;
    private Integer comparableCount;
    private String fairnessExplanation;
    private Boolean isStatisticalOutlier;
    private List<String> features = new ArrayList<>();
    private String sourcePlatform;
    private String sourceUrl;
    private String imageUrl;
    private String scrapedAt;
    private String retrievalTimestamp;
    private String extractionStatus;
    private Boolean priceExplicitlyExtracted;
    private Boolean areaExplicitlyExtracted;
    private Boolean fairnessAnalysisPerformed;
    private Boolean isPlaceholder;
    private String snippet;

    public RentalListingDto() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLocality() {
        return locality;
    }

    public void setLocality(String locality) {
        this.locality = locality;
    }

    public String getSubLocality() {
        return subLocality;
    }

    public void setSubLocality(String subLocality) {
        this.subLocality = subLocality;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Integer getRentAmount() {
        return rentAmount;
    }

    public void setRentAmount(Integer rentAmount) {
        this.rentAmount = rentAmount;
    }

    public Integer getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(Integer depositAmount) {
        this.depositAmount = depositAmount;
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

    public Integer getCarpetAreaSqft() {
        return carpetAreaSqft;
    }

    public void setCarpetAreaSqft(Integer carpetAreaSqft) {
        this.carpetAreaSqft = carpetAreaSqft;
    }

    public String getFurnishing() {
        return furnishing;
    }

    public void setFurnishing(String furnishing) {
        this.furnishing = furnishing;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public Double getPricePerSqft() {
        return pricePerSqft;
    }

    public void setPricePerSqft(Double pricePerSqft) {
        this.pricePerSqft = pricePerSqft;
    }

    public Integer getFairnessScore() {
        return fairnessScore;
    }

    public void setFairnessScore(Integer fairnessScore) {
        this.fairnessScore = fairnessScore;
    }

    public String getFairnessCategory() {
        return fairnessCategory;
    }

    public void setFairnessCategory(String fairnessCategory) {
        this.fairnessCategory = fairnessCategory;
    }

    public Double getVariancePercentage() {
        return variancePercentage;
    }

    public void setVariancePercentage(Double variancePercentage) {
        this.variancePercentage = variancePercentage;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Integer getComparableCount() {
        return comparableCount;
    }

    public void setComparableCount(Integer comparableCount) {
        this.comparableCount = comparableCount;
    }

    public List<String> getFeatures() {
        return features;
    }

    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public String getSourcePlatform() {
        return sourcePlatform;
    }

    public void setSourcePlatform(String sourcePlatform) {
        this.sourcePlatform = sourcePlatform;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getScrapedAt() {
        return scrapedAt;
    }

    public void setScrapedAt(String scrapedAt) {
        this.scrapedAt = scrapedAt;
    }

    public Boolean getIsPlaceholder() {
        return isPlaceholder;
    }

    public void setIsPlaceholder(Boolean isPlaceholder) {
        this.isPlaceholder = isPlaceholder;
    }

    public String getFairnessExplanation() {
        return fairnessExplanation;
    }

    public void setFairnessExplanation(String fairnessExplanation) {
        this.fairnessExplanation = fairnessExplanation;
    }

    public Boolean getIsStatisticalOutlier() {
        return isStatisticalOutlier;
    }

    public void setIsStatisticalOutlier(Boolean isStatisticalOutlier) {
        this.isStatisticalOutlier = isStatisticalOutlier;
    }

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public String getRetrievalTimestamp() {
        return retrievalTimestamp;
    }

    public void setRetrievalTimestamp(String retrievalTimestamp) {
        this.retrievalTimestamp = retrievalTimestamp;
    }

    public String getExtractionStatus() {
        return extractionStatus;
    }

    public void setExtractionStatus(String extractionStatus) {
        this.extractionStatus = extractionStatus;
    }

    public Boolean getPriceExplicitlyExtracted() {
        return priceExplicitlyExtracted;
    }

    public void setPriceExplicitlyExtracted(Boolean priceExplicitlyExtracted) {
        this.priceExplicitlyExtracted = priceExplicitlyExtracted;
    }

    public Boolean getAreaExplicitlyExtracted() {
        return areaExplicitlyExtracted;
    }

    public void setAreaExplicitlyExtracted(Boolean areaExplicitlyExtracted) {
        this.areaExplicitlyExtracted = areaExplicitlyExtracted;
    }

    public Boolean getFairnessAnalysisPerformed() {
        return fairnessAnalysisPerformed;
    }

    public void setFairnessAnalysisPerformed(Boolean fairnessAnalysisPerformed) {
        this.fairnessAnalysisPerformed = fairnessAnalysisPerformed;
    }
}
