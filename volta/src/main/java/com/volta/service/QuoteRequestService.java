package com.volta.service;

import com.volta.domain.QuoteRequest;
import com.volta.domain.QuoteRequestStatus;
import com.volta.dto.QuoteRequestDto;
import com.volta.repository.QuoteRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuoteRequestService {
  private final QuoteRequestRepository quoteRequestRepository;

  public QuoteRequestDto createQuote(QuoteRequest.QuoteRequestBuilder builder) {
    String id = "dv-" + UUID.randomUUID().toString().substring(0, 8);
    long count = quoteRequestRepository.count() + 1;
    String reference = "DV-2026-" + String.format("%03d", count);

    QuoteRequest quote = builder
        .id(id)
        .reference(reference)
        .status(QuoteRequestStatus.NOUVELLE)
        .createdAt(LocalDateTime.now())
        .build();

    QuoteRequest saved = quoteRequestRepository.save(quote);
    return toDto(saved);
  }

  public List<QuoteRequestDto> getByStatus(QuoteRequestStatus status) {
    return quoteRequestRepository.findByStatus(status).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public List<QuoteRequestDto> getBySupplier(String supplierId) {
    return quoteRequestRepository.findBySupplierId(supplierId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public List<QuoteRequestDto> getByEquipment(String equipmentId) {
    return quoteRequestRepository.findByEquipmentId(equipmentId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public QuoteRequestDto getById(String id) {
    QuoteRequest quote = quoteRequestRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Quote not found"));
    return toDto(quote);
  }

  public QuoteRequestDto updateStatus(String id, QuoteRequestStatus status) {
    QuoteRequest quote = quoteRequestRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Quote not found"));
    quote.setStatus(status);
    quote.setUpdatedAt(LocalDateTime.now());
    QuoteRequest saved = quoteRequestRepository.save(quote);
    return toDto(saved);
  }

  private QuoteRequestDto toDto(QuoteRequest quote) {
    return QuoteRequestDto.builder()
        .id(quote.getId())
        .reference(quote.getReference())
        .equipmentId(quote.getEquipmentId())
        .supplierId(quote.getSupplierId())
        .clientName(quote.getClientName())
        .clientCompany(quote.getClientCompany())
        .clientPhone(quote.getClientPhone())
        .clientEmail(quote.getClientEmail())
        .duration(quote.getDuration())
        .requestedDate(quote.getRequestedDate())
        .location(quote.getLocation())
        .message(quote.getMessage())
        .status(quote.getStatus())
        .createdAt(quote.getCreatedAt())
        .updatedAt(quote.getUpdatedAt())
        .build();
  }
}
