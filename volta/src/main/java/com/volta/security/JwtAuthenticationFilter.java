package com.volta.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Collections;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final String jwtSecret;

  public JwtAuthenticationFilter(@Value("${jwt.secret:volta-secret-key-change-in-production-very-long-key-32-chars-minimum}") String jwtSecret) {
    this.jwtSecret = jwtSecret;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    try {
      String token = extractToken(request);
      if (token != null && isTokenValid(token)) {
        String userId = getUserIdFromToken(token);
        String role = getRoleFromToken(token);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
            userId,
            null,
            Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    } catch (Exception e) {
      log.error("JWT authentication error: {}", e.getMessage());
    }

    filterChain.doFilter(request, response);
  }

  private String extractToken(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }

  private boolean isTokenValid(String token) {
    try {
      Jwts.parser()
          .verifyWith(getSigningKey())
          .build()
          .parseSignedClaims(token);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  private String getUserIdFromToken(String token) {
    return getAllClaimsFromToken(token).getSubject();
  }

  private String getRoleFromToken(String token) {
    return (String) getAllClaimsFromToken(token).get("role");
  }

  private Claims getAllClaimsFromToken(String token) {
    return Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(jwtSecret.getBytes());
  }
}
