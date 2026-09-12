package ci.volta.backend.domain;

import ci.volta.backend.model.Anomaly;
import ci.volta.backend.model.ChecklistItem;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Le niveau GOLD se mérite : il découle du rapport et des anomalies, jamais
 * d'un simple choix dans une liste.
 */
class QualificationRulesTest {

    private static ChecklistItem item(String result) {
        ChecklistItem c = new ChecklistItem();
        c.section = "Mécanique";
        c.label = "Contrôle";
        c.result = result;
        return c;
    }

    private static Anomaly anomaly(String severity, String status) {
        Anomaly a = new Anomaly();
        a.severity = severity;
        a.status = status;
        return a;
    }

    @Test
    @DisplayName("Tout conforme et aucune anomalie ouverte : GOLD atteignable")
    void goldQuandToutConforme() {
        assertThat(QualificationRules.maxAllowedLevel(
                List.of(item("CONFORME"), item("CONFORME")), List.of())).isEqualTo("GOLD");
    }

    @Test
    @DisplayName("Un point à surveiller plafonne à SILVER")
    void silverAvecPointASurveiller() {
        assertThat(QualificationRules.maxAllowedLevel(
                List.of(item("CONFORME"), item("A_SURVEILLER")), List.of())).isEqualTo("SILVER");
    }

    @Test
    @DisplayName("Une anomalie mineure ouverte interdit GOLD mais pas SILVER")
    void anomalieMineureOuverte() {
        assertThat(QualificationRules.maxAllowedLevel(
                List.of(item("CONFORME")), List.of(anomaly("MINEURE", "OPEN")))).isEqualTo("SILVER");
    }

    @Test
    @DisplayName("Une non-conformité ou une anomalie majeure ouverte plafonne à BASIC")
    void basicAvecNonConformite() {
        assertThat(QualificationRules.maxAllowedLevel(
                List.of(item("NON_CONFORME")), List.of())).isEqualTo("BASIC");
        assertThat(QualificationRules.maxAllowedLevel(
                List.of(item("CONFORME")), List.of(anomaly("MAJEURE", "UNDER_REVIEW")))).isEqualTo("BASIC");
    }

    @Test
    @DisplayName("Demander un niveau au-dessus du plafond est un conflit d'état")
    void niveauTropEleveRefuse() {
        assertThatThrownBy(() -> QualificationRules.checkLevelAllowed("GOLD",
                List.of(item("A_SURVEILLER")), List.of()))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
        QualificationRules.checkLevelAllowed("SILVER", List.of(item("A_SURVEILLER")), List.of());
    }

    @Test
    @DisplayName("Les transitions de réservation et d'anomalie refusent les sauts d'étape")
    void workflowsRefusentLesSauts() {
        RentalWorkflow.checkTransition("PENDING", "QUALIFIED");
        RentalWorkflow.checkTransition("ACCEPTED", "CONFIRMED");
        assertThatThrownBy(() -> RentalWorkflow.checkTransition("PENDING", "CONFIRMED"))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> RentalWorkflow.checkTransition("COMPLETED", "CANCELLED"))
                .isInstanceOf(ResponseStatusException.class);

        AnomalyWorkflow.checkTransition("OPEN", "IN_PROGRESS");
        AnomalyWorkflow.checkTransition("UNDER_REVIEW", "RESOLVED");
        assertThatThrownBy(() -> AnomalyWorkflow.checkTransition("OPEN", "CLOSED"))
                .isInstanceOf(ResponseStatusException.class);

        OpportunityWorkflow.checkTransition("NEW", "CONTACTED");
        OpportunityWorkflow.checkTransition("QUALIFIED", "LOST");
        assertThatThrownBy(() -> OpportunityWorkflow.checkTransition("WON", "NEW"))
                .isInstanceOf(ResponseStatusException.class);
    }
}
