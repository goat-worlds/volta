package ci.volta.backend.repository;

import ci.volta.backend.model.ReferenceSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReferenceSequenceRepository extends JpaRepository<ReferenceSequence, String> {

    /** Verrouille le compteur jusqu'au commit : deux appels concurrents se succèdent. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ReferenceSequence s where s.seqKey = :key")
    Optional<ReferenceSequence> findByKeyForUpdate(@Param("key") String key);
}
