package ci.volta.backend.service;

import ci.volta.backend.model.AuditEvent;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.AuditEventRepository;
import ci.volta.backend.security.CurrentUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Journal d'audit des opérations sensibles.
 *
 * Écrit dans la transaction de l'opération : si celle-ci échoue, la trace
 * disparaît avec elle et le journal ne raconte jamais une action qui n'a pas eu
 * lieu. L'acteur est lu dans le contexte de sécurité, jamais reçu du client.
 */
@Service
@Transactional
public class AuditService {

    private final AuditEventRepository repository;
    private final CurrentUser currentUser;

    public AuditService(AuditEventRepository repository, CurrentUser currentUser) {
        this.repository = repository;
        this.currentUser = currentUser;
    }

    public AuditEvent record(String action, String entityType, String entityId,
                             String entityReference, String details) {
        AuditEvent event = new AuditEvent();
        event.id = "audit-" + UUID.randomUUID();
        event.at = Instant.now().toString();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserAccount user) {
            event.actorId = user.id;
            event.actorName = user.name;
            event.actorRole = user.role;
        } else {
            event.actorId = "";
            event.actorName = "Système";
            event.actorRole = "SYSTEM";
        }
        event.action = action;
        event.entityType = entityType;
        event.entityId = entityId;
        event.entityReference = entityReference == null ? "" : entityReference;
        event.details = details == null ? "" : details;
        return repository.save(event);
    }

    /** Journal complet (500 dernières entrées), réservé à l'administration. */
    @Transactional(readOnly = true)
    public List<AuditEvent> listRecent() {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        return repository.findTop500ByOrderByAtDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> listForEntity(String entityType, String entityId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        return repository.findByEntityTypeAndEntityIdOrderByAtDesc(entityType, entityId);
    }
}
