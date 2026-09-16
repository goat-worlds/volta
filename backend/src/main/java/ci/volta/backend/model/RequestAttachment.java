package ci.volta.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

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
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    public String contentBase64;
}
