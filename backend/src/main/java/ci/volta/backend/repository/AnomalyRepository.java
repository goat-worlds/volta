package ci.volta.backend.repository;

import ci.volta.backend.model.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnomalyRepository extends JpaRepository<Anomaly, String> {
    List<Anomaly> findByEquipmentId(String equipmentId);
    List<Anomaly> findByInspectionId(String inspectionId);
    List<Anomaly> findByAssignedTo(String supplierId);
    List<Anomaly> findByReportedBy(String technicianId);
    List<Anomaly> findByEquipmentIdAndStatusIn(String equipmentId, List<String> statuses);
}
