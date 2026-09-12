package ci.volta.backend.service;

import ci.volta.backend.domain.AnomalyWorkflow;
import ci.volta.backend.model.Anomaly;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.repository.AnomalyRepository;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Anomalies relevées en vérification (voir AnomalyWorkflow).
 *
 *   - le technicien chargé de l'inspection les ouvre pendant qu'elle est en
 *     cours ;
 *   - le fournisseur propriétaire déclare son action corrective (IN_PROGRESS,
 *     puis SUBMITTED) ;
 *   - l'administration examine, valide et clôture.
 *
 * Une anomalie encore ouverte pèse sur la qualification (QualificationRules).
 */
@Service
@Transactional
public class AnomalyService {

    public record AnomalyInput(String inspectionId, String origin, String description, String severity) {
    }

    public record TransitionInput(String status, String correctiveAction, String reviewNote) {
    }

    private final AnomalyRepository anomalies;
    private final InspectionRepository inspections;
    private final EquipmentRepository equipments;
    private final NotificationRepository notifications;
    private final ReferenceService references;
    private final AuditService audit;
    private final CurrentUser currentUser;

    public AnomalyService(AnomalyRepository anomalies, InspectionRepository inspections,
                          EquipmentRepository equipments, NotificationRepository notifications,
                          ReferenceService references, AuditService audit, CurrentUser currentUser) {
        this.anomalies = anomalies;
        this.inspections = inspections;
        this.equipments = equipments;
        this.notifications = notifications;
        this.references = references;
        this.audit = audit;
        this.currentUser = currentUser;
    }

    private static String today() {
        return LocalDate.now().toString();
    }

    private void notify(String role, String message) {
        notifications.save(new Notification("n-" + UUID.randomUUID().toString().substring(0, 8),
                role, message, today(), false));
    }

    private Anomaly load(String id) {
        return anomalies.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anomalie introuvable : " + id));
    }

    @Transactional(readOnly = true)
    public List<Anomaly> listVisible() {
        String role = currentUser.role();
        String me = currentUser.requireId();
        if (CurrentUser.ROLE_ADMIN.equals(role)) {
            return anomalies.findAll();
        }
        if (CurrentUser.ROLE_TECHNICAL.equals(role)) {
            return anomalies.findByReportedBy(me);
        }
        if (CurrentUser.ROLE_SUPPLIER.equals(role)) {
            return anomalies.findByAssignedTo(me);
        }
        return List.of();
    }

    public Anomaly open(AnomalyInput input) {
        if (input.inspectionId() == null || input.inspectionId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'inspection est requise");
        }
        if (input.description() == null || input.description().trim().length() < 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Décrivez l'anomalie (5 caractères minimum)");
        }
        AnomalyWorkflow.checkSeverity(input.severity());

        Inspection inspection = inspections.findById(input.inspectionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inspection introuvable"));
        currentUser.requireOwnership(inspection.technicalTeamId, "cette inspection");
        if (!"IN_PROGRESS".equals(inspection.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une anomalie ne peut être relevée que pendant une inspection en cours");
        }
        Equipment eq = equipments.findById(inspection.equipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));

        Anomaly a = new Anomaly();
        a.id = "ano-" + UUID.randomUUID().toString().substring(0, 8);
        a.reference = references.next(ReferenceService.ANOMALY);
        a.inspectionId = inspection.id;
        a.equipmentId = eq.id;
        a.origin = input.origin() == null ? "" : input.origin().trim();
        a.description = input.description().trim();
        a.severity = input.severity().trim().toUpperCase();
        a.status = AnomalyWorkflow.OPEN;
        a.reportedBy = currentUser.requireId();
        a.assignedTo = eq.supplierId;
        a.createdAt = today();
        a.updatedAt = today();
        a = anomalies.save(a);

        List<String> mirrored = inspection.anomalies == null
                ? new java.util.ArrayList<>() : new java.util.ArrayList<>(inspection.anomalies);
        mirrored.add(a.reference + " · " + a.severity + " · " + a.description);
        inspection.anomalies = mirrored;
        inspections.save(inspection);

        notify("SUPPLIER", "Anomalie " + a.severity.toLowerCase() + " relevée sur " + eq.name + " (" + a.reference + ")");
        audit.record("ANOMALY_OPENED", "ANOMALY", a.id, a.reference,
                eq.name + " — " + a.severity + " — " + a.description);
        return a;
    }

    public Anomaly transition(String anomalyId, TransitionInput input) {
        if (input.status() == null || input.status().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le statut cible est requis");
        }
        String target = input.status().trim().toUpperCase();
        Anomaly a = load(anomalyId);

        if (currentUser.isAdmin()) {
            // L'administration peut effectuer toute transition autorisée.
        } else if (currentUser.isSupplier() && currentUser.owns(a.assignedTo)
                && AnomalyWorkflow.SUPPLIER_TARGETS.contains(target)) {
            if (AnomalyWorkflow.SUBMITTED.equals(target)
                    && (input.correctiveAction() == null || input.correctiveAction().trim().length() < 5)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Décrivez l'action corrective réalisée avant de soumettre");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous ne pouvez pas effectuer cette transition sur cette anomalie");
        }

        AnomalyWorkflow.checkTransition(a.status, target);
        if (input.correctiveAction() != null && !input.correctiveAction().isBlank()) {
            a.correctiveAction = input.correctiveAction().trim();
        }
        if (input.reviewNote() != null && !input.reviewNote().isBlank()) {
            a.reviewNote = input.reviewNote().trim();
        }
        String previous = a.status;
        a.status = target;
        a.updatedAt = today();
        if (AnomalyWorkflow.RESOLVED.equals(target)) {
            a.resolvedAt = today();
        }
        a = anomalies.save(a);

        if (AnomalyWorkflow.SUBMITTED.equals(target)) {
            notify("ADMIN", "Action corrective soumise pour l'anomalie " + a.reference);
        } else if (AnomalyWorkflow.RESOLVED.equals(target) || AnomalyWorkflow.CLOSED.equals(target)) {
            notify("SUPPLIER", "Anomalie " + a.reference + " " + (AnomalyWorkflow.RESOLVED.equals(target) ? "résolue" : "clôturée"));
        } else if (AnomalyWorkflow.IN_PROGRESS.equals(target) && AnomalyWorkflow.UNDER_REVIEW.equals(previous)) {
            notify("SUPPLIER", "Anomalie " + a.reference + " renvoyée en traitement");
        }
        audit.record("ANOMALY_" + target, "ANOMALY", a.id, a.reference, previous + " vers " + target);
        return a;
    }
}
