package com.volta.repository;

import com.volta.domain.Inspection;
import com.volta.domain.InspectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, String> {
  List<Inspection> findByStatus(InspectionStatus status);
  List<Inspection> findByTechnicalTeamId(String technicalTeamId);
  Optional<Inspection> findByQuoteRequestId(String quoteRequestId);
  List<Inspection> findByEquipmentId(String equipmentId);
}
