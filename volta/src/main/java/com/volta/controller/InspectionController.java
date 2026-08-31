package com.volta.controller;

import com.volta.dto.ChecklistItemDto;
import com.volta.dto.InspectionDto;
import com.volta.service.InspectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inspections")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class InspectionController {
  private final InspectionService inspectionService;

  @PostMapping
  public ResponseEntity<InspectionDto> assignInspection(@RequestBody AssignRequest request) {
    InspectionDto response = inspectionService.assignInspection(request.getQuoteRequestId(), request.getTechnicalTeamId());
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<InspectionDto> getInspection(@PathVariable String id) {
    InspectionDto response = inspectionService.getInspection(id);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}/checklist")
  public ResponseEntity<InspectionDto> updateChecklist(
      @PathVariable String id,
      @RequestBody List<ChecklistItemDto> checklist
  ) {
    InspectionDto response = inspectionService.updateChecklist(id, checklist);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}/complete")
  public ResponseEntity<InspectionDto> completeInspection(
      @PathVariable String id,
      @RequestBody CompleteRequest request
  ) {
    InspectionDto response = inspectionService.completeInspection(id, request.getSummary());
    return ResponseEntity.ok(response);
  }

  public static class AssignRequest {
    private String quoteRequestId;
    private String technicalTeamId;

    public String getQuoteRequestId() { return quoteRequestId; }
    public void setQuoteRequestId(String quoteRequestId) { this.quoteRequestId = quoteRequestId; }
    public String getTechnicalTeamId() { return technicalTeamId; }
    public void setTechnicalTeamId(String technicalTeamId) { this.technicalTeamId = technicalTeamId; }
  }

  public static class CompleteRequest {
    private String summary;
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
  }
}
