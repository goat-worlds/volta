package com.volta.dto;

import com.volta.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
  private String token;
  private String id;
  private String name;
  private String email;
  private Role role;
  private String company;
}
