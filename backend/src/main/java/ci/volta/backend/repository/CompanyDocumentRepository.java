package ci.volta.backend.repository;

import ci.volta.backend.model.CompanyDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyDocumentRepository extends JpaRepository<CompanyDocument, String> {

    List<CompanyDocument> findByUserId(String userId);

    Optional<CompanyDocument> findByUserIdAndKind(String userId, String kind);
}
