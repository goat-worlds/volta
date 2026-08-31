package com.volta.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {
  @Id
  private String id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String categoryId;

  @Column(nullable = false)
  private String brand;

  @Column(nullable = false)
  private String model;

  @Column(nullable = false)
  private Integer year;

  @Column(nullable = false)
  private Integer hours;

  @Column(nullable = false)
  private String location;

  @Column(columnDefinition = "TEXT")
  private String description;

  @ElementCollection
  private List<String> photos = new ArrayList<>();

  @Column(nullable = false)
  private String supplierId;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private EquipmentStatus status = EquipmentStatus.DRAFT;

  private Character category;

  @Column(nullable = false)
  private String declaredCondition;

  private BigDecimal pricePerDay;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private EquipmentTier tier = EquipmentTier.BASIC;

  @Column(nullable = false)
  private Integer likes = 0;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  private LocalDateTime updatedAt;

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
