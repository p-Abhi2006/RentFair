package com.rentfair.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SerpApiResponse {

    @JsonProperty("search_metadata")
    private SerpApiSearchMetadata searchMetadata;

    @JsonProperty("organic_results")
    private List<SerpApiOrganicResult> organicResults = new ArrayList<>();

    @JsonProperty("error")
    private String error;

    public SerpApiSearchMetadata getSearchMetadata() {
        return searchMetadata;
    }

    public void setSearchMetadata(SerpApiSearchMetadata searchMetadata) {
        this.searchMetadata = searchMetadata;
    }

    public List<SerpApiOrganicResult> getOrganicResults() {
        return organicResults != null ? organicResults : new ArrayList<>();
    }

    public void setOrganicResults(List<SerpApiOrganicResult> organicResults) {
        this.organicResults = organicResults;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
