package com.rentfair;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import java.io.File;

@SpringBootApplication
@EnableCaching
public class RentFairApplication {

    public static void main(String[] args) {
        // Automatically discover and load .env from project root or current directory
        loadDotenvIfPresent();

        SpringApplication.run(RentFairApplication.class, args);
    }

    private static void loadDotenvIfPresent() {
        try {
            File currentDirEnv = new File(".env");
            File parentDirEnv = new File("../.env");

            String directory = null;
            if (currentDirEnv.exists()) {
                directory = ".";
            } else if (parentDirEnv.exists()) {
                directory = "..";
            }

            if (directory != null) {
                Dotenv dotenv = Dotenv.configure()
                        .directory(directory)
                        .ignoreIfMissing()
                        .load();

                dotenv.entries().forEach(entry -> {
                    if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                });
            }
        } catch (Exception ignored) {
            // Non-fatal if .env is missing; fallback to system environment variables
        }
    }
}
