package com.rentfair.exception;

import com.rentfair.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MissingApiKeyException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingApiKey(MissingApiKeyException ex, HttpServletRequest request) {
        log.warn("Missing SerpApi key: {}", ex.getMessage());
        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "MISSING_API_KEY",
                ex.getMessage(),
                request.getRequestURI(),
                List.of("Set the SERPAPI_API_KEY environment variable or define it in .env")
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(SerpApiRateLimitException.class)
    public ResponseEntity<ApiErrorResponse> handleRateLimit(SerpApiRateLimitException ex, HttpServletRequest request) {
        log.warn("SerpApi rate limit reached: {}", ex.getMessage());
        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "RATE_LIMIT_EXCEEDED",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
    }

    @ExceptionHandler(InvalidSearchParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidParams(InvalidSearchParameterException ex, HttpServletRequest request) {
        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "INVALID_PARAMETERS",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(SerpApiNetworkException.class)
    public ResponseEntity<ApiErrorResponse> handleNetworkError(SerpApiNetworkException ex, HttpServletRequest request) {
        log.error("SerpApi communication error: {}", ex.getMessage(), ex);
        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.BAD_GATEWAY.value(),
                "UPSTREAM_SERVICE_ERROR",
                "Failed to fetch rental data from SerpApi Google search engine: " + ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .toList();

        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_FAILED",
                "Invalid request parameters",
                request.getRequestURI(),
                details
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "An unexpected server error occurred: " + ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
