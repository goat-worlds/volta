package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/**
 * Trace d'une opération sensible : qui a fait quoi, sur quel objet, quand.
 *
 * Journal en écriture seule : rien ne le modifie ni ne le supprime depuis
 * l'application.
 */
@Entity
@Table(name = "audit_events", indexes = {
        @Index(name = "idx_audit_entity", columnList = "entityType, entityId"),
        @Index(name = "idx_audit_at", columnList = "at")
})
public class AuditEvent {
    @Id
    public String id;
    /** Horodatage ISO-8601 (UTC). */
    public String at;
    public String actorId;
    public String actorName;
    public String actorRole;
    /** Action métier en majuscules, ex. EQUIPMENT_PUBLISHED. */
    public String action;
    public String entityType;
    public String entityId;
    public String entityReference;
    @Column(columnDefinition = "TEXT")
    public String details;
}
