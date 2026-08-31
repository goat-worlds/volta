package com.volta.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
  @Id
  private String id;

  @Column(nullable = false)
  private String inspectionId;

  @Column(nullable = false)
  private String equipmentId;

  @Column(nullable = false)
  private LocalDateTime submittedAt;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String summary;

  @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  private List<ChecklistItem> checklist = new ArrayList<>();

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  private LocalDateTime updatedAt;

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
