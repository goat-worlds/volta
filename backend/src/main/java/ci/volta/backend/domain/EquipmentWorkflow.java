package ci.volta.backend.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;

/**
 * Règles de transition du cycle de vie d'un équipement.
 *
 * Le parcours de vérification est la promesse centrale de VOLTA : un engin
 * publié a été inspecté et classé. Sans matrice, rien n'empêchait de publier un
 * brouillon, de classer un équipement jamais inspecté, ou de relancer une
 * inspection déjà close.
 *
 * Les statuts sont ceux du modèle existant, aucun n'est inventé :
 *   DRAFT → SUBMITTED → PENDING_INSPECTION → INSPECTION_IN_PROGRESS
 *         → REPORT_SUBMITTED → PENDING_ADMIN_REVIEW → REFERENCED → PUBLISHED
 *   avec sorties REJECTED, CORRECTIONS_REQUESTED et UNPUBLISHED.
 */
public final class EquipmentWorkflow {

    public static final String DRAFT = "DRAFT";
    public static final String SUBMITTED = "SUBMITTED";
    public static final String PENDING_INSPECTION = "PENDING_INSPECTION";
    public static final String INSPECTION_IN_PROGRESS = "INSPECTION_IN_PROGRESS";
    public static final String REPORT_SUBMITTED = "REPORT_SUBMITTED";
    public static final String PENDING_ADMIN_REVIEW = "PENDING_ADMIN_REVIEW";
    public static final String REFERENCED = "REFERENCED";
    public static final String PUBLISHED = "PUBLISHED";
    public static final String UNPUBLISHED = "UNPUBLISHED";
    public static final String REJECTED = "REJECTED";
    public static final String CORRECTIONS_REQUESTED = "CORRECTIONS_REQUESTED";

    /**
     * Suites autorisées pour chaque statut.
     *
     * Un équipement rejeté ou corrigé revient en DRAFT : le fournisseur reprend
     * la main, corrige, et resoumet. C'est la seule façon de repartir.
     *
     * REJECTED est terminal côté admin mais laisse la porte au fournisseur —
     * refuser un engin ne bannit pas son propriétaire.
     */
    private static final Map<String, Set<String>> TRANSITIONS = Map.ofEntries(
        Map.entry(DRAFT, Set.of(SUBMITTED)),
        Map.entry(SUBMITTED, Set.of(PENDING_INSPECTION, REJECTED, CORRECTIONS_REQUESTED)),
        Map.entry(PENDING_INSPECTION, Set.of(INSPECTION_IN_PROGRESS, REJECTED)),
        Map.entry(INSPECTION_IN_PROGRESS, Set.of(REPORT_SUBMITTED, PENDING_ADMIN_REVIEW)),
        Map.entry(REPORT_SUBMITTED, Set.of(PENDING_ADMIN_REVIEW, REJECTED, CORRECTIONS_REQUESTED)),
        Map.entry(PENDING_ADMIN_REVIEW, Set.of(REFERENCED, REJECTED, CORRECTIONS_REQUESTED)),
        Map.entry(REFERENCED, Set.of(PUBLISHED, REJECTED, CORRECTIONS_REQUESTED)),
        Map.entry(PUBLISHED, Set.of(UNPUBLISHED)),
        Map.entry(UNPUBLISHED, Set.of(PUBLISHED, REJECTED)),
        // Le fournisseur reprend la main pour corriger puis resoumettre.
        Map.entry(REJECTED, Set.of(DRAFT)),
        Map.entry(CORRECTIONS_REQUESTED, Set.of(DRAFT, SUBMITTED))
    );

    /** Statuts depuis lesquels un classement commercial a du sens. */
    private static final Set<String> CAN_BE_REFERENCED = Set.of(
        REPORT_SUBMITTED, PENDING_ADMIN_REVIEW, REFERENCED, PUBLISHED, UNPUBLISHED
    );

    private EquipmentWorkflow() {
    }

    public static void checkTransition(String currentStatus, String targetStatus) {
        String current = normalize(currentStatus);
        Set<String> allowed = TRANSITIONS.get(current);

        if (allowed == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Statut d'équipement inconnu : " + current);
        }
        if (!allowed.contains(targetStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    describeRefusal(current, targetStatus));
        }
    }

    /**
     * Le classement suppose qu'une inspection a eu lieu.
     *
     * C'est la garantie que porte le niveau affiché au catalogue : attribuer un
     * GOLD à un engin jamais examiné viderait la mention de son sens.
     */
    public static void checkCanBeReferenced(String currentStatus) {
        if (!CAN_BE_REFERENCED.contains(normalize(currentStatus))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cet équipement ne peut pas être classé avant que son inspection soit terminée "
                    + "(statut actuel : " + normalize(currentStatus) + ")");
        }
    }

    /**
     * La publication exige un niveau attribué.
     *
     * Un engin publié sans niveau apparaîtrait au catalogue sans la mention qui
     * justifie sa présence.
     */
    public static void checkCanBePublished(String currentStatus, String level) {
        checkTransition(currentStatus, PUBLISHED);
        if (level == null || level.isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Attribuez un niveau (BASIC, SILVER ou GOLD) avant de publier cet équipement");
        }
    }

    /** Niveaux commerciaux reconnus. */
    public static void checkLevel(String level) {
        if (level == null || !Set.of("BASIC", "SILVER", "GOLD").contains(level.trim().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Niveau invalide : attendu BASIC, SILVER ou GOLD");
        }
    }

    private static String describeRefusal(String current, String target) {
        if (PUBLISHED.equals(target)) {
            return "Cet équipement ne peut pas être publié depuis le statut " + current
                 + " : il doit avoir été inspecté puis classé";
        }
        if (PENDING_INSPECTION.equals(target)) {
            return "Une inspection ne peut être assignée qu'à un équipement soumis (statut actuel : "
                 + current + ")";
        }
        return "Transition impossible : " + current + " vers " + target;
    }

    private static String normalize(String status) {
        return status == null || status.isBlank() ? DRAFT : status.trim().toUpperCase();
    }
}
