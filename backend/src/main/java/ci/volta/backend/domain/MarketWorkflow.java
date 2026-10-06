package ci.volta.backend.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Volta Market : cycle de vie d'une annonce de vente et d'une demande d'offre.
 *
 * Une annonce suit le même principe que le catalogue de location : rien n'est
 * exposé au public sur simple déclaration du vendeur.
 *
 *   DRAFT → SUBMITTED → PUBLISHED → SOLD
 *   avec REJECTED (retour au vendeur) et WITHDRAWN (retrait temporaire).
 *
 * Une demande d'offre suit le circuit du cahier des charges (§8), dans l'ordre,
 * sans saut d'étape : c'est cette frise que le client voit dans son suivi, et
 * une étape franchie avant la précédente y serait illisible. CLOSED est
 * atteignable depuis toute étape — une demande sans suite se clôt, elle ne
 * reste pas « en négociation » pour toujours.
 */
public final class MarketWorkflow {

    // --- Annonces ---

    public static final String DRAFT = "DRAFT";
    public static final String SUBMITTED = "SUBMITTED";
    public static final String PUBLISHED = "PUBLISHED";
    public static final String REJECTED = "REJECTED";
    public static final String WITHDRAWN = "WITHDRAWN";
    public static final String SOLD = "SOLD";

    private static final Map<String, Set<String>> LISTING_TRANSITIONS = Map.ofEntries(
        Map.entry(DRAFT, Set.of(SUBMITTED)),
        Map.entry(SUBMITTED, Set.of(PUBLISHED, REJECTED)),
        Map.entry(PUBLISHED, Set.of(WITHDRAWN, SOLD)),
        Map.entry(WITHDRAWN, Set.of(PUBLISHED, SUBMITTED)),
        // Le vendeur reprend la main : il corrige et resoumet.
        Map.entry(REJECTED, Set.of(DRAFT)),
        Map.entry(SOLD, Set.of())
    );

    /** États de l'article vendu : neuf ou d'occasion, rien d'autre n'a de sens. */
    public static final Set<String> CONDITIONS = Set.of("NEUF", "OCCASION");

    // --- Demandes d'offre (CDC §8) ---

    public static final List<String> REQUEST_FLOW = List.of(
        "RECEIVED",
        "QUALIFYING",
        "AVAILABILITY_CHECK",
        "COMMERCIAL_REVIEW",
        "OFFER",
        "NEGOTIATION",
        "VALIDATED",
        "SOLD",
        "DELIVERED",
        "CLOSED");

    public static final String RECEIVED = "RECEIVED";
    public static final String CLOSED = "CLOSED";
    /** Étape à laquelle VOLTA interroge le vendeur : « peux-tu livrer ? ». */
    public static final String AVAILABILITY_CHECK = "AVAILABILITY_CHECK";

    /** VOLTA a chiffré : la demande attend la réponse de l'acheteur. */
    public static final String OFFER = "OFFER";
    public static final String NEGOTIATION = "NEGOTIATION";
    public static final String VALIDATED = "VALIDATED";

    /**
     * La balle est-elle dans le camp de l'acheteur ?
     *
     * Une proposition chiffrée n'avance plus sans lui : c'est à ce moment, et à
     * ce moment seulement, qu'il peut valider ou refuser. Avant, il n'y a rien
     * à accepter ; après, la commande est partie en livraison.
     *
     * La négociation compte aussi : elle est une offre révisée, pas une autre
     * étape du dialogue.
     */
    public static boolean awaitingClientDecision(String stage) {
        String current = normalize(stage, RECEIVED);
        return OFFER.equals(current) || NEGOTIATION.equals(current);
    }

    /**
     * La commande a-t-elle été transmise au vendeur ?
     *
     * VOLTA reçoit d'abord, qualifie, puis interroge le vendeur. Tant que
     * l'administration n'a pas atteint la vérification de disponibilité, la
     * commande reste entre le client et VOLTA — le vendeur ne la voit pas.
     */
    public static boolean transmittedToSeller(String stage) {
        String current = normalize(stage, RECEIVED);
        int index = REQUEST_FLOW.indexOf(current);
        return index >= REQUEST_FLOW.indexOf(AVAILABILITY_CHECK);
    }

    private MarketWorkflow() {
    }

    public static void checkListingTransition(String current, String target) {
        String from = normalize(current, DRAFT);
        Set<String> allowed = LISTING_TRANSITIONS.get(from);
        if (allowed == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Statut d'annonce inconnu : " + from);
        }
        if (target == null || !allowed.contains(target)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transition impossible pour cette annonce : " + from + " vers " + target);
        }
    }

    public static void checkCondition(String condition) {
        if (condition == null || !CONDITIONS.contains(condition.trim().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "L'état doit être NEUF ou OCCASION");
        }
    }

    /**
     * Une demande avance aussi loin qu'il le faut, recule d'un cran, ou se clôt.
     *
     * Sauter en avant était interdit : une commande dont l'engin était en stock
     * et le prix affiché traversait quand même disponibilité, analyse
     * commerciale, offre et négociation — quatre étapes qui n'avaient pas eu
     * lieu, et que l'acheteur lisait dans son suivi comme si elles l'avaient
     * été.
     *
     * Reculer reste limité à un cran : une offre refusée revient en analyse,
     * une négociation rouvre l'offre. Au-delà, ce n'est plus une correction.
     */
    public static void checkRequestTransition(String current, String target) {
        String from = normalize(current, RECEIVED);
        int fromIndex = REQUEST_FLOW.indexOf(from);
        int toIndex = target == null ? -1 : REQUEST_FLOW.indexOf(target);
        if (fromIndex < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Étape de demande inconnue : " + from);
        }
        if (toIndex < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Étape cible inconnue : " + target);
        }
        if (CLOSED.equals(from)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Une demande clôturée ne bouge plus");
        }
        boolean forward = toIndex > fromIndex;
        boolean backOne = toIndex == fromIndex - 1 && fromIndex > 0;
        boolean close = CLOSED.equals(target);
        if (!forward && !backOne && !close) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transition impossible pour cette demande : " + from + " vers " + target);
        }
    }

    public static boolean isPublished(String status) {
        return PUBLISHED.equals(normalize(status, DRAFT));
    }

    private static String normalize(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim().toUpperCase();
    }
}
