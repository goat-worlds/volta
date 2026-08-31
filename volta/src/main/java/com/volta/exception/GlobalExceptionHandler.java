package com.volta.exception;

import com.volta.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiResponse<?>> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
    log.warn("Resource not found: {}", ex.getMessage());
    return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ApiResponse<?>> handleUnauthorized(UnauthorizedException ex, WebRequest request) {
    log.warn("Unauthorized: {}", ex.getMessage());
    return ResponseEntity
        .status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiResponse<?>> handleBadCredentials(BadCredentialsException ex) {
    log.warn("Bad credentials");
    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(ApiResponse.error("Email ou mot de passe incorrect"));
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ApiResponse<?>> handleAuthenticationException(AuthenticationException ex) {
    log.warn("Authentication error: {}", ex.getMessage());
    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(ApiResponse.error("Authentification requise"));
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ApiResponse<?>> handleConflict(ConflictException ex) {
    log.warn("Conflict: {}", ex.getMessage());
    return ResponseEntity
        .status(HttpStatus.CONFLICT)
        .body(ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<ApiResponse<?>> handleValidation(ValidationException ex) {
    log.warn("Validation error: {}", ex.getMessage());
    Map<String, String> errors = new HashMap<>();
    errors.put("field", ex.getField());
    errors.put("error", ex.getMessage());
    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error("Erreur de validation", errors));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<?>> handleGenericException(Exception ex) {
    log.error("Unexpected error", ex);
    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error("Une erreur est survenue. Veuillez réessayer."));
  }
}
