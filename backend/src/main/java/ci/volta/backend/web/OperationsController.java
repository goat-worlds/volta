package ci.volta.backend.web;

import ci.volta.backend.model.Anomaly;
import ci.volta.backend.model.AuditEvent;
import ci.volta.backend.model.Opportunity;
import ci.volta.backend.service.AnomalyService;
import ci.volta.backend.service.AuditService;
import ci.volta.backend.service.OpportunityService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Anomalies de vérification, pipeline commercial et journal d'audit.
 *
 * Les règles de rôle sont dans SecurityConfig ; la propriété et les
 * transitions sont vérifiées dans les services.
 */
@RestController
@RequestMapping("/api")
public class OperationsController {

    private final AnomalyService anomalies;
    private final OpportunityService opportunities;
    private final AuditService audit;

    public OperationsController(AnomalyService anomalies, OpportunityService opportunities, AuditService audit) {
        this.anomalies = anomalies;
        this.opportunities = opportunities;
        this.audit = audit;
    }

    // --- Anomalies ---

    @GetMapping("/anomalies")
    public List<Anomaly> anomalies() {
        return anomalies.listVisible();
    }

    @PostMapping("/anomalies")
    @ResponseStatus(HttpStatus.CREATED)
    public Anomaly openAnomaly(@RequestBody AnomalyService.AnomalyInput body) {
        return anomalies.open(body);
    }

    @PostMapping("/anomalies/{id}/transition")
    public Anomaly transitionAnomaly(@PathVariable String id, @RequestBody AnomalyService.TransitionInput body) {
        return anomalies.transition(id, body);
    }

    // --- Pipeline commercial ---

    @GetMapping("/opportunities")
    public List<Opportunity> opportunities() {
        return opportunities.list();
    }

    @PostMapping("/opportunities")
    @ResponseStatus(HttpStatus.CREATED)
    public Opportunity createOpportunity(@RequestBody OpportunityService.OpportunityInput body) {
        return opportunities.create(body);
    }

    @PutMapping("/opportunities/{id}")
    public Opportunity updateOpportunity(@PathVariable String id,
                                         @RequestBody OpportunityService.OpportunityInput body) {
        return opportunities.update(id, body);
    }

    @PostMapping("/opportunities/{id}/stage")
    public Opportunity moveOpportunity(@PathVariable String id, @RequestBody OpportunityService.StageInput body) {
        return opportunities.moveStage(id, body);
    }

    // --- Journal d'audit ---

    @GetMapping("/audit")
    public List<AuditEvent> auditLog() {
        return audit.listRecent();
    }

    @GetMapping("/audit/{entityType}/{entityId}")
    public List<AuditEvent> auditFor(@PathVariable String entityType, @PathVariable String entityId) {
        return audit.listForEntity(entityType.toUpperCase(), entityId);
    }
}
