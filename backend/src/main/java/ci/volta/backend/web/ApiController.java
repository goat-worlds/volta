package ci.volta.backend.web;

import ci.volta.backend.model.Category;
import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.Quote;
import ci.volta.backend.model.QuoteRequest;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.Report;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.CategoryRepository;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.QuoteRepository;
import ci.volta.backend.repository.QuoteRequestRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.repository.ReportRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.VoltaService;
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

@RestController
@RequestMapping("/api")
public class ApiController {

    public record AssignInspectionRequest(String equipmentId, String technicalTeamId) {
    }

    public record ReferenceRequest(String level) {
    }

    public record ReportRequest(String summary, List<ChecklistItem> checklist) {
    }

    public record CreateQuoteRequestBody(String equipmentId, String clientId, String message, int quantity, String startDate, String endDate, String clientName, String clientPhone, String clientEmail) {
    }

    public record CreateQuoteBody(String quoteRequestId, String supplierId, long price, int deliveryTime, String conditions, String validUntil) {
    }

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final InspectionRepository inspectionRepository;
    private final ReportRepository reportRepository;
    private final RentalRequestRepository rentalRequestRepository;
    private final NotificationRepository notificationRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final QuoteRepository quoteRepository;
    private final VoltaService service;

    public ApiController(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            EquipmentRepository equipmentRepository,
            InspectionRepository inspectionRepository,
            ReportRepository reportRepository,
            RentalRequestRepository rentalRequestRepository,
            NotificationRepository notificationRepository,
            QuoteRequestRepository quoteRequestRepository,
            QuoteRepository quoteRepository,
            VoltaService service) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.inspectionRepository = inspectionRepository;
        this.reportRepository = reportRepository;
        this.rentalRequestRepository = rentalRequestRepository;
        this.notificationRepository = notificationRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.quoteRepository = quoteRepository;
        this.service = service;
    }

    @GetMapping("/users")
    public List<UserAccount> users() {
        return userRepository.findAll();
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return categoryRepository.findAll();
    }

    /** Catalogue filtré selon l'appelant : voir VoltaService.listVisibleEquipment. */
    @GetMapping("/equipment")
    public List<Equipment> equipment() {
        return service.listVisibleEquipment();
    }

    @GetMapping("/inspections")
    public List<Inspection> inspections() {
        return inspectionRepository.findAll();
    }

    @GetMapping("/reports")
    public List<Report> reports() {
        return reportRepository.findAll();
    }

    @GetMapping("/rental-requests")
    public List<RentalRequest> rentalRequests() {
        return rentalRequestRepository.findAll();
    }

    @GetMapping("/notifications")
    public List<Notification> notifications() {
        return notificationRepository.findAll();
    }

    @PostMapping("/equipment")
    @ResponseStatus(HttpStatus.CREATED)
    public Equipment addEquipment(@RequestBody Equipment equipment) {
        return service.addEquipment(equipment);
    }

    @PostMapping("/equipment/{id}/submit")
    public Equipment submitEquipment(@PathVariable String id) {
        return service.submitEquipment(id);
    }

    @PostMapping("/equipment/{id}/reject")
    public Equipment rejectEquipment(@PathVariable String id) {
        return service.rejectEquipment(id);
    }

    @PostMapping("/equipment/{id}/request-correction")
    public Equipment requestCorrection(@PathVariable String id) {
        return service.requestCorrection(id);
    }

    @PostMapping("/equipment/{id}/reference")
    public Equipment referenceEquipment(@PathVariable String id, @RequestBody ReferenceRequest body) {
        return service.referenceEquipment(id, body.level());
    }

    @PostMapping("/equipment/{id}/publish")
    public Equipment publishEquipment(@PathVariable String id) {
        return service.publishEquipment(id);
    }

    @PostMapping("/equipment/{id}/unpublish")
    public Equipment unpublishEquipment(@PathVariable String id) {
        return service.unpublishEquipment(id);
    }

    @PostMapping("/inspections")
    @ResponseStatus(HttpStatus.CREATED)
    public Inspection assignInspection(@RequestBody AssignInspectionRequest body) {
        return service.assignInspection(body.equipmentId(), body.technicalTeamId());
    }

    @PostMapping("/inspections/{id}/start")
    public Inspection startInspection(@PathVariable String id) {
        return service.startInspection(id);
    }

    @PutMapping("/inspections/{id}/checklist")
    public Inspection updateChecklist(@PathVariable String id, @RequestBody List<ChecklistItem> checklist) {
        return service.updateChecklist(id, checklist);
    }

    @PostMapping("/inspections/{id}/report")
    @ResponseStatus(HttpStatus.CREATED)
    public Report submitReport(@PathVariable String id, @RequestBody ReportRequest body) {
        return service.submitReport(id, body.summary(), body.checklist());
    }

    @PostMapping("/rental-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public RentalRequest createRentalRequest(@RequestBody RentalRequest request) {
        return service.createRentalRequest(request);
    }

    @PostMapping("/rental-requests/{id}/accept")
    public RentalRequest acceptRentalRequest(@PathVariable String id) {
        return service.respondRentalRequest(id, true);
    }

    @PostMapping("/rental-requests/{id}/decline")
    public RentalRequest declineRentalRequest(@PathVariable String id) {
        return service.respondRentalRequest(id, false);
    }

    @GetMapping("/quote-requests")
    public List<QuoteRequest> listQuoteRequests() {
        return quoteRequestRepository.findAll();
    }

    @PostMapping("/quote-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public QuoteRequest createQuoteRequest(@RequestBody CreateQuoteRequestBody body) {
        return service.createQuoteRequest(
                body.equipmentId(),
                body.clientId(),
                body.message(),
                body.quantity(),
                body.startDate(),
                body.endDate(),
                body.clientName(),
                body.clientPhone(),
                body.clientEmail());
    }

    /** Détail d'une demande, réservé à ses deux parties. */
    @GetMapping("/quote-requests/{id}")
    public QuoteRequest quoteRequest(@PathVariable String id) {
        return service.getQuoteRequest(id);
    }

    /** Devis reçus pour une demande : c'est la vue de comparaison du client. */
    @GetMapping("/quotes/request/{requestId}")
    public List<Quote> quotesByRequest(@PathVariable String requestId) {
        return service.listQuotesByRequest(requestId);
    }

    @GetMapping("/quote-requests/client/{clientId}")
    public List<QuoteRequest> listQuoteRequestsByClient(@PathVariable String clientId) {
        return service.listQuoteRequestsByClient(clientId);
    }

    @GetMapping("/quote-requests/supplier/{supplierId}")
    public List<QuoteRequest> listQuoteRequestsBySupplier(@PathVariable String supplierId) {
        return service.listQuoteRequestsBySupplier(supplierId);
    }

    @GetMapping("/quotes")
    public List<Quote> listQuotes() {
        return quoteRepository.findAll();
    }

    @GetMapping("/quotes/{id}")
    public Quote getQuote(@PathVariable String id) {
        return service.getQuote(id);
    }

    @PostMapping("/quotes")
    @ResponseStatus(HttpStatus.CREATED)
    public Quote createQuote(@RequestBody CreateQuoteBody body) {
        return service.createQuote(
                body.quoteRequestId(),
                body.supplierId(),
                body.price(),
                body.deliveryTime(),
                body.conditions(),
                body.validUntil());
    }

    @GetMapping("/quotes/supplier/{supplierId}")
    public List<Quote> listQuotesBySupplier(@PathVariable String supplierId) {
        return service.listQuotesBySupplier(supplierId);
    }

    @PostMapping("/quotes/{id}/accept")
    public Quote acceptQuote(@PathVariable String id) {
        return service.acceptQuote(id);
    }

    @PostMapping("/quotes/{id}/reject")
    public Quote rejectQuote(@PathVariable String id) {
        return service.rejectQuote(id);
    }
}
