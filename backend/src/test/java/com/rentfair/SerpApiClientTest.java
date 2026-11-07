package com.rentfair;

import com.rentfair.client.SerpApiClient;
import com.rentfair.client.dto.SerpApiResponse;
import com.rentfair.config.AppConfig;
import com.rentfair.config.SerpApiProperties;
import com.rentfair.exception.MissingApiKeyException;
import com.rentfair.exception.SerpApiNetworkException;
import com.rentfair.exception.SerpApiRateLimitException;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class SerpApiClientTest {

    @Test
    @DisplayName("AppConfig creates RestClient and RequestFactory with configured timeouts")
    void testAppConfigRestClientTimeoutSettings() {
        AppConfig config = new AppConfig();
        SerpApiProperties properties = new SerpApiProperties();
        properties.setTimeoutSeconds(10);
        properties.setBaseUrl("https://serpapi.com/search");

        SimpleClientHttpRequestFactory factory = config.createRequestFactory(properties);
        assertNotNull(factory);

        RestClient restClient = config.restClient(properties);
        assertNotNull(restClient, "RestClient bean must be successfully created");
    }

    @Test
    @DisplayName("AppConfig falls back to default 15s timeout if timeoutSeconds is zero or negative")
    void testAppConfigTimeoutFallback() {
        AppConfig config = new AppConfig();
        SerpApiProperties properties = new SerpApiProperties();
        properties.setTimeoutSeconds(0);

        SimpleClientHttpRequestFactory factory = config.createRequestFactory(properties);
        assertNotNull(factory);

        RestClient restClient = config.restClient(properties);
        assertNotNull(restClient);
    }

    @Test
    @DisplayName("Successful SerpApi response is parsed properly")
    void testSuccessfulSerpApiResponse() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        int port = server.getAddress().getPort();
        String jsonResponse = "{\"search_metadata\":{\"status\":\"Success\"},\"organic_results\":[{\"title\":\"2 BHK Flat\"}]}";

        server.createContext("/search", exchange -> {
            byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        });
        server.start();

        try {
            SerpApiProperties properties = new SerpApiProperties();
            properties.setBaseUrl("http://127.0.0.1:" + port + "/search");
            properties.setApiKey("test-valid-key");
            properties.setTimeoutSeconds(5);

            AppConfig config = new AppConfig();
            RestClient restClient = config.restClient(properties);
            SerpApiClient client = new SerpApiClient(restClient, properties);

            SerpApiResponse response = client.search("2 BHK Whitefield");
            assertNotNull(response);
            assertNotNull(response.getOrganicResults());
            assertEquals(1, response.getOrganicResults().size());
            assertEquals("2 BHK Flat", response.getOrganicResults().get(0).getTitle());
        } finally {
            server.stop(0);
        }
    }

    @Test
    @DisplayName("Connection failure translates into SerpApiNetworkException without leaking API key")
    void testConnectionFailure() {
        // Connect to a port that is not listening
        int unusedPort = 59876;
        String secretApiKey = "secret-key-xyz-98765";

        SerpApiProperties properties = new SerpApiProperties();
        properties.setBaseUrl("http://127.0.0.1:" + unusedPort + "/search");
        properties.setApiKey(secretApiKey);
        properties.setTimeoutSeconds(1);

        AppConfig config = new AppConfig();
        RestClient restClient = config.restClient(properties);
        SerpApiClient client = new SerpApiClient(restClient, properties);

        SerpApiNetworkException ex = assertThrows(
                SerpApiNetworkException.class,
                () -> client.search("2 BHK Whitefield")
        );

        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("connecting to SerpApi"));
        assertFalse(ex.getMessage().contains(secretApiKey), "API key must not be exposed in exception message");
        if (ex.getCause() != null && ex.getCause().getMessage() != null) {
            assertFalse(ex.getCause().getMessage().contains(secretApiKey), "API key must not be exposed in cause");
        }
    }

    @Test
    @DisplayName("Delayed response exceeding read timeout throws SerpApiNetworkException and does not leak API key")
    void testDelayedResponseTimeout() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        int port = server.getAddress().getPort();
        String secretApiKey = "super-secret-token-abcdef";

        // Handler delays response by 600ms
        server.createContext("/search", exchange -> {
            try {
                Thread.sleep(600);
            } catch (InterruptedException ignored) {}
            byte[] bytes = "{}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        });
        server.start();

        try {
            SerpApiProperties properties = new SerpApiProperties();
            properties.setBaseUrl("http://127.0.0.1:" + port + "/search");
            properties.setApiKey(secretApiKey);

            // Configure request factory with a short 100ms read timeout
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(Duration.ofMillis(200));
            factory.setReadTimeout(Duration.ofMillis(100));

            RestClient restClient = RestClient.builder()
                    .baseUrl(properties.getBaseUrl())
                    .requestFactory(factory)
                    .build();

            SerpApiClient client = new SerpApiClient(restClient, properties);

            SerpApiNetworkException ex = assertThrows(
                    SerpApiNetworkException.class,
                    () -> client.search("2 BHK Whitefield")
            );

            assertNotNull(ex.getMessage());
            assertTrue(ex.getMessage().toLowerCase().contains("time") || ex.getMessage().toLowerCase().contains("network"));
            assertFalse(ex.getMessage().contains(secretApiKey), "API key must never be leaked in timeout message");
            if (ex.getCause() != null && ex.getCause().getMessage() != null) {
                assertFalse(ex.getCause().getMessage().contains(secretApiKey), "API key must not be exposed in timeout cause");
            }
        } finally {
            server.stop(0);
        }
    }

    @Test
    @DisplayName("Missing API key throws MissingApiKeyException")
    void testMissingApiKey() {
        SerpApiProperties properties = new SerpApiProperties();
        properties.setApiKey("");
        AppConfig config = new AppConfig();
        RestClient restClient = config.restClient(properties);
        SerpApiClient client = new SerpApiClient(restClient, properties);

        assertThrows(MissingApiKeyException.class, () -> client.search("2 BHK"));

        properties.setApiKey("your_serpapi_api_key_here");
        assertThrows(MissingApiKeyException.class, () -> client.search("2 BHK"));
    }

    @Test
    @DisplayName("HTTP 429 response throws SerpApiRateLimitException")
    void testRateLimit429Handling() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        int port = server.getAddress().getPort();

        server.createContext("/search", exchange -> {
            byte[] bytes = "{\"error\":\"Rate limit exceeded\"}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(429, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        });
        server.start();

        try {
            SerpApiProperties properties = new SerpApiProperties();
            properties.setBaseUrl("http://127.0.0.1:" + port + "/search");
            properties.setApiKey("test-key");
            properties.setTimeoutSeconds(5);

            AppConfig config = new AppConfig();
            RestClient restClient = config.restClient(properties);
            SerpApiClient client = new SerpApiClient(restClient, properties);

            assertThrows(SerpApiRateLimitException.class, () -> client.search("2 BHK Whitefield"));
        } finally {
            server.stop(0);
        }
    }

    @Test
    @DisplayName("HTTP 401 response throws MissingApiKeyException")
    void testUnauthorized401Handling() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        int port = server.getAddress().getPort();

        server.createContext("/search", exchange -> {
            byte[] bytes = "{\"error\":\"Invalid API key\"}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(401, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        });
        server.start();

        try {
            SerpApiProperties properties = new SerpApiProperties();
            properties.setBaseUrl("http://127.0.0.1:" + port + "/search");
            properties.setApiKey("test-key");
            properties.setTimeoutSeconds(5);

            AppConfig config = new AppConfig();
            RestClient restClient = config.restClient(properties);
            SerpApiClient client = new SerpApiClient(restClient, properties);

            assertThrows(MissingApiKeyException.class, () -> client.search("2 BHK Whitefield"));
        } finally {
            server.stop(0);
        }
    }

    @Test
    @DisplayName("HTTP 500 response throws SerpApiNetworkException")
    void testServerError500Handling() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        int port = server.getAddress().getPort();

        server.createContext("/search", exchange -> {
            byte[] bytes = "{\"error\":\"Internal Server Error\"}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(500, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        });
        server.start();

        try {
            SerpApiProperties properties = new SerpApiProperties();
            properties.setBaseUrl("http://127.0.0.1:" + port + "/search");
            properties.setApiKey("test-key");
            properties.setTimeoutSeconds(5);

            AppConfig config = new AppConfig();
            RestClient restClient = config.restClient(properties);
            SerpApiClient client = new SerpApiClient(restClient, properties);

            assertThrows(SerpApiNetworkException.class, () -> client.search("2 BHK Whitefield"));
        } finally {
            server.stop(0);
        }
    }

    @Test
    @DisplayName("sanitizeMessage utility masks API keys and api_key query parameters")
    void testSanitizeMessageUtility() {
        AppConfig config = new AppConfig();
        SerpApiProperties properties = new SerpApiProperties();
        RestClient restClient = config.restClient(properties);
        SerpApiClient client = new SerpApiClient(restClient, properties);

        String raw = "I/O error on GET request for \"https://serpapi.com/search?q=rent&api_key=secretKey123&gl=in\": Read timed out";
        String sanitized = client.sanitizeMessage(raw, "secretKey123");

        assertFalse(sanitized.contains("secretKey123"));
        assertTrue(sanitized.contains("api_key=***"));
        assertTrue(sanitized.contains("Read timed out"));

        // Verify that API key containing regex-special characters is also completely sanitized
        String regexKey = "key$with+regex*special[chars]^";
        String rawWithRegexKey = "Failed for api_key=" + regexKey + "&engine=google";
        String sanitizedRegexKey = client.sanitizeMessage(rawWithRegexKey, regexKey);
        assertFalse(sanitizedRegexKey.contains(regexKey));
        assertTrue(sanitizedRegexKey.contains("api_key=***"));
    }
}

