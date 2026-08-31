package com.volta.dto;

import com.volta.domain.InspectionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class InspectionDto {
  private String id;
  private String quoteRequestId;
  private String equipmentId;
  private String technicalTeamId;
  private LocalDateTime assignedAt;
  private InspectionStatus status;
  private List<ChecklistItemDto> checklist;
}
