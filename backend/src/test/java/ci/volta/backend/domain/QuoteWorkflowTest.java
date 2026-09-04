package ci.volta.backend.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Règles de transition du workflow de devis.
 *
 * Ces règles décident de ce qui peut arriver à un devis. Une transition oubliée
 * ici, et c'est une double acceptation ou une location créée deux fois pour un
 * seul besoin.
 */
class QuoteWorkflowTest {

    /** Vérifie qu'une action est refusée avec le code attendu. */
    private void assertConflict(Runnable action, String expectedFragment) {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, action::run);
        assertEquals(HttpStatus.CONFLICT, e.getStatusCode(),
                "un état incompatible doit donner 409, pas " + e.getStatusCode());
        assertTrue(e.getReason() != null && e.getReason().toLowerCase().contains(expectedFragment.toLowerCase()),
                "message obtenu : " + e.getReason());
    }

    @Nested
    @DisplayName("Transitions de devis")
    class Transitions {

        @Test
        @DisplayName("Un devis envoyé peut être accepté ou refusé")
        void devisEnvoyeEstDecidable() {
            assertDoesNotThrow(() -> QuoteWorkflow.checkQuoteTransition(
                    QuoteWorkflow.QUOTE_SENT, QuoteWorkflow.QUOTE_ACCEPTED));
            assertDoesNotThrow(() -> QuoteWorkflow.checkQuoteTransition(
                    QuoteWorkflow.QUOTE_SENT, QuoteWorkflow.QUOTE_REJECTED));
        }

        @Test
        @DisplayName("Un devis déjà accepté ne peut pas l'être une seconde fois")
        void doubleAcceptationRefusee() {
            assertConflict(
                    () -> QuoteWorkflow.checkQuoteTransition(
                            QuoteWorkflow.QUOTE_ACCEPTED, QuoteWorkflow.QUOTE_ACCEPTED),
                    "déjà été accepté");
        }

        @Test
        @DisplayName("Un devis refusé ne peut pas être accepté ensuite")
        void refuseVersAccepteInterdit() {
            assertConflict(
                    () -> QuoteWorkflow.checkQuoteTransition(
                            QuoteWorkflow.QUOTE_REJECTED, QuoteWorkflow.QUOTE_ACCEPTED),
                    "refusé");
        }

        @Test
        @DisplayName("Un devis accepté ne peut plus être refusé")
        void accepteVersRefuseInterdit() {
            assertConflict(
                    () -> QuoteWorkflow.checkQuoteTransition(
                            QuoteWorkflow.QUOTE_ACCEPTED, QuoteWorkflow.QUOTE_REJECTED),
                    "déjà été accepté");
        }

        @Test
        @DisplayName("Un statut absent est traité comme un devis envoyé")
        void statutAbsentTraiteCommeEnvoye() {
            assertDoesNotThrow(() -> QuoteWorkflow.checkQuoteTransition(
                    null, QuoteWorkflow.QUOTE_ACCEPTED));
            assertDoesNotThrow(() -> QuoteWorkflow.checkQuoteTransition(
                    "  ", QuoteWorkflow.QUOTE_ACCEPTED));
        }

        @Test
        @DisplayName("La casse du statut n'ouvre pas de contournement")
        void casseIgnoree() {
            assertConflict(
                    () -> QuoteWorkflow.checkQuoteTransition("accepted", QuoteWorkflow.QUOTE_ACCEPTED),
                    "déjà été accepté");
        }

        @Test
        @DisplayName("Un statut inconnu est refusé plutôt que laissé passer")
        void statutInconnuRefuse() {
            assertConflict(
                    () -> QuoteWorkflow.checkQuoteTransition("BROUILLON", QuoteWorkflow.QUOTE_ACCEPTED),
                    "inconnu");
        }
    }

    @Nested
    @DisplayName("Demandes de devis")
    class Demandes {

        @Test
        @DisplayName("Une demande en attente accueille de nouveaux devis")
        void demandeEnAttenteAccueilleDevis() {
            assertDoesNotThrow(() -> QuoteWorkflow.checkRequestAcceptsQuotes(
                    QuoteWorkflow.REQUEST_PENDING));
        }

        @Test
        @DisplayName("Une demande déjà tranchée n'accueille plus de devis")
        void demandeTrancheeFermee() {
            assertConflict(
                    () -> QuoteWorkflow.checkRequestAcceptsQuotes(QuoteWorkflow.REQUEST_ACCEPTED),
                    "déjà traitée");
            assertConflict(
                    () -> QuoteWorkflow.checkRequestAcceptsQuotes(QuoteWorkflow.REQUEST_DECLINED),
                    "déjà traitée");
        }
    }

    @Nested
    @DisplayName("Validité dans le temps")
    class Validite {

        @Test
        @DisplayName("Un devis expiré ne peut plus être accepté")
        void devisExpireRefuse() {
            String hier = LocalDate.now().minusDays(1).toString();
            assertConflict(() -> QuoteWorkflow.checkStillValid(hier), "expiré");
        }

        @Test
        @DisplayName("Un devis encore valide passe")
        void devisValidePasse() {
            String demain = LocalDate.now().plusDays(1).toString();
            assertDoesNotThrow(() -> QuoteWorkflow.checkStillValid(demain));
        }

        @Test
        @DisplayName("Une date absente ou illisible ne bloque pas")
        void dateAbsenteNeBloquePas() {
            // Le champ est facultatif dans le modèle : refuser sur une donnée
            // manquante bloquerait des devis parfaitement valides.
            assertDoesNotThrow(() -> QuoteWorkflow.checkStillValid(null));
            assertDoesNotThrow(() -> QuoteWorkflow.checkStillValid(""));
            assertDoesNotThrow(() -> QuoteWorkflow.checkStillValid("bientôt"));
        }
    }
}
