package com.volta.controller;

import com.volta.dto.ReviewDto;
import com.volta.dto.ApiResponse;
import com.volta.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment/{equipmentId}/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class ReviewController {
  private final ReviewService reviewService;

  @PostMapping
  public ResponseEntity<ApiResponse<ReviewDto>> createReview(
      @PathVariable String equipmentId,
      @RequestBody CreateReviewRequest request
  ) {
    ReviewDto response = reviewService.createReview(
        equipmentId,
        request.getAuthor(),
        request.getRating(),
        request.getComment()
    );
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(ApiResponse.ok(response, "Avis créé avec succès"));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<ReviewDto>>> getReviews(@PathVariable String equipmentId) {
    List<ReviewDto> response = reviewService.getReviewsByEquipment(equipmentId);
    return ResponseEntity.ok(ApiResponse.ok(response));
  }

  @GetMapping("/rating")
  public ResponseEntity<ApiResponse<Map<String, Object>>> getRating(@PathVariable String equipmentId) {
    Double avgRating = reviewService.getAverageRating(equipmentId);
    List<ReviewDto> reviews = reviewService.getReviewsByEquipment(equipmentId);

    Map<String, Object> ratingData = new HashMap<>();
    ratingData.put("average", Math.round(avgRating * 10.0) / 10.0);
    ratingData.put("count", reviews.size());

    return ResponseEntity.ok(ApiResponse.ok(ratingData));
  }

  public static class CreateReviewRequest {
    private String author;
    private Double rating;
    private String comment;

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
  }
}
