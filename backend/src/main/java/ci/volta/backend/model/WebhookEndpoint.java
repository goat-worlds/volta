package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "webhook_endpoints")
public class WebhookEndpoint {
    @Id
    public String id;
    @Column(columnDefinition = "TEXT")
    public String url;
    /** Event name to subscribe to, or "*" for all events. */
    public String event;
    public boolean active = true;
    public String createdAt;
}
