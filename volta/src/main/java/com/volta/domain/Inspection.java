package com.volta.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inspections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inspection {
  @Id
  private String id;

  @Column(nullable = false)
  private String quoteRequestId;

  @Column(nullable = false)
  private String equipmentId;

  @Column(nullable = false)
  private String technicalTeamId;

  @Column(nullable = false)
  private LocalDateTime assignedAt;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private InspectionStatus status = InspectionStatus.ASSIGNEE;

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "inspectionId", fetch = FetchType.EAGER)
  private List<ChecklistItem> checklist = new ArrayList<>();

  @ElementCollection
  private List<String> photos = new ArrayList<>();

  @ElementCollection
  private List<String> anomalies = new ArrayList<>();

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  private LocalDateTime updatedAt;

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
