package com.volta.controller;

import com.volta.domain.EquipmentStatus;
import com.volta.domain.EquipmentTier;
import com.volta.dto.EquipmentRequest;
import com.volta.dto.EquipmentResponse;
import com.volta.service.EquipmentService;
import com.volta.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class EquipmentController {
  private final EquipmentService equipmentService;
  private final CategoryService categoryService;

  @PostMapping
  public ResponseEntity<EquipmentResponse> createEquipment(@RequestBody EquipmentRequest request) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String supplierId = (String) auth.getPrincipal();
    EquipmentResponse response = equipmentService.createEquipment(request, supplierId);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping
  public ResponseEntity<Page<EquipmentResponse>> listEquipment(
      @RequestParam(required = false) EquipmentStatus status,
      @RequestParam(required = false) EquipmentTier tier,
      @RequestParam(required = false) String categoryId,
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size
  ) {
    Pageable pageable = PageRequest.of(page, size);
    Page<EquipmentResponse> response = equipmentService.listEquipment(status, tier, categoryId, search, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<EquipmentResponse> getEquipment(@PathVariable String id) {
    EquipmentResponse response = equipmentService.getEquipment(id);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}")
  public ResponseEntity<EquipmentResponse> updateEquipment(
      @PathVariable String id,
      @RequestBody EquipmentRequest request
  ) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String supplierId = (String) auth.getPrincipal();
    EquipmentResponse response = equipmentService.updateEquipment(id, request, supplierId);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}/status")
  public ResponseEntity<EquipmentResponse> updateStatus(
      @PathVariable String id,
      @RequestBody StatusUpdateRequest request
  ) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String supplierId = (String) auth.getPrincipal();
    EquipmentResponse response = equipmentService.updateStatus(id, request.getStatus(), supplierId);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteEquipment(@PathVariable String id) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String supplierId = (String) auth.getPrincipal();
    equipmentService.deleteEquipment(id, supplierId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/like")
  public ResponseEntity<EquipmentResponse> toggleLike(@PathVariable String id) {
    EquipmentResponse response = equipmentService.toggleLike(id);
    return ResponseEntity.ok(response);
  }

  @GetMapping("categories")
  public ResponseEntity<?> getCategories() {
    return ResponseEntity.ok(categoryService.getAllCategories());
  }

  @GetMapping("categories/{id}")
  public ResponseEntity<?> getCategory(@PathVariable String id) {
    return ResponseEntity.ok(categoryService.getCategory(id));
  }

  public static class StatusUpdateRequest {
    private EquipmentStatus status;

    public EquipmentStatus getStatus() {
      return status;
    }

    public void setStatus(EquipmentStatus status) {
      this.status = status;
    }
  }
}
