package com.cyberas.auth;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@ApplicationScoped
public class AuthService {

    @Inject
    EntityManager em;

    private static final Logger LOG = Logger.getLogger(AuthService.class);
    private static final String SECRET_KEY = "cyberas-secret-key-2026-minimum-32-chars-long-secret";

    @Transactional
    public User createUser(String email, String password, String role) {
        // Check if user already exists
        try {
            em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();
            throw new RuntimeException("Utilisateur déjà existant");
        } catch (NoResultException e) {
            // User doesn't exist, continue
        }

        User user = new User();
        user.email = email;
        user.password = hashPassword(password);
        user.role = role;
        user.status = "email_pending";
        user.createdAt = Instant.now();

        em.persist(user);
        return user;
    }

    @Transactional
    public void saveVerificationCode(long userId, String code) {
        VerificationCode vc = new VerificationCode();
        vc.userId = userId;
        vc.code = code;
        vc.expiresAt = Instant.now().plus(30, ChronoUnit.MINUTES);
        em.persist(vc);
    }

    @Transactional
    public boolean verifyCode(String email, String code) {
        try {
            User user = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();

            VerificationCode vc = em.createQuery("SELECT vc FROM VerificationCode vc WHERE vc.userId = :userId AND vc.code = :code", VerificationCode.class)
                    .setParameter("userId", user.id)
                    .setParameter("code", code)
                    .getSingleResult();

            if (vc.expiresAt.isBefore(Instant.now())) {
                return false;
            }

            user.status = "active";
            em.merge(user);
            em.remove(vc);
            return true;
        } catch (NoResultException e) {
            return false;
        }
    }

    public boolean validateCredentials(String email, String password) {
        try {
            User user = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();
            return checkPassword(password, user.password) && "active".equals(user.status);
        } catch (NoResultException e) {
            return false;
        }
    }

    public String generateToken(String email) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 86400000); // 24 hours

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String validateToken(String token) throws Exception {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String getUserRole(String email) {
        try {
            User user = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();
            return user.role;
        } catch (NoResultException e) {
            return null;
        }
    }

    private String hashPassword(String password) {
        // In production, use bcrypt or argon2
        return password; // Simplified for demo
    }

    private boolean checkPassword(String password, String hash) {
        return password.equals(hash); // Simplified for demo
    }
}
