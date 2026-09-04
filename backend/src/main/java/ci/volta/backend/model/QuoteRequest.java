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
}
