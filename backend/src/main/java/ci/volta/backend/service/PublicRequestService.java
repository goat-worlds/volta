package ci.volta.backend.service;

import ci.volta.backend.domain.RequestWorkflow;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.PublicRequest;
import ci.volta.backend.model.RequestAttachment;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.PublicRequestRepository;
import ci.volta.backend.repository.RequestAttachmentRepository;
import ci.volta.backend.security.CurrentUser;
import ci.volta.backend.security.TrackingTokens;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Demandes des parcours publics (CDC §5) : location, achat libre, technicien,
 * offre d'engin, catalogue, GOLD, accompagnement, candidature technique.
 *
 * Point d'entrée unique de tout formulaire déposé sans compte. Le déposant ne
 * revoit jamais son dossier que par sa référence et son secret de suivi ;
 * l'équipe VOLTA le voit, le qualifie et le fait avancer depuis la console
 * d'administration.
 */
@Service
@Transactional
public class PublicRequestService {

    /** Poids maximal d'une pièce jointe une fois décodée (le client borne déjà à 3 Mo). */
    private static final long MAX_ATTACHMENT_BYTES = 5L * 1024 * 1024;

    private static final Set<String> PRIORITIES = Set.of("URGENT", "HIGH", "NORMAL", "LOW");

    public record ContactInput(String name, String company, String phone, String email, String city) {
    }

    public record AttachmentInput(String field, String name, String type, long size, String contentBase64) {
    }

    public record CreateRequestInput(String kind, String intent, String subject, String location,
                                     ContactInput contact, String priority,
                                     Map<String, String> payload, List<AttachmentInput> attachments) {
    }

    /** Accusé de dépôt : ce que le déposant garde. Le secret de suivi n'apparaît qu'ici. */
    public record CreateRequestReceipt(String id, String reference, String trackingToken,
                                       String trackingCode, String status, String createdAt) {
    }

    /** Ce que le déposant retrouve avec sa référence et son secret : l'avancement, rien de plus. */
    public record PublicRequestTracking(String reference, String subject, String location,
                                        String status, String priority, String createdAt,
                                        String updatedAt) {
    }

    public record AttachmentMeta(String id, String fieldName, String originalName,
                                 String contentType, long size) {
        static AttachmentMeta of(RequestAttachment a) {
            return new AttachmentMeta(a.id, a.fieldName, a.originalName, a.contentType, a.size);
        }
    }

    /**
     * Vue d'une demande pour l'administration.
     *
     * L'entité range les coordonnées à plat (contactName, contactPhone…) parce
     * que c'est ce qu'une table sait faire ; cette vue les regroupe sous
     * {@code contact} pour parler le même langage que le formulaire qui les a
     * saisies (types/domain.ts, ContactInput) — un seul endroit doit changer si
     * demain la forme d'une coordonnée change.
     */
    public record AdminView(String id, String reference, String kind, String intent, String subject,
                            ContactInput contact, String location, String status, String priority,
                            String ownerId, Map<String, String> payload, String notes,
                            String createdAt, String updatedAt) {
        static AdminView of(PublicRequest r) {
            return new AdminView(r.id, r.reference, r.kind, r.intent, r.subject,
                    new ContactInput(r.contactName, r.contactCompany, r.contactPhone, r.contactEmail, r.contactCity),
                    r.location, r.status, r.priority, r.ownerId, r.payload, r.notes, r.createdAt, r.updatedAt);
        }
    }

    /** Fiche complète d'une demande, pour l'administration : la demande et ses pièces jointes. */
    public record RequestDetail(AdminView request, List<AttachmentMeta> attachments) {
    }

    public record DownloadedFile(byte[] bytes, String contentType, String originalName) {
    }

    private final PublicRequestRepository requests;
    private final RequestAttachmentRepository attachments;
    private final NotificationRepository notifications;
    private final ReferenceService references;
    private final AuditService audit;
    private final CurrentUser currentUser;

    public PublicRequestService(PublicRequestRepository requests, RequestAttachmentRepository attachments,
                                NotificationRepository notifications, ReferenceService references,
                                AuditService audit, CurrentUser currentUser) {
        this.requests = requests;
        this.attachments = attachments;
        this.notifications = notifications;
        this.references = references;
        this.audit = audit;
        this.currentUser = currentUser;
    }

    private static String today() {
        return LocalDate.now().toString();
    }

    private static String shortId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void notify(String role, String message) {
        notifications.save(new Notification(shortId("n"), role, message, today(), false));
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }

    // ------------------------------------------------------------------
    // Dépôt (public, sans compte)
    // ------------------------------------------------------------------

