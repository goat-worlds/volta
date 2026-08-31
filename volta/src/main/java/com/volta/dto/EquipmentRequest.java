package com.volta.dto;

import com.volta.domain.EquipmentTier;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class EquipmentRequest {
  private String name;
  private String categoryId;
  private String brand;
  private String model;
  private Integer year;
  private Integer hours;
  private String location;
  private String description;
  private List<String> photos;
  private String declaredCondition;
  private BigDecimal pricePerDay;
  private EquipmentTier tier;
}
