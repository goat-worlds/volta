package ci.volta.backend.service;

import ci.volta.backend.model.CompanyDocument;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.domain.EquipmentWorkflow;
import ci.volta.backend.repository.CompanyDocumentRepository;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.security.CurrentUser;
import java.time.Instant;
import java.util.Base64;
import java.util.Set;
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
    public static final String VERSION = "2026-10-b";

    private final UserRepository users;
    private final CompanyDocumentRepository documents;
    private final EquipmentRepository equipments;
    private final CurrentUser currentUser;
    private final AuditService audit;

    public CompanyContractService(UserRepository users, CompanyDocumentRepository documents,
                                  EquipmentRepository equipments,
                                  CurrentUser currentUser, AuditService audit) {
        this.users = users;
        this.documents = documents;
        this.equipments = equipments;
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
     * Qui doit signer le contrat de collaboration.
     *
     * Les entreprises clientes, et les fournisseurs. Ce sont les deux seuls à
     * qui ses clauses s'adressent : honorer la disponibilité affichée, traiter
     * sur la plateforme les marchés qu'on leur apporte, ne pas débaucher un
     * technicien formé par l'académie sans accord écrit. Un particulier qui
     * loue une pelle pour son garage n'est tenu à rien de tout cela.
     *
     * Les équipes techniques en sont exclues : elles sont internes, et leur
     * engagement relève de leur contrat de travail, pas de celui-ci.
     */
    public static boolean doitSigner(UserAccount u) {
        return estEntreprise(u) || (u != null && CurrentUser.ROLE_SUPPLIER.equalsIgnoreCase(u.role));
    }

    /**
     * Le contrat reste-t-il à signer pour ce compte ?
     *
     * Lu par l'écran au premier écran qui suit la connexion. Une fois signé,
     * il ne se représente jamais : un document qu'on redemande à chaque
     * ouverture cesse d'être lu dès la deuxième fois.
     */
    public static boolean resteASigner(UserAccount u) {
        return doitSigner(u) && u.contractAcceptedAt == null;
    }

    /**
     * Vrai si ce compte peut engager quoi que ce soit.
     *
     * <h2>L'entrée ne se mérite plus</h2>
     *
     * Une entreprise cliente attendait que VOLTA vérifie son RCCM, sa DFE et
     * la pièce de son gérant avant de pouvoir déposer la moindre demande. Elle
     * les fournit toujours — on sait à qui l'on a affaire — mais elle n'attend
     * plus : elle signe le contrat et travaille, comme le fournisseur. Faire
     * patienter un dirigeant pressé devant un contrôle de pièces, c'est le
     * perdre avant de l'avoir servi.
     *
     * <h2>Ce qui se perd, en revanche</h2>
     *
     * Le droit d'y rester. Un compte suspendu n'engage plus rien : c'est la
     * contrepartie de l'accès direct — ouvrir la porte à tous sans recours
     * reviendrait à n'en avoir aucun.
     *
     * La règle est écrite en exceptions : un rôle ajouté demain passera, plutôt
     * que d'être bloqué par un oubli.
     */
    public static boolean peutEngager(UserAccount u) {
        if (u != null && u.suspendedAt != null) {
            return false;
        }
        return !doitSigner(u) || u.contractAcceptedAt != null;
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
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, me.suspendedAt != null
                ? "Votre compte est suspendu. Contactez VOLTA."
                : "Signez le contrat de collaboration pour activer votre compte.");
    }

    /**
     * Les pièces que le compte dépose lui-même, depuis son espace.
     *
     * <h2>Pourquoi pas à l'inscription</h2>
     *
     * Une entreprise cliente les donne en s'inscrivant : elle vient chercher
     * des marchés, elle sait qu'on lui demandera qui elle est. Un fournisseur
     * vient d'abord voir ; lui réclamer son registre du commerce avant qu'il
     * ait publié un seul engin le fait partir. Il s'inscrit, il signe, il
     * travaille — et il complète quand il veut davantage.
     *
     * <h2>Ce que cela ouvre</h2>
     *
     * Un compte sans pièces publie jusqu'à {@link #ENGINS_SANS_PIECES} engins
     * et ne vend pas sur Volta Market. C'est assez pour éprouver la plateforme,
     * trop peu pour en vivre. Les pièces vérifiées lèvent la limite et ouvrent
     * la vente — là où les sommes changent d'ordre de grandeur, savoir à qui
     * l'on a affaire cesse d'être une formalité.
     *
     * <h2>Déposer n'est pas être vérifié</h2>
     *
     * Le dépôt remet le dossier à l'administration ; c'est elle qui valide.
     * Ouvrir les droits au dépôt reviendrait à les accorder sur déclaration,
     * et une pièce qu'aucun œil ne regarde ne prouve rien.
     */
    public record DocumentsInput(String rccm, String dfe, String managerEmail,
                                 AuthService.DocumentInput managerIdDocument) {
    }

    /** Ce qu'un compte non vérifié peut publier. Assez pour essayer, pas pour vivre. */
    public static final int ENGINS_SANS_PIECES = 3;

    @Transactional
    public UserAccount submitDocuments(DocumentsInput in) {
        UserAccount me = currentUser.require();
        if (!doitSigner(me)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seuls les fournisseurs et les entreprises clientes déposent ces pièces.");
        }
        if (in == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucune pièce transmise.");
        }

        String rccm = in.rccm() == null ? "" : in.rccm().trim();
        String dfe = in.dfe() == null ? "" : in.dfe().trim();
        if (rccm.isEmpty() || dfe.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le RCCM et la DFE sont tous deux nécessaires.");
        }

        /*
         * Tout changement rouvre la vérification.
         *
         * La validation portait sur un numéro précis et une pièce précise.
         * Laisser remplacer l'un ou l'autre en gardant le bénéfice de la
         * validation reviendrait à valider le suivant sans l'avoir vu : il
         * suffirait de se faire valider une fois sur un dossier propre, puis
         * d'y substituer n'importe quoi.
         *
         * L'email du responsable ne compte pas : c'est une adresse de
         * correspondance, pas une pièce.
         */
        boolean nouvellePiece = in.managerIdDocument() != null
                && in.managerIdDocument().contentBase64() != null
                && !in.managerIdDocument().contentBase64().isBlank();
        boolean change = !rccm.equals(me.rccm == null ? "" : me.rccm)
                || !dfe.equals(me.dfe == null ? "" : me.dfe)
                || nouvellePiece;

        me.rccm = rccm;
        me.dfe = dfe;
        if (in.managerEmail() != null && !in.managerEmail().isBlank()) {
            me.managerEmail = in.managerEmail().trim();
        }
        if (nouvellePiece) {
            remplacerPiece(me.id, in.managerIdDocument());
        }
        if (change) {
            me.contractValidatedAt = null;
            me.contractValidatedBy = null;
        }

        me = users.save(me);
        audit.record("DOCUMENTS_SUBMITTED", "USER", me.id, me.company, rccm);
        return me;
    }

    /**
     * Remplace la pièce du gérant.
     *
     * Une seule par compte : en empiler plusieurs obligerait l'administration à
     * deviner laquelle fait foi, et c'est toujours la dernière.
     */
    private void remplacerPiece(String userId, AuthService.DocumentInput doc) {
        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(doc.contentBase64());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La pièce déposée est illisible.");
        }
        if (decoded.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La pièce déposée est vide.");
        }
        if (decoded.length > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La pièce dépasse 5 Mo.");
        }

        documents.findByUserIdAndKind(userId, CompanyDocument.KIND_MANAGER_ID)
                .ifPresent(documents::delete);

        CompanyDocument d = new CompanyDocument();
        d.id = "doc-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        d.userId = userId;
        d.kind = CompanyDocument.KIND_MANAGER_ID;
        d.originalName = doc.name() == null || doc.name().isBlank() ? "piece-gerant" : doc.name().trim();
        d.contentType = doc.type() == null || doc.type().isBlank()
                ? "application/octet-stream" : doc.type().trim();
        d.size = decoded.length;
        d.uploadedAt = Instant.now().toString();
        d.contentBase64 = doc.contentBase64();
        documents.save(d);
    }

    /**
     * Ce compte est-il vérifié ?
     *
     * Les pièces déposées et regardées par l'administration. C'est ce qui lève
     * la limite d'engins publiés et ouvre la vente sur Volta Market.
     */
    public static boolean estVerifie(UserAccount u) {
        return u != null && u.contractValidatedAt != null
                && u.rccm != null && !u.rccm.isBlank()
                && u.dfe != null && !u.dfe.isBlank();
    }

    /**
     * Les statuts qui occupent une place dans le parc.
     *
     * Ni le brouillon, ni le refusé, ni le retiré : ce qui compte est ce que
     * la plateforme porte — une fiche soumise mobilise déjà une inspection, et
     * une fiche publiée mobilise la caution de VOLTA devant le client.
     *
     * Compter les seuls publiés laisserait déposer trente fiches d'un coup et
     * déplacerait le refus sur l'administration, qui n'a pas à expliquer au
     * fournisseur un plafond qu'elle n'a pas fixé.
     */
    private static final Set<String> AU_PARC = Set.of(
            EquipmentWorkflow.SUBMITTED, EquipmentWorkflow.PENDING_INSPECTION,
            EquipmentWorkflow.INSPECTION_IN_PROGRESS, EquipmentWorkflow.REPORT_SUBMITTED,
            EquipmentWorkflow.PENDING_ADMIN_REVIEW, EquipmentWorkflow.REFERENCED,
            EquipmentWorkflow.PUBLISHED);

    /** Combien d'engins de ce fournisseur occupent une place. */
    @Transactional(readOnly = true)
    public int enginsAuParc(String supplierId) {
        if (supplierId == null) {
            return 0;
        }
        return (int) equipments.findBySupplierId(supplierId).stream()
                .filter(e -> e.status != null && AU_PARC.contains(e.status))
                .count();
    }

    /**
     * Barre la route quand le dossier ne porte pas assez loin.
     *
     * Posée devant le quatrième engin et devant la vente sur le Market. Le
     * message dit ce qui manque et ce que cela ouvrirait : un refus qui se
     * contente de refuser n'apprend rien à celui qui le reçoit.
     *
     * L'administration n'est jamais arrêtée : elle agit pour le compte d'un
     * fournisseur dont elle a le dossier sous les yeux.
     */
    public void requireParcCapacity() {
        UserAccount me = currentUser.require();
        if (currentUser.isAdmin() || estVerifie(me)) {
            return;
        }
        if (enginsAuParc(me.id) >= ENGINS_SANS_PIECES) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous avez " + ENGINS_SANS_PIECES + " engins au parc, la limite des comptes "
                            + "sans pièces vérifiées. " + suite(me));
        }
    }

    /** Même verrou, pour ce qui ne se compte pas : la vente. */
    public void requireVerifiedFor(String action) {
        UserAccount me = currentUser.require();
        if (currentUser.isAdmin() || estVerifie(me)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Il faut un dossier vérifié pour " + action + ". " + suite(me));
    }

    /**
     * Ce qu'il reste à faire, et par qui.
     *
     * Dire « déposez vos pièces » à quelqu'un qui vient de les déposer le
     * renvoie sur un écran où tout est déjà rempli : il conclut à une panne et
     * recommence. Le refus doit nommer celui qui tient la suite.
     */
    private String suite(UserAccount u) {
        boolean depose = u.rccm != null && !u.rccm.isBlank()
                && u.dfe != null && !u.dfe.isBlank();
        return depose
                ? "Votre dossier est déposé, VOLTA le vérifie. Vous serez prévenu dès la validation."
                : "Déposez votre RCCM et votre DFE dans votre espace pour lever cette limite.";
    }

    /** L'état du dossier, tel que l'espace du fournisseur l'affiche. */
    public record DossierView(String rccm, String dfe, String managerEmail,
                              boolean pieceDeposee, boolean verifie,
                              int enginsAuParc, int plafondSansPieces) {
    }

    @Transactional(readOnly = true)
    public DossierView monDossier() {
        UserAccount me = currentUser.require();
        boolean piece = documents
                .findByUserIdAndKind(me.id, CompanyDocument.KIND_MANAGER_ID).isPresent();
        return new DossierView(
                me.rccm == null ? "" : me.rccm,
                me.dfe == null ? "" : me.dfe,
                me.managerEmail == null ? "" : me.managerEmail,
                piece, estVerifie(me), enginsAuParc(me.id), ENGINS_SANS_PIECES);
    }

    /** L'entreprise lit le contrat et le signe. */
    @Transactional
    public UserAccount accept() {
        UserAccount me = currentUser.require();
        if (!doitSigner(me)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ce contrat lie les entreprises clientes et les fournisseurs.");
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
        // La signature est conservée : elle a eu lieu, et l'effacer
        // permettrait de resigner pour contourner la suspension.
        cible.suspendedAt = Instant.now().toString();
        cible.suspendedReason = motif == null ? "" : motif.trim();
        cible.contractValidatedAt = null;
        cible.contractValidatedBy = null;
        cible = users.save(cible);
        audit.record("ACCOUNT_SUSPENDED", "USER", cible.id, cible.company,
                admin.name + " — " + cible.suspendedReason);
        return cible;
    }

    /** Lève la suspension. La signature n'a jamais été effacée. */
    @Transactional
    public UserAccount restore(String userId) {
        UserAccount admin = currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        UserAccount cible = load(userId);
        cible.suspendedAt = null;
        cible.suspendedReason = null;
        cible = users.save(cible);
        audit.record("ACCOUNT_RESTORED", "USER", cible.id, cible.company, admin.name);
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
        if (!doitSigner(u)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ce compte n'est ni une entreprise cliente ni un fournisseur");
        }
        return u;
    }
}
