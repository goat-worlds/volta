package ci.volta.backend.security;

import ci.volta.backend.model.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Utilisateur authentifié de la requête en cours.
 *
 * Le contrôle de propriété d'une ressource a besoin de savoir qui agit, et cette
 * information ne doit jamais venir du corps de la requête : un identifiant
 * transmis par le client se falsifie, alors que celui du contexte de sécurité
 * provient du jeton vérifié.
 *
 * Les méthodes distinguent deux refus qu'il ne faut pas confondre :
 *   - 401, l'appelant n'est pas identifié ;
 *   - 403, il est identifié mais n'a pas le droit d'agir sur cette ressource.
 */
@Component
public class CurrentUser {

    public static final String ROLE_CLIENT = "CLIENT";
    public static final String ROLE_SUPPLIER = "SUPPLIER";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_TECHNICAL = "TECHNICAL";

    /** Utilisateur courant, ou 401 si la requête n'est pas authentifiée. */
    public UserAccount require() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        return user;
    }

    public String requireId() {
        return require().id;
    }

    public String role() {
        UserAccount user = require();
        return user.role == null ? "" : user.role.trim().toUpperCase();
    }

    public boolean isAdmin() {
        return ROLE_ADMIN.equals(role());
    }

    public boolean isSupplier() {
        return ROLE_SUPPLIER.equals(role());
    }

    public boolean isClient() {
        return ROLE_CLIENT.equals(role());
    }

    /** Exige un rôle précis. */
    public UserAccount requireRole(String expectedRole) {
        UserAccount user = require();
        if (!expectedRole.equalsIgnoreCase(user.role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cette action est réservée au rôle " + expectedRole);
        }
        return user;
    }

    /**
     * Vérifie que l'utilisateur est bien propriétaire de la ressource.
     *
     * L'administrateur passe outre : la supervision suppose de voir et corriger
     * ce qui appartient aux autres.
     *
     * Le message reste volontairement neutre. Répondre « ce devis appartient au
     * fournisseur X » confirmerait l'existence de la ressource à quelqu'un qui
     * n'y a pas droit.
     */
    public void requireOwnership(String ownerId, String resourceLabel) {
        UserAccount user = require();
        if (ROLE_ADMIN.equalsIgnoreCase(user.role)) {
            return;
        }
        if (ownerId == null || !ownerId.equals(user.id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Accès refusé : " + resourceLabel + " ne vous appartient pas");
        }
    }

    /** Vrai si l'utilisateur possède la ressource, sans lever d'exception. */
    public boolean owns(String ownerId) {
        UserAccount user = require();
        return ROLE_ADMIN.equalsIgnoreCase(user.role)
                || (ownerId != null && ownerId.equals(user.id));
    }
}
