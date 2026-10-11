package ci.volta.backend.domain;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Ce qu'il faut avoir au dossier pour le clore.
 *
 * <h2>Pourquoi des règles par nature</h2>
 *
 * Clore une prestation, c'était poser {@code DONE} et rien d'autre : aucun
 * compte rendu, aucune pièce, aucune réception. Un dossier terminé et un
 * dossier qu'on a cessé de suivre se ressemblaient parfaitement, et le jour où
 * un client conteste, il ne reste rien à lui opposer.
 *
 * Mais exiger les mêmes documents de tout le monde est l'autre faute. Une
 * formation n'a pas de bon de restitution, une location d'engin n'a pas de
 * feuille de présence, et une offre d'engin ne produit aucune prestation. Des
 * exigences identiques partout seraient contournées partout — on dépose
 * n'importe quel fichier à la place de celui qu'on n'a pas.
 *
 * <h2>Ce que la table dit</h2>
 *
 * Pour chaque nature de demande, les pièces sans lesquelles le dossier ne se
 * ferme pas. Une nature absente de la table n'exige rien : c'est le cas des
 * dossiers qui n'exécutent aucune prestation — une offre d'engin, une demande
 * de référencement.
 *
 * <h2>Ce qu'elle ne fait pas</h2>
 *
 * Elle ne juge pas le contenu du fichier. Personne ne peut vérifier
 * automatiquement qu'un PDF déposé comme « bon de restitution » en est un. Ce
 * qu'elle garantit, c'est qu'une pièce de ce type a été versée, par qui et
 * quand — et que le dossier ne s'est pas fermé sur du vide.
 */
public final class ProofRules {

    /** Compte rendu d'intervention : ce que le technicien a fait et constaté. */
    public static final String REPORT = "REPORT";

    /** Bon de livraison ou de restitution, signé par le client. */
    public static final String DELIVERY_NOTE = "DELIVERY_NOTE";

    /** Procès-verbal de réception des travaux. */
    public static final String ACCEPTANCE = "ACCEPTANCE";

    /** Feuille de présence ou attestation de formation. */
    public static final String ATTENDANCE = "ATTENDANCE";

    /** Photographies du chantier ou de la machine, avant et après. */
    public static final String PHOTOS = "PHOTOS";

    private static final Map<String, String> LIBELLES = new LinkedHashMap<>();

    static {
        LIBELLES.put(REPORT, "Compte rendu d'intervention");
        LIBELLES.put(DELIVERY_NOTE, "Bon de livraison ou de restitution signé");
        LIBELLES.put(ACCEPTANCE, "Procès-verbal de réception");
        LIBELLES.put(ATTENDANCE, "Feuille de présence ou attestation");
        LIBELLES.put(PHOTOS, "Photographies");
    }

    /**
     * Les pièces exigées pour clore, par nature de demande.
     *
     * Une location se clôt sur la restitution de la machine ; une intervention
     * sur le compte rendu de ce qui a été fait ; un chantier sur son
     * procès-verbal ; une formation sur la présence de ceux qui l'ont suivie.
     * Chacune a la preuve que son métier produit déjà — on ne demande pas un
     * document de plus, on exige celui qui existe.
     */
    private static final Map<String, List<String>> EXIGENCES = Map.of(
            "RENTAL", List.of(DELIVERY_NOTE),
            "TECHNICIAN", List.of(REPORT),
            "CONSTRUCTION", List.of(ACCEPTANCE),
            "SUPPORT", List.of(ATTENDANCE),
            "PURCHASE", List.of(DELIVERY_NOTE));

    private ProofRules() {
    }

    /** Les types de pièces exigés pour clore une demande de cette nature. */
    public static List<String> requiredFor(String kind) {
        if (kind == null) {
            return List.of();
        }
        return EXIGENCES.getOrDefault(kind.trim().toUpperCase(), List.of());
    }

    /** Vrai si ce type de pièce est reconnu. Les autres sont refusés au dépôt. */
    public static boolean isKnown(String proofKind) {
        return proofKind != null && LIBELLES.containsKey(proofKind.trim().toUpperCase());
    }

    /** Le nom lisible d'un type de pièce, pour l'écran et pour les refus. */
    public static String label(String proofKind) {
        if (proofKind == null) {
            return "";
        }
        return LIBELLES.getOrDefault(proofKind.trim().toUpperCase(), proofKind);
    }

    /** Tous les types connus, pour l'écran de dépôt. */
    public static Map<String, String> catalogue() {
        return Map.copyOf(LIBELLES);
    }
}
