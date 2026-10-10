package ci.volta.backend.web;

import ci.volta.backend.model.UserAccount;
import ci.volta.backend.service.CompanyContractService;
import java.util.List;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Le contrat de collaboration : signature par l'entreprise, validation par VOLTA.
 *
 * Deux moments distincts et deux mains distinctes. Les confondre — ouvrir les
 * fonctions dès la signature — reviendrait à faire de la vérification des
 * pièces une formalité qu'on accomplit après coup, c'est-à-dire jamais.
 */
@RestController
@RequestMapping("/api")
public class CompanyContractController {

    private final CompanyContractService service;

    public CompanyContractController(CompanyContractService service) {
        this.service = service;
    }

    public record MotifBody(String motif) {
    }

    /** L'entreprise signe. */
    @PostMapping("/me/contract")
    public UserAccount accept() {
        return service.accept();
    }

    /** Les dossiers entreprises à vérifier, et ceux déjà ouverts. */
    @GetMapping("/admin/companies")
    public List<UserAccount> companies() {
        return service.listCompanies();
    }

    @PostMapping("/admin/companies/{id}/validate")
    public UserAccount validate(@PathVariable String id) {
        return service.validate(id);
    }

    @PostMapping("/admin/companies/{id}/revoke")
    public UserAccount revoke(@PathVariable String id,
                              @RequestBody(required = false) MotifBody body) {
        return service.revoke(id, body == null ? null : body.motif());
    }

    /** La pièce du gérant, servie en pièce jointe pour être ouverte, pas devinée. */
    @GetMapping("/admin/companies/{id}/piece-gerant")
    public ResponseEntity<ByteArrayResource> managerId(@PathVariable String id) {
        CompanyContractService.PieceTelechargee piece = service.managerId(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(piece.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + piece.originalName().replace("\"", "") + "\"")
                .body(new ByteArrayResource(piece.bytes()));
    }
}
