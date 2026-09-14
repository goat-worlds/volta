package ci.volta.backend.web;

import ci.volta.backend.model.PurchaseRequest;
import ci.volta.backend.model.SaleListing;
import ci.volta.backend.service.MarketService;
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
 * Volta Market.
 *
 * Trois publics, trois familles de routes :
 *   - la vitrine (/listings, /listings/{id}, demande d'offre, suivi) est
 *     ouverte à tous — on achète sans compte ;
 *   - le vendeur gère ses annonces (/listings/mine, création, soumission,
 *     retrait) ;
 *   - l'équipe VOLTA publie, met en avant, rejette, marque vendu et fait
 *     avancer les demandes d'offre.
 *
 * Les règles de rôle sont dans SecurityConfig ; la propriété et les
 * transitions sont vérifiées dans MarketService.
 */
@RestController
@RequestMapping("/api/market")
public class MarketController {

    public record FeatureBody(boolean featured) {
    }

    private final MarketService market;

    public MarketController(MarketService market) {
        this.market = market;
    }

    // --- Vitrine ---

    @GetMapping("/listings")
    public List<MarketService.PublicListing> listings() {
        return market.listPublished();
    }

    /** Déclarée avant /listings/{id} : « mine » n'est pas un identifiant. */
    @GetMapping("/listings/mine")
    public List<SaleListing> myListings() {
        return market.listMine();
    }

    @GetMapping("/listings/{id}")
    public MarketService.PublicListing listing(@PathVariable String id) {
        return market.getPublic(id);
    }

    @PostMapping("/listings/{id}/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseRequest requestOffer(@PathVariable String id, @RequestBody MarketService.PurchaseInput body) {
        return market.requestOffer(id, body);
    }

    @GetMapping("/requests/track/{reference}")
    public MarketService.PurchaseTracking track(@PathVariable String reference) {
        return market.track(reference);
    }

    // --- Vendeur ---

    @PostMapping("/listings")
    @ResponseStatus(HttpStatus.CREATED)
    public SaleListing create(@RequestBody MarketService.ListingInput body) {
        return market.create(body);
    }

    @PutMapping("/listings/{id}")
    public SaleListing update(@PathVariable String id, @RequestBody MarketService.ListingInput body) {
        return market.update(id, body);
    }

    @PostMapping("/listings/{id}/submit")
    public SaleListing submit(@PathVariable String id) {
        return market.submit(id);
    }

    @PostMapping("/listings/{id}/withdraw")
    public SaleListing withdraw(@PathVariable String id) {
        return market.withdraw(id);
    }

    // --- Équipe VOLTA ---

    @PostMapping("/listings/{id}/publish")
    public SaleListing publish(@PathVariable String id) {
        return market.publish(id);
    }

    @PostMapping("/listings/{id}/reject")
    public SaleListing reject(@PathVariable String id, @RequestBody MarketService.ReviewInput body) {
        return market.reject(id, body);
    }

    @PostMapping("/listings/{id}/feature")
    public SaleListing feature(@PathVariable String id, @RequestBody FeatureBody body) {
        return market.feature(id, body.featured());
    }

    @PostMapping("/listings/{id}/sold")
    public SaleListing sold(@PathVariable String id) {
        return market.markSold(id);
    }

    @GetMapping("/requests")
    public List<PurchaseRequest> requests() {
        return market.listRequests();
    }

    @PostMapping("/requests/{id}/stage")
    public PurchaseRequest moveStage(@PathVariable String id, @RequestBody MarketService.StageInput body) {
        return market.moveStage(id, body);
    }
}
