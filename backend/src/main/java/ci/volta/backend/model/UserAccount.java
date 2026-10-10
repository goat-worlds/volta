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

    /**
     * Ce qu'est ce client : {@code PARTICULIER} ou {@code ENTREPRISE}.
     *
     * Nul pour les autres rôles, et nul pour les comptes clients créés avant
     * la distinction — ils sont traités comme des particuliers, ce qu'ils
     * étaient de fait : on ne leur avait jamais rien demandé d'autre.
     *
     * La différence n'est pas cosmétique. Un particulier loue pour lui et
     * circule librement ; une entreprise reçoit les marchés que VOLTA lui
     * apporte, et cela l'engage — d'où les pièces exigées ci-dessous et le
     * contrat qu'elle signe avant de voir les fonctions opérationnelles.
     */
    public String clientType;

    /** Registre du commerce et du crédit mobilier. Exigé d'une entreprise. */
    public String rccm;

    /** Déclaration fiscale d'existence. Exigée d'une entreprise. */
    public String dfe;

    /**
     * L'adresse du responsable, distincte de celle du compte.
     *
     * Le compte est souvent tenu par un chargé d'affaires ; les engagements du
     * contrat, eux, lient la personne qui dirige. C'est elle qu'on écrit quand
     * un marché dérape, et ce n'est pas forcément celle qui s'est inscrite.
     */
    public String managerEmail;

    /**
     * Quand l'entreprise a signé le contrat de collaboration, en ISO.
     *
     * Nul tant qu'elle ne l'a pas lu et accepté. Signer ne suffit pas à ouvrir
     * les fonctions : c'est l'administration qui valide ensuite, après avoir
     * vérifié les pièces.
     */
    public String contractAcceptedAt;

    /** Quand l'administration a validé le dossier, et qui l'a fait. */
    public String contractValidatedAt;
    public String contractValidatedBy;
    @JsonIgnore
    public String passwordHash;
}
