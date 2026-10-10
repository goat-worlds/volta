package ci.volta.backend.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;

/**
 * Cycle de vie d'une réservation (demande de location).
 *
 * La réservation passe par VOLTA avant la mise en relation finale : le client
 * demande, l'administration qualifie, le fournisseur accepte, l'administration
 * confirme la mise en relation puis suit l'exécution jusqu'à la clôture.
 *
 *   PENDING → QUALIFIED → ACCEPTED → CONFIRMED → IN_PROGRESS → COMPLETED
 *   avec sorties DECLINED (fournisseur) et CANCELLED (administration).
 *
 * PENDING, ACCEPTED et DECLINED sont les statuts historiques ; les autres
 * s'ajoutent sans les renommer pour ne pas casser les données existantes.
 */
public final class RentalWorkflow {

    public static final String PENDING = "PENDING";
    public static final String QUALIFIED = "QUALIFIED";
    public static final String ACCEPTED = "ACCEPTED";
    public static final String DECLINED = "DECLINED";
    public static final String CONFIRMED = "CONFIRMED";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String COMPLETED = "COMPLETED";
    public static final String CANCELLED = "CANCELLED";

    private static final Map<String, Set<String>> TRANSITIONS = Map.ofEntries(
        Map.entry(PENDING, Set.of(QUALIFIED, ACCEPTED, DECLINED, CANCELLED)),
        Map.entry(QUALIFIED, Set.of(ACCEPTED, DECLINED, CANCELLED)),
        Map.entry(ACCEPTED, Set.of(CONFIRMED, CANCELLED)),
        Map.entry(CONFIRMED, Set.of(IN_PROGRESS, CANCELLED)),
        Map.entry(IN_PROGRESS, Set.of(COMPLETED, CANCELLED)),
        Map.entry(DECLINED, Set.of()),
        Map.entry(COMPLETED, Set.of()),
        Map.entry(CANCELLED, Set.of())
    );

    /** Statuts sur lesquels le fournisseur peut encore se prononcer. */
    public static final Set<String> AWAITING_SUPPLIER = Set.of(PENDING, QUALIFIED);

    private RentalWorkflow() {
    }

    public static void checkTransition(String currentStatus, String targetStatus) {
        String current = normalize(currentStatus);
        Set<String> allowed = TRANSITIONS.get(current);
        if (allowed == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Statut de réservation inconnu : " + current);
        }
        if (!allowed.contains(targetStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transition impossible pour cette réservation : " + current + " vers " + targetStatus);
        }
    }

    public static boolean isTerminal(String status) {
        Set<String> allowed = TRANSITIONS.get(normalize(status));
        return allowed != null && allowed.isEmpty();
    }

    private static String normalize(String status) {
        return status == null || status.isBlank() ? PENDING : status.trim().toUpperCase();
    }
}
