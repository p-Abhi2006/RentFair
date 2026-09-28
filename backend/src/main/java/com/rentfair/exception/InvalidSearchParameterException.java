package com.rentfair.exception;

public class InvalidSearchParameterException extends RuntimeException {
    public InvalidSearchParameterException(String message) {
        super(message);
    }
}
