package ci.volta.backend.repository;

import ci.volta.backend.model.EquipmentReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EquipmentReviewRepository extends JpaRepository<EquipmentReview, String> {

    List<EquipmentReview> findByEquipmentIdAndHiddenFalseOrderByCreatedAtDesc(String equipmentId);

    List<EquipmentReview> findByHiddenFalse();

    Optional<EquipmentReview> findByEquipmentIdAndClientId(String equipmentId, String clientId);
}
