package ci.volta.backend.service;

import ci.volta.backend.model.SessionToken;
import ci.volta.backend.domain.PhoneKey;
import ci.volta.backend.model.CompanyDocument;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.SessionRepository;
import ci.volta.backend.repository.CompanyDocumentRepository;
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
    private final CompanyDocumentRepository companyDocuments;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private final long sessionDurationDays;

    public AuthService(
            UserRepository userRepository,
            SessionRepository sessionRepository,
            CompanyDocumentRepository companyDocuments,
            @Value("${volta.session.duration-days:7}") long sessionDurationDays) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.companyDocuments = companyDocuments;
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

    /**
     * Les deux profils de client.
     *
     * Un particulier loue pour lui : son nom et son numéro suffisent, et c'est
     * tout ce qu'on lui demande. Une entreprise reçoit les marchés que VOLTA
     * lui apporte, signe un contrat qui l'engage, et facture — la plateforme
     * doit donc savoir à qui elle a affaire avant de lui ouvrir quoi que ce
     * soit. D'où le registre du commerce, la déclaration fiscale, la pièce du
     * gérant et l'adresse du responsable.
     *
     * Les comptes clients créés avant cette distinction restent sans type :
     * ils valent particuliers, ce qu'ils étaient de fait.
     */
    public static final String CLIENT_PARTICULIER = "PARTICULIER";
    public static final String CLIENT_ENTREPRISE = "ENTREPRISE";

    /** Pièce jointe à l'inscription : la pièce d'identité du gérant. */
    public record DocumentInput(String name, String type, String contentBase64) {
    }

    /**
     * Ce qu'une inscription apporte.
     *
     * La méthode prenait sept paramètres de type String à la file. En ajouter
     * quatre de plus aurait donné un appel dont aucun lecteur ne peut vérifier
     * l'ordre — et une inversion entre deux chaînes voisines ne se voit ni à la
     * compilation ni à l'exécution, seulement dans la base, plus tard.
     */
    public record RegisterInput(String name, String email, String phone, String password,
                                String role, String company, String city,
                                String clientType, String rccm, String dfe, String managerEmail,
                                DocumentInput managerIdDocument) {
    }

    /** Taille maximale d'une pièce déposée à l'inscription. */
    private static final int MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

    public AuthResult register(RegisterInput in) {
        String name = in == null ? null : in.name();
        String password = in == null ? null : in.password();
        if (name == null || name.isBlank() || password == null || password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nom et mot de passe (6 caractères minimum) sont requis");
        }

        // Un rôle absent vaut CLIENT : c'est le cas courant, et c'était le seul
        // comportement possible avant l'ouverture de l'inscription aux autres
        // rôles — les clients existants continuent de fonctionner à l'identique.
        String requestedRole = in.role() == null || in.role().isBlank()
                ? "CLIENT" : in.role().trim().toUpperCase();
        if (!SELF_ASSIGNABLE_ROLES.contains(requestedRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Rôle invalide. Choisissez client, fournisseur ou équipe technique.");
        }

        boolean estClient = "CLIENT".equals(requestedRole);
        String typeClient = null;
        if (estClient) {
            typeClient = in.clientType() == null || in.clientType().isBlank()
                    ? CLIENT_PARTICULIER : in.clientType().trim().toUpperCase();
            if (!CLIENT_PARTICULIER.equals(typeClient) && !CLIENT_ENTREPRISE.equals(typeClient)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Type de client invalide : particulier ou entreprise.");
            }
        }
        boolean estEntreprise = CLIENT_ENTREPRISE.equals(typeClient);

        /*
         * L'identifiant de connexion dépend du profil.
         *
         * Un particulier vient déposer un besoin, pas ouvrir un dossier : on
         * lui demande son nom et son numéro, rien de plus. C'est le numéro qui
         * l'identifie — il l'a toujours sur lui, et c'est par là qu'on le
         * rappellera de toute façon.
         *
         * Une entreprise, un fournisseur ou une équipe technique tiennent un
         * parc, reçoivent des demandes et signent des documents : l'adresse
         * reste exigée, parce que c'est par elle que passent les notifications
         * écrites et les pièces contractuelles.
         */
        String cleTelephone = PhoneKey.of(in.phone());

        if (estClient && cleTelephone == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Un numéro de téléphone valide est requis");
        }
        if ((!estClient || estEntreprise) && (in.email() == null || in.email().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    estEntreprise
                            ? "L'email est requis pour un compte entreprise"
                            : "L'email est requis pour un compte fournisseur ou technique");
        }

        // Un fournisseur, une équipe technique et une entreprise agissent au nom
        // d'une structure : c'est cette raison sociale que voient l'administrateur
        // au moment d'assigner un dossier et le contrat au moment d'être signé.
        String structure = in.company() == null ? "" : in.company().trim();
        if (structure.isEmpty() && (!estClient || estEntreprise)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La raison sociale est requise pour ce type de compte");
        }

        String rccm = in.rccm() == null ? "" : in.rccm().trim();
        String dfe = in.dfe() == null ? "" : in.dfe().trim();
        String emailResponsable = in.managerEmail() == null ? "" : in.managerEmail().trim();
        if (estEntreprise) {
            if (rccm.isEmpty() || dfe.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Le RCCM et la DFE sont requis pour un compte entreprise");
            }
            if (emailResponsable.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "L'email du responsable est requis pour un compte entreprise");
            }
            if (in.managerIdDocument() == null || blank(in.managerIdDocument().contentBase64())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La pièce d'identité du gérant est requise pour un compte entreprise");
            }
        }

        if (in.email() != null && !in.email().isBlank()
                && userRepository.findByEmailIgnoreCase(in.email()).isPresent()) {
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
        user.email = in.email() == null ? "" : in.email().trim();
        user.phone = in.phone() == null ? "" : in.phone().trim();
        user.phoneKey = cleTelephone;
        user.city = in.city() == null ? "" : in.city().trim();
        user.clientType = typeClient;
        user.rccm = rccm;
        user.dfe = dfe;
        user.managerEmail = emailResponsable;
        user.passwordHash = encoder.encode(password);
        user = userRepository.save(user);

        if (estEntreprise) {
            storeManagerId(user.id, in.managerIdDocument());
        }
        return new AuthResult(createSession(user.id).token, user);
    }

    /**
     * Range la pièce du gérant.
     *
     * Elle est décodée avant d'être rangée : une chaîne qui n'est pas du base64
     * se stocke sans broncher et ne se découvre qu'au téléchargement, le jour
     * où l'administration en a besoin pour valider le dossier.
     */
    private void storeManagerId(String userId, DocumentInput doc) {
        byte[] decoded;
        try {
            decoded = java.util.Base64.getDecoder().decode(doc.contentBase64());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La pièce d'identité du gérant est illisible");
        }
        if (decoded.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La pièce d'identité du gérant est vide");
        }
        if (decoded.length > MAX_DOCUMENT_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La pièce d'identité du gérant dépasse 5 Mo");
        }

        CompanyDocument d = new CompanyDocument();
        d.id = "doc-" + UUID.randomUUID().toString().substring(0, 8);
        d.userId = userId;
        d.kind = CompanyDocument.KIND_MANAGER_ID;
        d.originalName = blank(doc.name()) ? "piece-gerant" : doc.name().trim();
        d.contentType = blank(doc.type()) ? "application/octet-stream" : doc.type().trim();
        d.size = decoded.length;
        d.uploadedAt = java.time.Instant.now().toString();
        d.contentBase64 = doc.contentBase64();
        companyDocuments.save(d);
    }

    private static boolean blank(String v) {
        return v == null || v.isBlank();
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
