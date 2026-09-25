package ci.volta.backend.service;

import ci.volta.backend.domain.MarketWorkflow;
import ci.volta.backend.model.DocumentInfo;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.PurchaseRequest;
import ci.volta.backend.model.SaleListing;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.PurchaseRequestRepository;
import ci.volta.backend.repository.SaleListingRepository;
import ci.volta.backend.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Volta Market : annonces de vente et demandes d'offre (voir MarketWorkflow).
 *
 * Le vendeur rédige et soumet ; l'équipe VOLTA publie, met en avant, rejette
 * ou marque vendu. L'acheteur — visiteur ou client connecté — dépose une
 * demande d'offre sur une annonce publiée et la suit par sa référence. Aucune
 * coordonnée du vendeur ne transite : la mise en relation est faite par Génie
 * Sélect, pas par la plateforme.
 */
@Service
@Transactional
public class MarketService {

    public record ListingInput(String title, String categoryId, String brand, String model,
                               Integer year, Integer hours, String location, String condition,
                               Long askingPrice, Boolean negotiable, String description,
                               List<String> photos, List<DocumentInfo> documents,
                               String equipmentId) {
    }

    public record ReviewInput(String note) {
    }

    public record PurchaseInput(String contactName, String contactCompany, String contactPhone,
                                String contactEmail, String contactCity, Integer quantity,
                                String message,
                                /** Où livrer, et où l'engin travaillera : deux lieux, souvent distincts. */
                                String deliveryLocation, String usageLocation) {
    }

    public record StageInput(String stage, String notes, Long offerAmount) {
    }

    /**
     * Ce que le public voit d'une annonce : tout sauf l'identité du vendeur.
     *
     * Le champ sellerId n'est pas une coordonnée, mais il permettrait de
     * retrouver l'entreprise dans l'annuaire et de la contacter en direct —
     * ce que le circuit Market interdit précisément.
     */
    public record PublicListing(String id, String reference, String title, String categoryId,
                                String brand, String model, Integer year, Integer hours,
                                String location, String condition, long askingPrice,
                                boolean negotiable, String description, List<String> photos,
                                List<DocumentInfo> documents, boolean featured,
                                String publishedAt) {
        static PublicListing of(SaleListing l) {
            return new PublicListing(l.id, l.reference, l.title, l.categoryId, l.brand, l.model,
                    l.year, l.hours, l.location, l.condition, l.askingPrice, l.negotiable,
                    l.description, l.photos, l.documents, l.featured, l.publishedAt);
        }
    }

    /** Ce que le déposant retrouve avec sa référence : l'avancement, pas les notes internes. */
    public record PurchaseTracking(String reference, String listingId, String listingTitle,
                                   String status, Long offerAmount, int quantity,
                                   String createdAt, String updatedAt) {
    }

    private final SaleListingRepository listings;
    private final PurchaseRequestRepository purchases;
    private final EquipmentRepository equipments;
    private final NotificationRepository notifications;
    private final ReferenceService references;
    private final AuditService audit;
    private final CurrentUser currentUser;

    public MarketService(SaleListingRepository listings, PurchaseRequestRepository purchases,
                         EquipmentRepository equipments, NotificationRepository notifications,
                         ReferenceService references, AuditService audit, CurrentUser currentUser) {
        this.listings = listings;
        this.purchases = purchases;
        this.equipments = equipments;
        this.notifications = notifications;
        this.references = references;
        this.audit = audit;
        this.currentUser = currentUser;
    }

    private static String today() {
        return LocalDate.now().toString();
    }

    private static String shortId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void notify(String role, String message) {
        notifications.save(new Notification(shortId("n"), role, message, today(), false));
    }

    /** Utilisateur courant s'il y en a un — la vitrine se consulte sans compte. */
    private Optional<UserAccount> visitor() {
        try {
            return Optional.of(currentUser.require());
        } catch (RuntimeException notAuthenticated) {
            return Optional.empty();
        }
    }

    // ------------------------------------------------------------------
    // Vitrine publique
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<PublicListing> listPublished() {
        return listings.findByStatusOrderByFeaturedDescPublishedAtDesc(MarketWorkflow.PUBLISHED)
                .stream().map(PublicListing::of).toList();
    }

