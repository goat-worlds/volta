package ci.volta.backend.service;

import ci.volta.backend.model.ReferenceSequence;
import ci.volta.backend.repository.ReferenceSequenceRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Les références que l'on cite au téléphone : « RES-26-0042 ».
 *
 * <h2>Le format</h2>
 *
 * Trois morceaux, chacun avec une raison d'être :
 * <ul>
 *   <li>la famille, trois lettres qui disent de quoi l'on parle ;</li>
 *   <li>l'année de création, sur deux chiffres ;</li>
 *   <li>le rang dans la famille et l'année, sur quatre chiffres au moins.</li>
 * </ul>
 *
 * L'ancien format, « VOL-LOC-2026-000042 », comptait dix-neuf caractères dont
 * la moitié ne disait rien : « VOL- » ne distingue rien sur une plateforme qui
 * s'appelle VOLTA, et six chiffres de rang annonçaient un million de dossiers
 * par an. Il fallait le lire deux fois pour le dicter. Celui-ci tient en onze
 * caractères et se dit d'une traite : « RES, vingt-six, zéro zéro
 * quarante-deux ».
 *
 * <h2>Les familles</h2>
 *
 * Les lettres disent le dossier dans les mots de ceux qui le citent : RES une
 * réservation, DEV un devis, DEM une demande. L'ancienne codification appelait
 * RES l'engin (« ressource ») et LOC la réservation — ce qu'aucun client ne
 * pouvait deviner.
 *
 * Une demande de devis et une demande de parcours partagent DEM et son
 * compteur : pour le client ce sont deux demandes, rangées dans la même liste,
 * et deux numérotations parallèles y auraient produit deux « DEM-26-0012 ».
 *
 * <h2>Le compteur</h2>
 *
 * Persistant, par famille et par année, avancé sous verrou : jamais dérivé d'un
 * comptage de lignes, qui recule quand une ligne disparaît et produit des
 * doublons.
 *
 * <h2>Les anciennes références</h2>
 *
 * Elles ont été envoyées par WhatsApp, notées sur des carnets, imprimées sur
 * des contrats. {@link #normalize} les traduit dans le nouveau format — même
 * famille, même année, même rang — si bien qu'un lien de suivi ancien ouvre
 * toujours son dossier, recodé au démarrage par {@code ReferenceMigration}.
 */
@Service
@Transactional
public class ReferenceService {

    /** Engin : la fiche que le fournisseur dépose et que VOLTA référence. */
    public static final String EQUIPMENT = "ENG";
    /** Vérification : la mission confiée à l'équipe technique. */
    public static final String VERIFICATION = "VER";
    /** Réservation : la location d'un engin, de la demande à la clôture. */
    public static final String RESERVATION = "RES";
    /**
     * Demande : un parcours public (louer, devenir partenaire, candidater,
     * demander un technicien…) comme une demande de devis sur une fiche.
     */
    public static final String REQUEST = "DEM";
    /** Devis : le prix proposé en réponse à une demande. */
    public static final String QUOTE = "DEV";
    public static final String ANOMALY = "ANO";
    public static final String OPPORTUNITY = "OPP";
    /** Volta Market : annonce de vente. */
    public static final String LISTING = "MKT";
    /** Volta Market : demande d'achat sur une annonce. */
    public static final String PURCHASE = "ACH";

    /** Ce qu'est chaque famille, en clair — pour les messages et la recherche. */
    public static final Map<String, String> LABELS = Map.of(
            EQUIPMENT, "Engin",
            VERIFICATION, "Vérification",
            RESERVATION, "Réservation",
            REQUEST, "Demande",
            QUOTE, "Devis",
            ANOMALY, "Anomalie",
            OPPORTUNITY, "Opportunité",
            LISTING, "Annonce",
            PURCHASE, "Commande");

    private static final Pattern CURRENT = Pattern.compile("^([A-Z]{3})-?(\\d{2})-?(\\d{1,9})$");

    private final ReferenceSequenceRepository sequences;
    private final TransactionTemplate isolated;

    public ReferenceService(ReferenceSequenceRepository sequences, PlatformTransactionManager transactions) {
        this.sequences = sequences;
        this.isolated = new TransactionTemplate(transactions);
        this.isolated.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /** La prochaine référence de la famille, pour l'année en cours. */
    public String next(String family) {
        int year = LocalDate.now().getYear() % 100;
        String key = sequenceKey(family, year);
        ReferenceSequence seq = sequences.findByKeyForUpdate(key).orElse(null);
        if (seq == null) {
            /*
             * Premier dossier de la famille dans l'année. Créer le compteur ici,
             * dans la transaction de l'appelant, laissait deux créations
             * simultanées partir chacune de 1 : aucune ne voyait la ligne de
             * l'autre, et les deux recevaient « …-0001 ». Le compteur naît donc
             * à part, une seule fois, puis se relit sous verrou comme d'habitude.
             */
            createCounter(key);
            seq = sequences.findByKeyForUpdate(key).orElseThrow();
        }
        long value = seq.nextValue;
        seq.nextValue = value + 1;
        sequences.save(seq);
        return format(family, year, value);
    }

    private void createCounter(String key) {
        try {
            isolated.executeWithoutResult(status -> {
                if (sequences.findById(key).isEmpty()) {
                    ReferenceSequence created = new ReferenceSequence();
                    created.seqKey = key;
                    created.nextValue = 1;
                    sequences.saveAndFlush(created);
                }
            });
        } catch (DataIntegrityViolationException alreadyCreated) {
            // Une autre création l'a posé entre-temps : c'est ce qu'on voulait.
        }
    }

    /**
     * Clé du compteur : « RES-26 ».
     *
     * Distincte des clés de l'ancien format (« RES-2026 ») : celles-ci comptaient
     * les engins sous RES, et les reprendre aurait fait démarrer les
     * réservations au rang des engins.
     */
    static String sequenceKey(String family, int year) {
        return family + "-" + String.format("%02d", year % 100);
    }

    public static String format(String family, int year, long rank) {
        return String.format("%s-%02d-%04d", family, year % 100, rank);
    }

    /** Les morceaux d'une référence au format courant. */
    public record Parts(String family, int year, long rank) {
    }

    public static Optional<Parts> parse(String reference) {
        if (reference == null) {
            return Optional.empty();
        }
        Matcher m = CURRENT.matcher(reference);
        if (!m.matches()) {
            return Optional.empty();
        }
        return Optional.of(new Parts(m.group(1), Integer.parseInt(m.group(2)), Long.parseLong(m.group(3))));
    }



    /**
     * La référence telle qu'on la cherche, quelle que soit la façon dont on l'a
     * saisie.
     *
     * Au téléphone on dicte « res 26 42 », sur un écran on lit « RES-26-0042 » :
     * casse, espaces, tirets manquants et zéros non écrits sont rattrapés. Ce
     * qui ne ressemble à aucune référence est rendu nettoyé, tel quel : la
     * recherche échouera honnêtement.
     */
    public static String normalize(String input) {
        if (input == null) {
            return "";
        }
        String cleaned = input.trim().toUpperCase().replaceAll("[\\s\\u00A0]+", "");
        return parse(cleaned)
                .map(p -> format(p.family(), p.year(), p.rank()))
                .orElse(cleaned);
    }
}
