package ci.volta.backend.security;

import ci.volta.backend.model.UserAccount;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Contrôle de propriété des ressources.
 *
 * Le rôle dit ce qu'un utilisateur a le droit de faire ; la propriété dit sur
 * quoi il a le droit de le faire. Sans ce second contrôle, un fournisseur
 * authentifié peut agir sur le catalogue et les devis d'un concurrent en
 * changeant simplement un identifiant dans l'URL.
 */
class CurrentUserTest {

    private final CurrentUser currentUser = new CurrentUser();

    private void authenticateAs(String userId, String role) {
        UserAccount user = new UserAccount();
        user.id = userId;
        user.role = role;
        user.email = userId + "@volta.test";

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }

    @AfterEach
    void clearContext() {
        // Le contexte est porté par un ThreadLocal : sans nettoyage, l'identité
        // d'un test fuiterait dans le suivant.
        SecurityContextHolder.clearContext();
    }

    private void assertForbidden(Runnable action) {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, action::run);
        assertEquals(HttpStatus.FORBIDDEN, e.getStatusCode(),
                "un défaut de droit doit donner 403, pas " + e.getStatusCode());
    }

    @Test
    @DisplayName("Sans authentification, l'accès est refusé en 401")
    void sansAuthentification401() {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, currentUser::require);
        assertEquals(HttpStatus.UNAUTHORIZED, e.getStatusCode(),
                "l'absence d'identité est un 401, à ne pas confondre avec un 403");
    }

    @Test
    @DisplayName("Un utilisateur accède à ses propres ressources")
    void proprietaireAccepte() {
        authenticateAs("u-client-a", "CLIENT");
        assertDoesNotThrow(() -> currentUser.requireOwnership("u-client-a", "cette demande"));
        assertTrue(currentUser.owns("u-client-a"));
    }

    @Test
    @DisplayName("CLIENT A ne peut pas accéder aux ressources de CLIENT B")
    void clientNAccedePasAuxDonneesDunAutreClient() {
        authenticateAs("u-client-a", "CLIENT");
        assertForbidden(() -> currentUser.requireOwnership("u-client-b", "cette demande"));
        assertFalse(currentUser.owns("u-client-b"));
    }

    @Test
    @DisplayName("SUPPLIER A ne peut pas agir sur les devis de SUPPLIER B")
    void fournisseurNAccedePasAuxDevisDunAutre() {
        authenticateAs("u-supplier-a", "SUPPLIER");
        assertForbidden(() -> currentUser.requireOwnership("u-supplier-b", "ce devis"));
    }

    @Test
    @DisplayName("Un propriétaire absent vaut refus, pas autorisation")
    void proprietaireNulRefuse() {
        authenticateAs("u-client-a", "CLIENT");
        // Une ressource orpheline ne doit appartenir à personne plutôt qu'à tous.
        assertForbidden(() -> currentUser.requireOwnership(null, "cette ressource"));
    }

    @Test
    @DisplayName("L'administrateur passe outre la propriété")
    void adminPasseOutre() {
        authenticateAs("u-admin", "ADMIN");
        // La supervision suppose de voir et corriger ce qui appartient aux autres.
        assertDoesNotThrow(() -> currentUser.requireOwnership("u-client-b", "cette demande"));
        assertTrue(currentUser.owns("n-importe-qui"));
    }

    @Test
    @DisplayName("Le message de refus ne révèle pas le propriétaire réel")
    void messageNeRevelePasLeProprietaire() {
        authenticateAs("u-supplier-a", "SUPPLIER");
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> currentUser.requireOwnership("u-supplier-secret", "ce devis"));

        // Nommer le propriétaire confirmerait l'existence de la ressource à
        // quelqu'un qui n'y a pas droit.
        assertFalse(e.getReason().contains("u-supplier-secret"),
                "message obtenu : " + e.getReason());
    }

    @Test
    @DisplayName("Un rôle inattendu est refusé en 403")
    void mauvaisRoleRefuse() {
        authenticateAs("u-client-a", "CLIENT");
        assertForbidden(() -> currentUser.requireRole("ADMIN"));
        assertDoesNotThrow(() -> currentUser.requireRole("CLIENT"));
    }

    @Test
    @DisplayName("Les rôles sont reconnus quelle que soit la casse")
    void roleInsensibleALaCasse() {
        authenticateAs("u-admin", "admin");
        assertTrue(currentUser.isAdmin(), "un rôle en minuscules doit rester reconnu");
    }
}
