package ci.volta.backend.service;

import ci.volta.backend.model.SessionToken;
import ci.volta.backend.domain.PhoneKey;
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
        if (name == null || name.isBlank() || password == null || password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nom et mot de passe (6 caractères minimum) sont requis");
        }

        // Un rôle absent vaut CLIENT : c'est le cas courant, et c'était le seul
        // comportement possible avant l'ouverture de l'inscription aux autres
        // rôles — les clients existants continuent de fonctionner à l'identique.
        String requestedRole = role == null || role.isBlank() ? "CLIENT" : role.trim().toUpperCase();
        if (!SELF_ASSIGNABLE_ROLES.contains(requestedRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Rôle invalide. Choisissez client, fournisseur ou équipe technique.");
        }

        /*
         * L'identifiant de connexion dépend du rôle.
         *
         * Un client vient déposer un besoin, pas ouvrir un dossier : on lui
         * demande son nom et son numéro, rien de plus. C'est le numéro qui
         * l'identifie — il l'a toujours sur lui, et c'est par là qu'on le
         * rappellera de toute façon.
         *
         * Un fournisseur ou une équipe technique tiennent un parc, reçoivent
         * des demandes et signent des rapports : l'adresse reste exigée, parce
         * que c'est par elle que passent les notifications écrites.
         */
        boolean estClient = "CLIENT".equals(requestedRole);
        String cleTelephone = PhoneKey.of(phone);

        if (estClient) {
            if (cleTelephone == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Un numéro de téléphone valide est requis");
            }
        } else if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "L'email est requis pour un compte fournisseur ou technique");
        }

        // Un fournisseur et une équipe technique agissent au nom d'une
        // structure : c'est cette raison sociale que voient le client dans le
        // catalogue et l'administrateur au moment d'assigner une inspection.
        String structure = company == null ? "" : company.trim();
        if (structure.isEmpty() && !"CLIENT".equals(requestedRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La raison sociale est requise pour un compte fournisseur ou technique");
        }

        if (email != null && !email.isBlank()
                && userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        if (cleTelephone != null && userRepository.findByPhoneKey(cleTelephone).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec ce numéro");
        }
        UserAccount user = new UserAccount();
        user.id = "u-" + UUID.randomUUID().toString().substring(0, 8);
        user.name = name;
        user.role = requestedRole;
        user.company = structure;
        user.email = email == null ? "" : email.trim();
        user.phone = phone == null ? "" : phone.trim();
        user.phoneKey = cleTelephone;
        user.city = city == null ? "" : city.trim();
        user.passwordHash = encoder.encode(password);
        user = userRepository.save(user);
        return new AuthResult(createSession(user.id).token, user);
    }

    /**
     * Connexion par adresse ou par numéro.
     *
     * Le client s'inscrit avec son seul numéro : exiger une adresse ici lui
     * fermerait la porte du compte qu'on vient de lui ouvrir. La saisie est donc
     * lue pour ce qu'elle est — dix chiffres valent un numéro, le reste vaut une
     * adresse — plutôt que de demander à l'utilisateur de déclarer laquelle il
     * emploie.
     *
     * Le message d'échec ne distingue pas le compte inconnu du mot de passe
     * faux : le faire dirait à qui essaie si un numéro est inscrit chez nous.
     */
    public AuthResult login(String identifiant, String password) {
        String saisie = identifiant == null ? "" : identifiant.trim();

        UserAccount user = (PhoneKey.ressembleAUnNumero(saisie)
                ? userRepository.findByPhoneKey(PhoneKey.of(saisie))
                : userRepository.findByEmailIgnoreCase(saisie))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Identifiant ou mot de passe incorrect"));

        if (user.passwordHash == null || !encoder.matches(password == null ? "" : password, user.passwordHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiant ou mot de passe incorrect");
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
