package ci.volta.backend.repository;

import ci.volta.backend.model.QuoteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, String> {
    List<QuoteRequest> findByClientId(String clientId);
    List<QuoteRequest> findBySupplierId(String supplierId);
    List<QuoteRequest> findByEquipmentId(String equipmentId);
}
