package ci.volta.backend.repository;

import ci.volta.backend.model.EquipmentLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EquipmentLikeRepository extends JpaRepository<EquipmentLike, String> {

    Optional<EquipmentLike> findByEquipmentIdAndClientId(String equipmentId, String clientId);

    List<EquipmentLike> findByClientId(String clientId);

    long countByEquipmentId(String equipmentId);
}
