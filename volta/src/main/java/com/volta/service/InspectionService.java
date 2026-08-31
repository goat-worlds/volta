package com.volta.service;

import com.volta.domain.*;
import com.volta.dto.ChecklistItemDto;
import com.volta.dto.InspectionDto;
import com.volta.repository.InspectionRepository;
import com.volta.repository.ChecklistItemRepository;
import com.volta.repository.QuoteRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InspectionService {
  private final InspectionRepository inspectionRepository;
  private final ChecklistItemRepository checklistItemRepository;
  private final QuoteRequestRepository quoteRequestRepository;

  private static final List<ChecklistItem> CHECKLIST_TEMPLATE = createTemplate();

  public InspectionDto assignInspection(String quoteRequestId, String technicalTeamId) {
    QuoteRequest quote = quoteRequestRepository.findById(quoteRequestId)
        .orElseThrow(() -> new RuntimeException("Quote not found"));

    Inspection inspection = Inspection.builder()
        .id("insp-" + UUID.randomUUID().toString().substring(0, 8))
        .quoteRequestId(quoteRequestId)
        .equipmentId(quote.getEquipmentId())
        .technicalTeamId(technicalTeamId)
        .assignedAt(LocalDateTime.now())
        .status(InspectionStatus.ASSIGNEE)
        .build();

    // Create checklist items
    List<ChecklistItem> checklist = CHECKLIST_TEMPLATE.stream()
        .map(item -> {
          ChecklistItem newItem = new ChecklistItem();
          newItem.setId(UUID.randomUUID().toString());
          newItem.setSection(item.getSection());
          newItem.setLabel(item.getLabel());
          newItem.setResult(null);
          newItem.setObservation("");
          newItem.setInspectionId(inspection.getId());
          return newItem;
        })
        .collect(Collectors.toList());

    Inspection saved = inspectionRepository.save(inspection);
    inspection.setChecklist(checklist);
    checklistItemRepository.saveAll(checklist);

    return toDto(saved);
  }

  public InspectionDto getInspection(String id) {
    Inspection inspection = inspectionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Inspection not found"));
    return toDto(inspection);
  }

  public InspectionDto updateChecklist(String id, List<ChecklistItemDto> checklistDto) {
    Inspection inspection = inspectionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Inspection not found"));

    List<ChecklistItem> checklist = inspection.getChecklist();
    for (int i = 0; i < checklistDto.size() && i < checklist.size(); i++) {
      ChecklistItemDto dto = checklistDto.get(i);
      ChecklistItem item = checklist.get(i);
      if (dto.getResult() != null) item.setResult(CheckResult.valueOf(dto.getResult()));
      if (dto.getObservation() != null) item.setObservation(dto.getObservation());
    }

    checklistItemRepository.saveAll(checklist);
    inspection.setStatus(InspectionStatus.EN_COURS);
    Inspection saved = inspectionRepository.save(inspection);
    return toDto(saved);
  }

  public InspectionDto completeInspection(String id, String summary) {
    Inspection inspection = inspectionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Inspection not found"));

    inspection.setStatus(InspectionStatus.PENDING_ADMIN_REVIEW);
    Inspection saved = inspectionRepository.save(inspection);
    return toDto(saved);
  }

  private InspectionDto toDto(Inspection inspection) {
    return InspectionDto.builder()
        .id(inspection.getId())
        .quoteRequestId(inspection.getQuoteRequestId())
        .equipmentId(inspection.getEquipmentId())
        .technicalTeamId(inspection.getTechnicalTeamId())
        .assignedAt(inspection.getAssignedAt())
        .status(inspection.getStatus())
        .checklist(inspection.getChecklist().stream()
            .map(item -> new ChecklistItemDto(item.getSection(), item.getLabel(),
                item.getResult() != null ? item.getResult().toString() : null, item.getObservation()))
            .collect(Collectors.toList()))
        .build();
  }

  private static List<ChecklistItem> createTemplate() {
    return List.of(
        ChecklistItem.builder().section("MÉCANIQUE").label("Moteur").build(),
        ChecklistItem.builder().section("MÉCANIQUE").label("Transmission").build(),
        ChecklistItem.builder().section("MÉCANIQUE").label("Hydraulique").build(),
        ChecklistItem.builder().section("MÉCANIQUE").label("Freinage").build(),
        ChecklistItem.builder().section("MÉCANIQUE").label("Direction").build(),
        ChecklistItem.builder().section("MÉCANIQUE").label("Pneus / chenilles").build(),
        ChecklistItem.builder().section("ÉQUIPEMENT").label("Godet").build(),
        ChecklistItem.builder().section("ÉQUIPEMENT").label("Bras").build(),
        ChecklistItem.builder().section("ÉQUIPEMENT").label("Accessoires").build(),
        ChecklistItem.builder().section("SÉCURITÉ").label("Dispositifs de sécurité").build(),
        ChecklistItem.builder().section("SÉCURITÉ").label("Éclairage").build(),
        ChecklistItem.builder().section("SÉCURITÉ").label("Signalisation").build(),
        ChecklistItem.builder().section("ÉTAT GÉNÉRAL").label("Carrosserie").build(),
        ChecklistItem.builder().section("ÉTAT GÉNÉRAL").label("Corrosion").build(),
        ChecklistItem.builder().section("ÉTAT GÉNÉRAL").label("Usure").build()
    );
  }
}
