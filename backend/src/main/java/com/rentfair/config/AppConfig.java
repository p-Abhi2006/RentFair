package com.rentfair.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Configuration
public class AppConfig {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:4173}")
    private String allowedOrigins;

    @Bean
    public RestClient restClient(SerpApiProperties serpApiProperties) {
        return RestClient.builder()
                .baseUrl(serpApiProperties.getBaseUrl())
                .build();
    }

    @Bean
    public RestTemplate restTemplate(SerpApiProperties serpApiProperties) {
        return new RestTemplateBuilder()
                .setConnectTimeout(Duration.ofSeconds(serpApiProperties.getTimeoutSeconds()))
                .setReadTimeout(Duration.ofSeconds(serpApiProperties.getTimeoutSeconds()))
                .build();
    }

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("rentalSearches", "marketBaselines");
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        config.setAllowedOrigins(origins);
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
