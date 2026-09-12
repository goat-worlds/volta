package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Anomalie relevée lors d'une vérification technique.
 *
 * Objet à part entière, et non une simple chaîne dans l'inspection : elle a un
 * responsable, une gravité, une action corrective et un cycle de vie propre
 * (voir AnomalyWorkflow).
 */
@Entity
@Table(name = "anomalies")
public class Anomaly {
    @Id
    public String id;
    public String reference;
    public String inspectionId;
    public String equipmentId;
    /** Section / contrôle d'origine dans la checklist, si applicable. */
    public String origin;
    @Column(columnDefinition = "TEXT")
    public String description;
    /** MINEURE, MAJEURE ou CRITIQUE. */
    public String severity;
    public String status;
    /** Technicien qui a relevé l'anomalie. */
    public String reportedBy;
    /** Fournisseur chargé de la corriger. */
    public String assignedTo;
    @Column(columnDefinition = "TEXT")
    public String correctiveAction;
    @Column(columnDefinition = "TEXT")
    public String reviewNote;
    public String createdAt;
    public String updatedAt;
    public String resolvedAt;
}
