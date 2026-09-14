package ci.volta.backend.repository;

import ci.volta.backend.model.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, String> {
    List<PurchaseRequest> findBySellerIdOrderByCreatedAtDesc(String sellerId);
    List<PurchaseRequest> findByClientIdOrderByCreatedAtDesc(String clientId);
    List<PurchaseRequest> findByListingId(String listingId);
    Optional<PurchaseRequest> findByReference(String reference);
}
