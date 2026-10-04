package ci.volta.backend.domain;

/**
 * Forme canonique d'un numéro de téléphone, pour l'identification.
 *
 * <p>Un même abonné écrit son numéro de six façons : « 05 00 99 13 13 »,
 * « 0500991313 », « +225 05 00 99 13 13 », « 00225 05-00-99-13-13 ». Comparer
 * les chaînes telles qu'elles sont saisies ferait échouer la connexion dès que
 * le client met un espace de plus qu'à l'inscription.
 *
 * <p>La clé ne garde donc que les chiffres, indicatif pays retiré — « +225 »,
 * « 00225 », ou rien du tout selon l'humeur du formulaire. Reste le numéro
 * national, que deux abonnés distincts ne partagent pas.
 *
 * <p>Elle est stockée à côté du numéro affiché, qui garde sa mise en forme :
 * c'est celui-là qu'on montre et qu'on rappelle, la clé ne sert qu'à retrouver
 * le compte.
 */
public final class PhoneKey {

    /**
     * Indicatifs pays écrits devant un numéro ivoirien.
     *
     * L'ordre compte : « 00225 » contient « 225 », et tester le court d'abord
     * laisserait « 00 » collé devant le numéro national.
     */
    private static final String[] INDICATIFS = {"00225", "225"};

    /**
     * En deçà, la saisie n'identifie personne.
     *
     * Huit chiffres, parce que les numéros ivoiriens en comptaient huit avant
     * le passage à dix : des comptes créés à l'époque sont encore en base, et
     * exiger dix chiffres les rendrait tous inaccessibles.
     */
    private static final int LONGUEUR_MINIMALE = 8;

    private PhoneKey() {
    }

    /**
     * Clé d'un numéro saisi, ou {@code null} s'il n'en contient pas assez pour
     * identifier quelqu'un. Renvoyer une clé courte ouvrirait la porte à des
     * collisions entre deux abonnés sans rapport.
     *
     * <p>L'indicatif est retiré explicitement, et non en gardant « les dix
     * derniers chiffres ». Cette première version marchait pour les numéros à
     * dix chiffres et se trompait sur les anciens à huit : « +225 07 00 00 03 »
     * en compte onze une fois l'indicatif collé, et les dix derniers donnaient
     * « 2507000003 » — un bout d'indicatif pris pour le début du numéro. Le
     * même abonné recevait alors deux clés selon qu'il écrivait ou non son
     * indicatif, et ne pouvait plus se connecter.
     */
    public static String of(String saisi) {
        if (saisi == null) {
            return null;
        }
        StringBuilder chiffres = new StringBuilder();
        for (char c : saisi.toCharArray()) {
            if (Character.isDigit(c)) {
                chiffres.append(c);
            }
        }

        String national = chiffres.toString();
        for (String indicatif : INDICATIFS) {
            // On ne retire l'indicatif que s'il reste un numéro derrière : un
            // numéro national qui commence par « 225 » ne doit pas être amputé.
            if (national.startsWith(indicatif)
                    && national.length() - indicatif.length() >= LONGUEUR_MINIMALE) {
                national = national.substring(indicatif.length());
                break;
            }
        }

        return national.length() < LONGUEUR_MINIMALE ? null : national;
    }

    /**
     * Dit si une saisie ressemble à un numéro plutôt qu'à une adresse.
     *
     * <p>L'arobase tranche : une adresse en contient une, jamais un numéro.
     * Pour le reste, on s'en remet à la clé — ce qui donne un numéro national
     * exploitable en est un, le reste est traité comme une adresse.
     */
    public static boolean ressembleAUnNumero(String saisi) {
        if (saisi == null || saisi.contains("@")) {
            return false;
        }
        return of(saisi) != null;
    }
}
