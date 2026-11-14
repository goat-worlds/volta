package ci.volta.backend.api;

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
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * La demande de pièces de rechange, déposée comme le ferait le formulaire.
 *
 * <h2>Pourquoi ce test existe</h2>
 *
 * La carte « Acheter des pièces de rechange » promettait un formulaire et
 * menait au catalogue des machines à vendre : le parcours n'avait jamais été
 * écrit. Maintenant qu'il l'est, rien ne garantissait que le serveur accepte
 * son intention — BUY_PARTS n'avait jamais été déposée.
 *
 * <h2>Ce qu'il vérifie, et pourquoi chaque point</h2>
 *
 * Le dépôt <strong>sans compte</strong> : c'est le cas réel. Quelqu'un qui
 * cherche un joint de vérin ne crée pas un compte d'abord, et la route est
 * ouverte pour cela.
 *
 * Le <strong>suivi</strong> : la référence accompagnée de son secret ramène
 * le dossier, et la référence seule ne le ramène pas. Elle se dicte au
 * téléphone et s'écrit sur un bon de commande ; si elle suffisait, qui la
 * lirait par-dessus l'épaule ouvrirait la demande.
 *
 * La <strong>charge conservée</strong> : modèle de machine, référence de pièce
 * et quantité sont ce qui permet à VOLTA d'interroger ses fournisseurs. Une
 * demande qui arrive sans la machine fait perdre deux jours en aller-retour.
 */
@SpringBootTest
class SparePartsRequestHttpTest {

    @Autowired WebApplicationContext context;

    MockMvc mvc;

    private static final String DEMANDE = """
            {"kind":"PURCHASE","intent":"BUY_PARTS",
             "subject":"Pièces — filtre hydraulique pour Komatsu PC210LC-8",
             "location":"Abidjan",
             "contact":{"name":"Kouassi Diabaté","company":"BTP Lagunes",
                        "phone":"0700000099","email":"kouassi@btp-lagunes.ci","city":"Abidjan"},
             "payload":{"machineModel":"Komatsu PC210LC-8","category":"c-pelle",
                        "machineYear":"2018","serialNumber":"KMTPC123456",
                        "partName":"Filtre hydraulique","partReference":"07063-01142",
                        "quantity":"4","condition":"Neuve d'origine","deadline":"Sous 7 jours"},
             "attachments":[]}
            """;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    @DisplayName("Une demande de pièces se dépose sans compte et revient avec sa référence")
    void deposeSansCompte() throws Exception {
        MvcResult cree = mvc.perform(post("/api/public/requests")
                   .contentType(MediaType.APPLICATION_JSON).content(DEMANDE))
           .andExpect(status().isCreated())
           .andReturn();

        String reference = extraire(cree.getResponse().getContentAsString());
        assertThat(reference).as("référence rendue au déposant").isNotBlank();
    }

    @Test
    @DisplayName("La référence ramène le dossier, et ce qu'il faut pour chercher la pièce")
    void suiviParReference() throws Exception {
        MvcResult cree = mvc.perform(post("/api/public/requests")
                   .contentType(MediaType.APPLICATION_JSON).content(DEMANDE))
           .andExpect(status().isCreated())
           .andReturn();
        String corps = cree.getResponse().getContentAsString();
        String reference = extraire(corps);
        String jeton = champ(corps, "trackingToken");

        mvc.perform(get("/api/public/requests/track/" + reference).param("token", jeton))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.reference").value(reference))
           .andExpect(jsonPath("$.intent").value("BUY_PARTS"));
    }

    @Test
    @DisplayName("La référence seule n'ouvre pas le dossier")
    void referenceSeuleInsuffisante() throws Exception {
        // Une référence se dicte au téléphone et s'écrit sur un bon de
        // commande. Si elle suffisait, qui la lirait par-dessus l'épaule
        // ouvrirait la demande : le secret qui l'accompagne est ce qui
        // distingue le déposant d'un curieux.
        MvcResult cree = mvc.perform(post("/api/public/requests")
                   .contentType(MediaType.APPLICATION_JSON).content(DEMANDE))
           .andExpect(status().isCreated())
           .andReturn();
        String reference = extraire(cree.getResponse().getContentAsString());

        mvc.perform(get("/api/public/requests/track/" + reference))
           .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Une demande sans contact est refusée plutôt qu'enregistrée muette")
    void contactExige() throws Exception {
        // Sans téléphone ni email, VOLTA ne peut pas répondre : mieux vaut
        // refuser que créer un dossier auquel personne ne pourra donner suite.
        String sansContact = """
                {"kind":"PURCHASE","intent":"BUY_PARTS","subject":"Pièces","location":"Abidjan",
                 "contact":{"name":"","company":"","phone":"","email":"","city":""},
                 "payload":{"partName":"Filtre"},"attachments":[]}
                """;

        mvc.perform(post("/api/public/requests")
                   .contentType(MediaType.APPLICATION_JSON).content(sansContact))
           .andExpect(status().is4xxClientError());
    }

    private static String champ(String json, String nom) {
        Matcher m = Pattern.compile("\"" + nom + "\":\"([^\"]+)\"").matcher(json);
        assertThat(m.find()).as(nom + " attendu dans " + json).isTrue();
        return m.group(1);
    }

    private static String extraire(String json) {
        Matcher m = Pattern.compile("\"reference\":\"([^\"]+)\"").matcher(json);
        assertThat(m.find()).as("référence attendue dans " + json).isTrue();
        return m.group(1);
    }
}
