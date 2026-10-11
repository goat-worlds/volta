package ci.volta.backend.service;

import ci.volta.backend.domain.RentalWorkflow;
import ci.volta.backend.model.EquipmentLike;
import ci.volta.backend.model.EquipmentReview;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentLikeRepository;
import ci.volta.backend.repository.EquipmentReviewRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.security.CurrentUser;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Les avis sur les engins.
 *
 * <h2>Seuls ceux qui ont loué</h2>
 *
 * Un avis n'a de valeur que si celui qui l'écrit a conduit la machine, l'a
 * attendue, l'a vue tenir ou tomber. Ouvrir l'écriture à tout compte inscrit
 * remplirait les fiches de commentaires de gens qui n'ont rien loué — et la
 * première note fausse ferait perdre toute valeur aux vraies.
 *
 * Le droit d'écrire se lit donc dans les réservations : il faut une location
 * conclue sur cet engin, au nom de ce compte. Un devis demandé ne suffit pas,
 * une demande refusée non plus.
 *
 * <h2>Ce que le public lit</h2>
 *
 * La note, le texte, la date. Jamais le nom : les identités ne circulent pas
 * sur la plateforme, et un avis signé permettrait de remonter au client. Le
 * lecteur voit « Client vérifié », ce qui est la seule chose qui compte — la
 * personne a loué cet engin, et le serveur l'a vérifié avant d'accepter sa
 * ligne.
 */
@Service
public class EquipmentReviewService {

    /** Ce que l'on appelle un marché conclu, pour le droit de noter. */
    private static final Set<String> MARCHE_CONCLU = Set.of(
            RentalWorkflow.ACCEPTED, RentalWorkflow.CONFIRMED,
            RentalWorkflow.IN_PROGRESS, RentalWorkflow.COMPLETED);

    private final EquipmentReviewRepository reviews;
    private final EquipmentLikeRepository likes;
    private final RentalRequestRepository rentals;
    private final CurrentUser currentUser;
    private final AuditService audit;

    public EquipmentReviewService(EquipmentReviewRepository reviews, EquipmentLikeRepository likes,
                                  RentalRequestRepository rentals,
                                  CurrentUser currentUser, AuditService audit) {
        this.reviews = reviews;
        this.likes = likes;
        this.rentals = rentals;
        this.currentUser = currentUser;
        this.audit = audit;
    }

    /** Ce qu'un visiteur lit sous une fiche : une note, un texte, une date. */
    public record ReviewView(String id, int rating, String comment, String createdAt) {
        static ReviewView of(EquipmentReview r) {
            return new ReviewView(r.id, r.rating, r.comment, r.createdAt);
        }
    }

    /** La moyenne et le compte, pour les vignettes du catalogue. */
    public record ReviewSummary(String equipmentId, double average, int count) {
    }

    public record ReviewInput(Integer rating, String comment) {
    }

    @Transactional(readOnly = true)
    public List<ReviewView> listFor(String equipmentId) {
        return reviews.findByEquipmentIdAndHiddenFalseOrderByCreatedAtDesc(equipmentId)
                .stream().map(ReviewView::of).toList();
    }

    /**
     * Les moyennes de tous les engins notés, en un appel.
     *
     * Le catalogue affiche l'étoile sur chaque vignette. Demander la moyenne
     * engin par engin ferait une requête par carte — vingt sur une page de
     * catalogue, rechargées à chaque tour de synchronisation.
     */
    @Transactional(readOnly = true)
    public List<ReviewSummary> summaries() {
        Map<String, List<EquipmentReview>> parEngin = reviews.findByHiddenFalse().stream()
                .collect(Collectors.groupingBy(r -> r.equipmentId));
        return parEngin.entrySet().stream()
                .map(e -> new ReviewSummary(
                        e.getKey(),
                        e.getValue().stream().mapToInt(r -> r.rating).average().orElse(0),
                        e.getValue().size()))
                .toList();
    }

    /**
     * Ce compte peut-il noter cet engin ?
     *
     * Servi à l'écran pour n'afficher le formulaire qu'à qui peut s'en servir :
     * proposer d'écrire puis refuser à l'envoi est la pire des deux options.
     */
    @Transactional(readOnly = true)
    public boolean mayReview(String equipmentId) {
        return currentUser.optional().map(me -> aLoue(equipmentId, me)).orElse(false);
    }

