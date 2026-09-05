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
import java.util.Optional;
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

    /**
     * Rôles qu'un visiteur peut se donner en créant son compte.
     *
     * ADMIN en est volontairement absent : la plateforme arbitre entre le
     * fournisseur et le client, et ce pouvoir ne peut pas s'obtenir en cochant
     * une case dans un formulaire public. Un administrateur est créé par
     * amorçage ou promu par un administrateur existant.
     */
    private static final java.util.Set<String> SELF_ASSIGNABLE_ROLES =
            java.util.Set.of("CLIENT", "SUPPLIER", "TECHNICAL");

    public AuthResult register(String name, String email, String phone, String password,
                               String role, String company, String city) {
        if (name == null || name.isBlank() || email == null || email.isBlank()
                || password == null || password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nom, email et mot de passe (6 caractères minimum) sont requis");
        }

        // Un rôle absent vaut CLIENT : c'est le cas courant, et c'était le seul
        // comportement possible avant l'ouverture de l'inscription aux autres
        // rôles — les clients existants continuent de fonctionner à l'identique.
        String requestedRole = role == null || role.isBlank() ? "CLIENT" : role.trim().toUpperCase();
        if (!SELF_ASSIGNABLE_ROLES.contains(requestedRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Rôle invalide. Choisissez client, fournisseur ou équipe technique.");
        }

        // Un fournisseur et une équipe technique agissent au nom d'une
        // structure : c'est cette raison sociale que voient le client dans le
        // catalogue et l'administrateur au moment d'assigner une inspection.
        String structure = company == null ? "" : company.trim();
        if (structure.isEmpty() && !"CLIENT".equals(requestedRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La raison sociale est requise pour un compte fournisseur ou technique");
        }

        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        UserAccount user = new UserAccount();
        user.id = "u-" + UUID.randomUUID().toString().substring(0, 8);
        user.name = name;
        user.role = requestedRole;
        user.company = structure;
        user.email = email;
        user.phone = phone == null ? "" : phone;
        user.city = city == null ? "" : city.trim();
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

    /**
     * Résout l'utilisateur d'un jeton sans prolonger la session ni lever
     * d'exception.
     *
     * Destiné au filtre d'authentification, appelé à chaque requête : y
     * réutiliser {@link #me(String)} écrirait en base à chaque appel et
     * transformerait un simple GET en écriture. Un jeton absent ou expiré rend
     * un Optional vide, la chaîne de sécurité décidant seule du code de retour.
     */
    @Transactional(readOnly = true)
    public Optional<UserAccount> resolveUser(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return sessionRepository.findById(token)
                .filter(s -> {
                    try {
                        return Instant.parse(s.expiresAt).isAfter(Instant.now());
                    } catch (RuntimeException e) {
                        // Date illisible : la session est traitée comme invalide
                        // plutôt que de faire échouer la requête.
                        return false;
                    }
                })
                .flatMap(s -> userRepository.findById(s.userId));
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
