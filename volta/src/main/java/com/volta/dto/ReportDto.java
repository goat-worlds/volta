package com.volta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class ReportDto {
  private String id;
  private String inspectionId;
  private String equipmentId;
  private LocalDateTime submittedAt;
  private String summary;
  private List<ChecklistItemDto> checklist;
}
