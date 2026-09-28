package com.rentfair.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "rental_listings")
public class RentalListingEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 100)
    private String sourcePlatform;

    @Column(columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    @Column(length = 100)
    private String locality;

    @Column(length = 100)
    private String subLocality;

    @Column(length = 100)
    private String city;

    private Integer rentAmount;
    private Integer depositAmount;
    private Integer bhk;

    @Column(length = 50)
    private String propertyType;

    private Integer carpetAreaSqft;

    @Column(length = 50)
    private String furnishing;

    private Integer bathrooms;

    private Double pricePerSqft;
    private Integer fairnessScore;

    @Column(length = 50)
    private String fairnessCategory;

    private Double variancePercentage;
    private Double confidenceScore;
    private Integer comparableCount;

    @Column(columnDefinition = "TEXT")
    private String fairnessExplanation;
    private Boolean isStatisticalOutlier;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(length = 50)
    private String retrievalTimestamp;

    @Column(length = 20)
    private String extractionStatus;

    private Boolean priceExplicitlyExtracted;
    private Boolean areaExplicitlyExtracted;
    private Boolean fairnessAnalysisPerformed;

    @Column(nullable = false)
    private Instant createdAt;

    public RentalListingEntity() {
        this.createdAt = Instant.now();
    }

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

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public String getLocality() {
        return locality;
    }

    public void setLocality(String locality) {
        this.locality = locality;
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

    public String getSubLocality() {
        return subLocality;
    }

    public void setSubLocality(String subLocality) {
        this.subLocality = subLocality;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
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
