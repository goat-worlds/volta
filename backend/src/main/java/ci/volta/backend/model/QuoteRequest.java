package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "quote_requests")
public class QuoteRequest {
    @Id
    public String id;
    public String equipmentId;
    public String clientId;
    public String supplierId;
    public String status; // PENDING, ACCEPTED, DECLINED
    @Column(columnDefinition = "TEXT")
    public String message;
    public int quantity;
    public String startDate;
    public String endDate;
    public String clientName;
    public String clientPhone;
    public String clientEmail;
    public String createdAt;

    /**
     * Motif de clôture, écrit par VOLTA.
     *
     * Une demande close sans raison laisse le client devant un statut muet : il
     * a rempli un formulaire, attendu, et n'apprend rien. Le motif voyage avec
     * la demande, qui reste dans son espace.
     */
    public String adminNote;

    /**
     * Rangée par le client, qui ne veut plus la voir.
     *
     * Et non supprimée. Un devis accepté est un engagement commercial, une
     * demande clôturée garde le motif de sa clôture : les effacer priverait
     * VOLTA de sa trace et le client de son recours. Le drapeau ne vide que sa
     * liste — l'administration continue de tout voir, et lui-même peut revenir
     * sur sa décision.
     */
    public boolean hiddenByClient;
}
