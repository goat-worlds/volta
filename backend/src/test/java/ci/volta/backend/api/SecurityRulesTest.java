package ci.volta.backend.api;

import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests négatifs de sécurité, exécutés à travers la pile HTTP complète.
 *
 * Ils vérifient ce qu'un utilisateur ne doit PAS pouvoir faire. Un test qui
 * confirme qu'un fournisseur peut créer un équipement ne prouve rien sur
 * l'isolation ; seul un test qui échoue quand il devrait échouer la démontre.
 *
 * Passer par MockMvc plutôt que par le service permet d'inclure le filtre
 * d'authentification et les règles d'autorisation dans ce qui est testé — c'est
 * précisément la chaîne où se logeaient les défauts.
 *
 * Nommé Test et non IT bien qu'il traverse toute la pile : il s'exécute sur une
 * base H2 en mémoire, sans service externe, et doit donc tourner à chaque
 * « mvn test » plutôt qu'être réservé à « verify ».
 */
@SpringBootTest
class SecurityRulesTest {

    @Autowired WebApplicationContext context;
    @Autowired UserRepository users;
    @Autowired EquipmentRepository equipments;
    @Autowired AuthService authService;

    MockMvc mvc;

    String clientAToken;
    String clientBToken;
    String supplierAToken;
    String supplierBToken;
    String technicalToken;
    String adminToken;

    String equipmentOfSupplierA;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        clientAToken = tokenFor("client-a", "CLIENT");
        clientBToken = tokenFor("client-b", "CLIENT");
        supplierAToken = tokenFor("supplier-a", "SUPPLIER");
        supplierBToken = tokenFor("supplier-b", "SUPPLIER");
        technicalToken = tokenFor("technical-a", "TECHNICAL");
        adminToken = tokenFor("admin-a", "ADMIN");

