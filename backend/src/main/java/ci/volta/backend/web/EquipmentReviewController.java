package ci.volta.backend.web;

import ci.volta.backend.service.EquipmentReviewService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Les avis sur les engins.
 *
 * La lecture est publique : c'est le propre d'un avis que d'être lu par
 * quelqu'un qui hésite, et celui-là n'a pas encore de compte. L'écriture est
 * réservée à qui a loué la machine, ce que le service vérifie dans les
 * réservations avant d'accepter la ligne.
 */
@RestController
@RequestMapping("/api")
public class EquipmentReviewController {

    private final EquipmentReviewService service;

    public EquipmentReviewController(EquipmentReviewService service) {
        this.service = service;
    }

    @GetMapping("/equipment/{id}/reviews")
    public List<EquipmentReviewService.ReviewView> list(@PathVariable String id) {
        return service.listFor(id);
    }

    /** Les moyennes de tous les engins, en un appel, pour les vignettes. */
    @GetMapping("/equipment/reviews/summaries")
    public List<EquipmentReviewService.ReviewSummary> summaries() {
        return service.summaries();
    }

    /** Le formulaire ne s'affiche qu'à qui peut s'en servir. */
    @GetMapping("/equipment/{id}/reviews/may-post")
    public Map<String, Boolean> mayPost(@PathVariable String id) {
        return Map.of("allowed", service.mayReview(id));
    }

    @PostMapping("/equipment/{id}/reviews")
    public EquipmentReviewService.ReviewView submit(@PathVariable String id,
                                                    @RequestBody EquipmentReviewService.ReviewInput body) {
        return service.submit(id, body);
    }

    public record HiddenBody(boolean hidden) {
    }

    @PostMapping("/admin/reviews/{id}/hidden")
    public void setHidden(@PathVariable String id, @RequestBody HiddenBody body) {
        service.setHidden(id, body != null && body.hidden());
    }
}
