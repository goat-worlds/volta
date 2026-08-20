package com.cyberas.rssi;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "auditors")
public class Auditor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "rssi_id", nullable = false)
    public Long rssiId;

    @Column(nullable = false)
    public String email;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String status; // "en_attente", "actif", "suspendu"

    @Column(name = "created_at")
    public Instant createdAt;

    @Column(name = "last_access")
    public Instant lastAccess;
}
