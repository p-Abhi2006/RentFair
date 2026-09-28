package com.rentfair.exception;

public class SerpApiNetworkException extends RuntimeException {
    public SerpApiNetworkException(String message, Throwable cause) {
        super(message, cause);
    }

    public SerpApiNetworkException(String message) {
        super(message);
    }
}
