package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Opportunité du pipeline commercial (voir OpportunityWorkflow).
 *
 * Elle est rattachée soit à un compte existant (clientId), soit à un prospect
 * décrit par ses coordonnées. Le montant est saisi par l'équipe commerciale :
 * c'est une estimation déclarée, jamais un chiffre calculé.
 */
@Entity
@Table(name = "opportunities")
public class Opportunity {
    @Id
    public String id;
    public String reference;
    public String title;
    public String stage;
    /** Compte client existant, ou null pour un prospect. */
    public String clientId;
    public String prospectName;
    public String prospectCompany;
    public String prospectContact;
    /** Membre de l'équipe VOLTA en charge (vendeur). */
    public String ownerId;
    /** EQUIPMENT, RENTAL_REQUEST, QUOTE_REQUEST, QUOTE, SERVICE ou OTHER. */
    public String linkedType;
    public String linkedId;
    /** Montant estimé en FCFA, ou null si inconnu. */
    public Long amount;
    @Column(columnDefinition = "TEXT")
    public String notes;
    public String createdAt;
    public String updatedAt;
    public String closedAt;
}
