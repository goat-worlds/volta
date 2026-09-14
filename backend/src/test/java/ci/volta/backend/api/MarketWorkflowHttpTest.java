package ci.volta.backend.api;

import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.PurchaseRequestRepository;
import ci.volta.backend.repository.SaleListingRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Volta Market à travers la pile HTTP : le vendeur rédige et soumet, VOLTA
 * publie et met en avant, un visiteur sans compte demande une offre et la
 * suit par sa référence, VOLTA fait avancer la demande.
 *
 * Vérifie aussi ce qui ne doit pas se voir : une annonce non publiée reste
 * invisible du public, et le vendeur ne reçoit pas les coordonnées de
 * l'acheteur.
 */
@SpringBootTest
class MarketWorkflowHttpTest {

    @Autowired WebApplicationContext context;
    @Autowired UserRepository users;
    @Autowired SaleListingRepository listings;
    @Autowired PurchaseRequestRepository purchases;
    @Autowired AuthService authService;

    MockMvc mvc;
    String adminToken;
    String sellerToken;
    String otherSellerToken;

    private static final String LISTING_BODY = """
            {"title":"Pelle test 20 t","categoryId":"c-pelle","brand":"Komatsu","model":"PC200",
             "year":2018,"hours":4000,"location":"Abidjan","condition":"OCCASION",
             "askingPrice":50000000,"negotiable":true,"description":"Bon état général",
             "photos":["/engins/pelle-komatsu.jpeg"],"documents":[]}
            """;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        UserAccount admin = account("mkt-admin", "ADMIN");
        UserAccount seller = account("mkt-seller", "SUPPLIER");
        UserAccount other = account("mkt-other", "SUPPLIER");
        adminToken = authService.login(admin.email, "secret123").token();
        sellerToken = authService.login(seller.email, "secret123").token();
        otherSellerToken = authService.login(other.email, "secret123").token();
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

    private String createDraft() throws Exception {
        MvcResult created = mvc.perform(post("/api/market/listings")
                   .header("X-Session-Token", sellerToken)
                   .contentType(MediaType.APPLICATION_JSON).content(LISTING_BODY))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.status").value("DRAFT"))
           .andReturn();
        return extract(created.getResponse().getContentAsString(), "\"id\":\"([^\"]+)\"");
    }

    private static String extract(String json, String regex) {
        Matcher m = Pattern.compile(regex).matcher(json);
        assertThat(m.find()).as("champ attendu dans " + json).isTrue();
        return m.group(1);
    }

