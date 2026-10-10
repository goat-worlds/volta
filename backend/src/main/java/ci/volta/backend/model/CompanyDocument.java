package ci.volta.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

/**
 * Pièce justificative d'un client entreprise.
 *
 * <h2>Pourquoi une table à part</h2>
 *
 * La pièce d'identité du gérant pèse quelques centaines de kilo-octets. Posée
 * sur {@link UserAccount}, elle serait relue à chaque authentification, à
 * chaque listage de l'annuaire, à chaque assignation d'inspection — pour un
 * contenu que personne ne regarde en dehors du moment où l'administration
 * valide le dossier.
 *
 * <h2>Ce qu'elle garde</h2>
 *
 * Le RCCM et la DFE sont des numéros : ils vivent sur le compte, parce qu'on
 * les lit en même temps que la raison sociale. Ici ne vient que ce qui est un
 * fichier.
 *
 * Le contenu est conservé encodé, comme les pièces jointes des demandes : le
 * projet n'a pas de stockage d'objets, et un chemin sur le disque du serveur
 * se perdrait au premier redéploiement.
 */
@Entity
@Table(name = "company_documents")
public class CompanyDocument {

    /** La pièce d'identité du gérant, exigée à l'inscription d'une entreprise. */
    public static final String KIND_MANAGER_ID = "MANAGER_ID";

    @Id
    public String id;

    /** Le compte entreprise à qui cette pièce appartient. */
    @Column(name = "user_id")
    public String userId;

    /** Ce que la pièce est — {@link #KIND_MANAGER_ID} pour l'instant. */
    public String kind;

    public String originalName;
    public String contentType;
    public long size;

    /** Dépôt, en ISO : l'administration juge aussi la fraîcheur d'une pièce. */
    public String uploadedAt;

    /** Contenu encodé. Jamais renvoyé tel quel : il se télécharge à part. */
    @JsonIgnore
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    public String contentBase64;
}
