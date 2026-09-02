package ci.volta.backend.repository;

import ci.volta.backend.model.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, String> {
    List<Quote> findByQuoteRequestId(String quoteRequestId);
    List<Quote> findBySupplierId(String supplierId);
    Optional<Quote> findFirstByQuoteRequestIdOrderByCreatedAtDesc(String quoteRequestId);
}
