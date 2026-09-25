package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Demande d'offre d'achat sur une annonce Volta Market (voir MarketWorkflow).
 *
 * Elle peut être déposée sans compte : l'acheteur laisse ses coordonnées et
 * reçoit une référence qui lui permet de suivre l'avancement. Un client
 * connecté est rattaché par clientId en plus. Le vendeur n'est jamais mis en
 * contact direct : c'est Génie Sélect qui qualifie, vérifie et fait l'offre.
 */
@Entity
@Table(name = "purchase_requests")
public class PurchaseRequest {
    @Id
    public String id;
    /** Référence métier, ex. VOL-ACH-2026-000001. */
    public String reference;
    public String listingId;
    public String sellerId;
    /** Compte client, ou null pour un visiteur. */
    public String clientId;
    public String contactName;
    public String contactCompany;
    public String contactPhone;
    public String contactEmail;
    public String contactCity;
    /**
     * Où l'engin doit être livré, et où il servira ensuite.
     *
     * Deux informations distinctes, et le vendeur a besoin des deux : livrer à
     * Abidjan un engin qui travaillera à Yamoussoukro n'engage ni le même
     * transport ni le même délai. Les confondre dans « ville » faisait accepter
     * des commandes qui ne pouvaient pas être honorées.
     */
    public String deliveryLocation;
    public String usageLocation;
    public int quantity;
    @Column(columnDefinition = "TEXT")
    public String message;
    /** Étape du circuit (MarketWorkflow.REQUEST_FLOW). */
    public String status;
    /** Montant de l'offre faite par Génie Sélect, une fois l'étape OFFER atteinte. */
    public Long offerAmount;
    @Column(columnDefinition = "TEXT")
    public String notes;
    public String createdAt;
    public String updatedAt;
}
