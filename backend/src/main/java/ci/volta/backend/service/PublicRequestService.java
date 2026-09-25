package ci.volta.backend.service;

import ci.volta.backend.domain.RequestWorkflow;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.PublicRequest;
import ci.volta.backend.model.RequestAttachment;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.PublicRequestRepository;
import ci.volta.backend.repository.RequestAttachmentRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.security.CurrentUser;
import ci.volta.backend.security.TrackingTokens;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
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
                                        String updatedAt,
                                        /** Le suivi d'une candidature s'écrit avec les mots du recrutement. */
                                        String intent,
                                        /** Rendez-vous fixé par VOLTA : c'est ce que le candidat vient lire. */
                                        String meetingAt, String meetingNote,
                                        /** Orientation décidée après les rencontres. */
                                        String orientation) {
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
                            String createdUserId, String createdAt, String updatedAt,
                            String meetingAt, String meetingNote, String orientation) {
        static AdminView of(PublicRequest r) {
            return new AdminView(r.id, r.reference, r.kind, r.intent, r.subject,
                    new ContactInput(r.contactName, r.contactCompany, r.contactPhone, r.contactEmail, r.contactCity),
                    r.location, r.status, r.priority, r.ownerId, r.payload, r.notes,
                    r.createdUserId, r.createdAt, r.updatedAt, r.meetingAt, r.meetingNote, r.orientation);
        }
    }

    /** Orientations possibles à l'issue des rencontres. */
    public static final String ORIENTATION_TECHNICIAN = "TECHNICIAN";
    public static final String ORIENTATION_STAGE_CONSULTANT = "STAGE_CONSULTANT";
    public static final String ORIENTATION_EXTERNAL_CONSULTANT = "EXTERNAL_CONSULTANT";

    private static final Set<String> ORIENTATIONS = Set.of(
            ORIENTATION_TECHNICIAN, ORIENTATION_STAGE_CONSULTANT, ORIENTATION_EXTERNAL_CONSULTANT);

    /**
     * Une orientation absente vaut « technicien ».
     *
     * Les candidatures déposées avant ce tri n'en portent pas, et les priver du
     * compte qu'elles attendaient serait leur retirer un droit acquis.
     */
    private static boolean opensTechnicalAccount(String orientation) {
        return blank(orientation) || ORIENTATION_TECHNICIAN.equals(orientation);
    }

    /**
     * Le responsable académie oriente le candidat après les rencontres.
     *
     * C'est la décision qui clôt le recrutement : équipe technique, stage, ou
     * réseau de consultants externes. Elle conditionne l'ouverture du compte
     * technicien à la validation, et s'enregistre dans l'historique du dossier.
     */
    public AdminView setOrientation(String requestId, String orientation, String note) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        PublicRequest r = load(requestId);

        String target = orientation == null || orientation.isBlank()
                ? null
                : orientation.trim().toUpperCase();
        if (target != null && !ORIENTATIONS.contains(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Orientation inconnue : " + target);
        }

        r.orientation = target;
        if (!blank(note)) {
            r.notes = (blank(r.notes) ? "" : r.notes + "\n")
                    + "[" + today() + " · ORIENTATION] " + note.trim();
        }
        r.updatedAt = Instant.now().toString();
        r = requests.save(r);
        audit.record("REQUEST_ORIENTATION", "REQUEST", r.id, r.reference,
                target == null ? "orientation effacée" : target);
        return AdminView.of(r);
    }

    /**
     * VOLTA retient le dossier.
     *
     * Le parcours impose une étape à la fois, et c'est ce qui garantit qu'un
     * dossier ne saute pas une vérification. Mais lire une demande et décider
     * qu'elle est bonne est un seul geste : l'imposer en trois clics fait
     * traiter moins de dossiers, pas mieux. Cette méthode enchaîne les mêmes
     * transitions, une par une et dans le même ordre, jusqu'à l'étape où le
     * dossier est retenu — le contrôle de workflow reste celui de `advance`.
     *
     * Un dossier déjà plus avancé n'est pas ramené en arrière.
     */
    public AdvanceResult select(String requestId, String note) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        PublicRequest r = load(requestId);

        int target = RequestWorkflow.FLOW.indexOf(RequestWorkflow.SEARCHING);
        int current = RequestWorkflow.FLOW.indexOf(r.status);
        if (current >= target) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ce dossier est déjà retenu ou plus avancé (" + r.status + ")");
        }

        AdvanceResult result = null;
        for (int step = current + 1; step <= target; step += 1) {
            // La note n'accompagne que le dernier pas : répétée à chaque
            // étape, elle remplirait l'historique de la même phrase.
            result = advance(requestId, RequestWorkflow.FLOW.get(step), step == target ? note : null);
        }
        return result;
    }

    /**
     * VOLTA fixe la rencontre.
     *
     * Une date vide efface le rendez-vous : une rencontre annulée doit pouvoir
     * disparaître du suivi, sinon le candidat se présente.
     */
    public AdminView scheduleMeeting(String requestId, String meetingAt, String meetingNote) {
        PublicRequest r = requests.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Demande introuvable : " + requestId));
        r.meetingAt = meetingAt == null || meetingAt.isBlank() ? null : meetingAt.trim();
        r.meetingNote = meetingNote == null || meetingNote.isBlank() ? null : meetingNote.trim();
        r.updatedAt = today();
        r = requests.save(r);

        if (r.meetingAt != null) {
            notify("ADMIN", "Rencontre fixée au " + r.meetingAt + " pour " + r.reference);
        }
        return AdminView.of(r);
    }

    /** Fiche complète d'une demande, pour l'administration : la demande et ses pièces jointes. */
    public record RequestDetail(AdminView request, List<AttachmentMeta> attachments) {
    }

    public record DownloadedFile(byte[] bytes, String contentType, String originalName) {
    }

    /**
     * Identifiants d'un compte que la validation vient de créer.
     *
     * Le mot de passe n'est jamais conservé ailleurs que dans son empreinte :
     * cette fiche est la seule occasion où il apparaît en clair, pour que
     * l'administration le transmette au candidat par un canal distinct.
     */
    public record ProvisionedAccount(String email, String temporaryPassword, String role) {
    }

    /** Résultat d'un changement de statut : la demande, et le compte créé s'il y en a un. */
    public record AdvanceResult(AdminView request, ProvisionedAccount account) {
    }

    /** Seule cette intention ouvre un accès : les autres parcours demandent un service, pas un compte. */
    private static final String INTENT_JOIN_TECHNICAL_TEAM = "JOIN_TECHNICAL_TEAM";

    private final PublicRequestRepository requests;
    private final RequestAttachmentRepository attachments;
    private final NotificationRepository notifications;
    private final UserRepository users;
    private final ReferenceService references;
    private final AuditService audit;
    private final AuthService authService;
    private final CurrentUser currentUser;
    private final SecureRandom random = new SecureRandom();

    public PublicRequestService(PublicRequestRepository requests, RequestAttachmentRepository attachments,
                                NotificationRepository notifications, UserRepository users,
                                ReferenceService references, AuditService audit, AuthService authService,
                                CurrentUser currentUser) {
        this.requests = requests;
        this.attachments = attachments;
        this.notifications = notifications;
        this.users = users;
        this.references = references;
        this.audit = audit;
        this.authService = authService;
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
                r.createdAt, r.updatedAt, r.intent, r.meetingAt, r.meetingNote, r.orientation);
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

    public AdvanceResult advance(String id, String status, String notes) {
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

        // Le compte d'équipe technique ne s'ouvre qu'aux candidats orientés
        // vers ce métier. Un consultant, en stage ou externe, est validé sans
        // recevoir un accès de technicien : jusqu'ici tout candidat validé en
        // devenait un, quelle que soit la décision prise en entretien.
        ProvisionedAccount account = null;
        if (RequestWorkflow.VALIDATED.equals(target) && INTENT_JOIN_TECHNICAL_TEAM.equals(r.intent)
                && blank(r.createdUserId) && opensTechnicalAccount(r.orientation)) {
            account = provisionTechnicalAccount(r);
        }

        r.updatedAt = Instant.now().toString();
        r = requests.save(r);
        audit.record("REQUEST_" + target, "REQUEST", r.id, r.reference, previous + " vers " + target);
        return new AdvanceResult(AdminView.of(r), account);
    }

    /**
     * Ouvre un accès au candidat dont la candidature technique vient d'être
     * validée : sans lui, l'équipe technique nouvellement recrutée ne peut ni
     * se connecter, ni recevoir de mission.
     *
     * Un email déjà inscrit garde son compte existant — la validation ne le
     * remplace pas, elle se contente de lier le dossier au compte qui existe
     * déjà, pour que l'idempotence ne dépende pas de deviner s'il l'a créé lui.
     */
    private ProvisionedAccount provisionTechnicalAccount(PublicRequest r) {
        var existing = users.findByEmailIgnoreCase(r.contactEmail);
        if (existing.isPresent()) {
            r.createdUserId = existing.get().id;
            r.notes = (blank(r.notes) ? "" : r.notes + "\n")
                    + "[" + today() + "] Compte existant réutilisé (" + r.contactEmail + ").";
            return null;
        }

        String rawPassword = generateTemporaryPassword();
        UserAccount account = new UserAccount();
        account.id = shortId("u");
        account.name = r.contactName;
        account.role = CurrentUser.ROLE_TECHNICAL;
        account.company = blank(r.contactCompany) ? r.payload.getOrDefault("specialty", "") : r.contactCompany;
        account.email = r.contactEmail;
        account.phone = r.contactPhone;
        account.city = blank(r.contactCity) ? r.location : r.contactCity;
        account.passwordHash = authService.encodePassword(rawPassword);
        account = users.save(account);

        r.createdUserId = account.id;
        r.notes = (blank(r.notes) ? "" : r.notes + "\n")
                + "[" + today() + "] Compte équipe technique créé (" + account.email + ").";
        audit.record("REQUEST_ACCOUNT_CREATED", "REQUEST", r.id, r.reference, "Compte " + account.id + " créé");

        return new ProvisionedAccount(account.email, rawPassword, account.role);
    }

    /** Alphabet sans I, O, 0 ni 1 : un mot de passe temporaire se recopie aussi à la main. */
    private String generateTemporaryPassword() {
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return sb.toString();
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
