package ci.volta.backend.repository;

import ci.volta.backend.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserAccount, String> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);

    /**
     * Retrouve un compte par son numéro normalisé.
     *
     * Comparer les numéros tels qu'ils sont saisis échouerait au premier espace
     * de différence : la clé est calculée par
     * {@link ci.volta.backend.domain.PhoneKey} à l'inscription comme à la
     * connexion.
     */
    Optional<UserAccount> findByPhoneKey(String phoneKey);
}
