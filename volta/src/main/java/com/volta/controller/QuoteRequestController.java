package com.volta.controller;

import com.volta.domain.QuoteRequest;
import com.volta.domain.QuoteRequestStatus;
import com.volta.dto.QuoteRequestDto;
import com.volta.service.QuoteRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class QuoteRequestController {
  private final QuoteRequestService quoteRequestService;

  @PostMapping
  public ResponseEntity<QuoteRequestDto> createQuote(@RequestBody CreateQuoteRequest request) {
    QuoteRequest.QuoteRequestBuilder builder = QuoteRequest.builder()
        .equipmentId(request.getEquipmentId())
        .supplierId(request.getSupplierId())
        .clientName(request.getClientName())
        .clientCompany(request.getClientCompany())
        .clientPhone(request.getClientPhone())
        .clientEmail(request.getClientEmail())
        .duration(request.getDuration())
        .requestedDate(request.getRequestedDate())
        .location(request.getLocation())
        .message(request.getMessage());

    QuoteRequestDto response = quoteRequestService.createQuote(builder);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping
  public ResponseEntity<List<QuoteRequestDto>> listQuotes(
      @RequestParam(required = false) QuoteRequestStatus status,
      @RequestParam(required = false) String supplierId,
      @RequestParam(required = false) String equipmentId
  ) {
    List<QuoteRequestDto> response;
    if (status != null) {
      response = quoteRequestService.getByStatus(status);
    } else if (supplierId != null) {
      response = quoteRequestService.getBySupplier(supplierId);
    } else if (equipmentId != null) {
      response = quoteRequestService.getByEquipment(equipmentId);
    } else {
      response = List.of();
    }
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<QuoteRequestDto> getQuote(@PathVariable String id) {
    QuoteRequestDto response = quoteRequestService.getById(id);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}/status")
  public ResponseEntity<QuoteRequestDto> updateStatus(
      @PathVariable String id,
      @RequestBody StatusUpdateRequest request
  ) {
    QuoteRequestDto response = quoteRequestService.updateStatus(id, request.getStatus());
    return ResponseEntity.ok(response);
  }

  public static class CreateQuoteRequest {
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

    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getSupplierId() { return supplierId; }
    public void setSupplierId(String supplierId) { this.supplierId = supplierId; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getClientCompany() { return clientCompany; }
    public void setClientCompany(String clientCompany) { this.clientCompany = clientCompany; }
    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }
    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public LocalDate getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
  }

  public static class StatusUpdateRequest {
    private QuoteRequestStatus status;
    public QuoteRequestStatus getStatus() { return status; }
    public void setStatus(QuoteRequestStatus status) { this.status = status; }
  }
}
