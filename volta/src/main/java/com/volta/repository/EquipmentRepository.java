package com.volta.repository;

import com.volta.domain.Equipment;
import com.volta.domain.EquipmentStatus;
import com.volta.domain.EquipmentTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, String> {
  List<Equipment> findByStatus(EquipmentStatus status);
  List<Equipment> findBySupplierId(String supplierId);
  List<Equipment> findByTier(EquipmentTier tier);
  List<Equipment> findByCategoryId(String categoryId);

  @Query("SELECT e FROM Equipment e WHERE e.status = ?1 AND (LOWER(e.name) LIKE LOWER(CONCAT('%', ?2, '%')) OR LOWER(e.brand) LIKE LOWER(CONCAT('%', ?2, '%')))")
  List<Equipment> searchByStatusAndKeyword(EquipmentStatus status, String keyword);
}
