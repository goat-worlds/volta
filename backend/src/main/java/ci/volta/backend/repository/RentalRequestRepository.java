package ci.volta.backend.repository;

import ci.volta.backend.model.RentalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRequestRepository extends JpaRepository<RentalRequest, String> {

    /**
     * Les réservations d'un client sur un engin donné.
     *
     * Sert à répondre à une seule question : ce client a-t-il réellement loué
     * cette machine ? C'est elle qui ouvre le droit de la noter.
     */
    List<RentalRequest> findByEquipmentIdAndClientId(String equipmentId, String clientId);
}
