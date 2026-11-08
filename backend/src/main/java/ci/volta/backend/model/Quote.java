package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "quotes")
public class Quote {
    @Id
    public String id;
    /** « DEV-26-0007 » : la référence du prix proposé, distincte de celle de la demande. */
    public String reference;
    public String quoteRequestId;
    public String supplierId;
    public long price;
    public int deliveryTime; // jours
    @Column(columnDefinition = "TEXT")
    public String conditions;
    public String status; // SENT, ACCEPTED, REJECTED
    public String validUntil;
    public String createdAt;
}
