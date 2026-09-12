package ci.volta.backend.service;

import ci.volta.backend.domain.RentalWorkflow;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

/**
 * Traitement des réservations par VOLTA (voir RentalWorkflow).
 *
 * Deux acteurs, deux périmètres :
 *   - le fournisseur propriétaire de l'engin accepte ou refuse ;
 *   - l'administration qualifie, confirme la mise en relation, démarre, clôture
 *     ou annule.
 *
 * Chaque transition est vérifiée côté serveur et journalisée.
 */
@Service
@Transactional
public class ReservationService {

    private final RentalRequestRepository rentals;
    private final EquipmentRepository equipments;
    private final NotificationRepository notifications;
    private final WebhookService webhooks;
    private final AuditService audit;
    private final CurrentUser currentUser;

    public ReservationService(RentalRequestRepository rentals, EquipmentRepository equipments,
                              NotificationRepository notifications, WebhookService webhooks,
                              AuditService audit, CurrentUser currentUser) {
        this.rentals = rentals;
        this.equipments = equipments;
        this.notifications = notifications;
        this.webhooks = webhooks;
        this.audit = audit;
        this.currentUser = currentUser;
    }

    private static String today() {
        return LocalDate.now().toString();
    }

    private RentalRequest load(String id) {
        return rentals.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable : " + id));
    }

    private Equipment equipmentOf(RentalRequest r) {
        return equipments.findById(r.equipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found: " + r.equipmentId));
    }

    private void notify(String role, String message) {
        notifications.save(new Notification("n-" + UUID.randomUUID().toString().substring(0, 8),
                role, message, today(), false));
    }

    private RentalRequest move(RentalRequest r, String target, String action, String details) {
        RentalWorkflow.checkTransition(r.status, target);
        r.status = target;
        r.updatedAt = today();
        r = rentals.save(r);
        Equipment eq = equipmentOf(r);
        audit.record(action, "RENTAL_REQUEST", r.id, r.reference,
                eq.name + (details == null || details.isBlank() ? "" : " — " + details));
        webhooks.dispatch("RENTAL_" + target, Map.of(
                "requestId", r.id,
                "reference", r.reference == null ? "" : r.reference,
                "equipmentId", eq.id,
                "equipmentName", eq.name));
        return r;
    }

    /** Le fournisseur propriétaire se prononce. */
    public RentalRequest respond(String requestId, boolean accepted) {
        RentalRequest r = load(requestId);
        currentUser.requireOwnership(r.supplierId, "cette réservation");
        if (!RentalWorkflow.AWAITING_SUPPLIER.contains(r.status == null ? RentalWorkflow.PENDING : r.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette réservation n'attend plus la réponse du fournisseur (statut : " + r.status + ")");
        }
        RentalRequest saved = move(r, accepted ? RentalWorkflow.ACCEPTED : RentalWorkflow.DECLINED,
                accepted ? "RENTAL_ACCEPTED_BY_SUPPLIER" : "RENTAL_DECLINED_BY_SUPPLIER", null);
        notify("ADMIN", (accepted ? "Fournisseur d'accord pour " : "Fournisseur indisponible pour ")
                + saved.reference + " — " + (accepted ? "à confirmer" : "réservation refusée"));
        return saved;
    }

    /** L'administration qualifie la demande (disponibilité, conditions). */
    public RentalRequest qualify(String requestId, String note) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        RentalRequest r = load(requestId);
        r.adminNote = note == null ? r.adminNote : note.trim();
        RentalRequest saved = move(r, RentalWorkflow.QUALIFIED, "RENTAL_QUALIFIED", note);
        notify("SUPPLIER", "Réservation " + saved.reference + " qualifiée par VOLTA — votre réponse est attendue");
        return saved;
    }

    /** Mise en relation confirmée par VOLTA après l'accord du fournisseur. */
    public RentalRequest confirm(String requestId, String note) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        RentalRequest r = load(requestId);
        if (note != null && !note.isBlank()) r.adminNote = note.trim();
        RentalRequest saved = move(r, RentalWorkflow.CONFIRMED, "RENTAL_CONFIRMED", note);
        notify("SUPPLIER", "Réservation " + saved.reference + " confirmée — mise en relation avec le client");
        notify("CLIENT", "Votre réservation " + saved.reference + " est confirmée");
        return saved;
    }

    public RentalRequest start(String requestId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        return move(load(requestId), RentalWorkflow.IN_PROGRESS, "RENTAL_STARTED", null);
    }

    public RentalRequest complete(String requestId, String note) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        RentalRequest r = load(requestId);
        if (note != null && !note.isBlank()) r.adminNote = note.trim();
        return move(r, RentalWorkflow.COMPLETED, "RENTAL_COMPLETED", note);
    }

    public RentalRequest cancel(String requestId, String reason) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le motif d'annulation est requis");
        }
        RentalRequest r = load(requestId);
        r.adminNote = reason.trim();
        RentalRequest saved = move(r, RentalWorkflow.CANCELLED, "RENTAL_CANCELLED", reason);
        notify("SUPPLIER", "Réservation " + saved.reference + " annulée par VOLTA");
        notify("CLIENT", "Votre réservation " + saved.reference + " a été annulée");
        return saved;
    }
}