        equipmentOfSupplierA = equipmentOwnedBy(userId("supplier-a"));
    }

    /** Crée le compte s'il n'existe pas et retourne un jeton de session valide. */
    private String tokenFor(String slug, String role) {
        String email = slug + "@volta.test";
        UserAccount user = users.findByEmailIgnoreCase(email).orElseGet(() -> {
            UserAccount u = new UserAccount();
            u.id = "u-" + slug;
            u.name = slug;
            u.email = email;
            u.role = role;
            u.company = slug;
            u.phone = "";
            u.city = "";
            u.passwordHash = authService.encodePassword("secret123");
            return users.save(u);
        });
        // Le rôle est réaffirmé : un compte réutilisé d'un test précédent doit
        // porter celui qu'attend le test courant.
        user.role = role;
        users.save(user);
        return authService.login(email, "secret123").token();
    }

    private String userId(String slug) {
        return users.findByEmailIgnoreCase(slug + "@volta.test").orElseThrow().id;
    }

    private String equipmentOwnedBy(String supplierId) {
        Equipment eq = new Equipment();
        eq.id = "eq-test-" + supplierId;
        eq.name = "Engin de test";
        eq.supplierId = supplierId;
        eq.status = "DRAFT";
        eq.categoryId = "cat-1";
        eq.pricePerDay = 100_000;
        eq.location = "Abidjan";
        return equipments.save(eq).id;
    }

    /**
     * Sérialise un corps de requête sans dépendance JSON.
     *
     * Le projet n'expose pas Jackson au classpath de test ; les charges utiles
     * de ces tests sont assez simples pour être écrites directement.
     */
    private String body(Map<String, Object> payload) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            if (!first) sb.append(',');
            first = false;
            sb.append('"').append(entry.getKey()).append("\":");
            Object value = entry.getValue();
            if (value instanceof Number || value instanceof Boolean) {
                sb.append(value);
            } else {
                sb.append('"').append(String.valueOf(value)).append('"');
            }
        }
        return sb.append('}').toString();
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("Sans authentification")
    class SansAuthentification {

        @Test
        @DisplayName("Un endpoint métier est refusé en 401")
        void endpointMetierRefuse() throws Exception {
            mvc.perform(get("/api/quote-requests")).andExpect(status().isUnauthorized());
            mvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Le catalogue public reste accessible")
        void cataloguePublicAccessible() throws Exception {
            mvc.perform(get("/api/equipment")).andExpect(status().isOk());
            mvc.perform(get("/api/categories")).andExpect(status().isOk());
        }

        @Test
        @DisplayName("Un jeton inventé ne donne aucun accès")
        void jetonInventeRefuse() throws Exception {
            mvc.perform(get("/api/quote-requests").header("Authorization", "Bearer inexistant"))
               .andExpect(status().isUnauthorized());
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("Cloisonnement entre utilisateurs de même rôle")
    class Cloisonnement {

        @Test
        @DisplayName("Un client ne lit pas les demandes d'un autre client")
        void clientNeLitPasLesDemandesDunAutre() throws Exception {
            mvc.perform(get("/api/quote-requests/client/" + userId("client-b"))
                       .header("Authorization", "Bearer " + clientAToken))
               .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Un fournisseur ne lit pas les devis d'un concurrent")
        void fournisseurNeLitPasLesDevisDunConcurrent() throws Exception {
            // Les prix pratiqués par un concurrent ne doivent pas être lisibles
            // en changeant un identifiant dans l'URL.
            mvc.perform(get("/api/quotes/supplier/" + userId("supplier-b"))
                       .header("Authorization", "Bearer " + supplierAToken))
               .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Un fournisseur ne voit pas les demandes adressées à un autre")
        void fournisseurNeVoitPasLesDemandesDunAutre() throws Exception {
            mvc.perform(get("/api/quote-requests/supplier/" + userId("supplier-b"))
                       .header("Authorization", "Bearer " + supplierAToken))
               .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Un fournisseur ne soumet pas l'équipement d'un autre")
        void fournisseurNeSoumetPasLEquipementDunAutre() throws Exception {
            mvc.perform(post("/api/equipment/" + equipmentOfSupplierA + "/submit")
                       .header("Authorization", "Bearer " + supplierBToken))
               .andExpect(status().isForbidden());
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("Franchissement de rôle")
    class FranchissementDeRole {

        @Test
        @DisplayName("Un client n'atteint pas les endpoints d'administration")
        void clientNAtteintPasLAdministration() throws Exception {
            mvc.perform(get("/api/users").header("Authorization", "Bearer " + clientAToken))
               .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Un client ne crée pas de devis")
        void clientNeCreePasDeDevis() throws Exception {
            mvc.perform(post("/api/quotes")
                       .header("Authorization", "Bearer " + clientAToken)
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(body(Map.of("quoteRequestId", "qreq-x", "price", 1000))))
               .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Un fournisseur ne publie pas son propre équipement")
        void fournisseurNePubliePasSonEquipement() throws Exception {
            // La publication est une décision d'administration : autoriser le
            // fournisseur reviendrait à supprimer la vérification.
            mvc.perform(post("/api/equipment/" + equipmentOfSupplierA + "/publish")
                       .header("Authorization", "Bearer " + supplierAToken))
               .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Un fournisseur n'attribue pas son propre niveau")
        void fournisseurNAttribuePasSonNiveau() throws Exception {
            mvc.perform(post("/api/equipment/" + equipmentOfSupplierA + "/reference")
                       .header("Authorization", "Bearer " + supplierAToken)
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(body(Map.of("level", "GOLD"))))
               .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("L'équipe technique ne publie pas et n'attribue pas de niveau")
        void techniqueNeDecidePas() throws Exception {
            // L'équipe technique constate, l'administration décide.
            mvc.perform(post("/api/equipment/" + equipmentOfSupplierA + "/publish")
                       .header("Authorization", "Bearer " + technicalToken))
               .andExpect(status().isForbidden());

            mvc.perform(post("/api/equipment/" + equipmentOfSupplierA + "/reference")
                       .header("Authorization", "Bearer " + technicalToken)
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(body(Map.of("level", "GOLD"))))
               .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Un client n'assigne pas d'inspection")
        void clientNAssignePasDInspection() throws Exception {
            mvc.perform(post("/api/inspections")
                       .header("Authorization", "Bearer " + clientAToken)
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(body(Map.of("equipmentId", equipmentOfSupplierA,
                                            "technicalTeamId", userId("technical-a")))))
               .andExpect(status().isForbidden());
        }
    }

    // ------------------------------------------------------------------
    @Nested
    @DisplayName("Transitions interdites")
    class TransitionsInterdites {

        @Test
        @DisplayName("Un brouillon ne se publie pas, même par l'administration")
        void brouillonNonPubliableParAdmin() throws Exception {
            // Le rôle donne le droit d'agir, pas celui de sauter les étapes.
            mvc.perform(post("/api/equipment/" + equipmentOfSupplierA + "/publish")
                       .header("Authorization", "Bearer " + adminToken))
               .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Un équipement non inspecté ne se classe pas")
        void classementAvantInspectionRefuse() throws Exception {
            mvc.perform(post("/api/equipment/" + equipmentOfSupplierA + "/reference")
                       .header("Authorization", "Bearer " + adminToken)
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(body(Map.of("level", "GOLD"))))
               .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Une inspection ne s'assigne pas à un équipement en brouillon")
        void assignationSurBrouillonRefusee() throws Exception {
            mvc.perform(post("/api/inspections")
                       .header("Authorization", "Bearer " + adminToken)
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(body(Map.of("equipmentId", equipmentOfSupplierA,
                                            "technicalTeamId", userId("technical-a")))))
               .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Une inspection ne s'assigne pas à un non-technicien")
        void assignationAUnNonTechnicienRefusee() throws Exception {
            // Assigner à un fournisseur lui donnerait la main sur la
            // vérification de son propre matériel.
            Equipment submitted = equipments.findById(equipmentOfSupplierA).orElseThrow();
            submitted.status = "SUBMITTED";
            equipments.save(submitted);

            mvc.perform(post("/api/inspections")
                       .header("Authorization", "Bearer " + adminToken)
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(body(Map.of("equipmentId", equipmentOfSupplierA,
                                            "technicalTeamId", userId("supplier-b")))))
               .andExpect(status().isBadRequest());
        }
    }
}
