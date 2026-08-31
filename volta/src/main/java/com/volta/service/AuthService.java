package com.volta.service;

import com.volta.domain.User;
import com.volta.dto.RegisterRequest;
import com.volta.dto.LoginRequest;
import com.volta.dto.AuthResponse;
import com.volta.repository.UserRepository;
import com.volta.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;

  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new RuntimeException("Email already exists");
    }

    User user = User.builder()
        .id("u-" + UUID.randomUUID().toString().substring(0, 8))
        .name(request.getName())
        .email(request.getEmail())
        .passwordHash(passwordEncoder.encode(request.getPassword()))
        .role(request.getRole())
        .company(request.getCompany())
        .phone(request.getPhone())
        .city(request.getCity())
        .build();

    userRepository.save(user);

    String token = jwtTokenProvider.generateToken(user);
    return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCompany());
  }

  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new RuntimeException("Invalid password");
    }

    String token = jwtTokenProvider.generateToken(user);
    return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCompany());
  }

  public AuthResponse getMe(String userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    return new AuthResponse(null, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCompany());
  }
}
