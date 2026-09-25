package ci.volta.backend.web;

import ci.volta.backend.service.PublicRequestService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Demandes des parcours publics : location, achat libre, technicien, offre
 * d'engin, catalogue, GOLD, accompagnement, candidature technique.
 *
 * Trois publics, trois familles de routes, comme Volta Market :
 *   - le dépôt et le suivi (/public/requests) sont ouverts à tous — on
 *     candidate ou on demande sans compte ;
 *   - la console (/admin/requests) est réservée à l'équipe VOLTA, qui
 *     qualifie et fait avancer chaque dossier.
 *
 * Les règles de rôle sont dans SecurityConfig ; le contrôle d'accès (secret de
 * suivi, rôle ADMIN) est vérifié dans PublicRequestService.
 */
@RestController
@RequestMapping("/api")
public class PublicRequestController {

    private final PublicRequestService service;

    public PublicRequestController(PublicRequestService service) {
        this.service = service;
    }

    // --- Dépôt et suivi publics ---

    @PostMapping("/public/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public PublicRequestService.CreateRequestReceipt create(@RequestBody PublicRequestService.CreateRequestInput body) {
        return service.createRequest(body);
    }

    @GetMapping("/public/requests/track/{reference}")
    public PublicRequestService.PublicRequestTracking track(@PathVariable String reference,
                                                            @RequestParam(required = false) String token) {
        return service.track(reference, token);
    }

    // --- Console d'administration ---

    @GetMapping("/admin/requests")
    public List<PublicRequestService.AdminView> list() {
        return service.listAll();
    }

    @GetMapping("/admin/requests/{id}")
    public PublicRequestService.RequestDetail detail(@PathVariable String id) {
        return service.get(id);
    }

    public record StatusInput(String status, String notes) {
    }

    public record MeetingInput(String meetingAt, String meetingNote) {
    }

    public record OrientationInput(String orientation, String note) {
    }

    public record SelectInput(String note) {
    }

    /**
     * VOLTA retient le dossier : un geste, et il atteint l'étape où le travail
     * commence vraiment. Les mêmes transitions que « statut », enchaînées.
     */
    @PostMapping("/admin/requests/{id}/select")
    public PublicRequestService.AdvanceResult select(@PathVariable String id,
                                                      @RequestBody(required = false) SelectInput body) {
        return service.select(id, body == null ? null : body.note());
    }

    /**
     * Décision du responsable académie après les rencontres : équipe
     * technique, stage, ou réseau de consultants externes.
     */
    @PostMapping("/admin/requests/{id}/orientation")
    public PublicRequestService.AdminView setOrientation(@PathVariable String id,
                                                         @RequestBody OrientationInput body) {
        return service.setOrientation(id, body.orientation(), body.note());
    }

    /**
     * VOLTA fixe la rencontre. Le candidat la lit ensuite avec sa référence,
     * sur la page de suivi : c'est la seule information qu'il attend.
     */
    @PostMapping("/admin/requests/{id}/meeting")
    public PublicRequestService.AdminView scheduleMeeting(@PathVariable String id,
                                                          @RequestBody MeetingInput body) {
        return service.scheduleMeeting(id, body.meetingAt(), body.meetingNote());
    }

    @PostMapping("/admin/requests/{id}/status")
    public PublicRequestService.AdvanceResult advance(@PathVariable String id, @RequestBody StatusInput body) {
        return service.advance(id, body == null ? null : body.status(), body == null ? null : body.notes());
    }

    @GetMapping("/admin/requests/{id}/attachments/{attachmentId}")
    public ResponseEntity<ByteArrayResource> download(@PathVariable String id, @PathVariable String attachmentId) {
        PublicRequestService.DownloadedFile file = service.downloadAttachment(id, attachmentId);
        String contentType = file.contentType() == null || file.contentType().isBlank()
                ? "application/octet-stream" : file.contentType();
        String safeName = file.originalName() == null ? "piece-jointe" : file.originalName().replace("\"", "");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeName + "\"")
                .body(new ByteArrayResource(file.bytes()));
    }
}
