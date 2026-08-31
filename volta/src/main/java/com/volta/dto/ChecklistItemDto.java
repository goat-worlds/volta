package com.volta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChecklistItemDto {
  private String section;
  private String label;
  private String result;
  private String observation;
}
