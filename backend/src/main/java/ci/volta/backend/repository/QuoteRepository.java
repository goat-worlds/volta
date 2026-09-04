package ci.volta.backend.repository;

import ci.volta.backend.model.Quote;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, String> {
    List<Quote> findByQuoteRequestId(String quoteRequestId);
    List<Quote> findBySupplierId(String supplierId);
    Optional<Quote> findFirstByQuoteRequestIdOrderByCreatedAtDesc(String quoteRequestId);

    /**
     * Charge un devis en verrouillant sa ligne jusqu'à la fin de la transaction.
     *
     * Sans ce verrou, deux acceptations simultanées liraient toutes deux le
     * statut SENT, le jugeraient acceptable, et créeraient chacune une demande
     * de location : la vérification de statut ne protège de rien si elle porte
     * sur une lecture que l'autre transaction peut encore invalider.
     *
     * Le verrou est pessimiste plutôt qu'optimiste car l'entité ne porte pas de
     * champ @Version — l'ajouter modifierait le schéma d'une table déjà peuplée.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select q from Quote q where q.id = :id")
    Optional<Quote> findByIdForUpdate(@Param("id") String id);

    /**
     * Devis déjà accepté pour une demande donnée.
     *
     * Sert de seconde barrière : deux devis distincts de la même demande
     * pourraient être acceptés en parallèle, chacun verrouillant sa propre ligne
     * sans jamais se croiser.
     */
    Optional<Quote> findFirstByQuoteRequestIdAndStatus(String quoteRequestId, String status);
}
