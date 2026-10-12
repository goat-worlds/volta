package ci.volta.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Pièce jointe d'une demande de parcours public — le CV d'une candidature,
 * d'abord.
 *
 * Table à part plutôt que colonne de {@link PublicRequest} : la liste des
 * demandes se consulte souvent, son contenu presque jamais, et l'un ne doit
 * pas payer le poids de l'autre. Le contenu n'est donc jamais embarqué dans la
 * réponse JSON d'une demande — il se télécharge à part, par son identifiant.
 */
@Entity
@Table(name = "request_attachments")
public class RequestAttachment {

    @Id
    public String id;

    @Column(name = "request_id")
    public String requestId;

    /** Nom du champ de formulaire porteur, ex. « cv ». */
    public String fieldName;

    public String originalName;
    public String contentType;
    public long size;

    /** Contenu encodé en base64. Jamais renvoyé tel quel : voir le contrôleur de téléchargement. */
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
