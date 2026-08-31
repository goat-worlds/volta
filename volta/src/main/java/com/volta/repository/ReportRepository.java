package com.volta.repository;

import com.volta.domain.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
  Optional<Report> findByInspectionId(String inspectionId);
  Optional<Report> findByEquipmentId(String equipmentId);
}
