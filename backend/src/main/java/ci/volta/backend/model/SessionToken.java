package ci.volta.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "sessions")
public class SessionToken {
    @Id
    public String token;
    public String userId;
    public String createdAt;
    public String expiresAt;
}
