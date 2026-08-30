package ci.volta.backend.repository;

import ci.volta.backend.model.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<SessionToken, String> {
    void deleteByExpiresAtLessThan(String now);
}
