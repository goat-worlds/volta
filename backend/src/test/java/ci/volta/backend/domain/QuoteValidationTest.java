package ci.volta.backend.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Validation des données de devis.
 *
 * Ces contrôles existent côté serveur parce qu'une vérification faite dans le
 * navigateur ne protège de rien : l'API est appelable directement.
 */
class QuoteValidationTest {

    private void assertBadRequest(Runnable action, String expectedFragment) {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, action::run);
        assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode(),
                "une donnée invalide doit donner 400, pas " + e.getStatusCode());
        assertTrue(e.getReason() != null && e.getReason().toLowerCase().contains(expectedFragment.toLowerCase()),
                "message obtenu : " + e.getReason());
    }

    @Test
    @DisplayName("Un prix nul ou négatif est refusé")
    void prixNonPositifRefuse() {
        assertBadRequest(() -> QuoteValidation.checkPrice(0), "strictement positif");
        assertBadRequest(() -> QuoteValidation.checkPrice(-1), "strictement positif");
        assertBadRequest(() -> QuoteValidation.checkPrice(Long.MIN_VALUE), "strictement positif");
    }

    @Test
    @DisplayName("Un prix positif raisonnable passe")
    void prixValidePasse() {
        assertDoesNotThrow(() -> QuoteValidation.checkPrice(1));
        assertDoesNotThrow(() -> QuoteValidation.checkPrice(750_000));
    }

    @Test
    @DisplayName("Un prix démesuré est refusé : c'est une erreur de saisie")
    void prixDemesureRefuse() {
        assertBadRequest(() -> QuoteValidation.checkPrice(Long.MAX_VALUE), "plafond");
    }

    @Test
    @DisplayName("Une quantité nulle ou négative est refusée")
    void quantiteNonPositiveRefusee() {
        assertBadRequest(() -> QuoteValidation.checkQuantity(0), "strictement positive");
        assertBadRequest(() -> QuoteValidation.checkQuantity(-3), "strictement positive");
        assertDoesNotThrow(() -> QuoteValidation.checkQuantity(1));
    }

    @Test
    @DisplayName("Un délai négatif est refusé, zéro reste admis")
    void delaiNegatifRefuse() {
        assertBadRequest(() -> QuoteValidation.checkDeliveryTime(-1), "négatif");
        // Zéro signifie une mise à disposition immédiate : c'est légitime.
        assertDoesNotThrow(() -> QuoteValidation.checkDeliveryTime(0));
    }

    @Test
    @DisplayName("Une date de fin antérieure au début est refusée")
    void periodeInverseeRefusee() {
        assertBadRequest(
                () -> QuoteValidation.checkPeriod("2026-06-10", "2026-06-01"),
                "précède");
    }

    @Test
    @DisplayName("Une période cohérente passe, y compris sur une seule journée")
    void periodeCoherentePasse() {
        assertDoesNotThrow(() -> QuoteValidation.checkPeriod("2026-06-01", "2026-06-10"));
        assertDoesNotThrow(() -> QuoteValidation.checkPeriod("2026-06-01", "2026-06-01"));
    }

    @Test
    @DisplayName("Une période démesurée est refusée")
    void periodeDemesureeRefusee() {
        assertBadRequest(
                () -> QuoteValidation.checkPeriod("2026-01-01", "2040-01-01"),
                "durée maximale");
    }

    @Test
    @DisplayName("Des dates absentes ou illisibles ne bloquent pas")
    void datesAbsentesTolerees() {
        // Le modèle stocke les dates en texte libre et certaines demandes
        // existantes n'en portent pas.
        assertDoesNotThrow(() -> QuoteValidation.checkPeriod(null, null));
        assertDoesNotThrow(() -> QuoteValidation.checkPeriod("2026-06-01", null));
        assertDoesNotThrow(() -> QuoteValidation.checkPeriod("la semaine prochaine", "plus tard"));
    }

    @Test
    @DisplayName("Une validité déjà dépassée à la création est refusée")
    void validiteDepasseeRefusee() {
        String hier = LocalDate.now().minusDays(1).toString();
        assertBadRequest(() -> QuoteValidation.checkValidUntil(hier), "dépassée");
    }

    @Test
    @DisplayName("Un champ requis vide est refusé")
    void champRequisVideRefuse() {
        assertBadRequest(() -> QuoteValidation.checkRequired(null, "L'équipement"), "requis");
        assertBadRequest(() -> QuoteValidation.checkRequired("   ", "L'équipement"), "requis");
        assertDoesNotThrow(() -> QuoteValidation.checkRequired("eq-1", "L'équipement"));
    }
}
