package com.volta.dto;

import com.volta.domain.QuoteRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class QuoteRequestDto {
  private String id;
  private String reference;
  private String equipmentId;
  private String supplierId;
  private String clientName;
  private String clientCompany;
  private String clientPhone;
  private String clientEmail;
  private String duration;
  private LocalDate requestedDate;
  private String location;
  private String message;
  private QuoteRequestStatus status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
