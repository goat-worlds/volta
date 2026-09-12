package ci.volta.backend.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;

/**
 * Pipeline commercial d'une opportunité.
 *
 *   NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON
 *   avec sortie LOST depuis toute étape ouverte.
 *
 * Une négociation peut revenir en proposition ; WON et LOST sont définitifs.
 */
public final class OpportunityWorkflow {

    public static final String NEW = "NEW";
    public static final String CONTACTED = "CONTACTED";
    public static final String QUALIFIED = "QUALIFIED";
    public static final String PROPOSAL = "PROPOSAL";
    public static final String NEGOTIATION = "NEGOTIATION";
    public static final String WON = "WON";
    public static final String LOST = "LOST";

    public static final Set<String> OPEN_STAGES = Set.of(NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION);

    /** Objets métier auxquels une opportunité peut être rattachée. */
    public static final Set<String> LINK_TYPES = Set.of(
            "EQUIPMENT", "RENTAL_REQUEST", "QUOTE_REQUEST", "QUOTE", "SERVICE", "OTHER");

    private static final Map<String, Set<String>> TRANSITIONS = Map.ofEntries(
        Map.entry(NEW, Set.of(CONTACTED, QUALIFIED, LOST)),
        Map.entry(CONTACTED, Set.of(QUALIFIED, LOST)),
        Map.entry(QUALIFIED, Set.of(PROPOSAL, LOST)),
        Map.entry(PROPOSAL, Set.of(NEGOTIATION, WON, LOST)),
        Map.entry(NEGOTIATION, Set.of(PROPOSAL, WON, LOST)),
        Map.entry(WON, Set.of()),
        Map.entry(LOST, Set.of())
    );

    private OpportunityWorkflow() {
    }

    public static void checkTransition(String currentStage, String targetStage) {
        String current = normalize(currentStage);
        Set<String> allowed = TRANSITIONS.get(current);
        if (allowed == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Étape commerciale inconnue : " + current);
        }
        if (targetStage == null || !allowed.contains(targetStage)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transition impossible pour cette opportunité : " + current + " vers " + targetStage);
        }
    }

    public static void checkLinkType(String linkType) {
        if (linkType != null && !linkType.isBlank() && !LINK_TYPES.contains(linkType.trim().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Type de rattachement inconnu : " + linkType);
        }
    }

    public static boolean isClosed(String stage) {
        return WON.equals(normalize(stage)) || LOST.equals(normalize(stage));
    }

    private static String normalize(String stage) {
        return stage == null || stage.isBlank() ? NEW : stage.trim().toUpperCase();
    }
}
