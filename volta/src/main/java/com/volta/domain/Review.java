package com.volta.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
  private String id;
  private String equipmentId;
  private String author;
  private Double rating;
  private String comment;
  private String date;
  private Boolean verified;
}
