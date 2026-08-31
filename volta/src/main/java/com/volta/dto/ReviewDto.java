package com.volta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ReviewDto {
  private String id;
  private String equipmentId;
  private String author;
  private Double rating;
  private String comment;
  private String date;
  private Boolean verified;
}
