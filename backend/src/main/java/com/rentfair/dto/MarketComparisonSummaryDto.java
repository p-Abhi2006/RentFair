package com.rentfair.dto;

import java.util.ArrayList;
import java.util.List;

public class MarketComparisonSummaryDto {

    public static class MetricLeader {
        private String locality;
        private String metricName;
        private String metricValue;
        private Double numericValue;

        public MetricLeader() {}

        public MetricLeader(String locality, String metricName, String metricValue, Double numericValue) {
            this.locality = locality;
            this.metricName = metricName;
            this.metricValue = metricValue;
            this.numericValue = numericValue;
        }

        public String getLocality() {
            return locality;
        }

        public void setLocality(String locality) {
            this.locality = locality;
        }

        public String getMetricName() {
            return metricName;
        }

        public void setMetricName(String metricName) {
            this.metricName = metricName;
        }

        public String getMetricValue() {
            return metricValue;
        }

        public void setMetricValue(String metricValue) {
            this.metricValue = metricValue;
        }

        public Double getNumericValue() {
            return numericValue;
        }

        public void setNumericValue(Double numericValue) {
            this.numericValue = numericValue;
        }
    }

    private MetricLeader lowestMedianRent;
    private MetricLeader highestMedianRent;
    private Integer rentSpread;
    private String rentSpreadDescription;
    private MetricLeader lowestPricePerSqft;
    private MetricLeader highestPricePerSqft;
    private Double pricePerSqftSpread;
    private String pricePerSqftSpreadDescription;
    private List<String> observations = new ArrayList<>();

    public MarketComparisonSummaryDto() {}

    public MetricLeader getLowestMedianRent() {
        return lowestMedianRent;
    }

    public void setLowestMedianRent(MetricLeader lowestMedianRent) {
        this.lowestMedianRent = lowestMedianRent;
    }

    public MetricLeader getHighestMedianRent() {
        return highestMedianRent;
    }

    public void setHighestMedianRent(MetricLeader highestMedianRent) {
        this.highestMedianRent = highestMedianRent;
    }

    public Integer getRentSpread() {
        return rentSpread;
    }

    public void setRentSpread(Integer rentSpread) {
        this.rentSpread = rentSpread;
    }

    public String getRentSpreadDescription() {
        return rentSpreadDescription;
    }

    public void setRentSpreadDescription(String rentSpreadDescription) {
        this.rentSpreadDescription = rentSpreadDescription;
    }

    public MetricLeader getLowestPricePerSqft() {
        return lowestPricePerSqft;
    }

    public void setLowestPricePerSqft(MetricLeader lowestPricePerSqft) {
        this.lowestPricePerSqft = lowestPricePerSqft;
    }

    public MetricLeader getHighestPricePerSqft() {
        return highestPricePerSqft;
    }

    public void setHighestPricePerSqft(MetricLeader highestPricePerSqft) {
        this.highestPricePerSqft = highestPricePerSqft;
    }

    public Double getPricePerSqftSpread() {
        return pricePerSqftSpread;
    }

    public void setPricePerSqftSpread(Double pricePerSqftSpread) {
        this.pricePerSqftSpread = pricePerSqftSpread;
    }

    public String getPricePerSqftSpreadDescription() {
        return pricePerSqftSpreadDescription;
    }

    public void setPricePerSqftSpreadDescription(String pricePerSqftSpreadDescription) {
        this.pricePerSqftSpreadDescription = pricePerSqftSpreadDescription;
    }

    public List<String> getObservations() {
        return observations;
    }

    public void setObservations(List<String> observations) {
        this.observations = observations;
    }
}
