package ci.volta.backend.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Set;

/**
 * Règles de transition du workflow de devis.
 *
 * Les statuts étaient jusqu'ici écrits directement dans le service, sans qu'aucun
 * endroit ne dise quelles suites sont légitimes. Rien n'empêchait donc de passer
 * un devis refusé à accepté, ni d'accepter deux fois le même.
 *
 * Les statuts repris ici sont ceux que le modèle utilise déjà — aucun n'est
 * inventé :
 *   Quote          SENT, ACCEPTED, REJECTED
 *   QuoteRequest   PENDING, ACCEPTED, DECLINED
 *   RentalRequest  PENDING, ACCEPTED, DECLINED
 *
 * Une transition absente de la table est refusée : c'est ce qui distingue une
 * matrice d'une simple liste d'interdits, où tout oubli devient une permission.
 */
public final class QuoteWorkflow {

    // --- Statuts de devis ---
    public static final String QUOTE_SENT = "SENT";
    public static final String QUOTE_ACCEPTED = "ACCEPTED";
    public static final String QUOTE_REJECTED = "REJECTED";

    // --- Statuts de demande de devis ---
    public static final String REQUEST_PENDING = "PENDING";
    public static final String REQUEST_ACCEPTED = "ACCEPTED";
    public static final String REQUEST_DECLINED = "DECLINED";

    /**
     * Suites autorisées pour un devis.
     *
     * ACCEPTED et REJECTED sont terminaux : une décision prise ne se rejoue pas.
     * C'est ce qui interdit la double acceptation comme le passage de refusé à
     * accepté.
     */
    private static final Map<String, Set<String>> QUOTE_TRANSITIONS = Map.of(
        QUOTE_SENT, Set.of(QUOTE_ACCEPTED, QUOTE_REJECTED),
        QUOTE_ACCEPTED, Set.of(),
        QUOTE_REJECTED, Set.of()
    );

    /**
     * Suites autorisées pour une demande de devis.
     *
     * Une demande déjà tranchée n'accueille plus de nouveau devis : le client a
     * fait son choix, rouvrir la demande créerait deux locations pour un seul
     * besoin.
     */
    private static final Map<String, Set<String>> REQUEST_TRANSITIONS = Map.of(
        REQUEST_PENDING, Set.of(REQUEST_ACCEPTED, REQUEST_DECLINED),
        REQUEST_ACCEPTED, Set.of(),
        REQUEST_DECLINED, Set.of()
    );

    private QuoteWorkflow() {
    }

    /**
     * Vérifie qu'un devis peut passer au statut demandé.
     *
     * @throws ResponseStatusException 409 si la transition n'est pas prévue —
     *         l'état courant rend l'action impossible, ce n'est ni une requête
     *         malformée (400) ni un défaut de droit (403).
     */
    public static void checkQuoteTransition(String currentStatus, String targetStatus) {
        String current = normalize(currentStatus, QUOTE_SENT);
        Set<String> allowed = QUOTE_TRANSITIONS.get(current);

        if (allowed == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Statut de devis inconnu : " + current);
        }
        if (!allowed.contains(targetStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, describeRefusal(current, targetStatus));
        }
    }

    /** Vrai si un devis peut encore être créé pour cette demande. */
    public static void checkRequestAcceptsQuotes(String requestStatus) {
        String current = normalize(requestStatus, REQUEST_PENDING);
        if (!REQUEST_PENDING.equals(current)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette demande est déjà traitée (" + current + ") : aucun nouveau devis ne peut y être ajouté");
        }
    }

    public static void checkRequestTransition(String currentStatus, String targetStatus) {
        String current = normalize(currentStatus, REQUEST_PENDING);
        Set<String> allowed = REQUEST_TRANSITIONS.get(current);

        if (allowed == null || !allowed.contains(targetStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transition de demande impossible : " + current + " vers " + targetStatus);
        }
    }

    /**
     * Un devis dont la validité est dépassée ne peut plus être accepté.
     *
     * Une date absente ou illisible n'invalide pas le devis : le champ est
     * facultatif dans le modèle, et refuser sur une donnée manquante bloquerait
     * des devis parfaitement valides.
     */
    public static void checkStillValid(String validUntil) {
        if (validUntil == null || validUntil.isBlank()) {
            return;
        }
        try {
            if (LocalDate.parse(validUntil).isBefore(LocalDate.now())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ce devis a expiré le " + validUntil + " et ne peut plus être accepté");
            }
        } catch (DateTimeParseException e) {
            // Format non reconnu : on ne bloque pas sur une donnée qu'on ne sait
            // pas interpréter.
        }
    }

    /** Message expliquant pourquoi la transition est refusée. */
    private static String describeRefusal(String current, String target) {
        if (QUOTE_ACCEPTED.equals(current) && QUOTE_ACCEPTED.equals(target)) {
            return "Ce devis a déjà été accepté";
        }
        if (QUOTE_ACCEPTED.equals(current)) {
            return "Ce devis a déjà été accepté et ne peut plus être modifié";
        }
        if (QUOTE_REJECTED.equals(current)) {
            return "Ce devis a été refusé et ne peut plus être accepté";
        }
        return "Transition impossible : " + current + " vers " + target;
    }

    private static String normalize(String status, String fallback) {
        return status == null || status.isBlank() ? fallback : status.trim().toUpperCase();
    }
}
