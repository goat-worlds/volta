package com.volta.security;

import com.volta.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {
  private static final long EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

  @Value("${jwt.secret:volta-secret-key-change-in-production-very-long-key-32-chars-minimum}")
  private String jwtSecret;

  private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(jwtSecret.getBytes());
  }

  public String generateToken(User user) {
    return Jwts.builder()
        .setSubject(user.getId())
        .claim("email", user.getEmail())
        .claim("role", user.getRole().toString())
        .claim("name", user.getName())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
        .signWith(getSigningKey(), SignatureAlgorithm.HS512)
        .compact();
  }

  public String getUserIdFromToken(String token) {
    return getAllClaimsFromToken(token).getSubject();
  }

  public String getRoleFromToken(String token) {
    return (String) getAllClaimsFromToken(token).get("role");
  }

  public String getEmailFromToken(String token) {
    return (String) getAllClaimsFromToken(token).get("email");
  }

  public boolean isTokenValid(String token) {
    try {
      Jwts.parser()
          .verifyWith(getSigningKey())
          .build()
          .parseSignedClaims(token);
      return true;
    } catch (Exception e) {
      log.error("JWT validation error: {}", e.getMessage());
      return false;
    }
  }

  private Claims getAllClaimsFromToken(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}
