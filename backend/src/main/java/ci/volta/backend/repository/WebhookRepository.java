package ci.volta.backend.repository;

import ci.volta.backend.model.WebhookEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WebhookRepository extends JpaRepository<WebhookEndpoint, String> {
    List<WebhookEndpoint> findByActiveTrue();
}
