package com.volta.controller;

import com.volta.domain.Equipment;
import com.volta.domain.EquipmentStatus;
import com.volta.domain.EquipmentTier;
import com.volta.domain.InspectionStatus;
import com.volta.dto.EquipmentResponse;
import com.volta.dto.InspectionDto;
import com.volta.repository.EquipmentRepository;
import com.volta.repository.InspectionRepository;
import com.volta.service.EquipmentService;
import com.volta.service.InspectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class AdminController {
  private final EquipmentService equipmentService;
  private final InspectionService inspectionService;
  private final EquipmentRepository equipmentRepository;
  private final InspectionRepository inspectionRepository;

  @PutMapping("/equipment/{id}/validate")
  public ResponseEntity<EquipmentResponse> validateEquipment(
      @PathVariable String id,
      @RequestBody ValidateRequest request
  ) {
    Equipment equipment = equipmentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Equipment not found"));

    equipment.setStatus(EquipmentStatus.CATEGORISE);
    equipment.setCategory(request.getCategory().charAt(0));
    equipment.setTier(request.getTier());
    equipment.setUpdatedAt(LocalDateTime.now());

    Equipment saved = equipmentRepository.save(equipment);
    return ResponseEntity.ok(equipmentService.getEquipment(saved.getId()));
  }

  @PutMapping("/equipment/{id}/reject")
  public ResponseEntity<EquipmentResponse> rejectEquipment(
      @PathVariable String id,
      @RequestBody RejectRequest request
  ) {
    Equipment equipment = equipmentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Equipment not found"));

    equipment.setStatus(EquipmentStatus.REJECTED);
    equipment.setUpdatedAt(LocalDateTime.now());

    Equipment saved = equipmentRepository.save(equipment);
    return ResponseEntity.ok(equipmentService.getEquipment(saved.getId()));
  }

  @PutMapping("/inspections/{id}/approve")
  public ResponseEntity<InspectionDto> approveInspection(@PathVariable String id) {
    com.volta.domain.Inspection inspection = inspectionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Inspection not found"));

    inspection.setStatus(InspectionStatus.PUBLISHED);
    inspection.setUpdatedAt(LocalDateTime.now());

    // Update equipment status to PUBLISHED
    Equipment equipment = equipmentRepository.findById(inspection.getEquipmentId())
        .orElseThrow(() -> new RuntimeException("Equipment not found"));
    equipment.setStatus(EquipmentStatus.PUBLISHED);
    equipmentRepository.save(equipment);

    com.volta.domain.Inspection saved = inspectionRepository.save(inspection);
    return ResponseEntity.ok(inspectionService.getInspection(saved.getId()));
  }

  @PutMapping("/inspections/{id}/reject")
  public ResponseEntity<InspectionDto> rejectInspection(
      @PathVariable String id,
      @RequestBody RejectInspectionRequest request
  ) {
    com.volta.domain.Inspection inspection = inspectionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Inspection not found"));

    inspection.setStatus(InspectionStatus.REJECTED);
    inspection.setUpdatedAt(LocalDateTime.now());

    com.volta.domain.Inspection saved = inspectionRepository.save(inspection);
    return ResponseEntity.ok(inspectionService.getInspection(saved.getId()));
  }

  public static class ValidateRequest {
    private String category;
    private EquipmentTier tier;

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public EquipmentTier getTier() { return tier; }
    public void setTier(EquipmentTier tier) { this.tier = tier; }
  }

  public static class RejectRequest {
    private String reason;
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
  }

  public static class RejectInspectionRequest {
    private String reason;
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
  }
}
