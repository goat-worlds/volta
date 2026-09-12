package ci.volta.backend.domain;

import ci.volta.backend.model.Anomaly;
import ci.volta.backend.model.ChecklistItem;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Critères des niveaux BASIC, SILVER et GOLD.
 *
 * Le niveau n'est pas un badge choisi librement : il découle du rapport
 * d'inspection et des anomalies encore ouvertes. L'administration reste libre
 * d'attribuer un niveau inférieur à celui que le dossier permettrait.
 *
 *   BASIC  : un rapport d'inspection existe.
 *   SILVER : aucun contrôle NON_CONFORME, aucune anomalie MAJEURE ou CRITIQUE
 *            encore ouverte.
 *   GOLD   : tous les contrôles CONFORME, aucune anomalie ouverte, quelle que
 *            soit sa gravité.
 */
public final class QualificationRules {

    public static final String CONFORME = "CONFORME";
    public static final String NON_CONFORME = "NON_CONFORME";

    private QualificationRules() {
    }

    /** Niveau le plus élevé que le dossier autorise, ou null sans rapport. */
    public static String maxAllowedLevel(List<ChecklistItem> checklist, List<Anomaly> openAnomalies) {
        if (checklist == null) {
            return null;
        }
        boolean allConforme = !checklist.isEmpty()
                && checklist.stream().allMatch(c -> CONFORME.equalsIgnoreCase(c.result));
        boolean anyNonConforme = checklist.stream().anyMatch(c -> NON_CONFORME.equalsIgnoreCase(c.result));
        boolean anyOpen = openAnomalies != null && !openAnomalies.isEmpty();
        boolean anySeriousOpen = openAnomalies != null && openAnomalies.stream()
                .anyMatch(a -> "MAJEURE".equalsIgnoreCase(a.severity) || "CRITIQUE".equalsIgnoreCase(a.severity));

        if (allConforme && !anyOpen) {
            return "GOLD";
        }
        if (!anyNonConforme && !anySeriousOpen) {
            return "SILVER";
        }
        return "BASIC";
    }

    public static void checkLevelAllowed(String requestedLevel, List<ChecklistItem> checklist,
                                         List<Anomaly> openAnomalies) {
        String requested = requestedLevel.trim().toUpperCase();
        String max = maxAllowedLevel(checklist, openAnomalies);
        if (max == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Aucun rapport d'inspection : impossible d'attribuer un niveau");
        }
        if (rank(requested) > rank(max)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Le dossier ne permet pas le niveau " + requested + " (maximum : " + max + ") : "
                    + describe(checklist, openAnomalies));
        }
    }

    private static int rank(String level) {
        return switch (level) {
            case "GOLD" -> 3;
            case "SILVER" -> 2;
            default -> 1;
        };
    }

    private static String describe(List<ChecklistItem> checklist, List<Anomaly> openAnomalies) {
        long nonConforme = checklist.stream().filter(c -> NON_CONFORME.equalsIgnoreCase(c.result)).count();
        long aSurveiller = checklist.stream()
                .filter(c -> c.result != null && !CONFORME.equalsIgnoreCase(c.result)
                        && !NON_CONFORME.equalsIgnoreCase(c.result))
                .count();
        long open = openAnomalies == null ? 0 : openAnomalies.size();
        return nonConforme + " contrôle(s) non conforme(s), " + aSurveiller + " à surveiller, "
                + open + " anomalie(s) ouverte(s)";
    }
}