    /**
     * Fiche d'une annonce. Publiée, elle est ouverte à tous ; sinon, seuls son
     * vendeur et l'administration la voient — répondre 404 plutôt que 403 à un
     * tiers ne lui confirme pas qu'un brouillon existe.
     */
    @Transactional(readOnly = true)
    public PublicListing getPublic(String id) {
        SaleListing l = load(id);
        if (MarketWorkflow.isPublished(l.status)) {
            return PublicListing.of(l);
        }
        boolean owner = visitor().map(u -> currentUser.owns(l.sellerId)).orElse(false);
        if (!owner) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable : " + id);
        }
        return PublicListing.of(l);
    }

    // ------------------------------------------------------------------
    // Vendeur
    // ------------------------------------------------------------------

    /** Annonces du vendeur connecté ; l'administration voit tout. */
    @Transactional(readOnly = true)
    public List<SaleListing> listMine() {
        UserAccount me = currentUser.require();
        if (currentUser.isAdmin()) {
            return listings.findAll();
        }
        if (!currentUser.isSupplier()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul un fournisseur vend sur Volta Market");
        }
        return listings.findBySellerIdOrderByUpdatedAtDesc(me.id);
    }

    public SaleListing create(ListingInput in) {
        UserAccount me = currentUser.require();
        if (!currentUser.isSupplier() && !currentUser.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul un fournisseur vend sur Volta Market");
        }
        SaleListing l = new SaleListing();
        l.id = shortId("sale");
        l.reference = references.next(ReferenceService.LISTING);
        l.sellerId = me.id;
        l.status = MarketWorkflow.DRAFT;
        l.featured = false;
        l.createdAt = today();
        apply(l, in, true);
        l = listings.save(l);
        audit.record("LISTING_CREATED", "LISTING", l.id, l.reference, l.title);
        return l;
    }

    public SaleListing update(String id, ListingInput in) {
        SaleListing l = load(id);
        currentUser.requireOwnership(l.sellerId, "cette annonce");
        // Une annonce publiée ne se modifie pas en place : ce que l'acheteur a
        // vu doit rester ce sur quoi il a demandé une offre. Le vendeur la
        // retire, corrige, et resoumet.
        if (!MarketWorkflow.DRAFT.equals(l.status) && !MarketWorkflow.REJECTED.equals(l.status)
                && !MarketWorkflow.WITHDRAWN.equals(l.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Retirez l'annonce avant de la modifier");
        }
        apply(l, in, false);
        if (MarketWorkflow.REJECTED.equals(l.status)) {
            MarketWorkflow.checkListingTransition(l.status, MarketWorkflow.DRAFT);
            l.status = MarketWorkflow.DRAFT;
        }
        l = listings.save(l);
        audit.record("LISTING_UPDATED", "LISTING", l.id, l.reference, l.title);
        return l;
    }

    public SaleListing submit(String id) {
        SaleListing l = load(id);
        currentUser.requireOwnership(l.sellerId, "cette annonce");
        MarketWorkflow.checkListingTransition(l.status, MarketWorkflow.SUBMITTED);
        validateComplete(l);
        l.status = MarketWorkflow.SUBMITTED;
        l.reviewNote = null;
        l.updatedAt = today();
        l = listings.save(l);
        notify(CurrentUser.ROLE_ADMIN, "Annonce Market à examiner : " + l.title + " (" + l.reference + ")");
        audit.record("LISTING_SUBMITTED", "LISTING", l.id, l.reference, l.title);
        return l;
    }

    public SaleListing withdraw(String id) {
        SaleListing l = load(id);
        currentUser.requireOwnership(l.sellerId, "cette annonce");
        MarketWorkflow.checkListingTransition(l.status, MarketWorkflow.WITHDRAWN);
        l.status = MarketWorkflow.WITHDRAWN;
        l.featured = false;
        l.updatedAt = today();
        l = listings.save(l);
        audit.record("LISTING_WITHDRAWN", "LISTING", l.id, l.reference, l.title);
        return l;
    }

    // ------------------------------------------------------------------
    // Administration
    // ------------------------------------------------------------------

    public SaleListing publish(String id) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        SaleListing l = load(id);
        MarketWorkflow.checkListingTransition(l.status, MarketWorkflow.PUBLISHED);
        validateComplete(l);
        l.status = MarketWorkflow.PUBLISHED;
        l.publishedAt = today();
        l.updatedAt = today();
        l = listings.save(l);
        notify(CurrentUser.ROLE_SUPPLIER, "Votre annonce " + l.title + " est publiée sur Volta Market");
        audit.record("LISTING_PUBLISHED", "LISTING", l.id, l.reference, l.title);
        return l;
    }

    public SaleListing reject(String id, ReviewInput in) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        if (in == null || in.note() == null || in.note().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Indiquez au vendeur ce qui doit être corrigé");
        }
        SaleListing l = load(id);
        MarketWorkflow.checkListingTransition(l.status, MarketWorkflow.REJECTED);
        l.status = MarketWorkflow.REJECTED;
        l.reviewNote = in.note().trim();
        l.featured = false;
        l.updatedAt = today();
        l = listings.save(l);
        notify(CurrentUser.ROLE_SUPPLIER, "Annonce " + l.title + " renvoyée pour correction : " + l.reviewNote);
        audit.record("LISTING_REJECTED", "LISTING", l.id, l.reference, l.reviewNote);
        return l;
    }

    /** La mise en avant est une décision éditoriale de l'équipe, sur une annonce publiée. */
    public SaleListing feature(String id, boolean featured) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        SaleListing l = load(id);
        if (featured && !MarketWorkflow.isPublished(l.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Seule une annonce publiée peut être mise en avant");
        }
        l.featured = featured;
        l.updatedAt = today();
        l = listings.save(l);
        audit.record(featured ? "LISTING_FEATURED" : "LISTING_UNFEATURED", "LISTING", l.id, l.reference, l.title);
        return l;
    }

    public SaleListing markSold(String id) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        SaleListing l = load(id);
        MarketWorkflow.checkListingTransition(l.status, MarketWorkflow.SOLD);
        l.status = MarketWorkflow.SOLD;
        l.featured = false;
        l.soldAt = today();
        l.updatedAt = today();
        l = listings.save(l);
        notify(CurrentUser.ROLE_SUPPLIER, "Votre annonce " + l.title + " est marquée vendue");
        audit.record("LISTING_SOLD", "LISTING", l.id, l.reference, l.title);
        return l;
    }

    // ------------------------------------------------------------------
    // Demandes d'offre
    // ------------------------------------------------------------------

    public PurchaseRequest requestOffer(String listingId, PurchaseInput in) {
        SaleListing l = load(listingId);
        if (!MarketWorkflow.isPublished(l.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette annonce n'est plus disponible");
        }
        if (in == null || blank(in.contactName()) || blank(in.contactPhone()) || blank(in.contactEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nom, téléphone et email sont nécessaires pour vous répondre");
        }
        int quantity = in.quantity() == null ? 1 : in.quantity();
        if (quantity < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La quantité doit être d'au moins 1");
        }

        PurchaseRequest r = new PurchaseRequest();
        r.id = shortId("ach");
        r.reference = references.next(ReferenceService.PURCHASE);
        r.listingId = l.id;
        r.sellerId = l.sellerId;
        r.clientId = visitor().filter(u -> currentUser.isClient()).map(u -> u.id).orElse(null);
        r.contactName = in.contactName().trim();
        r.contactCompany = trimOrEmpty(in.contactCompany());
        r.contactPhone = in.contactPhone().trim();
        r.contactEmail = in.contactEmail().trim();
        r.contactCity = trimOrEmpty(in.contactCity());
        r.deliveryLocation = trimOrEmpty(in.deliveryLocation());
        r.usageLocation = trimOrEmpty(in.usageLocation());
        r.quantity = quantity;
        r.message = trimOrEmpty(in.message());
        r.status = MarketWorkflow.RECEIVED;
        r.notes = "";
        r.createdAt = today();
        r.updatedAt = today();
        r = purchases.save(r);
        notify(CurrentUser.ROLE_ADMIN, "Demande d'offre " + r.reference + " sur " + l.title);
        audit.record("PURCHASE_REQUESTED", "PURCHASE", r.id, r.reference, l.title);
        return r;
    }

    /** Suivi public par référence : l'avancement seulement, jamais les notes internes. */
    @Transactional(readOnly = true)
    public PurchaseTracking track(String reference) {
        PurchaseRequest r = purchases.findByReference(reference.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Aucune demande à cette référence"));
        String title = listings.findById(r.listingId).map(l -> l.title).orElse("");
        return new PurchaseTracking(r.reference, r.listingId, title, r.status, r.offerAmount,
                r.quantity, r.createdAt, r.updatedAt);
    }

    /**
     * Demandes visibles : toutes pour l'administration, celles de ses annonces
     * pour le vendeur, les siennes pour le client. Le vendeur y lit l'intérêt
     * porté à son matériel, pas les coordonnées de l'acheteur.
     */
    @Transactional(readOnly = true)
    public List<PurchaseRequest> listRequests() {
        UserAccount me = currentUser.require();
        if (currentUser.isAdmin()) {
            return purchases.findAll();
        }
        if (currentUser.isSupplier()) {
            // Comme pour la location : le vendeur ne découvre la commande que
            // lorsque VOLTA la lui transmet. Avant, elle n'est qu'entre le
            // client et l'administration.
            return purchases.findBySellerIdOrderByCreatedAtDesc(me.id).stream()
                    .filter(r -> MarketWorkflow.transmittedToSeller(r.status))
                    .map(MarketService::withoutContact).toList();
        }
        if (currentUser.isClient()) {
            return purchases.findByClientIdOrderByCreatedAtDesc(me.id);
        }
        return List.of();
    }

    public PurchaseRequest moveStage(String id, StageInput in) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        if (in == null || blank(in.stage())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'étape cible est requise");
        }
        String target = in.stage().trim().toUpperCase();
        PurchaseRequest r = purchases.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable : " + id));
        MarketWorkflow.checkRequestTransition(r.status, target);
        if ("OFFER".equals(target)) {
            Long amount = in.offerAmount() != null ? in.offerAmount() : r.offerAmount;
            if (amount == null || amount <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Une offre se fait avec un montant");
            }
            r.offerAmount = amount;
        }
        String previous = r.status;
        r.status = target;
        if (!blank(in.notes())) {
            r.notes = (blank(r.notes) ? "" : r.notes + "\n")
                    + "[" + today() + " · " + target + "] " + in.notes().trim();
        }
        r.updatedAt = today();
        r = purchases.save(r);
        audit.record("PURCHASE_" + target, "PURCHASE", r.id, r.reference, previous + " vers " + target);
        return r;
    }

    // ------------------------------------------------------------------
    // Internes
    // ------------------------------------------------------------------

    private SaleListing load(String id) {
        return listings.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annonce introuvable : " + id));
    }

    /**
     * Copie la saisie dans l'annonce. À la création, un engin du catalogue
     * peut servir de base : ses caractéristiques préremplissent l'annonce, et
     * seul son propriétaire peut le faire.
     */
    private void apply(SaleListing l, ListingInput in, boolean creating) {
        if (creating && !blank(in.equipmentId())) {
            Equipment eq = equipments.findById(in.equipmentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Engin introuvable : " + in.equipmentId()));
            currentUser.requireOwnership(eq.supplierId, "cet engin");
            l.equipmentId = eq.id;
            l.title = eq.name;
            l.categoryId = eq.categoryId;
            l.brand = eq.brand;
            l.model = eq.model;
            l.year = eq.year;
            l.hours = eq.hours;
            l.location = eq.location;
            l.description = eq.description;
            l.photos = new ArrayList<>(eq.photos);
            l.documents = new ArrayList<>(eq.documents);
            l.condition = "OCCASION";
        }
        if (in.title() != null) l.title = in.title().trim();
        if (in.categoryId() != null) l.categoryId = in.categoryId().trim();
        if (in.brand() != null) l.brand = in.brand().trim();
        if (in.model() != null) l.model = in.model().trim();
        if (in.year() != null) l.year = in.year();
        if (in.hours() != null) l.hours = in.hours();
        if (in.location() != null) l.location = in.location().trim();
        if (in.condition() != null) {
            MarketWorkflow.checkCondition(in.condition());
            l.condition = in.condition().trim().toUpperCase();
        }
        if (in.askingPrice() != null) {
            if (in.askingPrice() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le prix ne peut pas être négatif");
            }
            l.askingPrice = in.askingPrice();
        }
        if (in.negotiable() != null) l.negotiable = in.negotiable();
        if (in.description() != null) l.description = in.description().trim();
        if (in.photos() != null) l.photos = new ArrayList<>(in.photos());
        if (in.documents() != null) l.documents = new ArrayList<>(in.documents());
        if (l.condition == null) l.condition = "OCCASION";
        l.updatedAt = today();
    }

    /** Ce sans quoi une annonce ne peut ni être soumise ni publiée. */
    private static void validateComplete(SaleListing l) {
        if (blank(l.title) || l.title.trim().length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'intitulé est requis (3 caractères minimum)");
        }
        if (blank(l.categoryId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La catégorie est requise");
        }
        if (blank(l.location)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La localisation est requise");
        }
        if (l.askingPrice <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le prix demandé est requis");
        }
        MarketWorkflow.checkCondition(l.condition);
    }

    /** Au-delà, l'annonce quitte la vitrine : la promesse du catalogue n'est plus tenue. */
    public static final int MAX_DELIVERY_FAILURES = 3;

    public record DeliveryFailureInput(String reason) {
    }

    /**
     * Le vendeur déclare qu'il ne peut pas honorer cette commande.
     *
     * La charte fournisseur engage à pouvoir livrer ce qui est publié. Le
     * manquement est compté sur l'annonce, pas sur la commande : c'est
     * l'annonce qui promet un engin disponible. Au troisième, elle est retirée
     * de la vitrine — le statut passe en retiré, les données restent.
     *
     * La commande, elle, est close : le client ne peut pas rester en attente
     * d'une livraison que personne ne fera.
     */
    public PurchaseRequest reportDeliveryFailure(String requestId, DeliveryFailureInput in) {
        PurchaseRequest r = purchases.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Demande introuvable : " + requestId));

        UserAccount me = currentUser.require();
        if (!currentUser.isAdmin() && !me.id.equals(r.sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cette commande ne vous concerne pas");
        }
        if (!MarketWorkflow.transmittedToSeller(r.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette commande ne vous a pas encore été transmise");
        }

        SaleListing l = load(r.listingId);
        l.deliveryFailureCount += 1;
        String motif = in == null || blank(in.reason()) ? "" : " — " + in.reason().trim();

        if (l.deliveryFailureCount >= MAX_DELIVERY_FAILURES
                && MarketWorkflow.isPublished(l.status)) {
            l.status = MarketWorkflow.WITHDRAWN;
            l.reviewNote = "Retirée après " + l.deliveryFailureCount
                    + " non-livraisons déclarées par le vendeur.";
            notify(CurrentUser.ROLE_ADMIN, "Annonce " + l.reference + " retirée : "
                    + l.deliveryFailureCount + " non-livraisons");
            audit.record("LISTING_WITHDRAWN_DELIVERY_FAILURES", "LISTING", l.id, l.reference, l.title);
        }
        listings.save(l);

        r.status = MarketWorkflow.CLOSED;
        r.notes = (r.notes == null || r.notes.isBlank() ? "" : r.notes + "\n")
                + "Non-livraison déclarée par le vendeur" + motif;
        r.updatedAt = today();
        r = purchases.save(r);

        notify(CurrentUser.ROLE_ADMIN, "Non-livraison déclarée sur " + r.reference
                + " (" + l.title + ") — incident " + l.deliveryFailureCount + "/" + MAX_DELIVERY_FAILURES);
        audit.record("PURCHASE_DELIVERY_FAILURE", "PURCHASE", r.id, r.reference, l.title);
        return r;
    }

    private static PurchaseRequest withoutContact(PurchaseRequest r) {
        PurchaseRequest copy = new PurchaseRequest();
        copy.id = r.id;
        copy.reference = r.reference;
        copy.listingId = r.listingId;
        copy.sellerId = r.sellerId;
        copy.quantity = r.quantity;
        copy.status = r.status;
        copy.offerAmount = r.offerAmount;
        copy.createdAt = r.createdAt;
        copy.updatedAt = r.updatedAt;
        copy.contactName = "";
        copy.contactCompany = "";
        copy.contactPhone = "";
        copy.contactEmail = "";
        copy.contactCity = r.contactCity;
        // Le vendeur doit pouvoir juger s'il peut livrer : le lieu de livraison,
        // celui d'utilisation et les conditions du chantier ne sont pas des
        // données personnelles, ils décrivent la mission.
        copy.deliveryLocation = r.deliveryLocation;
        copy.usageLocation = r.usageLocation;
        copy.message = r.message;
        copy.notes = "";
        return copy;
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }

    private static String trimOrEmpty(String s) {
        return s == null ? "" : s.trim();
    }
}
