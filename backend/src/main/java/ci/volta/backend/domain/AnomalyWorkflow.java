package ci.volta.backend.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;

/**
 * Cycle de vie d'une anomalie relevée lors d'une vérification.
 *
 *   OPEN → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → RESOLVED → CLOSED
 *
 * Le technicien ouvre l'anomalie, le fournisseur la traite et soumet son action
 * corrective, l'administration examine, valide puis clôture. Une anomalie
 * examinée et jugée insuffisante repart en traitement.
 */
public final class AnomalyWorkflow {

    public static final String OPEN = "OPEN";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String SUBMITTED = "SUBMITTED";
    public static final String UNDER_REVIEW = "UNDER_REVIEW";
    public static final String RESOLVED = "RESOLVED";
    public static final String CLOSED = "CLOSED";

    public static final Set<String> SEVERITIES = Set.of("MINEURE", "MAJEURE", "CRITIQUE");

    /** Statuts pour lesquels l'anomalie pèse encore sur la qualification. */
    public static final Set<String> BLOCKING = Set.of(OPEN, IN_PROGRESS, SUBMITTED, UNDER_REVIEW);

    private static final Map<String, Set<String>> TRANSITIONS = Map.ofEntries(
        Map.entry(OPEN, Set.of(IN_PROGRESS, SUBMITTED)),
        Map.entry(IN_PROGRESS, Set.of(SUBMITTED)),
        Map.entry(SUBMITTED, Set.of(UNDER_REVIEW, IN_PROGRESS)),
        Map.entry(UNDER_REVIEW, Set.of(RESOLVED, IN_PROGRESS)),
        Map.entry(RESOLVED, Set.of(CLOSED)),
        Map.entry(CLOSED, Set.of())
    );

    /** Transitions que le fournisseur concerné peut effectuer lui-même. */
    public static final Set<String> SUPPLIER_TARGETS = Set.of(IN_PROGRESS, SUBMITTED);

    private AnomalyWorkflow() {
    }

    public static void checkTransition(String currentStatus, String targetStatus) {
        String current = normalize(currentStatus);
        Set<String> allowed = TRANSITIONS.get(current);
        if (allowed == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Statut d'anomalie inconnu : " + current);
        }
        if (targetStatus == null || !allowed.contains(targetStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transition impossible pour cette anomalie : " + current + " vers " + targetStatus);
        }
    }

    public static void checkSeverity(String severity) {
        if (severity == null || !SEVERITIES.contains(severity.trim().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Gravité invalide : attendu MINEURE, MAJEURE ou CRITIQUE");
        }
    }

    private static String normalize(String status) {
        return status == null || status.isBlank() ? OPEN : status.trim().toUpperCase();
    }
}
