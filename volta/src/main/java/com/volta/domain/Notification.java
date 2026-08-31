package com.volta.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
  @Id
  private String id;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private Role role;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Column(nullable = false, updatable = false)
  private LocalDateTime date = LocalDateTime.now();

  @Column(nullable = false)
  private Boolean read = false;
}
