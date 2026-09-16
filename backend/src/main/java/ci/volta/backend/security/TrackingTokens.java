package ci.volta.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;

/**
 * Secret de suivi d'une demande déposée sans compte.
 *
 * Une référence métier (VOL-REQ-2026-000012) se lit au téléphone, mais elle
 * est séquentielle : connaître la sienne suffit à deviner celle du voisin. Le
 * suivi public exige donc un second facteur, aléatoire, remis une seule fois
 * au déposant. Alphabet sans I, O, 0 ni 1 pour rester recopiable à la main.
 */
public final class TrackingTokens {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private TrackingTokens() {
    }

    public static String generate() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    /** Comparaison en temps constant, insensible à la casse, tolérante au null. */
    public static boolean matches(String expected, String provided) {
        if (expected == null || provided == null) {
            return false;
        }
        byte[] a = expected.trim().toUpperCase().getBytes(StandardCharsets.UTF_8);
        byte[] b = provided.trim().toUpperCase().getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(a, b);
    }

    /** Code complet remis au déposant : référence puis secret, séparés d'un tiret. */
    public static String trackingCode(String reference, String token) {
        return reference + "-" + token;
    }
}