    /**
     * Dépose ou remplace son avis.
     *
     * Le second remplace le premier : un client qui loue la même pelle trois
     * fois a un avis sur elle, pas trois — et trois lignes du même auteur
     * pèseraient trois fois dans la moyenne.
     */
    @Transactional
    public ReviewView submit(String equipmentId, ReviewInput in) {
        UserAccount me = currentUser.require();
        if (!aLoue(equipmentId, me)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seuls les clients ayant loué cet engin peuvent le noter.");
        }
        int note = in == null || in.rating() == null ? 0 : in.rating();
        if (note < 1 || note > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La note va de 1 à 5 étoiles.");
        }
        String texte = in.comment() == null ? "" : in.comment().trim();
        if (texte.length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le commentaire ne doit pas dépasser 2000 caractères.");
        }

        EquipmentReview r = reviews.findByEquipmentIdAndClientId(equipmentId, me.id)
                .orElseGet(() -> {
                    EquipmentReview neuf = new EquipmentReview();
                    neuf.id = "avis-" + UUID.randomUUID().toString().substring(0, 8);
                    neuf.equipmentId = equipmentId;
                    neuf.clientId = me.id;
                    neuf.createdAt = Instant.now().toString();
                    return neuf;
                });
        r.rating = note;
        r.comment = texte;
        r.updatedAt = Instant.now().toString();
        r = reviews.save(r);

        audit.record("REVIEW_POSTED", "EQUIPMENT", equipmentId, "", note + "/5");
        return ReviewView.of(r);
    }

    /**
     * L'administration masque un avis.
     *
     * Elle ne le supprime pas : effacer donnerait à VOLTA le pouvoir de
     * réécrire ce qu'on dit de ses engins, et c'est exactement ce qui ruine la
     * crédibilité d'une note. Réservé aux propos qui ne parlent pas de la
     * machine — insultes, coordonnées, démarchage.
     */
    @Transactional
    public void setHidden(String reviewId, boolean hidden) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        EquipmentReview r = reviews.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avis introuvable"));
        r.hidden = hidden;
        reviews.save(r);
        audit.record(hidden ? "REVIEW_HIDDEN" : "REVIEW_RESTORED", "EQUIPMENT", r.equipmentId, "", reviewId);
    }

    /**
     * Les « j'aime » d'un engin, et si l'appelant en fait partie.
     *
     * Public, contrairement au favori qui range une machine dans sa propre
     * liste. Un visiteur sans compte voit le compte et ne peut pas voter :
     * un compteur anonyme se gonfle en rechargeant la page.
     */
    public record LikeState(String equipmentId, long count, boolean liked) {
    }

    @Transactional(readOnly = true)
    public List<LikeState> likeCounts() {
        String moi = currentUser.optional().map(u -> u.id).orElse(null);
        Set<String> miens = moi == null ? Set.of()
                : likes.findByClientId(moi).stream().map(l -> l.equipmentId).collect(Collectors.toSet());
        return likes.findAll().stream()
                .collect(Collectors.groupingBy(l -> l.equipmentId, Collectors.counting()))
                .entrySet().stream()
                .map(e -> new LikeState(e.getKey(), e.getValue(), miens.contains(e.getKey())))
                .toList();
    }

    /** Aimer, ou retirer son « j'aime ». Le même geste dans les deux sens. */
    @Transactional
    public LikeState toggleLike(String equipmentId) {
        UserAccount me = currentUser.require();
        var existant = likes.findByEquipmentIdAndClientId(equipmentId, me.id);
        if (existant.isPresent()) {
            likes.delete(existant.get());
            return new LikeState(equipmentId, likes.countByEquipmentId(equipmentId), false);
        }
        EquipmentLike l = new EquipmentLike();
        l.id = "like-" + UUID.randomUUID().toString().substring(0, 8);
        l.equipmentId = equipmentId;
        l.clientId = me.id;
        l.createdAt = Instant.now().toString();
        likes.save(l);
        return new LikeState(equipmentId, likes.countByEquipmentId(equipmentId), true);
    }

    private boolean aLoue(String equipmentId, UserAccount me) {
        if (!currentUser.isClient()) {
            return false;
        }
        return rentals.findByEquipmentIdAndClientId(equipmentId, me.id).stream()
                .anyMatch(r -> estConclu(r));
    }

    private static boolean estConclu(RentalRequest r) {
        return r.status != null && MARCHE_CONCLU.contains(r.status.trim().toUpperCase());
    }
}
