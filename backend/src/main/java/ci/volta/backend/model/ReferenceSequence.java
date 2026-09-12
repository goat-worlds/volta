package ci.volta.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Compteur persistant d'une famille de références métier, par année.
 *
 * Clé : « RES-2026 », « VER-2026 »… Le compteur avance sous verrou pessimiste
 * afin que deux créations simultanées ne reçoivent jamais le même numéro.
 */
@Entity
@Table(name = "reference_sequences")
public class ReferenceSequence {
    @Id
    public String seqKey;
    public long nextValue;
}
