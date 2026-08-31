package com.volta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryResponse {
  private String id;
  private String name;
  private String icon;
}
