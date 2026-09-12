package ci.volta.backend.repository;

import ci.volta.backend.model.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpportunityRepository extends JpaRepository<Opportunity, String> {
    List<Opportunity> findByStage(String stage);
    List<Opportunity> findByOwnerId(String ownerId);
}
