package com.rentfair.controller;

import com.rentfair.config.SerpApiProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final SerpApiProperties serpApiProperties;
    private final DataSource dataSource;
    private final Instant startTime = Instant.now();

    public HealthController(SerpApiProperties serpApiProperties, DataSource dataSource) {
        this.serpApiProperties = serpApiProperties;
        this.dataSource = dataSource;
    }

    @GetMapping({"/api/health", "/api/v1/health", "/health"})
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "RentFair — Rental Price Fairness Intelligence Platform");
        health.put("version", "0.1.0");
        health.put("timestamp", Instant.now().toString());
        health.put("uptimeSeconds", Duration.between(startTime, Instant.now()).getSeconds());

        // SerpApi configuration status (safe disclosure - never leaks API key value)
        String key = serpApiProperties.getApiKey();
        boolean keyConfigured = key != null && !key.trim().isEmpty() && !"your_serpapi_api_key_here".equals(key);
        Map<String, Object> serpApiStatus = new LinkedHashMap<>();
        serpApiStatus.put("configured", keyConfigured);
        serpApiStatus.put("engine", serpApiProperties.getEngine());
        serpApiStatus.put("timeoutSeconds", serpApiProperties.getTimeoutSeconds());
        health.put("serpApi", serpApiStatus);

        // Database status
        Map<String, Object> dbStatus = new LinkedHashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            dbStatus.put("status", "UP");
            dbStatus.put("databaseProduct", conn.getMetaData().getDatabaseProductName());
        } catch (Exception e) {
            dbStatus.put("status", "DOWN");
            dbStatus.put("error", e.getMessage());
        }
        health.put("database", dbStatus);

        return ResponseEntity.ok(health);
    }
}
