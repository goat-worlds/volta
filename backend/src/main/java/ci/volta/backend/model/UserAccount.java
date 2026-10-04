package ci.volta.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_users")
public class UserAccount {
    @Id
    public String id;
    public String name;
    public String role;
    public String company;
    public String email;
    public String phone;

    /**
     * Le numéro réduit à ses dix derniers chiffres, pour l'identification.
     *
     * Le champ {@code phone} garde la mise en forme saisie — c'est celui qu'on
     * affiche et qu'on rappelle. Celui-ci sert à retrouver le compte quand le
     * client se connecte, quelle que soit la façon dont il écrit son numéro ce
     * jour-là. Voir {@link ci.volta.backend.domain.PhoneKey}.
     */
    public String phoneKey;
    public String city;
    @JsonIgnore
    public String passwordHash;
}
