package ci.volta.backend.repository;

import ci.volta.backend.model.RequestProof;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestProofRepository extends JpaRepository<RequestProof, String> {

    List<RequestProof> findByRequestIdOrderByUploadedAtAsc(String requestId);
}
