package com.volta.dto;

import com.volta.domain.Role;
import lombok.Data;

@Data
public class RegisterRequest {
  private String email;
  private String password;
  private String name;
  private Role role;
  private String company;
  private String phone;
  private String city;
}
