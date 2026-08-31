package com.volta.repository;

import com.volta.domain.Review;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository {
  Review save(Review review);
  List<Review> findByEquipmentId(String equipmentId);
}
