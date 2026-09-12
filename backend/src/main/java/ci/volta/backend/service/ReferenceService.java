package ci.volta.backend.service;

import ci.volta.backend.model.ReferenceSequence;
import ci.volta.backend.repository.ReferenceSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Références métier lisibles et stables : « VOL-RES-2026-000001 ».
 *
 * L'identifiant technique (UUID court) reste la clé ; la référence est ce que
 * l'on cite au téléphone et dans un contrat. Elle est numérotée par famille et
 * par année à partir d'un compteur persistant, jamais dérivée d'un comptage de
 * lignes — un comptage recule quand une ligne disparaît et produit des doublons.
 */
@Service
@Transactional
public class ReferenceService {

    public static final String RESOURCE = "RES";
    public static final String VERIFICATION = "VER";
    public static final String RENTAL = "LOC";
    public static final String ANOMALY = "ANO";
    public static final String OPPORTUNITY = "OPP";

    private final ReferenceSequenceRepository sequences;

    public ReferenceService(ReferenceSequenceRepository sequences) {
        this.sequences = sequences;
    }

    public String next(String family) {
        int year = LocalDate.now().getYear();
        String key = family + "-" + year;
        ReferenceSequence seq = sequences.findByKeyForUpdate(key).orElseGet(() -> {
            ReferenceSequence created = new ReferenceSequence();
            created.seqKey = key;
            created.nextValue = 1;
            return created;
        });
        long value = seq.nextValue;
        seq.nextValue = value + 1;
        sequences.save(seq);
        return String.format("VOL-%s-%d-%06d", family, year, value);
    }
}
