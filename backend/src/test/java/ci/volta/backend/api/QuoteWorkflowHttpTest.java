package ci.volta.backend.api;

import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Quote;
import ci.volta.backend.model.QuoteRequest;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.QuoteRepository;
import ci.volta.backend.repository.QuoteRequestRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Codes de retour du workflow de devis, vérifiés à travers la pile HTTP.
 *
 * Un refus doit porter le bon code : 401 dit « identifiez-vous », 409 dit
 * « l'état de la ressource rend cette action impossible ». Les confondre envoie
 * un client se reconnecter alors que sa session est parfaitement valide.
 */
@SpringBootTest
class QuoteWorkflowHttpTest {

    @Autowired WebApplicationContext context;
    @Autowired UserRepository users;
    @Autowired EquipmentRepository equipments;
    @Autowired QuoteRequestRepository requests;
    @Autowired QuoteRepository quotes;
    @Autowired AuthService authService;

    MockMvc mvc;
    String clientToken;
    String clientId;
    String quoteId;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        UserAccount client = account("wf-client", "CLIENT");
        UserAccount supplier = account("wf-supplier", "SUPPLIER");
        clientId = client.id;
        clientToken = authService.login(client.email, "secret123").token();

        Equipment eq = new Equipment();
        eq.id = "eq-wf-" + System.nanoTime();
        eq.name = "Engin workflow";
        eq.supplierId = supplier.id;
        eq.status = "PUBLISHED";
        eq.level = "GOLD";
        eq.categoryId = "cat-1";
        eq.pricePerDay = 100_000;
        equipments.save(eq);

        QuoteRequest req = new QuoteRequest();
        req.id = "qreq-wf-" + System.nanoTime();
        req.equipmentId = eq.id;
        req.clientId = client.id;
        req.supplierId = supplier.id;
        req.status = "PENDING";
        req.quantity = 1;
        req.startDate = LocalDate.now().plusDays(7).toString();
        req.endDate = LocalDate.now().plusDays(14).toString();
        req.clientEmail = client.email;
        req.createdAt = LocalDate.now().toString();
        requests.save(req);

        Quote quote = new Quote();
        quote.id = "q-wf-" + System.nanoTime();
        quote.quoteRequestId = req.id;
        quote.supplierId = supplier.id;
        quote.price = 250_000;
        quote.deliveryTime = 2;
        quote.status = "SENT";
        quote.validUntil = LocalDate.now().plusDays(30).toString();
        quote.createdAt = LocalDate.now().toString();
        quoteId = quotes.save(quote).id;
    }

    private UserAccount account(String slug, String role) {
        String email = slug + "@volta.test";
        UserAccount user = users.findByEmailIgnoreCase(email).orElseGet(() -> {
            UserAccount u = new UserAccount();
            u.id = "u-" + slug;
            u.name = slug;
            u.email = email;
            u.company = slug;
            u.phone = "";
            u.city = "";
            u.passwordHash = authService.encodePassword("secret123");
            return users.save(u);
        });
        user.role = role;
        return users.save(user);
    }

    @Test
    @DisplayName("Une première acceptation aboutit")
    void premiereAcceptationAboutit() throws Exception {
        mvc.perform(post("/api/quotes/" + quoteId + "/accept")
                   .header("Authorization", "Bearer " + clientToken))
           .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Une seconde acceptation est un conflit d'état, pas un défaut d'authentification")
    void doubleAcceptationRenvoie409() throws Exception {
        mvc.perform(post("/api/quotes/" + quoteId + "/accept")
                   .header("Authorization", "Bearer " + clientToken))
           .andExpect(status().isOk());

        // Le jeton est le même et reste valide : renvoyer 401 enverrait le
        // client se reconnecter alors que sa session est intacte.
        mvc.perform(post("/api/quotes/" + quoteId + "/accept")
                   .header("Authorization", "Bearer " + clientToken))
           .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Un devis refusé ne peut plus être accepté")
    void refusePuisAccepteRenvoie409() throws Exception {
        mvc.perform(post("/api/quotes/" + quoteId + "/reject")
                   .header("Authorization", "Bearer " + clientToken))
           .andExpect(status().isOk());

        mvc.perform(post("/api/quotes/" + quoteId + "/accept")
                   .header("Authorization", "Bearer " + clientToken))
           .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Un devis inexistant donne 404, pas 401")
    void devisInexistantRenvoie404() throws Exception {
        mvc.perform(post("/api/quotes/inexistant/accept")
                   .header("Authorization", "Bearer " + clientToken))
           .andExpect(status().isNotFound());
    }
}
