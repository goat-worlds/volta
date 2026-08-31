package com.volta.dto;

import com.volta.domain.EquipmentStatus;
import com.volta.domain.EquipmentTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class EquipmentResponse {
  private String id;
  private String name;
  private String categoryId;
  private String brand;
  private String model;
  private Integer year;
  private Integer hours;
  private String location;
  private String description;
  private List<String> photos;
  private String supplierId;
  private EquipmentStatus status;
  private Character category;
  private String declaredCondition;
  private BigDecimal pricePerDay;
  private EquipmentTier tier;
  private Integer likes;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
