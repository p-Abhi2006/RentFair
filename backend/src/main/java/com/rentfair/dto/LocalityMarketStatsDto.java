package com.rentfair.dto;

import java.util.List;

public class LocalityMarketStatsDto {

    private String locality;
    private String city;
    private int totalListingCount;
    private int sourceListingCount;
    private int validPricedListingCount;
    private int listingsWithAreaCount;
    private int sampleSize;
    private int statisticalSampleSize;
    private Integer medianRent;
    private Integer averageRent;
    private Integer q1;
    private Integer q3;
    private Integer iqr;
    private Integer minTypical;
    private Integer maxTypical;
    private Double medianPricePerSqft;
    private String dataTimestamp;
    private String dataQuality;
    private String dataQualityDescription;
    private List<RentalListingDto> sampleListings;

    public LocalityMarketStatsDto() {}

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

    public int getTotalListingCount() {
        return totalListingCount;
    }

    public void setTotalListingCount(int totalListingCount) {
        this.totalListingCount = totalListingCount;
        if (this.sourceListingCount == 0) {
            this.sourceListingCount = totalListingCount;
        }
    }

    public int getSourceListingCount() {
        return sourceListingCount > 0 ? sourceListingCount : totalListingCount;
    }

    public void setSourceListingCount(int sourceListingCount) {
        this.sourceListingCount = sourceListingCount;
    }

    public int getValidPricedListingCount() {
        return validPricedListingCount;
    }

    public void setValidPricedListingCount(int validPricedListingCount) {
        this.validPricedListingCount = validPricedListingCount;
    }

    public int getListingsWithAreaCount() {
        return listingsWithAreaCount;
    }

    public void setListingsWithAreaCount(int listingsWithAreaCount) {
        this.listingsWithAreaCount = listingsWithAreaCount;
    }

    public int getSampleSize() {
        return sampleSize;
    }

    public void setSampleSize(int sampleSize) {
        this.sampleSize = sampleSize;
        if (this.statisticalSampleSize == 0) {
            this.statisticalSampleSize = sampleSize;
        }
    }

    public int getStatisticalSampleSize() {
        return statisticalSampleSize > 0 ? statisticalSampleSize : sampleSize;
    }

    public void setStatisticalSampleSize(int statisticalSampleSize) {
        this.statisticalSampleSize = statisticalSampleSize;
    }

    public Integer getMedianRent() {
        return medianRent;
    }

    public void setMedianRent(Integer medianRent) {
        this.medianRent = medianRent;
    }

    public Integer getAverageRent() {
        return averageRent;
    }

    public void setAverageRent(Integer averageRent) {
        this.averageRent = averageRent;
    }

    public Integer getQ1() {
        return q1;
    }

    public void setQ1(Integer q1) {
        this.q1 = q1;
    }

    public Integer getQ3() {
        return q3;
    }

    public void setQ3(Integer q3) {
        this.q3 = q3;
    }

    public Integer getIqr() {
        return iqr;
    }

    public void setIqr(Integer iqr) {
        this.iqr = iqr;
    }

    public Integer getMinTypical() {
        return minTypical;
    }

    public void setMinTypical(Integer minTypical) {
        this.minTypical = minTypical;
    }

    public Integer getMaxTypical() {
        return maxTypical;
    }

    public void setMaxTypical(Integer maxTypical) {
        this.maxTypical = maxTypical;
    }

    public Double getMedianPricePerSqft() {
        return medianPricePerSqft;
    }

    public void setMedianPricePerSqft(Double medianPricePerSqft) {
        this.medianPricePerSqft = medianPricePerSqft;
    }

    public String getDataTimestamp() {
        return dataTimestamp;
    }

    public void setDataTimestamp(String dataTimestamp) {
        this.dataTimestamp = dataTimestamp;
    }

    public String getDataQuality() {
        return dataQuality;
    }

    public void setDataQuality(String dataQuality) {
        this.dataQuality = dataQuality;
    }

    public String getDataQualityDescription() {
        return dataQualityDescription;
    }

    public void setDataQualityDescription(String dataQualityDescription) {
        this.dataQualityDescription = dataQualityDescription;
    }

    public List<RentalListingDto> getSampleListings() {
        return sampleListings;
    }

    public void setSampleListings(List<RentalListingDto> sampleListings) {
        this.sampleListings = sampleListings;
    }
}
