package com.volta.controller;

import com.volta.dto.RegisterRequest;
import com.volta.dto.LoginRequest;
import com.volta.dto.AuthResponse;
import com.volta.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class AuthController {
  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
    AuthResponse response = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
    AuthResponse response = authService.login(request);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/me")
  public ResponseEntity<AuthResponse> getMe() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String userId = (String) authentication.getPrincipal();
    AuthResponse response = authService.getMe(userId);
    return ResponseEntity.ok(response);
  }
}
