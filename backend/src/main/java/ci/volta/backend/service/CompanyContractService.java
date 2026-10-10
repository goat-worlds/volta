package ci.volta.backend.service;

import ci.volta.backend.model.CompanyDocument;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.CompanyDocumentRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.security.CurrentUser;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Le contrat de collaboration des clients entreprises.
 *
 * <h2>Pourquoi un verrou</h2>
 *
 * VOLTA apporte des marchés. Cela n'a de valeur — pour le client comme pour le
 * fournisseur — que si les engagements tiennent : une disponibilité affichée
 * est une disponibilité réelle, un marché apporté se traite sur la plateforme,
 * un technicien formé par l'académie ne se débauche pas dans le dos de la
 * maison. Ces engagements ne se devinent pas à l'usage : ils se lisent et se
 * signent avant d'entrer.
 *
 * Signer ne suffit pas. Une signature est une case cochée ; ce qui l'adosse à
 * une entreprise réelle, c'est le registre du commerce, la déclaration fiscale
 * et la pièce du gérant — que quelqu'un doit regarder. L'administration valide
 * donc après coup, et c'est cette validation, pas la signature, qui ouvre les
 * fonctions opérationnelles.
 *
 * <h2>Ce que le verrou laisse passer</h2>
 *
 * Tout ce qui se consulte : le catalogue, le Market, les fiches, les tarifs.
 * Un visiteur non inscrit y a accès, il n'y a aucune raison d'en priver une
 * entreprise dont le dossier est à l'étude.
 *
 * Ce qu'il retient, c'est ce qui engage : déposer une demande, commander,
 * réserver. Le verrou vit ici, au serveur, et non dans l'écran qui masque les
 * boutons — masquer un bouton n'a jamais empêché personne d'appeler la route
 * qu'il servait.
 *
 * <h2>Ce qu'il ne concerne pas</h2>
 *
 * Les particuliers, qui ne signent rien et dont rien ne dépend ; les
 * fournisseurs et les équipes techniques, dont l'entrée est gouvernée
 * ailleurs ; et les comptes clients créés avant la distinction, sans type,
 * qui valent particuliers.
 */
@Service
public class CompanyContractService {

    /**
     * Version du contrat acceptée.
     *
     * Sans elle, on saurait qu'une entreprise a signé, jamais ce qu'elle a
     * signé. Le jour où une clause change, c'est la seule chose qui permette
     * de dire qui est tenu par l'ancienne et qui doit relire.
     */
    public static final String VERSION = "2026-10";

    private final UserRepository users;
    private final CompanyDocumentRepository documents;
    private final CurrentUser currentUser;
    private final AuditService audit;

    public CompanyContractService(UserRepository users, CompanyDocumentRepository documents,
                                  CurrentUser currentUser, AuditService audit) {
        this.users = users;
        this.documents = documents;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    /** Vrai si ce compte est une entreprise cliente. */
    public static boolean estEntreprise(UserAccount u) {
        return u != null
                && CurrentUser.ROLE_CLIENT.equalsIgnoreCase(u.role)
                && AuthService.CLIENT_ENTREPRISE.equalsIgnoreCase(u.clientType);
    }

    /**
     * Vrai si ce compte peut engager quoi que ce soit.
     *
     * Tout le monde le peut, sauf une entreprise dont le dossier n'a pas
     * encore été validé. La règle est écrite dans ce sens — et non « seules
     * les entreprises validées » — parce que c'est l'exception qui est
     * nouvelle : un oubli doit laisser passer un particulier, pas le bloquer.
     */
    public static boolean peutEngager(UserAccount u) {
        return !estEntreprise(u) || u.contractValidatedAt != null;
    }

    /**
     * Barre la route à une entreprise non validée.
     *
     * Le message distingue les deux attentes : relire et signer d'abord, puis
     * patienter pendant la vérification. Un refus qui dirait seulement « accès
     * refusé » laisserait le dirigeant croire à une panne.
     */
    public void requireOperational() {
        UserAccount me = currentUser.optional().orElse(null);
        if (me == null || peutEngager(me)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, me.contractAcceptedAt == null
                ? "Signez le contrat de collaboration pour activer votre compte entreprise."
                : "Votre dossier est en cours de vérification par VOLTA.");
    }

    /** L'entreprise lit le contrat et le signe. */
    @Transactional
    public UserAccount accept() {
        UserAccount me = currentUser.require();
        if (!estEntreprise(me)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seul un compte entreprise signe ce contrat");
        }
        // Resigner ne réécrit pas la date : la première signature est celle qui
        // fait foi, et la réécrire effacerait la preuve de son antériorité.
        if (me.contractAcceptedAt == null) {
            me.contractAcceptedAt = Instant.now().toString();
            me = users.save(me);
            audit.record("CONTRACT_SIGNED", "USER", me.id, me.company, VERSION);
        }
        return me;
    }

    /** Les dossiers entreprises, pour l'administration. */
    @Transactional(readOnly = true)
    public List<UserAccount> listCompanies() {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        return users.findAll().stream().filter(CompanyContractService::estEntreprise).toList();
    }

    /** L'administration a vu les pièces : le compte s'ouvre. */
    @Transactional
    public UserAccount validate(String userId) {
        UserAccount admin = currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        UserAccount cible = load(userId);
        if (cible.contractAcceptedAt == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette entreprise n'a pas encore signé le contrat");
        }
        cible.contractValidatedAt = Instant.now().toString();
        cible.contractValidatedBy = admin.id;
        cible = users.save(cible);
        audit.record("CONTRACT_VALIDATED", "USER", cible.id, cible.company, admin.name);
        return cible;
    }

    /**
     * L'administration retire l'accès.
     *
     * La signature est conservée : elle a eu lieu. Seule la validation tombe —
     * c'est elle qui ouvrait les fonctions, et c'est elle qu'on reprend quand
     * un engagement n'est pas tenu.
     */
    @Transactional
    public UserAccount revoke(String userId, String motif) {
        UserAccount admin = currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        UserAccount cible = load(userId);
        cible.contractValidatedAt = null;
        cible.contractValidatedBy = null;
        cible = users.save(cible);
        audit.record("CONTRACT_REVOKED", "USER", cible.id, cible.company,
                motif == null ? "" : motif.trim());
        return cible;
    }

    /** La pièce du gérant, pour que l'administration puisse la regarder. */
    @Transactional(readOnly = true)
    public PieceTelechargee managerId(String userId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        CompanyDocument d = documents
                .findByUserIdAndKind(userId, CompanyDocument.KIND_MANAGER_ID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Aucune pièce déposée pour ce compte"));
        try {
            return new PieceTelechargee(Base64.getDecoder().decode(d.contentBase64),
                    d.contentType, d.originalName);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "La pièce enregistrée est illisible");
        }
    }

    public record PieceTelechargee(byte[] bytes, String contentType, String originalName) {
    }

    private UserAccount load(String userId) {
        UserAccount u = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Compte introuvable : " + userId));
        if (!estEntreprise(u)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ce compte n'est pas un client entreprise");
        }
        return u;
    }
}
