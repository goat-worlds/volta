package com.volta.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
  private Boolean success;
  private String message;
  private T data;
  private Object errors;
  private LocalDateTime timestamp;

  public static <T> ApiResponse<T> ok(T data) {
    return ApiResponse.<T>builder()
        .success(true)
        .data(data)
        .timestamp(LocalDateTime.now())
        .build();
  }

  public static <T> ApiResponse<T> ok(T data, String message) {
    return ApiResponse.<T>builder()
        .success(true)
        .data(data)
        .message(message)
        .timestamp(LocalDateTime.now())
        .build();
  }

  public static <T> ApiResponse<T> error(String message) {
    return ApiResponse.<T>builder()
        .success(false)
        .message(message)
        .timestamp(LocalDateTime.now())
        .build();
  }

  public static <T> ApiResponse<T> error(String message, Object errors) {
    return ApiResponse.<T>builder()
        .success(false)
        .message(message)
        .errors(errors)
        .timestamp(LocalDateTime.now())
        .build();
  }
}
