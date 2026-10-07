package com.rentfair.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:${DATABASE_URL:}}")
    private String databaseUrl;

    @Value("${spring.datasource.username:${DATABASE_USERNAME:sa}}")
    private String defaultUsername;

    @Value("${spring.datasource.password:${DATABASE_PASSWORD:}}")
    private String defaultPassword;

    @Value("${spring.datasource.driver-class-name:${DATABASE_DRIVER:}}")
    private String defaultDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            try {
                URI uri = new URI(databaseUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath() != null ? uri.getPath() : "";
                String userInfo = uri.getUserInfo();
                String rawQuery = uri.getRawQuery() != null ? uri.getRawQuery() : uri.getQuery();
                String querySuffix = (rawQuery != null && !rawQuery.trim().isEmpty()) ? "?" + rawQuery.trim() : "";

                String username = defaultUsername;
                String password = defaultPassword;
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                } else if (userInfo != null) {
                    username = userInfo;
                }

                String jdbcUrl = String.format("jdbc:postgresql://%s:%d%s%s", host, port, path, querySuffix);
                log.info("Configured PostgreSQL DataSource from URI: jdbc:postgresql://{}:{}{}{}", host, port, path, querySuffix);

                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
                config.setDriverClassName("org.postgresql.Driver");
                config.setMaximumPoolSize(10);
                config.setMinimumIdle(2);
                return new HikariDataSource(config);
            } catch (Exception e) {
                log.warn("Failed to parse DATABASE_URL as postgres:// URI ({}), falling back to standard config", e.getMessage());
            }
        }

        HikariConfig config = new HikariConfig();
        if (databaseUrl != null && !databaseUrl.trim().isEmpty()) {
            config.setJdbcUrl(databaseUrl);
            if (defaultDriver != null && !defaultDriver.trim().isEmpty()) {
                config.setDriverClassName(defaultDriver);
            }
        } else {
            config.setJdbcUrl("jdbc:h2:mem:rentfair;DB_CLOSE_DELAY=-1;MODE=PostgreSQL");
            config.setDriverClassName("org.h2.Driver");
        }
        config.setUsername(defaultUsername);
        config.setPassword(defaultPassword);
        config.setMaximumPoolSize(10);
        return new HikariDataSource(config);
    }
}
