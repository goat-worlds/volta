package ci.volta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Un « j'aime » public sur un engin.
 *
 * <h2>Pourquoi ce n'est pas un favori</h2>
 *
 * Le favori est privé : il range une machine dans sa propre liste, pour la
 * retrouver. Le « j'aime » est public : il dit aux autres que cette machine
 * plaît. Les confondre donnerait un compteur qui expose ce que chacun avait
 * mis de côté — et un favori retiré ferait baisser une note publique, ce que
 * personne n'attend en vidant sa liste.
 *
 * <h2>Un par compte</h2>
 *
 * La clé est la paire engin + compte. Un compteur qu'on peut gonfler en
 * cliquant deux fois ne mesure rien, et un compteur anonyme se gonfle en
 * rechargeant la page.
 */
@Entity
@Table(name = "equipment_likes")
public class EquipmentLike {

    @Id
    public String id;

    @Column(name = "equipment_id")
    public String equipmentId;

    @Column(name = "client_id")
    public String clientId;

    public String createdAt;
}
