package ci.volta.backend.repository;

import ci.volta.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    /**
     * Ce qu'une personne a le droit de lire : ce qui lui est nommément adressé,
     * et ce qui est diffusé à sa fonction. Le filtre est fait par la base plutôt
     * qu'en mémoire — le journal grossit à chaque action de la plateforme.
     */
    @Query("select n from Notification n "
            + "where n.userId = :userId or (n.userId is null and upper(n.role) = upper(:role)) "
            + "order by n.date desc")
    List<Notification> findVisibleFor(@Param("userId") String userId, @Param("role") String role);
}
