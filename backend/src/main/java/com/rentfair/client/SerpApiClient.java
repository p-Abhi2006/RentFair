package com.rentfair.client;

import com.rentfair.client.dto.SerpApiResponse;
import com.rentfair.config.SerpApiProperties;
import com.rentfair.exception.MissingApiKeyException;
import com.rentfair.exception.SerpApiNetworkException;
import com.rentfair.exception.SerpApiRateLimitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Component
public class SerpApiClient {

    private static final Logger log = LoggerFactory.getLogger(SerpApiClient.class);

    private final RestClient restClient;
    private final SerpApiProperties properties;

    public SerpApiClient(RestClient restClient, SerpApiProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    /**
     * Executes a Google search query against SerpApi and returns the raw SerpApiResponse.
     */
    public SerpApiResponse search(String query) {
        String apiKey = properties.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty() || "your_serpapi_api_key_here".equals(apiKey)) {
            throw new MissingApiKeyException("SERPAPI_API_KEY is missing or unconfigured. Please set it in .env or your environment.");
        }

        URI uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .queryParam("engine", properties.getEngine())
                .queryParam("q", query)
                .queryParam("api_key", apiKey)
                .queryParam("gl", "in")
                .queryParam("hl", "en")
                .queryParam("num", "20")
                .build()
                .toUri();

        log.info("Dispatching search query to SerpApi (engine={}, query='{}')", properties.getEngine(), query);

        try {
            SerpApiResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        int statusCode = res.getStatusCode().value();
                        if (statusCode == 429) {
                            throw new SerpApiRateLimitException("SerpApi query rate limit reached (HTTP 429).");
                        }
                        if (statusCode == 401 || statusCode == 403) {
                            throw new MissingApiKeyException("Invalid or unauthorized SERPAPI_API_KEY.");
                        }
                        throw new SerpApiNetworkException("SerpApi client error: HTTP " + statusCode);
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        throw new SerpApiNetworkException("SerpApi upstream service error: HTTP " + res.getStatusCode().value());
                    })
                    .body(SerpApiResponse.class);

            if (response == null) {
                throw new SerpApiNetworkException("Received null response payload from SerpApi.");
            }

            if (response.getError() != null && !response.getError().trim().isEmpty()) {
                String errorMsg = response.getError();
                log.warn("SerpApi returned error message: {}", errorMsg);
                if (errorMsg.toLowerCase().contains("api_key") || errorMsg.toLowerCase().contains("invalid key")) {
                    throw new MissingApiKeyException("SerpApi rejected API key: " + errorMsg);
                }
                if (errorMsg.toLowerCase().contains("rate") || errorMsg.toLowerCase().contains("quota")) {
                    throw new SerpApiRateLimitException("SerpApi rate limit/quota reached: " + errorMsg);
                }
                throw new SerpApiNetworkException("SerpApi error: " + errorMsg);
            }

            return response;

        } catch (MissingApiKeyException | SerpApiRateLimitException | SerpApiNetworkException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to connect to SerpApi: {}", e.getMessage(), e);
            throw new SerpApiNetworkException("Network error while connecting to SerpApi: " + e.getMessage(), e);
        }
    }
}
