package ci.volta.backend.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Cycle de vie d'une demande de parcours public (CDC §5, §31).
 *
 * Miroir exact de {@code REQUEST_FLOW} côté frontend (types/domain.ts) : la
 * frise de suivi affichée au déposant et la règle qui interdit les sauts
 * d'étape doivent raconter la même histoire des deux côtés.
 */
public final class RequestWorkflow {

    public static final String RECEIVED = "RECEIVED";
    public static final String QUALIFYING = "QUALIFYING";
    public static final String SEARCHING = "SEARCHING";
    public static final String QUOTE_DRAFT = "QUOTE_DRAFT";
    public static final String QUOTE_SENT = "QUOTE_SENT";
    public static final String VALIDATED = "VALIDATED";
    public static final String MATCHED = "MATCHED";
    public static final String MISSION = "MISSION";
    public static final String DONE = "DONE";
    public static final String CLOSED = "CLOSED";

    public static final List<String> FLOW = List.of(
            RECEIVED, QUALIFYING, SEARCHING, QUOTE_DRAFT, QUOTE_SENT,
            VALIDATED, MATCHED, MISSION, DONE, CLOSED);

    private RequestWorkflow() {
    }

    /**
     * Un cran en avant, un cran en arrière (une qualification qui rouvre un
     * point), ou une clôture depuis n'importe où — une demande abandonnée ne
     * doit pas être poussée jusqu'à « mission » pour pouvoir être refermée.
     */
    public static void checkTransition(String from, String to) {
        if (to == null || !FLOW.contains(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut inconnu : " + to);
        }
        if (CLOSED.equals(to)) {
            return;
        }
        int current = FLOW.indexOf(from);
        int next = FLOW.indexOf(to);
        if (current < 0 || Math.abs(next - current) != 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Passage de « " + from + " » à « " + to + " » non autorisé");
        }
    }
}
