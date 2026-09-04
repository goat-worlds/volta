package ci.volta.backend.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Cycle de vie d'un équipement.
 *
 * Le parcours de vérification est la promesse centrale de VOLTA : un engin
 * publié a été inspecté puis classé. Ces règles sont ce qui empêche cette
 * promesse d'être contournée.
 */
class EquipmentWorkflowTest {

    private void assertConflict(Runnable action, String fragment) {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, action::run);
        assertEquals(HttpStatus.CONFLICT, e.getStatusCode(),
                "un état incompatible doit donner 409, pas " + e.getStatusCode());
        assertTrue(e.getReason() != null && e.getReason().toLowerCase().contains(fragment.toLowerCase()),
                "message obtenu : " + e.getReason());
    }

    @Nested
    @DisplayName("Parcours nominal")
    class ParcoursNominal {

        @Test
        @DisplayName("Le chemin complet du brouillon à la publication est autorisé")
        void cheminComplet() {
            assertDoesNotThrow(() -> {
                EquipmentWorkflow.checkTransition(EquipmentWorkflow.DRAFT, EquipmentWorkflow.SUBMITTED);
                EquipmentWorkflow.checkTransition(EquipmentWorkflow.SUBMITTED, EquipmentWorkflow.PENDING_INSPECTION);
                EquipmentWorkflow.checkTransition(EquipmentWorkflow.PENDING_INSPECTION, EquipmentWorkflow.INSPECTION_IN_PROGRESS);
                EquipmentWorkflow.checkTransition(EquipmentWorkflow.INSPECTION_IN_PROGRESS, EquipmentWorkflow.REPORT_SUBMITTED);
                EquipmentWorkflow.checkTransition(EquipmentWorkflow.REPORT_SUBMITTED, EquipmentWorkflow.PENDING_ADMIN_REVIEW);
                EquipmentWorkflow.checkTransition(EquipmentWorkflow.PENDING_ADMIN_REVIEW, EquipmentWorkflow.REFERENCED);
                EquipmentWorkflow.checkTransition(EquipmentWorkflow.REFERENCED, EquipmentWorkflow.PUBLISHED);
            });
        }

        @Test
        @DisplayName("Un équipement refusé peut être repris en brouillon")
        void refusRevientAuFournisseur() {
            // Refuser un engin ne bannit pas son propriétaire : il corrige et resoumet.
            assertDoesNotThrow(() -> EquipmentWorkflow.checkTransition(
                    EquipmentWorkflow.REJECTED, EquipmentWorkflow.DRAFT));
        }
    }

    @Nested
    @DisplayName("Publication")
    class Publication {

        @Test
        @DisplayName("Un brouillon ne peut pas être publié directement")
        void brouillonNonPubliable() {
            assertConflict(
                    () -> EquipmentWorkflow.checkTransition(EquipmentWorkflow.DRAFT, EquipmentWorkflow.PUBLISHED),
                    "inspecté puis classé");
        }

        @Test
        @DisplayName("Un équipement seulement soumis ne peut pas être publié")
        void soumisNonPubliable() {
            assertConflict(
                    () -> EquipmentWorkflow.checkTransition(EquipmentWorkflow.SUBMITTED, EquipmentWorkflow.PUBLISHED),
                    "inspecté puis classé");
        }

        @Test
        @DisplayName("Un équipement refusé ne peut pas être publié")
        void refuseNonPubliable() {
            assertConflict(
                    () -> EquipmentWorkflow.checkTransition(EquipmentWorkflow.REJECTED, EquipmentWorkflow.PUBLISHED),
                    "inspecté puis classé");
        }

        @Test
        @DisplayName("La publication exige un niveau attribué")
        void publicationSansNiveauRefusee() {
            // Sans niveau, l'engin apparaîtrait au catalogue sans la mention qui
            // justifie sa présence.
            assertConflict(
                    () -> EquipmentWorkflow.checkCanBePublished(EquipmentWorkflow.REFERENCED, null),
                    "attribuez un niveau");
            assertConflict(
                    () -> EquipmentWorkflow.checkCanBePublished(EquipmentWorkflow.REFERENCED, "  "),
                    "attribuez un niveau");
        }

        @Test
        @DisplayName("Avec un niveau et depuis REFERENCED, la publication passe")
        void publicationValide() {
            assertDoesNotThrow(() -> EquipmentWorkflow.checkCanBePublished(
                    EquipmentWorkflow.REFERENCED, "GOLD"));
        }
    }

    @Nested
    @DisplayName("Classement commercial")
    class Classement {

        @Test
        @DisplayName("Un équipement non inspecté ne peut pas être classé")
        void classementAvantInspectionRefuse() {
            // Attribuer un GOLD à un engin jamais examiné viderait la mention de
            // son sens.
            assertConflict(
                    () -> EquipmentWorkflow.checkCanBeReferenced(EquipmentWorkflow.DRAFT),
                    "inspection soit terminée");
            assertConflict(
                    () -> EquipmentWorkflow.checkCanBeReferenced(EquipmentWorkflow.SUBMITTED),
                    "inspection soit terminée");
            assertConflict(
                    () -> EquipmentWorkflow.checkCanBeReferenced(EquipmentWorkflow.PENDING_INSPECTION),
                    "inspection soit terminée");
        }

        @Test
        @DisplayName("Après rapport d'inspection, le classement est possible")
        void classementApresRapport() {
            assertDoesNotThrow(() -> EquipmentWorkflow.checkCanBeReferenced(EquipmentWorkflow.REPORT_SUBMITTED));
            assertDoesNotThrow(() -> EquipmentWorkflow.checkCanBeReferenced(EquipmentWorkflow.PENDING_ADMIN_REVIEW));
        }

        @Test
        @DisplayName("Seuls BASIC, SILVER et GOLD sont acceptés")
        void niveauxReconnus() {
            assertDoesNotThrow(() -> EquipmentWorkflow.checkLevel("BASIC"));
            assertDoesNotThrow(() -> EquipmentWorkflow.checkLevel("silver"));
            assertDoesNotThrow(() -> EquipmentWorkflow.checkLevel("GOLD"));

            ResponseStatusException e = assertThrows(ResponseStatusException.class,
                    () -> EquipmentWorkflow.checkLevel("PLATINUM"));
            assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
            assertThrows(ResponseStatusException.class, () -> EquipmentWorkflow.checkLevel(null));
        }
    }

    @Nested
    @DisplayName("Assignation d'inspection")
    class Assignation {

        @Test
        @DisplayName("Une inspection ne s'assigne qu'à un équipement soumis")
        void assignationDepuisSoumisSeulement() {
            assertDoesNotThrow(() -> EquipmentWorkflow.checkTransition(
                    EquipmentWorkflow.SUBMITTED, EquipmentWorkflow.PENDING_INSPECTION));

            assertConflict(
                    () -> EquipmentWorkflow.checkTransition(
                            EquipmentWorkflow.DRAFT, EquipmentWorkflow.PENDING_INSPECTION),
                    "équipement soumis");
            assertConflict(
                    () -> EquipmentWorkflow.checkTransition(
                            EquipmentWorkflow.PUBLISHED, EquipmentWorkflow.PENDING_INSPECTION),
                    "équipement soumis");
        }

        @Test
        @DisplayName("Une inspection déjà en cours ne se relance pas")
        void pasDeRelanceInspection() {
            // Le refus est motivé par la cible visée — une assignation — et non
            // par une formule générique : c'est ce message que verra l'admin.
            assertConflict(
                    () -> EquipmentWorkflow.checkTransition(
                            EquipmentWorkflow.INSPECTION_IN_PROGRESS, EquipmentWorkflow.PENDING_INSPECTION),
                    "équipement soumis");
        }
    }

    @Test
    @DisplayName("Un statut inconnu est refusé plutôt que laissé passer")
    void statutInconnuRefuse() {
        assertConflict(
                () -> EquipmentWorkflow.checkTransition("EN_ATTENTE", EquipmentWorkflow.PUBLISHED),
                "inconnu");
    }

    @Test
    @DisplayName("Un statut absent est traité comme un brouillon")
    void statutAbsentTraiteCommeBrouillon() {
        assertDoesNotThrow(() -> EquipmentWorkflow.checkTransition(null, EquipmentWorkflow.SUBMITTED));
    }
}
