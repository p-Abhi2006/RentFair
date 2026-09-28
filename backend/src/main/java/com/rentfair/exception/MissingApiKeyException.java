package com.rentfair.exception;

public class MissingApiKeyException extends RuntimeException {
    public MissingApiKeyException(String message) {
        super(message);
    }
}
