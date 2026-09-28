package com.rentfair.exception;

public class SerpApiRateLimitException extends RuntimeException {
    public SerpApiRateLimitException(String message) {
        super(message);
    }
}
