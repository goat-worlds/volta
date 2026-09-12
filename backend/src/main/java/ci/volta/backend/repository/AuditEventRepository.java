package ci.volta.backend.repository;

import ci.volta.backend.model.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditEventRepository extends JpaRepository<AuditEvent, String> {
    List<AuditEvent> findByEntityTypeAndEntityIdOrderByAtDesc(String entityType, String entityId);
    List<AuditEvent> findByEntityTypeOrderByAtDesc(String entityType);
    List<AuditEvent> findTop500ByOrderByAtDesc();
}
