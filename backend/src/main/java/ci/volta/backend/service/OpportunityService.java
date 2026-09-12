package ci.volta.backend.service;

import ci.volta.backend.domain.OpportunityWorkflow;
import ci.volta.backend.model.Opportunity;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.OpportunityRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Pipeline commercial (voir OpportunityWorkflow).
 *
 * Réservé au rôle ADMIN, qui tient aujourd'hui le rôle de management
 * commercial : le projet ne définit pas de rôle VENDEUR distinct. Le champ
 * ownerId désigne le membre de l'équipe qui suit l'opportunité.
 */
@Service
@Transactional
public class OpportunityService {

    public record OpportunityInput(String title, String clientId, String prospectName,
                                   String prospectCompany, String prospectContact,
                                   String ownerId, String linkedType, String linkedId,
                                   Long amount, String notes) {
    }

    public record StageInput(String stage, String notes) {
    }

    private final OpportunityRepository opportunities;
    private final UserRepository users;
    private final ReferenceService references;
    private final AuditService audit;
    private final CurrentUser currentUser;

    public OpportunityService(OpportunityRepository opportunities, UserRepository users,
                              ReferenceService references, AuditService audit, CurrentUser currentUser) {
        this.opportunities = opportunities;
        this.users = users;
        this.references = references;
        this.audit = audit;
        this.currentUser = currentUser;
    }

    private static String today() {
        return LocalDate.now().toString();
    }

    @Transactional(readOnly = true)
    public List<Opportunity> list() {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        return opportunities.findAll();
    }

    public Opportunity create(OpportunityInput in) {
        UserAccount me = currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        if (in.title() == null || in.title().trim().length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'intitulé est requis (3 caractères minimum)");
        }
        boolean hasClient = in.clientId() != null && !in.clientId().isBlank();
        boolean hasProspect = in.prospectName() != null && !in.prospectName().isBlank();
        if (!hasClient && !hasProspect) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Rattachez l'opportunité à un client existant ou nommez le prospect");
        }
        if (hasClient && users.findById(in.clientId()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Client introuvable : " + in.clientId());
        }
        if (in.amount() != null && in.amount() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le montant ne peut pas être négatif");
        }
        OpportunityWorkflow.checkLinkType(in.linkedType());

        String ownerId = in.ownerId() == null || in.ownerId().isBlank() ? me.id : in.ownerId();
        UserAccount owner = users.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Responsable introuvable"));
        if (!CurrentUser.ROLE_ADMIN.equalsIgnoreCase(owner.role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le responsable d'une opportunité doit appartenir à l'équipe VOLTA");
        }

        Opportunity o = new Opportunity();
        o.id = "opp-" + UUID.randomUUID().toString().substring(0, 8);
        o.reference = references.next(ReferenceService.OPPORTUNITY);
        o.title = in.title().trim();
        o.stage = OpportunityWorkflow.NEW;
        o.clientId = hasClient ? in.clientId() : null;
        o.prospectName = hasProspect ? in.prospectName().trim() : null;
        o.prospectCompany = in.prospectCompany() == null ? null : in.prospectCompany().trim();
        o.prospectContact = in.prospectContact() == null ? null : in.prospectContact().trim();
        o.ownerId = owner.id;
        o.linkedType = in.linkedType() == null || in.linkedType().isBlank() ? null : in.linkedType().trim().toUpperCase();
        o.linkedId = in.linkedId() == null || in.linkedId().isBlank() ? null : in.linkedId().trim();
        o.amount = in.amount();
        o.notes = in.notes() == null ? "" : in.notes().trim();
        o.createdAt = today();
        o.updatedAt = today();
        o = opportunities.save(o);
        audit.record("OPPORTUNITY_CREATED", "OPPORTUNITY", o.id, o.reference, o.title);
        return o;
    }

    public Opportunity update(String id, OpportunityInput in) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        Opportunity o = load(id);
        if (OpportunityWorkflow.isClosed(o.stage)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Une opportunité close ne se modifie plus");
        }
        if (in.title() != null && !in.title().isBlank()) o.title = in.title().trim();
        if (in.prospectName() != null) o.prospectName = in.prospectName().trim();
        if (in.prospectCompany() != null) o.prospectCompany = in.prospectCompany().trim();
        if (in.prospectContact() != null) o.prospectContact = in.prospectContact().trim();
        if (in.notes() != null) o.notes = in.notes().trim();
        if (in.amount() != null) {
            if (in.amount() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le montant ne peut pas être négatif");
            }
            o.amount = in.amount();
        }
        if (in.ownerId() != null && !in.ownerId().isBlank()) {
            UserAccount owner = users.findById(in.ownerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Responsable introuvable"));
            if (!CurrentUser.ROLE_ADMIN.equalsIgnoreCase(owner.role)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Le responsable d'une opportunité doit appartenir à l'équipe VOLTA");
            }
            o.ownerId = owner.id;
        }
        if (in.linkedType() != null) {
            OpportunityWorkflow.checkLinkType(in.linkedType());
            o.linkedType = in.linkedType().isBlank() ? null : in.linkedType().trim().toUpperCase();
            o.linkedId = in.linkedId() == null || in.linkedId().isBlank() ? null : in.linkedId().trim();
        }
        o.updatedAt = today();
        o = opportunities.save(o);
        audit.record("OPPORTUNITY_UPDATED", "OPPORTUNITY", o.id, o.reference, o.title);
        return o;
    }

    public Opportunity moveStage(String id, StageInput in) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        if (in.stage() == null || in.stage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'étape cible est requise");
        }
        String target = in.stage().trim().toUpperCase();
        Opportunity o = load(id);
        OpportunityWorkflow.checkTransition(o.stage, target);
        if (OpportunityWorkflow.LOST.equals(target) && (in.notes() == null || in.notes().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indiquez le motif de la perte");
        }
        String previous = o.stage;
        o.stage = target;
        if (in.notes() != null && !in.notes().isBlank()) {
            o.notes = (o.notes == null || o.notes.isBlank() ? "" : o.notes + "\n")
                    + "[" + today() + " · " + target + "] " + in.notes().trim();
        }
        o.updatedAt = today();
        if (OpportunityWorkflow.isClosed(target)) {
            o.closedAt = today();
        }
        o = opportunities.save(o);
        audit.record("OPPORTUNITY_" + target, "OPPORTUNITY", o.id, o.reference, previous + " vers " + target);
        return o;
    }

    private Opportunity load(String id) {
        return opportunities.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunité introuvable : " + id));
    }
}
