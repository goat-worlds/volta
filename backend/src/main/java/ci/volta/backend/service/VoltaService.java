package ci.volta.backend.service;

import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.Quote;
import ci.volta.backend.model.QuoteRequest;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.Report;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.QuoteRepository;
import ci.volta.backend.repository.QuoteRequestRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.repository.ReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class VoltaService {

    public static final List<ChecklistItem> CHECKLIST_TEMPLATE = List.of(
            new ChecklistItem("MÉCANIQUE", "Moteur", null, ""),
            new ChecklistItem("MÉCANIQUE", "Transmission", null, ""),
            new ChecklistItem("MÉCANIQUE", "Hydraulique", null, ""),
            new ChecklistItem("MÉCANIQUE", "Freinage", null, ""),
            new ChecklistItem("MÉCANIQUE", "Direction", null, ""),
            new ChecklistItem("MÉCANIQUE", "Pneus / chenilles", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Godet", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Bras", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Accessoires", null, ""),
            new ChecklistItem("ÉQUIPEMENT", "Équipements spécifiques", null, ""),
            new ChecklistItem("SÉCURITÉ", "Dispositifs de sécurité", null, ""),
            new ChecklistItem("SÉCURITÉ", "Éclairage", null, ""),
            new ChecklistItem("SÉCURITÉ", "Signalisation", null, ""),
            new ChecklistItem("SÉCURITÉ", "Équipements obligatoires", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Carrosserie", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Corrosion", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Usure", null, ""),
            new ChecklistItem("ÉTAT GÉNÉRAL", "Fonctionnement général", null, ""));

    private final EquipmentRepository equipmentRepository;
    private final InspectionRepository inspectionRepository;
    private final ReportRepository reportRepository;
    private final RentalRequestRepository rentalRequestRepository;
    private final NotificationRepository notificationRepository;
    private final QuoteRequestRepository quoteRequestRepository;
    private final QuoteRepository quoteRepository;
    private final WebhookService webhookService;

    public VoltaService(
            EquipmentRepository equipmentRepository,
            InspectionRepository inspectionRepository,
            ReportRepository reportRepository,
            RentalRequestRepository rentalRequestRepository,
            NotificationRepository notificationRepository,
            QuoteRequestRepository quoteRequestRepository,
            QuoteRepository quoteRepository,
            WebhookService webhookService) {
        this.equipmentRepository = equipmentRepository;
        this.inspectionRepository = inspectionRepository;
        this.reportRepository = reportRepository;
        this.rentalRequestRepository = rentalRequestRepository;
        this.notificationRepository = notificationRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.quoteRepository = quoteRepository;
        this.webhookService = webhookService;
    }

    private static String today() {
        return LocalDate.now().toString();
    }

    private static String newId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void notify(String role, String message) {
        notificationRepository.save(new Notification(newId("n"), role, message, today(), false));
    }

    private void emit(String event, Equipment eq) {
        webhookService.dispatch(event, Map.of(
                "equipmentId", eq.id,
                "name", eq.name,
                "status", eq.status,
                "level", eq.level == null ? "" : eq.level,
                "supplierId", eq.supplierId == null ? "" : eq.supplierId));
    }

    private Equipment getEquipment(String id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found: " + id));
    }

    private Inspection getInspection(String id) {
        return inspectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inspection not found: " + id));
    }

    public Equipment addEquipment(Equipment equipment) {
        equipment.id = newId("eq");
        equipment.status = "DRAFT";
        equipment.level = null;
        equipment.createdAt = today();
        return equipmentRepository.save(equipment);
    }

    public Equipment submitEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "SUBMITTED";
        notify("ADMIN", eq.name + " soumis pour vérification");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_SUBMITTED", eq);
        return eq;
    }

    public Inspection assignInspection(String equipmentId, String technicalTeamId) {
        Equipment eq = getEquipment(equipmentId);
        Inspection inspection = new Inspection();
        inspection.id = newId("insp");
        inspection.equipmentId = equipmentId;
        inspection.technicalTeamId = technicalTeamId;
        inspection.assignedAt = today();
        inspection.status = "ASSIGNED";
        inspection.checklist = CHECKLIST_TEMPLATE.stream()
                .map(c -> new ChecklistItem(c.section, c.label, c.result, c.observation))
                .toList();
        inspection = inspectionRepository.save(inspection);
        eq.status = "PENDING_INSPECTION";
        equipmentRepository.save(eq);
        notify("TECHNICAL", "Nouvelle mission assignée : " + eq.name);
        notify("SUPPLIER", eq.name + " est en attente d'inspection");
        emit("INSPECTION_ASSIGNED", eq);
        return inspection;
    }

    public Inspection startInspection(String inspectionId) {
        Inspection inspection = getInspection(inspectionId);
        inspection.status = "IN_PROGRESS";
        inspection = inspectionRepository.save(inspection);
        Equipment eq = getEquipment(inspection.equipmentId);
        eq.status = "INSPECTION_IN_PROGRESS";
        equipmentRepository.save(eq);
        return inspection;
    }

    public Inspection updateChecklist(String inspectionId, List<ChecklistItem> checklist) {
        Inspection inspection = getInspection(inspectionId);
        inspection.checklist = checklist;
        return inspectionRepository.save(inspection);
    }

    public Report submitReport(String inspectionId, String summary, List<ChecklistItem> checklist) {
        Inspection inspection = getInspection(inspectionId);
        Report report = new Report();
        report.id = newId("rep");
        report.inspectionId = inspectionId;
        report.equipmentId = inspection.equipmentId;
        report.submittedAt = today();
        report.summary = summary;
        report.checklist = checklist;
        report = reportRepository.save(report);
        inspection.status = "DONE";
        inspection.checklist = checklist;
        inspectionRepository.save(inspection);
        Equipment eq = getEquipment(inspection.equipmentId);
        eq.status = "PENDING_ADMIN_REVIEW";
        equipmentRepository.save(eq);
        notify("ADMIN", "Rapport d'inspection transmis pour " + eq.name);
        emit("REPORT_SUBMITTED", eq);
        return report;
    }

    public Equipment rejectEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "REJECTED";
        notify("SUPPLIER", eq.name + " a été refusé après vérification");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_REJECTED", eq);
        return eq;
    }

    public Equipment requestCorrection(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "CORRECTIONS_REQUESTED";
        notify("SUPPLIER", "Des corrections sont demandées pour " + eq.name);
        eq = equipmentRepository.save(eq);
        emit("CORRECTIONS_REQUESTED", eq);
        return eq;
    }

    public Equipment referenceEquipment(String equipmentId, String level) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "REFERENCED";
        eq.level = level;
        notify("SUPPLIER", eq.name + " a été référencé " + level);
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_REFERENCED", eq);
        return eq;
    }

    public Equipment publishEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "PUBLISHED";
        notify("SUPPLIER", eq.name + " est publié sur le catalogue");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_PUBLISHED", eq);
        return eq;
    }

    public Equipment unpublishEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        eq.status = "UNPUBLISHED";
        notify("SUPPLIER", eq.name + " a été dépublié du catalogue");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_UNPUBLISHED", eq);
        return eq;
    }

    public RentalRequest createRentalRequest(RentalRequest request) {
        Equipment eq = getEquipment(request.equipmentId);
        long num = 124 + rentalRequestRepository.count();
        request.id = newId("req");
        request.reference = String.format("VOL-2026-%05d", num);
        request.supplierId = eq.supplierId;
        request.status = "PENDING";
        request.createdAt = today();
        request = rentalRequestRepository.save(request);
        notify("ADMIN", "Nouvelle demande de location " + request.reference + " — " + eq.name);
        notify("SUPPLIER", "Nouvelle demande de location " + request.reference + " — " + eq.name);
        webhookService.dispatch("RENTAL_REQUEST_CREATED", Map.of(
                "requestId", request.id,
                "reference", request.reference,
                "equipmentId", eq.id,
                "equipmentName", eq.name,
                "clientName", request.clientName == null ? "" : request.clientName));
        return request;
    }

    public RentalRequest respondRentalRequest(String requestId, boolean accepted) {
        RentalRequest request = rentalRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rental request not found: " + requestId));
        request.status = accepted ? "ACCEPTED" : "DECLINED";
        request = rentalRequestRepository.save(request);
        Equipment eq = getEquipment(request.equipmentId);
        notify("ADMIN", "Demande " + request.reference + " " + (accepted ? "acceptée" : "refusée") + " — " + eq.name);
        webhookService.dispatch(accepted ? "RENTAL_REQUEST_ACCEPTED" : "RENTAL_REQUEST_DECLINED", Map.of(
                "requestId", request.id,
                "reference", request.reference,
                "equipmentId", eq.id,
                "equipmentName", eq.name));
        return request;
    }

    public QuoteRequest createQuoteRequest(String equipmentId, String clientId, String message, int quantity, String startDate, String endDate, String clientName, String clientPhone, String clientEmail) {
        Equipment eq = getEquipment(equipmentId);
        QuoteRequest req = new QuoteRequest();
        req.id = newId("qreq");
        req.equipmentId = equipmentId;
        req.clientId = clientId;
        req.supplierId = eq.supplierId;
        req.status = "PENDING";
        req.message = message;
        req.quantity = quantity;
        req.startDate = startDate;
        req.endDate = endDate;
        req.clientName = clientName;
        req.clientPhone = clientPhone;
        req.clientEmail = clientEmail;
        req.createdAt = today();
        req = quoteRequestRepository.save(req);
        notify("SUPPLIER", "Nouvelle demande de devis pour " + eq.name);
        notify("ADMIN", "Demande de devis reçue pour " + eq.name);
        webhookService.dispatch("QUOTE_REQUEST_CREATED", Map.of(
                "requestId", req.id,
                "equipmentId", eq.id,
                "equipmentName", eq.name,
                "clientName", clientName == null ? "" : clientName));
        return req;
    }

    public List<QuoteRequest> listQuoteRequestsByClient(String clientId) {
        return quoteRequestRepository.findByClientId(clientId);
    }

    public List<QuoteRequest> listQuoteRequestsBySupplier(String supplierId) {
        return quoteRequestRepository.findBySupplierId(supplierId);
    }

    public Quote createQuote(String quoteRequestId, String supplierId, long price, int deliveryTime, String conditions, String validUntil) {
        QuoteRequest qreq = quoteRequestRepository.findById(quoteRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote request not found: " + quoteRequestId));

        Quote quote = new Quote();
        quote.id = newId("q");
        quote.quoteRequestId = quoteRequestId;
        quote.supplierId = supplierId;
        quote.price = price;
        quote.deliveryTime = deliveryTime;
        quote.conditions = conditions;
        quote.status = "SENT";
        quote.validUntil = validUntil;
        quote.createdAt = today();
        quote = quoteRepository.save(quote);

        Equipment eq = getEquipment(qreq.equipmentId);
        notify("CLIENT", "Nouveau devis pour " + eq.name);
        notify("ADMIN", "Devis créé pour " + eq.name);
        webhookService.dispatch("QUOTE_CREATED", Map.of(
                "quoteId", quote.id,
                "quoteRequestId", quoteRequestId,
                "equipmentId", eq.id,
                "price", price));
        return quote;
    }

    public List<Quote> listQuotesBySupplier(String supplierId) {
        return quoteRepository.findBySupplierId(supplierId);
    }

    public Quote getQuote(String quoteId) {
        return quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found: " + quoteId));
    }

    public Quote acceptQuote(String quoteId) {
        Quote quote = getQuote(quoteId);
        quote.status = "ACCEPTED";
        quote = quoteRepository.save(quote);

        QuoteRequest qreq = quoteRequestRepository.findById(quote.quoteRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote request not found"));

        Equipment eq = getEquipment(qreq.equipmentId);

        // Créer automatiquement une demande de location
        RentalRequest rental = new RentalRequest();
        long num = 124 + rentalRequestRepository.count();
        rental.id = newId("rental");
        rental.reference = String.format("VOL-2026-%05d", num);
        rental.equipmentId = qreq.equipmentId;
        rental.supplierId = qreq.supplierId;
        rental.startDate = qreq.startDate;
        rental.endDate = qreq.endDate;
        rental.comment = qreq.message;
        rental.clientName = qreq.clientName;
        rental.clientPhone = qreq.clientPhone;
        rental.clientEmail = qreq.clientEmail;
        rental.status = "PENDING";
        rental.createdAt = today();
        rentalRequestRepository.save(rental);

        notify("SUPPLIER", "Devis accepté pour " + eq.name);
        notify("ADMIN", "Devis accepté pour " + eq.name + " - Demande de location créée");
        webhookService.dispatch("QUOTE_ACCEPTED", Map.of(
                "quoteId", quoteId,
                "equipmentId", eq.id,
                "rentalRequestId", rental.id));
        return quote;
    }

    public Quote rejectQuote(String quoteId) {
        Quote quote = getQuote(quoteId);
        quote.status = "REJECTED";
        quote = quoteRepository.save(quote);

        QuoteRequest qreq = quoteRequestRepository.findById(quote.quoteRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote request not found"));
        Equipment eq = getEquipment(qreq.equipmentId);

        notify("SUPPLIER", "Devis refusé pour " + eq.name);
        webhookService.dispatch("QUOTE_REJECTED", Map.of(
                "quoteId", quoteId,
                "equipmentId", eq.id));
        return quote;
    }
}
