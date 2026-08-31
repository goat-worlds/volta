package com.volta.controller;

import com.volta.dto.ReportDto;
import com.volta.dto.ApiResponse;
import com.volta.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class ReportController {
  private final ReportService reportService;

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<ReportDto>> getReport(@PathVariable String id) {
    ReportDto response = reportService.getReport(id);
    return ResponseEntity.ok(ApiResponse.ok(response));
  }

  @GetMapping("/inspection/{inspectionId}")
  public ResponseEntity<ApiResponse<ReportDto>> getReportByInspection(@PathVariable String inspectionId) {
    ReportDto response = reportService.getReportByInspection(inspectionId);
    return ResponseEntity.ok(ApiResponse.ok(response));
  }

  @GetMapping("/equipment/{equipmentId}")
  public ResponseEntity<ApiResponse<ReportDto>> getReportByEquipment(@PathVariable String equipmentId) {
    ReportDto response = reportService.getReportByEquipment(equipmentId);
    return ResponseEntity.ok(ApiResponse.ok(response));
  }
}