    public CreateRequestReceipt createRequest(CreateRequestInput in) {
        if (in == null || blank(in.kind()) || blank(in.intent()) || blank(in.subject())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Demande incomplète.");
        }
        ContactInput contact = in.contact();
        if (contact == null || blank(contact.name()) || blank(contact.phone()) || blank(contact.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nom, téléphone et email sont nécessaires pour vous répondre.");
        }
        String priority = blank(in.priority()) ? "NORMAL" : in.priority().trim().toUpperCase();
        if (!PRIORITIES.contains(priority)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Priorité invalide : " + in.priority());
        }

        PublicRequest r = new PublicRequest();
        r.id = shortId("req");
        r.reference = references.next(ReferenceService.REQUEST);
        r.trackingToken = TrackingTokens.generate();
        r.kind = in.kind().trim().toUpperCase();
        r.intent = in.intent().trim().toUpperCase();
        r.subject = in.subject().trim();
        r.location = in.location() == null ? "" : in.location().trim();
        r.contactName = contact.name().trim();
        r.contactCompany = contact.company() == null ? "" : contact.company().trim();
        r.contactPhone = contact.phone().trim();
        r.contactEmail = contact.email().trim();
        r.contactCity = contact.city() == null ? "" : contact.city().trim();
        r.status = RequestWorkflow.RECEIVED;
        r.priority = priority;
        r.payload = in.payload() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(in.payload());
        String now = Instant.now().toString();
        r.createdAt = now;
        r.updatedAt = now;
        r = requests.save(r);

        storeAttachments(r.id, in.attachments());

        notify(CurrentUser.ROLE_ADMIN, "Nouvelle demande : " + r.subject + " (" + r.reference + ")");
        audit.record("REQUEST_RECEIVED", "REQUEST", r.id, r.reference, r.subject);

        return new CreateRequestReceipt(r.id, r.reference, r.trackingToken,
                TrackingTokens.trackingCode(r.reference, r.trackingToken), r.status, r.createdAt);
    }

    private void storeAttachments(String requestId, List<AttachmentInput> inputs) {
        if (inputs == null) {
            return;
        }
        for (AttachmentInput in : inputs) {
            if (in == null || blank(in.field()) || blank(in.name()) || blank(in.contentBase64())) {
                continue;
            }
            byte[] decoded;
            try {
                decoded = Base64.getDecoder().decode(in.contentBase64());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Pièce jointe illisible : " + in.name());
            }
            if (decoded.length == 0) {
                continue;
            }
            if (decoded.length > MAX_ATTACHMENT_BYTES) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Pièce jointe trop volumineuse : " + in.name());
            }
            RequestAttachment a = new RequestAttachment();
            a.id = shortId("att");
            a.requestId = requestId;
            a.fieldName = in.field().trim();
            a.originalName = in.name().trim();
            a.contentType = in.type() == null ? "application/octet-stream" : in.type().trim();
            a.size = decoded.length;
            a.contentBase64 = in.contentBase64();
            attachments.save(a);
        }
    }

    // ------------------------------------------------------------------
    // Suivi public
    // ------------------------------------------------------------------

    /**
     * Suivi par référence et secret : un secret faux répond comme une
     * référence inconnue, pour ne pas confirmer qu'une demande existe à
     * quiconque la devine.
     */
    @Transactional(readOnly = true)
    public PublicRequestTracking track(String reference, String token) {
        if (reference == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucune demande à cette référence.");
        }
        PublicRequest r = requests.findByReference(reference.trim().toUpperCase())
                .filter(found -> TrackingTokens.matches(found.trackingToken, token))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Aucune demande à cette référence."));
        return new PublicRequestTracking(r.reference, r.subject, r.location, r.status, r.priority,
                r.createdAt, r.updatedAt);
    }

    // ------------------------------------------------------------------
    // Administration
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<AdminView> listAll() {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        return requests.findAllByOrderByCreatedAtDesc().stream().map(AdminView::of).toList();
    }

    @Transactional(readOnly = true)
    public RequestDetail get(String id) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        PublicRequest r = load(id);
        List<AttachmentMeta> metas = attachments.findByRequestId(id).stream()
                .map(AttachmentMeta::of).toList();
        return new RequestDetail(AdminView.of(r), metas);
    }

    public AdminView advance(String id, String status, String notes) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        PublicRequest r = load(id);
        String target = status == null ? null : status.trim().toUpperCase();
        RequestWorkflow.checkTransition(r.status, target);

        String previous = r.status;
        r.status = target;
        if (!blank(notes)) {
            r.notes = (blank(r.notes) ? "" : r.notes + "\n")
                    + "[" + today() + " · " + target + "] " + notes.trim();
        }
        r.updatedAt = Instant.now().toString();
        r = requests.save(r);
        audit.record("REQUEST_" + target, "REQUEST", r.id, r.reference, previous + " vers " + target);
        return AdminView.of(r);
    }

    @Transactional(readOnly = true)
    public DownloadedFile downloadAttachment(String requestId, String attachmentId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        RequestAttachment a = attachments.findById(attachmentId)
                .filter(found -> requestId.equals(found.requestId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Pièce jointe introuvable."));
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(a.contentBase64);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Pièce jointe corrompue.");
        }
        return new DownloadedFile(bytes, a.contentType, a.originalName);
    }

    private PublicRequest load(String id) {
        return requests.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Demande introuvable : " + id));
    }
}
