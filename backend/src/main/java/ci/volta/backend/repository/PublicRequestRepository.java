package ci.volta.backend.repository;

import ci.volta.backend.model.PublicRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PublicRequestRepository extends JpaRepository<PublicRequest, String> {

    Optional<PublicRequest> findByReference(String reference);

    List<PublicRequest> findAllByOrderByCreatedAtDesc();
}
