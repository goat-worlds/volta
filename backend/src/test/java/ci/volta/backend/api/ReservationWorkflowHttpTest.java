package ci.volta.backend.api;

import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Parcours de réservation traité par VOLTA, à travers la pile HTTP :
 * demande → qualification → accord du fournisseur → confirmation → suivi.
 *
 * Vérifie aussi que le fournisseur d'un autre engin ne peut pas répondre à la
 * place du propriétaire, et que le client ne qualifie ni ne confirme.
 */
@SpringBootTest
class ReservationWorkflowHttpTest {

    @Autowired WebApplicationContext context;
    @Autowired UserRepository users;
    @Autowired EquipmentRepository equipments;
    @Autowired RentalRequestRepository rentals;
    @Autowired AuthService authService;

    MockMvc mvc;
    String adminToken;
    String ownerToken;
    String otherSupplierToken;
    String clientToken;
    String requestId;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        UserAccount admin = account("resa-admin", "ADMIN");
        UserAccount owner = account("resa-owner", "SUPPLIER");
        UserAccount other = account("resa-other", "SUPPLIER");
        UserAccount client = account("resa-client", "CLIENT");
        adminToken = authService.login(admin.email, "secret123").token();
        ownerToken = authService.login(owner.email, "secret123").token();
        otherSupplierToken = authService.login(other.email, "secret123").token();
        clientToken = authService.login(client.email, "secret123").token();

        Equipment eq = new Equipment();
        eq.id = "eq-resa-" + System.nanoTime();
        eq.name = "Engin réservé";
        eq.supplierId = owner.id;
        eq.status = "PUBLISHED";
        eq.level = "SILVER";
        eq.categoryId = "cat-1";
        eq.pricePerDay = 100_000;
        equipments.save(eq);

        RentalRequest r = new RentalRequest();
        r.id = "req-resa-" + System.nanoTime();
        r.reference = "VOL-LOC-TEST-" + System.nanoTime();
        r.equipmentId = eq.id;
        r.supplierId = owner.id;
        r.clientId = client.id;
        r.startDate = LocalDate.now().plusDays(3).toString();
        r.endDate = LocalDate.now().plusDays(10).toString();
        r.location = "Chantier test";
        r.clientName = client.name;
        r.clientEmail = client.email;
        r.status = "PENDING";
        r.createdAt = LocalDate.now().toString();
        requestId = rentals.save(r).id;
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
    @DisplayName("Un autre fournisseur ne peut pas accepter la réservation d'un engin qui n'est pas le sien")
    void autreFournisseurRefuse() throws Exception {
        mvc.perform(post("/api/rental-requests/" + requestId + "/accept")
                   .header("X-Session-Token", otherSupplierToken))
           .andExpect(status().isForbidden());
        assertThat(rentals.findById(requestId).orElseThrow().status).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Le client ne qualifie pas et ne confirme pas : c'est le rôle de VOLTA")
    void clientNeQualifiePas() throws Exception {
        mvc.perform(post("/api/rental-requests/" + requestId + "/qualify")
                   .header("X-Session-Token", clientToken)
                   .contentType(MediaType.APPLICATION_JSON).content("{\"note\":\"x\"}"))
           .andExpect(status().isForbidden());
        mvc.perform(post("/api/rental-requests/" + requestId + "/confirm")
                   .header("X-Session-Token", clientToken))
           .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Parcours complet : qualification, accord fournisseur, confirmation, démarrage, clôture")
    void parcoursComplet() throws Exception {
        mvc.perform(post("/api/rental-requests/" + requestId + "/qualify")
                   .header("X-Session-Token", adminToken)
                   .contentType(MediaType.APPLICATION_JSON)
                   .content("{\"note\":\"Disponibilité et conditions vérifiées\"}"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("QUALIFIED"))
           .andExpect(jsonPath("$.adminNote").value("Disponibilité et conditions vérifiées"));

        // Confirmer avant l'accord du fournisseur est un conflit d'état.
        mvc.perform(post("/api/rental-requests/" + requestId + "/confirm")
                   .header("X-Session-Token", adminToken))
           .andExpect(status().isConflict());

        mvc.perform(post("/api/rental-requests/" + requestId + "/accept")
                   .header("X-Session-Token", ownerToken))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("ACCEPTED"));

        mvc.perform(post("/api/rental-requests/" + requestId + "/confirm")
                   .header("X-Session-Token", adminToken))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mvc.perform(post("/api/rental-requests/" + requestId + "/start")
                   .header("X-Session-Token", adminToken))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mvc.perform(post("/api/rental-requests/" + requestId + "/complete")
                   .header("X-Session-Token", adminToken))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.status").value("COMPLETED"));

        // Chaque étape a laissé une trace dans le journal.
        mvc.perform(get("/api/audit/RENTAL_REQUEST/" + requestId)
                   .header("X-Session-Token", adminToken))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.length()").value(5));

        // Le journal est réservé à l'administration.
        mvc.perform(get("/api/audit")
                   .header("X-Session-Token", ownerToken))
           .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("L'annulation exige un motif")
    void annulationSansMotif() throws Exception {
        mvc.perform(post("/api/rental-requests/" + requestId + "/cancel")
                   .header("X-Session-Token", adminToken)
                   .contentType(MediaType.APPLICATION_JSON).content("{\"note\":\"\"}"))
           .andExpect(status().isBadRequest());
    }
}
