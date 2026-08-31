package com.volta.dto;

import com.volta.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class NotificationDto {
  private String id;
  private Role role;
  private String message;
  private LocalDateTime date;
  private Boolean read;
}
