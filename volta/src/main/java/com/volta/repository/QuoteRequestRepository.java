package com.volta.repository;

import com.volta.domain.QuoteRequest;
import com.volta.domain.QuoteRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, String> {
  List<QuoteRequest> findByStatus(QuoteRequestStatus status);
  List<QuoteRequest> findBySupplierId(String supplierId);
  List<QuoteRequest> findByEquipmentId(String equipmentId);
  boolean existsByReference(String reference);
}
