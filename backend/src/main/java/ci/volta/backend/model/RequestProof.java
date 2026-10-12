package ci.volta.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Une preuve de réalisation versée au dossier.
 *
 * <h2>Pourquoi pas une pièce jointe de plus</h2>
 *
 * {@link RequestAttachment} porte ce que le demandeur joint à sa demande — un
 * CV, la photo d'une panne. Ces pièces-ci sont versées à l'autre bout du
 * dossier, par l'exécutant, et elles conditionnent la clôture. Les mélanger
 * ferait d'un CV joint à l'inscription une preuve que la prestation a eu lieu.
 *
 * <h2>Ce qu'elle garde</h2>
 *
 * Le type de pièce, qui l'a versée et quand. C'est cela qu'on oppose à une
 * contestation : non pas le fichier seul, mais le fichier daté et signé d'un
 * auteur. Le contenu n'est jamais rendu avec la liste — il se télécharge à
 * part, et seulement par qui en a le droit.
 */
@Entity
@Table(name = "request_proofs")
public class RequestProof {

    @Id
    public String id;

    @Column(name = "request_id")
    public String requestId;

    /** Un des types de {@code ProofRules} : compte rendu, bon signé, PV, présence. */
    public String kind;

    public String originalName;
    public String contentType;
    public long size;

    /** Le compte qui a versé la pièce. */
    public String uploadedBy;

    /** Horodatage ISO : une preuve sans date ne prouve rien. */
    public String uploadedAt;

    /** Ce que l'exécutant précise à la main, s'il précise quelque chose. */
    @Lob
    @Column(columnDefinition = "TEXT")
    public String note;

    /** Contenu encodé. Jamais rendu avec la liste : il se télécharge à part. */
    @JsonIgnore
    /*
     * Le type est choisi par le dialecte, pas écrit à la main.
     *
     * « LONGTEXT » est un type MySQL : sur PostgreSQL, la création de la table
     * échouait sur « type longtext does not exist ». L'application démarrait
     * quand même — Hibernate ne fait qu'avertir — et la table manquait, si
     * bien que le premier dépôt de pièce échouait en production sur une base
     * qui paraissait saine.
     *
     * LONG32VARCHAR demande « le plus grand texte du moteur » : longtext sur
     * MySQL et MariaDB, text sur PostgreSQL. Le schéma MySQL existant est
     * inchangé.
     */
    @JdbcTypeCode(SqlTypes.LONG32VARCHAR)
    public String contentBase64;
}
