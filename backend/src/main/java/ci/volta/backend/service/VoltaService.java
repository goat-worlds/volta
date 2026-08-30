package ci.volta.backend.service;

import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.Report;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.repository.ReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class VoltaService {

    public static final List<ChecklistItem> CHECKLIST_TEMPLATE = List.of(
            new ChecklistItem("MÉCANIQUE", "Moteur", null, ""),
            new ChecklistItem("MÉCANIQUE", "Transmission", null, ""),
            new ChecklistItem("MÉCANIQUE", "Hydraulique", null, ""),
            new ChecklistItem("MÉCANIQUE", "Freinage", null, ""),
            new ChecklistItem("MÉCANIQUE", "Direction", null, ""),
            new ChecklistItem("MÉCANIQUE", "Pneus / chenilles", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Godet", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Bras", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Accessoires", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Équipements spécifiques", null, ""),
            new ChecklistItem("SÉCURITÉ", "Dispositifs de sécurité", null, ""),
            new ChecklistItem("SÉCURITÉ", "Éclairage", null, ""),
            new ChecklistItem("SÉCURITÉ", "Signalisation", null, ""),
            new ChecklistItem("SÉCURITÉ", "Équipements obligatoires", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Carrosserie", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Corrosion", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Usure", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Fonctionnement général", null, ""));

    private final EquipmentRepository equipmentRepository;
    private final InspectionRepository inspectionRepository;
    private final ReportRepository reportRepository;
    private final RentalRequestRepository rentalRequestRepository;
    private final NotificationRepository notificationRepository;
    private final WebhookService webhookService;

    public VoltaService(
            EquipmentRepository equipmentRepository,
            InspectionRepository inspectionRepository,
            ReportRepository reportRepository,
            RentalRequestRepository rentalRequestRepository,
            NotificationRepository notificationRepository,
            WebhookService webhookService) {
        this.equipmentRepository = equipmentRepository;
        this.inspectionRepository = inspectionRepository;
        this.reportRepository = reportRepository;
        this.rentalRequestRepository = rentalRequestRepository;
        this.notificationRepository = notificationRepository;
        this.webhookService = webhookService;
    }

    private static String today() {
        return LocalDate.now().toString();
    }

    private static String newId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void notify(String role, String message) {
        notificationRepository.save(new Notification(newId("n"), role, message, today(), false));
    }

    private void emit(String event, Equipment eq) {
        webhookService.dispatch(event, Map.of(
                "equipmentId", eq.id,
                "name", eq.name,
                "status", eq.status,
                "level", eq.level == null ? "" : eq.level,
                "supplierId", eq.supplierId == null ? "" : eq.supplierId));
    }

    private Equipment getEquipment(String id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found: " + id));
    }

    private Inspection getInspection(String id) {
        return inspectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inspection not found: " + id));
    }

    public Equipment addEquipment(Equipment equipment) {
        equipment.id = newId("eq");
        equipment.status = "DRAFT";
        equipment.level = null;
        equipment.createdAt = today();
        return equipmentRepository.save(equipment);
    }

    public Equipment submitEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "SUBMITTED";
        notify("ADMIN", eq.name + " soumis pour vérification");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_SUBMITTED", eq);
        return eq;
    }

    public Inspection assignInspection(String equipmentId, String technicalTeamId) {
        Equipment eq = getEquipment(equipmentId);
        Inspection inspection = new Inspection();
        inspection.id = newId("insp");
        inspection.equipmentId = equipmentId;
        inspection.technicalTeamId = technicalTeamId;
        inspection.assignedAt = today();
        inspection.status = "ASSIGNED";
        inspection.checklist = CHECKLIST_TEMPLATE.stream()
                .map(c -> new ChecklistItem(c.section, c.label, c.result, c.observation))
                .toList();
        inspection = inspectionRepository.save(inspection);
        eq.status = "PENDING_INSPECTION";
        equipmentRepository.save(eq);
        notify("TECHNICAL", "Nouvelle mission assignée : " + eq.name);
        notify("SUPPLIER", eq.name + " est en attente d'inspection");
        emit("INSPECTION_ASSIGNED", eq);
        return inspection;
    }

    public Inspection startInspection(String inspectionId) {
        Inspection inspection = getInspection(inspectionId);
        inspection.status = "IN_PROGRESS";
        inspection = inspectionRepository.save(inspection);
        Equipment eq = getEquipment(inspection.equipmentId);
        eq.status = "INSPECTION_IN_PROGRESS";
        equipmentRepository.save(eq);
        return inspection;
    }

    public Inspection updateChecklist(String inspectionId, List<ChecklistItem> checklist) {
        Inspection inspection = getInspection(inspectionId);
        inspection.checklist = checklist;
        return inspectionRepository.save(inspection);
    }

    public Report submitReport(String inspectionId, String summary, List<ChecklistItem> checklist) {
        Inspection inspection = getInspection(inspectionId);
        Report report = new Report();
        report.id = newId("rep");
        report.inspectionId = inspectionId;
        report.equipmentId = inspection.equipmentId;
        report.submittedAt = today();
        report.summary = summary;
        report.checklist = checklist;
        report = reportRepository.save(report);
        inspection.status = "DONE";
        inspection.checklist = checklist;
        inspectionRepository.save(inspection);
        Equipment eq = getEquipment(inspection.equipmentId);
        eq.status = "PENDING_ADMIN_REVIEW";
        equipmentRepository.save(eq);
        notify("ADMIN", "Rapport d'inspection transmis pour " + eq.name);
        emit("REPORT_SUBMITTED", eq);
        return report;
    }

    public Equipment rejectEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "REJECTED";
        notify("SUPPLIER", eq.name + " a été refusé après vérification");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_REJECTED", eq);
        return eq;
    }

    public Equipment requestCorrection(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "CORRECTIONS_REQUESTED";
        notify("SUPPLIER", "Des corrections sont demandées pour " + eq.name);
        eq = equipmentRepository.save(eq);
        emit("CORRECTIONS_REQUESTED", eq);
        return eq;
    }

    public Equipment referenceEquipment(String equipmentId, String level) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "REFERENCED";
        eq.level = level;
        notify("SUPPLIER", eq.name + " a été référencé " + level);
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_REFERENCED", eq);
        return eq;
    }

    public Equipment publishEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "PUBLISHED";
        notify("SUPPLIER", eq.name + " est publié sur le catalogue");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_PUBLISHED", eq);
        return eq;
    }

    public Equipment unpublishEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "UNPUBLISHED";
        notify("SUPPLIER", eq.name + " a été dépublié du catalogue");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_UNPUBLISHED", eq);
        return eq;
    }

    public RentalRequest createRentalRequest(RentalRequest request) {
        Equipment eq = getEquipment(request.equipmentId);
        long num = 124 + rentalRequestRepository.count();
        request.id = newId("req");
        request.reference = String.format("VOL-2026-%05d", num);
        request.supplierId = eq.supplierId;
        request.status = "PENDING";
        request.createdAt = today();
        request = rentalRequestRepository.save(request);
        notify("ADMIN", "Nouvelle demande de location " + request.reference + " — " + eq.name);
        notify("SUPPLIER", "Nouvelle demande de location " + request.reference + " — " + eq.name);
        webhookService.dispatch("RENTAL_REQUEST_CREATED", Map.of(
                "requestId", request.id,
                "reference", request.reference,
                "equipmentId", eq.id,
                "equipmentName", eq.name,
                "clientName", request.clientName == null ? "" : request.clientName));
        return request;
    }

    public RentalRequest respondRentalRequest(String requestId, boolean accepted) {
        RentalRequest request = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rental request not found: " + requestId));
        request.status = accepted ? "ACCEPTED" : "DECLINED";
        request = rentalRequestRepository.save(request);
        Equipment eq = getEquipment(request.equipmentId);
        notify("ADMIN", "Demande " + request.reference + " " + (accepted ? "acceptée" : "refusée") + " — " + eq.name);
        webhookService.dispatch(accepted ? "RENTAL_REQUEST_ACCEPTED" : "RENTAL_REQUEST_DECLINED", Map.of(
                "requestId", request.id,
                "reference", request.reference,
                "equipmentId", eq.id,
                "equipmentName", eq.name));
        return request;
    }
}
