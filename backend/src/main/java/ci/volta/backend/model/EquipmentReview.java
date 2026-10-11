package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

/**
 * L'avis d'un client sur un engin qu'il a réellement loué.
 *
 * <h2>Qui peut écrire</h2>
 *
 * Seul un client dont un marché a été conclu sur cet engin — une location
 * démarrée, un achat validé. C'est ce qui sépare un avis d'une opinion : celui
 * qui écrit a conduit la machine, l'a attendue, l'a vue tomber en panne ou
 * tenir. Ouvrir l'écriture à tout compte inscrit remplirait la fiche de
 * commentaires de gens qui n'ont rien loué, et la première note fausse ferait
 * perdre toute valeur aux vraies.
 *
 * Le contrôle est au serveur : il relit les réservations et les commandes de
 * l'auteur avant d'accepter. Voir {@code EquipmentReviewService}.
 *
 * <h2>Un avis par client et par engin</h2>
 *
 * Le second remplace le premier plutôt que de s'ajouter. Un client qui loue la
 * même pelle trois fois a un avis sur elle, pas trois — et trois lignes du
 * même auteur pèseraient trois fois dans la moyenne.
 *
 * <h2>Ce qui est affiché</h2>
 *
 * La note, le texte, la date. Pas le nom : les identités ne circulent pas sur
 * la plateforme, et un avis signé permettrait de remonter au client. Le
 * lecteur voit « Client vérifié », ce qui est la seule chose qui compte —
 * cette personne a loué cet engin.
 */
@Entity
@Table(name = "equipment_reviews")
public class EquipmentReview {

    @Id
    public String id;

    @Column(name = "equipment_id")
    public String equipmentId;

    /** L'auteur. Jamais rendu au public : il sert à empêcher le doublon. */
    @Column(name = "client_id")
    public String clientId;

    /** De 1 à 5. */
    public int rating;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String comment;

    public String createdAt;
    public String updatedAt;

    /**
     * Masqué par l'administration.
     *
     * Un avis ne se supprime pas — l'effacer donnerait à VOLTA le pouvoir de
     * réécrire ce qu'on dit de ses engins, et c'est précisément ce qui ruine
     * la crédibilité d'une note. Il se masque, ce qui laisse une trace et
     * reste réversible. Réservé aux propos qui n'ont rien à voir avec la
     * machine : insultes, coordonnées, démarchage.
     */
    public boolean hidden;
}
