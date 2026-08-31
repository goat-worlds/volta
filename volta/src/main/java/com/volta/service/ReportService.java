package com.volta.service;

import com.volta.domain.Report;
import com.volta.domain.Inspection;
import com.volta.domain.ChecklistItem;
import com.volta.dto.ChecklistItemDto;
import com.volta.dto.ReportDto;
import com.volta.repository.ReportRepository;
import com.volta.repository.InspectionRepository;
import com.volta.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
  private final ReportRepository reportRepository;
  private final InspectionRepository inspectionRepository;

  public ReportDto createReport(String inspectionId, String summary, List<ChecklistItem> checklist) {
    Inspection inspection = inspectionRepository.findById(inspectionId)
        .orElseThrow(() -> new ResourceNotFoundException("Inspection", "id", inspectionId));

    Report report = Report.builder()
        .id("rep-" + System.currentTimeMillis())
        .inspectionId(inspectionId)
        .equipmentId(inspection.getEquipmentId())
        .submittedAt(LocalDateTime.now())
        .summary(summary)
        .checklist(checklist)
        .build();

    Report saved = reportRepository.save(report);
    return toDto(saved);
  }

  public ReportDto getReport(String id) {
    Report report = reportRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
    return toDto(report);
  }

  public ReportDto getReportByInspection(String inspectionId) {
    Report report = reportRepository.findByInspectionId(inspectionId)
        .orElseThrow(() -> new ResourceNotFoundException("Report", "inspectionId", inspectionId));
    return toDto(report);
  }

  public ReportDto getReportByEquipment(String equipmentId) {
    Report report = reportRepository.findByEquipmentId(equipmentId)
        .orElseThrow(() -> new ResourceNotFoundException("Report", "equipmentId", equipmentId));
    return toDto(report);
  }

  private ReportDto toDto(Report report) {
    return ReportDto.builder()
        .id(report.getId())
        .inspectionId(report.getInspectionId())
        .equipmentId(report.getEquipmentId())
        .submittedAt(report.getSubmittedAt())
        .summary(report.getSummary())
        .checklist(report.getChecklist().stream()
            .map(item -> new ChecklistItemDto(
                item.getSection(),
                item.getLabel(),
                item.getResult() != null ? item.getResult().toString() : null,
                item.getObservation()
            ))
            .collect(Collectors.toList()))
        .build();
  }
}