    @Test
    @DisplayName("Un brouillon n'apparaît pas dans la vitrine et sa fiche répond 404 au public")
    void brouillonInvisible() throws Exception {
        String id = createDraft();
        mvc.perform(get("/api/market/listings"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[*].id", not(hasItem(id))));
        mvc.perform(get("/api/market/listings/" + id))
           .andExpect(status().isNotFound());
        // Son vendeur, lui, la voit.
        mvc.perform(get("/api/market/listings/" + id).header("X-Session-Token", sellerToken))
           .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Un autre vendeur ne soumet pas l'annonce d'autrui ; un vendeur ne publie pas lui-même")
    void proprieteEtRoles() throws Exception {
        String id = createDraft();
        mvc.perform(post("/api/market/listings/" + id + "/submit").header("X-Session-Token", otherSellerToken))
           .andExpect(status().isForbidden());
        mvc.perform(post("/api/market/listings/" + id + "/publish").header("X-Session-Token", sellerToken))
           .andExpect(status().isForbidden());
        // Publier un brouillon jamais soumis est un conflit d'état, même pour VOLTA.
        mvc.perform(post("/api/market/listings/" + id + "/publish").header("X-Session-Token", adminToken))
           .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Parcours complet : soumission, publication, mise en avant, demande d'offre publique, suivi, avancement")
    void parcoursComplet() throws Exception {
        String id = createDraft();

        mvc.perform(post("/api/market/listings/" + id + "/submit").header("X-Session-Token", sellerToken))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("SUBMITTED"));

        // Une offre ne se demande pas sur une annonce non publiée.
        mvc.perform(post("/api/market/listings/" + id + "/requests")
                   .contentType(MediaType.APPLICATION_JSON)
                   .content("{\"contactName\":\"A\",\"contactPhone\":\"1\",\"contactEmail\":\"a@b.c\"}"))
           .andExpect(status().isConflict());

        mvc.perform(post("/api/market/listings/" + id + "/publish").header("X-Session-Token", adminToken))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mvc.perform(post("/api/market/listings/" + id + "/feature")
                   .header("X-Session-Token", adminToken)
                   .contentType(MediaType.APPLICATION_JSON).content("{\"featured\":true}"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.featured").value(true));

        // La vitrine publique la montre, sans l'identité du vendeur.
        mvc.perform(get("/api/market/listings/" + id))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.featured").value(true))
           .andExpect(jsonPath("$.sellerId").doesNotExist());

        // Un visiteur sans compte demande une offre.
        MvcResult requested = mvc.perform(post("/api/market/listings/" + id + "/requests")
                   .contentType(MediaType.APPLICATION_JSON)
                   .content("""
                           {"contactName":"Jean Konan","contactCompany":"BTP Konan",
                            "contactPhone":"+225 07 00 00 00","contactEmail":"jean@konan.ci",
                            "contactCity":"Abidjan","quantity":1,"message":"Livraison à Abidjan ?"}
                           """))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.status").value("RECEIVED"))
           .andReturn();
        String body = requested.getResponse().getContentAsString();
        String requestId = extract(body, "\"id\":\"([^\"]+)\"");
        String reference = extract(body, "\"reference\":\"([^\"]+)\"");
        assertThat(reference).startsWith("VOL-ACH-");

        // Le suivi public ne livre que l'avancement.
        mvc.perform(get("/api/market/requests/track/" + reference))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("RECEIVED"))
           .andExpect(jsonPath("$.listingTitle").value("Pelle test 20 t"))
           .andExpect(jsonPath("$.notes").doesNotExist());

        // Le vendeur voit la demande sur son annonce, sans les coordonnées de l'acheteur.
        mvc.perform(get("/api/market/requests").header("X-Session-Token", sellerToken))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].id").value(requestId))
           .andExpect(jsonPath("$[0].contactPhone").value(""))
           .andExpect(jsonPath("$[0].contactEmail").value(""));

        // Sauter une étape est refusé ; avancer d'un cran est accepté.
        mvc.perform(post("/api/market/requests/" + requestId + "/stage")
                   .header("X-Session-Token", adminToken)
                   .contentType(MediaType.APPLICATION_JSON).content("{\"stage\":\"OFFER\"}"))
           .andExpect(status().isConflict());
        mvc.perform(post("/api/market/requests/" + requestId + "/stage")
                   .header("X-Session-Token", adminToken)
                   .contentType(MediaType.APPLICATION_JSON).content("{\"stage\":\"QUALIFYING\",\"notes\":\"Appel passé\"}"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("QUALIFYING"));

        assertThat(purchases.findById(requestId).orElseThrow().notes).contains("Appel passé");
    }

    @Test
    @DisplayName("Une offre exige un montant")
    void offreSansMontantRefusee() throws Exception {
        String id = createDraft();
        mvc.perform(post("/api/market/listings/" + id + "/submit").header("X-Session-Token", sellerToken));
        mvc.perform(post("/api/market/listings/" + id + "/publish").header("X-Session-Token", adminToken));
        String body = mvc.perform(post("/api/market/listings/" + id + "/requests")
                   .contentType(MediaType.APPLICATION_JSON)
                   .content("{\"contactName\":\"A\",\"contactPhone\":\"1\",\"contactEmail\":\"a@b.c\"}"))
           .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String requestId = extract(body, "\"id\":\"([^\"]+)\"");

        for (String stage : new String[] {"QUALIFYING", "AVAILABILITY_CHECK", "COMMERCIAL_REVIEW"}) {
            mvc.perform(post("/api/market/requests/" + requestId + "/stage")
                       .header("X-Session-Token", adminToken)
                       .contentType(MediaType.APPLICATION_JSON).content("{\"stage\":\"" + stage + "\"}"))
               .andExpect(status().isOk());
        }
        mvc.perform(post("/api/market/requests/" + requestId + "/stage")
                   .header("X-Session-Token", adminToken)
                   .contentType(MediaType.APPLICATION_JSON).content("{\"stage\":\"OFFER\"}"))
           .andExpect(status().isBadRequest());
        mvc.perform(post("/api/market/requests/" + requestId + "/stage")
                   .header("X-Session-Token", adminToken)
                   .contentType(MediaType.APPLICATION_JSON).content("{\"stage\":\"OFFER\",\"offerAmount\":48000000}"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.offerAmount").value(48000000));
    }
}
