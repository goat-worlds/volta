package com.volta.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "checklist_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItem {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false)
  private String section;

  @Column(nullable = false)
  private String label;

  @Enumerated(EnumType.STRING)
  private CheckResult result;

  @Column(columnDefinition = "TEXT")
  private String observation;

  private String inspectionId;
}
