package ci.volta.backend.service;

import ci.volta.backend.model.SessionToken;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.SessionRepository;
import ci.volta.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    public record AuthResult(String token, UserAccount user) {
    }

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private final long sessionDurationDays;

    public AuthService(
            UserRepository userRepository,
            SessionRepository sessionRepository,
            @Value("${volta.session.duration-days:7}") long sessionDurationDays) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.sessionDurationDays = sessionDurationDays;
    }

    public String encodePassword(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    public AuthResult register(String name, String email, String phone, String password) {
        if (name == null || name.isBlank() || email == null || email.isBlank()
                || password == null || password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nom, email et mot de passe (6 caractères minimum) sont requis");
        }
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        UserAccount user = new UserAccount();
        user.id = "u-" + UUID.randomUUID().toString().substring(0, 8);
        user.name = name;
        user.role = "CLIENT";
        user.company = "";
        user.email = email;
        user.phone = phone == null ? "" : phone;
        user.city = "";
        user.passwordHash = encoder.encode(password);
        user = userRepository.save(user);
        return new AuthResult(createSession(user.id).token, user);
    }

    public AuthResult login(String email, String password) {
        UserAccount user = userRepository.findByEmailIgnoreCase(email == null ? "" : email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect"));
        if (user.passwordHash == null || !encoder.matches(password == null ? "" : password, user.passwordHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");
        }
        return new AuthResult(createSession(user.id).token, user);
    }

    /** Validates the token, extends the session (sliding expiry) and returns the user. */
    public UserAccount me(String token) {
        SessionToken session = getValidSession(token);
        session.expiresAt = Instant.now().plus(sessionDurationDays, ChronoUnit.DAYS).toString();
        sessionRepository.save(session);
        return userRepository.findById(session.userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session invalide"));
    }

    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            sessionRepository.deleteById(token);
        }
    }

    private SessionToken getValidSession(String token) {
        sessionRepository.deleteByExpiresAtLessThan(Instant.now().toString());
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session requise");
        }
        return sessionRepository.findById(token)
                .filter(s -> Instant.parse(s.expiresAt).isAfter(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expirée"));
    }

    private SessionToken createSession(String userId) {
        SessionToken session = new SessionToken();
        session.token = UUID.randomUUID().toString() + UUID.randomUUID();
        session.userId = userId;
        session.createdAt = Instant.now().toString();
        session.expiresAt = Instant.now().plus(sessionDurationDays, ChronoUnit.DAYS).toString();
        return sessionRepository.save(session);
    }
}
