package ci.volta.backend.repository;

import ci.volta.backend.model.SaleListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SaleListingRepository extends JpaRepository<SaleListing, String> {

    /** Vitrine publique : les annonces publiées, mises en avant d'abord. */
    List<SaleListing> findByStatusOrderByFeaturedDescPublishedAtDesc(String status);

    List<SaleListing> findBySellerIdOrderByUpdatedAtDesc(String sellerId);

    List<SaleListing> findByStatus(String status);

    Optional<SaleListing> findByReference(String reference);
}
