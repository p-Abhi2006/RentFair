package com.rentfair.dto;

import java.util.ArrayList;
import java.util.List;

public class MarketBaselineDto {
    private String locality;
    private String city;
    private Integer bhk;
    private String propertyType;
    private Integer sampleSize;
    private Integer sourceListingCount;
    private Integer validPricedListingCount;
    private Integer listingsWithAreaCount;
    private Integer statisticalSampleSize;
    private Integer medianRent;
    private Integer averageRent;
    private Double medianPricePerSqft;
    private RentIqr rentIqr;
    private List<PriceDistributionBucket> priceDistribution = new ArrayList<>();
    private String generatedAt;
    private Boolean isPrototypeBaseline;

    public static class RentIqr {
        private Integer q1;
        private Integer q3;
        private Integer minTypical;
        private Integer maxTypical;

        public RentIqr() {}

        public RentIqr(Integer q1, Integer q3, Integer minTypical, Integer maxTypical) {
            this.q1 = q1;
            this.q3 = q3;
            this.minTypical = minTypical;
            this.maxTypical = maxTypical;
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
    }

    public static class PriceDistributionBucket {
        private String bracket;
        private Integer count;
        private Double percentage;

        public PriceDistributionBucket() {}

        public PriceDistributionBucket(String bracket, Integer count, Double percentage) {
            this.bracket = bracket;
            this.count = count;
            this.percentage = percentage;
        }

        public String getBracket() {
            return bracket;
        }

        public void setBracket(String bracket) {
            this.bracket = bracket;
        }

        public Integer getCount() {
            return count;
        }

        public void setCount(Integer count) {
            this.count = count;
        }

        public Double getPercentage() {
            return percentage;
        }

        public void setPercentage(Double percentage) {
            this.percentage = percentage;
        }
    }

    public MarketBaselineDto() {}

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

    public Integer getSampleSize() {
        return sampleSize;
    }

    public void setSampleSize(Integer sampleSize) {
        this.sampleSize = sampleSize;
    }

    public Integer getSourceListingCount() {
        return sourceListingCount;
    }

    public void setSourceListingCount(Integer sourceListingCount) {
        this.sourceListingCount = sourceListingCount;
    }

    public Integer getValidPricedListingCount() {
        return validPricedListingCount;
    }

    public void setValidPricedListingCount(Integer validPricedListingCount) {
        this.validPricedListingCount = validPricedListingCount;
    }

    public Integer getListingsWithAreaCount() {
        return listingsWithAreaCount;
    }

    public void setListingsWithAreaCount(Integer listingsWithAreaCount) {
        this.listingsWithAreaCount = listingsWithAreaCount;
    }

    public Integer getStatisticalSampleSize() {
        return statisticalSampleSize;
    }

    public void setStatisticalSampleSize(Integer statisticalSampleSize) {
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

    public Double getMedianPricePerSqft() {
        return medianPricePerSqft;
    }

    public void setMedianPricePerSqft(Double medianPricePerSqft) {
        this.medianPricePerSqft = medianPricePerSqft;
    }

    public RentIqr getRentIqr() {
        return rentIqr;
    }

    public void setRentIqr(RentIqr rentIqr) {
        this.rentIqr = rentIqr;
    }

    public List<PriceDistributionBucket> getPriceDistribution() {
        return priceDistribution;
    }

    public void setPriceDistribution(List<PriceDistributionBucket> priceDistribution) {
        this.priceDistribution = priceDistribution;
    }

    public String getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(String generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Boolean getIsPrototypeBaseline() {
        return isPrototypeBaseline;
    }

    public void setIsPrototypeBaseline(Boolean isPrototypeBaseline) {
        this.isPrototypeBaseline = isPrototypeBaseline;
    }
}
