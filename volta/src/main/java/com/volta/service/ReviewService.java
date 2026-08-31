package com.volta.service;

import com.volta.domain.Review;
import com.volta.domain.Equipment;
import com.volta.dto.ReviewDto;
import com.volta.repository.EquipmentRepository;
import com.volta.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
  private final EquipmentRepository equipmentRepository;
  // In real app, you'd have a ReviewRepository here

  private static List<Review> reviews = List.of(); // Mock storage

  public ReviewDto createReview(String equipmentId, String author, Double rating, String comment) {
    Equipment equipment = equipmentRepository.findById(equipmentId)
        .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

    Review review = new Review();
    review.setId("rev-" + UUID.randomUUID().toString().substring(0, 8));
    review.setEquipmentId(equipmentId);
    review.setAuthor(author);
    review.setRating(rating);
    review.setComment(comment);
    review.setDate(LocalDate.now().toString());
    review.setVerified(false);

    // In real app: reviewRepository.save(review)
    return toDto(review);
  }

  public List<ReviewDto> getReviewsByEquipment(String equipmentId) {
    Equipment equipment = equipmentRepository.findById(equipmentId)
        .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

    // In real app: reviewRepository.findByEquipmentId(equipmentId)
    return reviews.stream()
        .filter(r -> r.getEquipmentId().equals(equipmentId))
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public Double getAverageRating(String equipmentId) {
    List<Review> equipmentReviews = reviews.stream()
        .filter(r -> r.getEquipmentId().equals(equipmentId))
        .collect(Collectors.toList());

    if (equipmentReviews.isEmpty()) {
      return 0.0;
    }

    return equipmentReviews.stream()
        .mapToDouble(Review::getRating)
        .average()
        .orElse(0.0);
  }

  private ReviewDto toDto(Review review) {
    return ReviewDto.builder()
        .id(review.getId())
        .equipmentId(review.getEquipmentId())
        .author(review.getAuthor())
        .rating(review.getRating())
        .comment(review.getComment())
        .date(review.getDate())
        .verified(review.getVerified())
        .build();
  }
}
