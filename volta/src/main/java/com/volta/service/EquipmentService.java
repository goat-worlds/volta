package com.volta.service;

import com.volta.domain.Equipment;
import com.volta.domain.EquipmentStatus;
import com.volta.domain.EquipmentTier;
import com.volta.dto.EquipmentRequest;
import com.volta.dto.EquipmentResponse;
import com.volta.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentService {
  private final EquipmentRepository equipmentRepository;

  public EquipmentResponse createEquipment(EquipmentRequest request, String supplierId) {
    Equipment equipment = Equipment.builder()
        .id("eq-" + UUID.randomUUID().toString().substring(0, 8))
        .name(request.getName())
        .categoryId(request.getCategoryId())
        .brand(request.getBrand())
        .model(request.getModel())
        .year(request.getYear())
        .hours(request.getHours())
        .location(request.getLocation())
        .description(request.getDescription())
        .photos(request.getPhotos())
        .supplierId(supplierId)
        .status(EquipmentStatus.DRAFT)
        .declaredCondition(request.getDeclaredCondition())
        .pricePerDay(request.getPricePerDay())
        .tier(request.getTier() != null ? request.getTier() : EquipmentTier.BASIC)
        .build();

    Equipment saved = equipmentRepository.save(equipment);
    return toResponse(saved);
  }

  public EquipmentResponse getEquipment(String id) {
    Equipment equipment = equipmentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Equipment not found"));
    return toResponse(equipment);
  }

  public Page<EquipmentResponse> listEquipment(EquipmentStatus status, EquipmentTier tier, String categoryId, String search, Pageable pageable) {
    List<Equipment> equipment;

    if (search != null && !search.isEmpty()) {
      equipment = equipmentRepository.searchByStatusAndKeyword(
          status != null ? status : EquipmentStatus.PUBLISHED,
          search
      );
    } else if (status != null) {
      equipment = equipmentRepository.findByStatus(status);
    } else if (tier != null) {
      equipment = equipmentRepository.findByTier(tier);
    } else if (categoryId != null) {
      equipment = equipmentRepository.findByCategoryId(categoryId);
    } else {
      equipment = equipmentRepository.findAll();
    }

    List<EquipmentResponse> responses = equipment.stream()
        .map(this::toResponse)
        .collect(Collectors.toList());

    int start = (int) pageable.getOffset();
    int end = Math.min((start + pageable.getPageSize()), responses.size());

    return new PageImpl<>(
        responses.subList(start, end),
        pageable,
        responses.size()
    );
  }

  public EquipmentResponse updateEquipment(String id, EquipmentRequest request, String supplierId) {
    Equipment equipment = equipmentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Equipment not found"));

    if (!equipment.getSupplierId().equals(supplierId)) {
      throw new RuntimeException("Unauthorized: only supplier can update their equipment");
    }

    if (request.getName() != null) equipment.setName(request.getName());
    if (request.getDescription() != null) equipment.setDescription(request.getDescription());
    if (request.getPhotos() != null) equipment.setPhotos(request.getPhotos());
    if (request.getPricePerDay() != null) equipment.setPricePerDay(request.getPricePerDay());

    Equipment saved = equipmentRepository.save(equipment);
    return toResponse(saved);
  }

  public EquipmentResponse updateStatus(String id, EquipmentStatus status, String supplierId) {
    Equipment equipment = equipmentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Equipment not found"));

    if (!equipment.getSupplierId().equals(supplierId)) {
      throw new RuntimeException("Unauthorized");
    }

    equipment.setStatus(status);
    Equipment saved = equipmentRepository.save(equipment);
    return toResponse(saved);
  }

  public void deleteEquipment(String id, String supplierId) {
    Equipment equipment = equipmentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Equipment not found"));

    if (!equipment.getSupplierId().equals(supplierId)) {
      throw new RuntimeException("Unauthorized");
    }

    equipmentRepository.delete(equipment);
  }

  public EquipmentResponse toggleLike(String id) {
    Equipment equipment = equipmentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Equipment not found"));
    equipment.setLikes(equipment.getLikes() + 1);
    Equipment saved = equipmentRepository.save(equipment);
    return toResponse(saved);
  }

  private EquipmentResponse toResponse(Equipment equipment) {
    return EquipmentResponse.builder()
        .id(equipment.getId())
        .name(equipment.getName())
        .categoryId(equipment.getCategoryId())
        .brand(equipment.getBrand())
        .model(equipment.getModel())
        .year(equipment.getYear())
        .hours(equipment.getHours())
        .location(equipment.getLocation())
        .description(equipment.getDescription())
        .photos(equipment.getPhotos())
        .supplierId(equipment.getSupplierId())
        .status(equipment.getStatus())
        .category(equipment.getCategory())
        .declaredCondition(equipment.getDeclaredCondition())
        .pricePerDay(equipment.getPricePerDay())
        .tier(equipment.getTier())
        .likes(equipment.getLikes())
        .createdAt(equipment.getCreatedAt())
        .updatedAt(equipment.getUpdatedAt())
        .build();
  }
}
