package com.volta.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quote_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteRequest {
  @Id
  private String id;

  @Column(nullable = false, unique = true)
  private String reference;

  @Column(nullable = false)
  private String equipmentId;

  @Column(nullable = false)
  private String supplierId;

  @Column(nullable = false)
  private String clientName;

  @Column(nullable = false)
  private String clientCompany;

  @Column(nullable = false)
  private String clientPhone;

  @Column(nullable = false)
  private String clientEmail;

  @Column(nullable = false)
  private String duration;

  @Column(nullable = false)
  private LocalDate requestedDate;

  @Column(nullable = false)
  private String location;

  @Column(columnDefinition = "TEXT")
  private String message;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private QuoteRequestStatus status = QuoteRequestStatus.NOUVELLE;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  private LocalDateTime updatedAt;

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
