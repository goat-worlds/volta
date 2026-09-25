package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Message porté à la connaissance de quelqu'un.
 *
 * Il n'était adressé qu'à un rôle : « SUPPLIER », et tous les fournisseurs de
 * la plateforme lisaient « Votre équipement est en attente d'inspection » —
 * celui à qui c'était destiné comme les quinze autres. C'est à la fois du
 * bruit et une fuite : le nom d'un engin, d'une entreprise ou d'une annonce
 * apparaissait chez des concurrents.
 *
 * Deux destinataires possibles, et un seul à la fois :
 *   - `userId` renseigné : le message ne concerne que cette personne ;
 *   - `userId` nul : le message s'adresse à toute une fonction (« un dossier
 *     attend une décision »), et `role` dit laquelle.
 *
 * `role` est conservé dans les deux cas : il sert de filtre de repli et
 * d'information d'affichage côté administration.
 */
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    public String id;
    /** Fonction destinataire, ou fonction de la personne visée. */
    public String role;
    /** Destinataire nommé, ou null pour une diffusion à toute la fonction. */
    public String userId;
    @Column(columnDefinition = "TEXT")
    public String message;
    public String date;
    @Column(name = "is_read")
    public boolean read;

    public Notification() {
    }

    public Notification(String id, String role, String message, String date, boolean read) {
        this(id, role, null, message, date, read);
    }

    public Notification(String id, String role, String userId, String message, String date, boolean read) {
        this.id = id;
        this.role = role;
        this.userId = userId;
        this.message = message;
        this.date = date;
        this.read = read;
    }

    /** Message nominatif : seul son destinataire le verra. */
    public static Notification forUser(String id, String userId, String role, String message, String date) {
        return new Notification(id, role, userId, message, date, false);
    }

    /** Message de fonction : tous ceux qui exercent ce rôle le verront. */
    public static Notification forRole(String id, String role, String message, String date) {
        return new Notification(id, role, null, message, date, false);
    }
}
