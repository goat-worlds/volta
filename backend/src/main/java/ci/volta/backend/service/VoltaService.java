package ci.volta.backend.service;

import ci.volta.backend.domain.EquipmentWorkflow;
import ci.volta.backend.domain.QuoteValidation;
import ci.volta.backend.domain.QuoteWorkflow;
import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.Quote;
import ci.volta.backend.model.QuoteRequest;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.Report;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.QuoteRepository;
import ci.volta.backend.repository.QuoteRequestRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.repository.ReportRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
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

    /** Seul statut visible au catalogue public. */
    public static final String STATUS_PUBLISHED = "PUBLISHED";

    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public VoltaService(
            EquipmentRepository equipmentRepository,
            InspectionRepository inspectionRepository,
            ReportRepository reportRepository,
            RentalRequestRepository rentalRequestRepository,
            NotificationRepository notificationRepository,
            QuoteRequestRepository quoteRequestRepository,
            QuoteRepository quoteRepository,
            WebhookService webhookService,
            UserRepository userRepository,
            CurrentUser currentUser) {
        this.equipmentRepository = equipmentRepository;
        this.inspectionRepository = inspectionRepository;
        this.reportRepository = reportRepository;
        this.rentalRequestRepository = rentalRequestRepository;
        this.notificationRepository = notificationRepository;
        this.quoteRequestRepository = quoteRequestRepository;
        this.quoteRepository = quoteRepository;
        this.webhookService = webhookService;
        this.userRepository = userRepository;
        this.currentUser = currentUser;
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

    /**
     * Équipements visibles par l'appelant.
     *
     * Le catalogue public ne montre que les équipements publiés : un matériel en
     * DRAFT ou SUBMITTED n'a été ni inspecté ni classé, et l'exposer
     * contredirait la promesse d'équipements vérifiés.
     *
     * Un fournisseur voit en plus les siens, quel que soit leur statut — il doit
     * pouvoir suivre ce qui est en cours de vérification. L'administrateur et
     * l'équipe technique voient tout, c'est leur métier.
     */
    @Transactional(readOnly = true)
    public List<Equipment> listVisibleEquipment() {
        String role;
        String userId;
        try {
            role = currentUser.role();
            userId = currentUser.requireId();
        } catch (RuntimeException notAuthenticated) {
            // Visiteur non identifié : catalogue public seulement.
            return equipmentRepository.findByStatus(STATUS_PUBLISHED);
        }

        if (CurrentUser.ROLE_ADMIN.equals(role) || CurrentUser.ROLE_TECHNICAL.equals(role)) {
            return equipmentRepository.findAll();
        }

        if (CurrentUser.ROLE_SUPPLIER.equals(role)) {
            List<Equipment> visible = new java.util.ArrayList<>(
                    equipmentRepository.findByStatus(STATUS_PUBLISHED));
            equipmentRepository.findBySupplierId(userId).stream()
                    .filter(eq -> !STATUS_PUBLISHED.equals(eq.status))
                    .forEach(visible::add);
            return visible;
        }

        return equipmentRepository.findByStatus(STATUS_PUBLISHED);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Listes cadrées sur l'appelant
    //
    //  Ces endpoints renvoyaient tous un findAll(). L'écran paraissait juste
    //  parce que le frontend filtrait à l'affichage, mais la réponse HTTP
    //  contenait les données de tout le monde : un fournisseur recevait les
    //  coordonnées de chaque client, un technicien les missions des autres
    //  équipes. Le filtre appartient au serveur — lui seul sait qui appelle.
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Utilisateur tel qu'il peut être montré à l'appelant.
     *
     * L'annuaire est nécessaire à l'application : le client a besoin du nom du
     * loueur, l'administrateur du nom de l'équipe à qui il assigne. Les
     * coordonnées, elles, ne regardent que l'administration — elles arrivent
     * vides pour les autres plutôt que d'être omises, afin que le contrat de
     * l'API reste le même pour tous.
     */
    public record UserView(String id, String name, String role, String company,
                           String city, String email, String phone) {
    }

    private static UserView view(UserAccount u, boolean withContact) {
        return new UserView(u.id, u.name, u.role, u.company, u.city,
                withContact ? u.email : "", withContact ? u.phone : "");
    }

    @Transactional(readOnly = true)
    public List<UserView> listVisibleUsers() {
        boolean admin = isAdmin();
        return userRepository.findAll().stream().map(u -> view(u, admin)).toList();
    }

    @Transactional(readOnly = true)
    public UserView getVisibleUser(String id) {
        UserAccount u = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable : " + id));
        // On voit ses propres coordonnées, et l'administration voit celles de
        // tous : un utilisateur doit pouvoir relire sa propre fiche.
        boolean withContact = isAdmin() || id.equals(currentUser.requireId());
        return view(u, withContact);
    }

    /** Champs modifiables d'un compte. Le mot de passe suit un autre chemin. */
    public record UserInput(String name, String email, String phone, String role,
                            String company, String city, String password) {
    }

    /**
     * Crée un compte depuis l'administration.
     *
     * C'est le seul endroit d'où sort un ADMIN : l'inscription publique ne
     * permet que CLIENT, SUPPLIER et TECHNICAL.
     */
    public UserView createUser(UserInput input, AuthService authService) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);

        if (input.name() == null || input.name().isBlank()
                || input.email() == null || input.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom et email sont requis");
        }
        String role = input.role() == null || input.role().isBlank()
                ? CurrentUser.ROLE_CLIENT : input.role().trim().toUpperCase();
        if (!ASSIGNABLE_ROLES.contains(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu : " + role);
        }
        if (userRepository.findByEmailIgnoreCase(input.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        // Un mot de passe absent produirait un compte auquel personne ne peut se
        // connecter : mieux vaut refuser que créer une fiche morte.
        if (input.password() == null || input.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Un mot de passe d'au moins 6 caractères est requis");
        }

        UserAccount u = new UserAccount();
        u.id = newId("u");
        u.name = input.name().trim();
        u.email = input.email().trim();
        u.phone = input.phone() == null ? "" : input.phone().trim();
        u.role = role;
        u.company = input.company() == null ? "" : input.company().trim();
        u.city = input.city() == null ? "" : input.city().trim();
        u.passwordHash = authService.encodePassword(input.password());
        return view(userRepository.save(u), true);
    }

    /** Rôles qu'un administrateur peut attribuer, celui d'administrateur inclus. */
    private static final Set<String> ASSIGNABLE_ROLES = Set.of(
            CurrentUser.ROLE_CLIENT, CurrentUser.ROLE_SUPPLIER,
            CurrentUser.ROLE_TECHNICAL, CurrentUser.ROLE_ADMIN);

    /**
     * Met à jour un compte.
     *
     * Chacun corrige sa propre fiche ; seul l'administrateur touche au rôle,
     * qui décide de ce qu'on a le droit de faire.
     */
    public UserView updateUser(String id, UserInput input) {
        UserAccount me = currentUser.require();
        boolean admin = CurrentUser.ROLE_ADMIN.equalsIgnoreCase(me.role);
        if (!admin && !me.id.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous ne pouvez modifier que votre propre compte");
        }

        UserAccount u = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable : " + id));

        if (input.name() != null && !input.name().isBlank()) u.name = input.name().trim();
        if (input.phone() != null) u.phone = input.phone().trim();
        if (input.company() != null) u.company = input.company().trim();
        if (input.city() != null) u.city = input.city().trim();

        if (input.email() != null && !input.email().isBlank()
                && !input.email().equalsIgnoreCase(u.email)) {
            userRepository.findByEmailIgnoreCase(input.email()).ifPresent(other -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
            });
            u.email = input.email().trim();
        }

        if (input.role() != null && !input.role().isBlank()) {
            String role = input.role().trim().toUpperCase();
            if (!admin) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Seule l'administration peut changer un rôle");
            }
            if (!ASSIGNABLE_ROLES.contains(role)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu : " + role);
            }
            u.role = role;
        }

        return view(userRepository.save(u), true);
    }

    /** Identifiants des engins du fournisseur connecté. */
    private Set<String> ownEquipmentIds(String supplierId) {
        return equipmentRepository.findBySupplierId(supplierId).stream()
                .map(eq -> eq.id)
                .collect(java.util.stream.Collectors.toSet());
    }

    private boolean isAdmin() {
        try {
            return CurrentUser.ROLE_ADMIN.equals(currentUser.role());
        } catch (RuntimeException notAuthenticated) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public List<Inspection> listVisibleInspections() {
        String role = currentUser.role();
        String userId = currentUser.requireId();

        if (CurrentUser.ROLE_ADMIN.equals(role)) {
            return inspectionRepository.findAll();
        }
        if (CurrentUser.ROLE_TECHNICAL.equals(role)) {
            return inspectionRepository.findAll().stream()
                    .filter(i -> userId.equals(i.technicalTeamId))
                    .toList();
        }
        if (CurrentUser.ROLE_SUPPLIER.equals(role)) {
            // Le fournisseur suit la vérification de son propre matériel : il
            // voit l'inspection, sans avoir à connaître les autres dossiers.
            Set<String> mine = ownEquipmentIds(userId);
            return inspectionRepository.findAll().stream()
                    .filter(i -> mine.contains(i.equipmentId))
                    .toList();
        }
        // Le client loue un engin déjà vérifié ; le détail de l'inspection ne
        // fait pas partie de ce qu'il consulte.
        return List.of();
    }

    @Transactional(readOnly = true)
    public List<Report> listVisibleReports() {
        String role = currentUser.role();
        String userId = currentUser.requireId();

        if (CurrentUser.ROLE_ADMIN.equals(role)) {
            return reportRepository.findAll();
        }
        if (CurrentUser.ROLE_TECHNICAL.equals(role)) {
            Set<String> myInspections = inspectionRepository.findAll().stream()
                    .filter(i -> userId.equals(i.technicalTeamId))
                    .map(i -> i.id)
                    .collect(java.util.stream.Collectors.toSet());
            return reportRepository.findAll().stream()
                    .filter(r -> myInspections.contains(r.inspectionId))
                    .toList();
        }
        if (CurrentUser.ROLE_SUPPLIER.equals(role)) {
            Set<String> mine = ownEquipmentIds(userId);
            return reportRepository.findAll().stream()
                    .filter(r -> mine.contains(r.equipmentId))
                    .toList();
        }
        return List.of();
    }

    @Transactional(readOnly = true)
    public List<RentalRequest> listVisibleRentalRequests() {
        String role = currentUser.role();
        UserAccount me = currentUser.require();

        if (CurrentUser.ROLE_ADMIN.equals(role)) {
            return rentalRequestRepository.findAll();
        }
        if (CurrentUser.ROLE_SUPPLIER.equals(role)) {
            return rentalRequestRepository.findAll().stream()
                    .filter(r -> me.id.equals(r.supplierId))
                    .toList();
        }
        if (CurrentUser.ROLE_CLIENT.equals(role)) {
            // La demande de location ne porte pas d'identifiant client : elle
            // est rattachée par l'email saisi au moment du devis.
            String email = me.email == null ? "" : me.email;
            return rentalRequestRepository.findAll().stream()
                    .filter(r -> email.equalsIgnoreCase(r.clientEmail))
                    .toList();
        }
        return List.of();
    }

    @Transactional(readOnly = true)
    public List<Notification> listVisibleNotifications() {
        String role = currentUser.role();
        if (CurrentUser.ROLE_ADMIN.equals(role)) {
            return notificationRepository.findAll();
        }
        // Les notifications sont adressées à un rôle, pas encore à une
        // personne : chacun reçoit celles de son métier.
        return notificationRepository.findAll().stream()
                .filter(n -> role.equalsIgnoreCase(n.role))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuoteRequest> listVisibleQuoteRequests() {
        String role = currentUser.role();
        String userId = currentUser.requireId();

        if (CurrentUser.ROLE_ADMIN.equals(role)) {
            return quoteRequestRepository.findAll();
        }
        if (CurrentUser.ROLE_SUPPLIER.equals(role)) {
            return quoteRequestRepository.findBySupplierId(userId);
        }
        if (CurrentUser.ROLE_CLIENT.equals(role)) {
            return quoteRequestRepository.findByClientId(userId);
        }
        return List.of();
    }

    @Transactional(readOnly = true)
    public List<Quote> listVisibleQuotes() {
        String role = currentUser.role();
        String userId = currentUser.requireId();

        if (CurrentUser.ROLE_ADMIN.equals(role)) {
            return quoteRepository.findAll();
        }
        if (CurrentUser.ROLE_SUPPLIER.equals(role)) {
            return quoteRepository.findBySupplierId(userId);
        }
        if (CurrentUser.ROLE_CLIENT.equals(role)) {
            // Les offres reçues par le client : celles qui répondent à ses
            // propres demandes, quel que soit le fournisseur qui les émet.
            Set<String> myRequests = quoteRequestRepository.findByClientId(userId).stream()
                    .map(r -> r.id)
                    .collect(java.util.stream.Collectors.toSet());
            return quoteRepository.findAll().stream()
                    .filter(q -> myRequests.contains(q.quoteRequestId))
                    .toList();
        }
        return List.of();
    }

    /**
     * Enregistre un équipement au nom du fournisseur authentifié.
     *
     * Le supplierId présent dans le corps de la requête est écrasé : le laisser
     * passer permettait d'inscrire un équipement au catalogue d'un concurrent.
     * Seul l'administrateur peut désigner un autre fournisseur.
     */
    public Equipment addEquipment(Equipment equipment) {
        if (!currentUser.isAdmin() || equipment.supplierId == null || equipment.supplierId.isBlank()) {
            equipment.supplierId = currentUser.requireId();
        }
        equipment.id = newId("eq");
        equipment.status = "DRAFT";
        equipment.level = null;
        equipment.createdAt = today();
        return equipmentRepository.save(equipment);
    }

    /** Soumet un équipement à validation. Réservé à son propriétaire. */
    public Equipment submitEquipment(String equipmentId) {
        Equipment eq = getEquipment(equipmentId);
        currentUser.requireOwnership(eq.supplierId, "cet équipement");
        eq.status = "SUBMITTED";
        notify("ADMIN", eq.name + " soumis pour vérification");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_SUBMITTED", eq);
        return eq;
    }

    /**
     * Assigne une inspection à un membre de l'équipe technique.
     *
     * Trois vérifications absentes jusqu'ici : seule l'administration assigne,
     * l'équipement doit avoir été soumis, et le destinataire doit réellement
     * appartenir à l'équipe technique — assigner à un fournisseur lui aurait
     * donné la main sur la vérification de son propre matériel.
     */
    public Inspection assignInspection(String equipmentId, String technicalTeamId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);

        Equipment eq = getEquipment(equipmentId);
        EquipmentWorkflow.checkTransition(eq.status, EquipmentWorkflow.PENDING_INSPECTION);

        UserAccount inspector = userRepository.findById(technicalTeamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Membre de l'équipe technique introuvable"));
        if (!CurrentUser.ROLE_TECHNICAL.equalsIgnoreCase(inspector.role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Une inspection ne peut être assignée qu'à un membre de l'équipe technique");
        }

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

    /**
     * Démarre une inspection. Réservée à l'inspecteur qui en est chargé.
     *
     * Sans ce contrôle, n'importe quel technicien pouvait ouvrir la mission d'un
     * autre, et la traçabilité de qui a examiné quoi devenait inexploitable.
     */
    public Inspection startInspection(String inspectionId) {
        Inspection inspection = getInspection(inspectionId);
        currentUser.requireOwnership(inspection.technicalTeamId, "cette inspection");

        Equipment target = getEquipment(inspection.equipmentId);
        EquipmentWorkflow.checkTransition(target.status, EquipmentWorkflow.INSPECTION_IN_PROGRESS);

        inspection.status = "IN_PROGRESS";
        inspection = inspectionRepository.save(inspection);
        Equipment eq = getEquipment(inspection.equipmentId);
        eq.status = "INSPECTION_IN_PROGRESS";
        equipmentRepository.save(eq);
        return inspection;
    }

    /**
     * Enregistre l'avancement de la checklist.
     *
     * Une inspection close n'est plus modifiable : le rapport transmis à
     * l'administration doit correspondre à ce qui a été constaté.
     */
    public Inspection updateChecklist(String inspectionId, List<ChecklistItem> checklist) {
        Inspection inspection = getInspection(inspectionId);
        currentUser.requireOwnership(inspection.technicalTeamId, "cette inspection");

        if ("DONE".equals(inspection.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette inspection est close : son rapport a déjà été transmis");
        }

        inspection.checklist = checklist;
        return inspectionRepository.save(inspection);
    }

    /**
     * Transmet le rapport d'inspection à l'administration.
     *
     * L'équipe technique constate ; elle n'attribue pas le niveau commercial et
     * ne publie pas. Le rapport passe l'équipement en revue administrative,
     * l'admin décidant ensuite du classement et de la publication.
     */
    public Report submitReport(String inspectionId, String summary, List<ChecklistItem> checklist) {
        Inspection inspection = getInspection(inspectionId);
        currentUser.requireOwnership(inspection.technicalTeamId, "cette inspection");

        if ("DONE".equals(inspection.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Le rapport de cette inspection a déjà été transmis");
        }

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

    /**
     * Refuse un équipement. Décision administrative.
     *
     * Le fournisseur reprend la main : le refus le renvoie en brouillon plutôt
     * que de figer le dossier — refuser un engin ne bannit pas son propriétaire.
     */
    public Equipment rejectEquipment(String equipmentId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        Equipment eq = getEquipment(equipmentId);
        eq.status = "REJECTED";
        notify("SUPPLIER", eq.name + " a été refusé après vérification");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_REJECTED", eq);
        return eq;
    }

    /** Demande de correction au fournisseur. Décision administrative. */
    public Equipment requestCorrection(String equipmentId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        Equipment eq = getEquipment(equipmentId);
        eq.status = "CORRECTIONS_REQUESTED";
        notify("SUPPLIER", "Des corrections sont demandées pour " + eq.name);
        eq = equipmentRepository.save(eq);
        emit("CORRECTIONS_REQUESTED", eq);
        return eq;
    }

    /**
     * Attribue le niveau commercial BASIC, SILVER ou GOLD.
     *
     * C'est une décision d'administration, pas un résultat d'inspection :
     * l'équipe technique constate l'état, l'administration en tire un
     * positionnement. Le classement suppose toutefois qu'une inspection ait eu
     * lieu — sans quoi le niveau affiché au catalogue ne garantirait rien.
     */
    public Equipment referenceEquipment(String equipmentId, String level) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        EquipmentWorkflow.checkLevel(level);
        Equipment eq = getEquipment(equipmentId);
        EquipmentWorkflow.checkCanBeReferenced(eq.status);
        eq.status = "REFERENCED";
        eq.level = level;
        notify("SUPPLIER", eq.name + " a été référencé " + level);
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_REFERENCED", eq);
        return eq;
    }

    /**
     * Publie l'équipement au catalogue public.
     *
     * Dernière étape du parcours de vérification : elle exige un niveau
     * attribué, faute de quoi l'engin apparaîtrait sans la mention qui justifie
     * sa présence au catalogue.
     */
    public Equipment publishEquipment(String equipmentId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        Equipment eq = getEquipment(equipmentId);
        EquipmentWorkflow.checkCanBePublished(eq.status, eq.level);
        eq.status = "PUBLISHED";
        notify("SUPPLIER", eq.name + " est publié sur le catalogue");
        eq = equipmentRepository.save(eq);
        emit("EQUIPMENT_PUBLISHED", eq);
        return eq;
    }

    /** Retire l'équipement du catalogue. Décision administrative. */
    public Equipment unpublishEquipment(String equipmentId) {
        currentUser.requireRole(CurrentUser.ROLE_ADMIN);
        Equipment eq = getEquipment(equipmentId);
        EquipmentWorkflow.checkTransition(eq.status, EquipmentWorkflow.UNPUBLISHED);
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
        // Un événement, une notification, adressée à qui doit agir. La location
        // se traite entre le client et le fournisseur : l'administration la suit
        // par les webhooks, pas en doublant chaque message dans son journal.
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
        // Le fournisseur vient de trancher lui-même : le notifier de sa propre
        // action n'apprend rien, et l'administration n'a rien à faire de cette
        // décision commerciale.
        webhookService.dispatch(accepted ? "RENTAL_REQUEST_ACCEPTED" : "RENTAL_REQUEST_DECLINED", Map.of(
                "requestId", request.id,
                "reference", request.reference,
                "equipmentId", eq.id,
                "equipmentName", eq.name));
        return request;
    }

    /**
     * Crée une demande de devis pour le compte de l'utilisateur authentifié.
     *
     * Le clientId reçu en paramètre est ignoré : un identifiant transmis par le
     * client se falsifie, et rien n'empêchait jusqu'ici de déposer une demande
     * au nom d'un autre. Seul l'administrateur peut désigner un autre client,
     * pour les saisies faites au téléphone.
     */
    public QuoteRequest createQuoteRequest(String equipmentId, String clientId, String message, int quantity, String startDate, String endDate, String clientName, String clientPhone, String clientEmail) {
        QuoteValidation.checkRequired(equipmentId, "L'équipement");
        QuoteValidation.checkQuantity(quantity);
        QuoteValidation.checkPeriod(startDate, endDate);

        String effectiveClientId = currentUser.isAdmin() && clientId != null && !clientId.isBlank()
                ? clientId
                : currentUser.requireId();

        Equipment eq = getEquipment(equipmentId);
        QuoteRequest req = new QuoteRequest();
        req.id = newId("qreq");
        req.equipmentId = equipmentId;
        req.clientId = effectiveClientId;
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
        webhookService.dispatch("QUOTE_REQUEST_CREATED", Map.of(
                "requestId", req.id,
                "equipmentId", eq.id,
                "equipmentName", eq.name,
                "clientName", clientName == null ? "" : clientName));
        return req;
    }

    /**
     * Détail d'une demande de devis.
     *
     * Accessible au client qui l'a émise et au fournisseur à qui elle s'adresse :
     * ce sont les deux parties de la relation. Toute autre personne reçoit un
     * 403, sans indication sur l'existence de la demande.
     */
    @Transactional(readOnly = true)
    public QuoteRequest getQuoteRequest(String quoteRequestId) {
        QuoteRequest qreq = quoteRequestRepository.findById(quoteRequestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Quote request not found: " + quoteRequestId));

        if (!currentUser.owns(qreq.clientId) && !currentUser.owns(qreq.supplierId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Accès refusé : cette demande ne vous concerne pas");
        }
        return qreq;
    }

    /**
     * Devis reçus pour une demande donnée.
     *
     * Le client compare ici les offres qui répondent à SA demande. Renvoyer tous
     * les devis, ou ceux d'une autre demande, exposerait les prix pratiqués entre
     * concurrents.
     *
     * Un fournisseur consultant cette demande ne voit que ses propres devis : il
     * n'a pas à connaître les offres de ses concurrents avant décision.
     */
    @Transactional(readOnly = true)
    public List<Quote> listQuotesByRequest(String quoteRequestId) {
        QuoteRequest qreq = getQuoteRequest(quoteRequestId);
        List<Quote> quotes = quoteRepository.findByQuoteRequestId(quoteRequestId);

        if (currentUser.owns(qreq.clientId)) {
            return quotes;
        }
        String me = currentUser.requireId();
        return quotes.stream().filter(q -> me.equals(q.supplierId)).toList();
    }

    /** Demandes d'un client. Nul ne consulte celles d'un autre, hors administration. */
    public List<QuoteRequest> listQuoteRequestsByClient(String clientId) {
        currentUser.requireOwnership(clientId, "cette liste de demandes");
        return quoteRequestRepository.findByClientId(clientId);
    }

    /** Demandes adressées à un fournisseur, réservées à ce fournisseur. */
    public List<QuoteRequest> listQuoteRequestsBySupplier(String supplierId) {
        currentUser.requireOwnership(supplierId, "cette liste de demandes");
        return quoteRequestRepository.findBySupplierId(supplierId);
    }

    /**
     * Enregistre un devis en réponse à une demande.
     *
     * Le supplierId reçu est ignoré au profit de l'utilisateur authentifié :
     * il permettait de déposer un devis au nom d'un autre fournisseur. Seul
     * l'administrateur peut désigner un tiers.
     *
     * Le fournisseur doit par ailleurs être celui à qui la demande est adressée :
     * répondre à la demande d'un confrère reviendrait à s'inviter dans une
     * relation commerciale qui ne le concerne pas.
     */
    public Quote createQuote(String quoteRequestId, String supplierId, long price, int deliveryTime, String conditions, String validUntil) {
        QuoteValidation.checkRequired(quoteRequestId, "La demande de devis");
        QuoteValidation.checkPrice(price);
        QuoteValidation.checkDeliveryTime(deliveryTime);
        QuoteValidation.checkValidUntil(validUntil);

        QuoteRequest qreq = quoteRequestRepository.findById(quoteRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote request not found: " + quoteRequestId));

        String effectiveSupplierId = currentUser.isAdmin() && supplierId != null && !supplierId.isBlank()
                ? supplierId
                : currentUser.requireId();

        currentUser.requireOwnership(qreq.supplierId, "cette demande de devis");

        // Une demande déjà tranchée n'accueille plus de devis : le client a
        // choisi, en rouvrir un créerait deux locations pour un seul besoin.
        QuoteWorkflow.checkRequestAcceptsQuotes(qreq.status);

        Quote quote = new Quote();
        quote.id = newId("q");
        quote.quoteRequestId = quoteRequestId;
        quote.supplierId = effectiveSupplierId;
        quote.price = price;
        quote.deliveryTime = deliveryTime;
        quote.conditions = conditions;
        quote.status = QuoteWorkflow.QUOTE_SENT;
        quote.validUntil = validUntil;
        quote.createdAt = today();
        quote = quoteRepository.save(quote);

        Equipment eq = getEquipment(qreq.equipmentId);
        notify("CLIENT", "Nouveau devis pour " + eq.name);
        webhookService.dispatch("QUOTE_CREATED", Map.of(
                "quoteId", quote.id,
                "quoteRequestId", quoteRequestId,
                "equipmentId", eq.id,
                "price", price));
        return quote;
    }

    /**
     * Devis émis par un fournisseur.
     *
     * Sans ce contrôle, un concurrent pouvait lire les prix pratiqués par un
     * autre en changeant simplement l'identifiant dans l'URL.
     */
    public List<Quote> listQuotesBySupplier(String supplierId) {
        currentUser.requireOwnership(supplierId, "cette liste de devis");
        return quoteRepository.findBySupplierId(supplierId);
    }

    public Quote getQuote(String quoteId) {
        return quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found: " + quoteId));
    }

    /**
     * Accepte un devis et crée la demande de location correspondante.
     *
     * Trois protections que l'implémentation précédente n'avait pas :
     *
     *   - la ligne du devis est verrouillée avant lecture. Sans cela, deux
     *     acceptations simultanées liraient toutes deux le statut SENT et
     *     créeraient chacune une location : vérifier un statut ne sert à rien si
     *     la transaction voisine peut encore l'invalider ;
     *   - la décision revient au client destinataire, pas au fournisseur ni à
     *     un tiers ;
     *   - un devis déjà accepté ou refusé ne peut plus l'être, et un devis
     *     concurrent déjà accepté pour la même demande bloque les autres.
     *
     * La méthode hérite du @Transactional porté par la classe : le verrou tient
     * jusqu'au commit, et l'échec de la création de location annule aussi
     * l'acceptation.
     */
    public Quote acceptQuote(String quoteId) {
        Quote quote = quoteRepository.findByIdForUpdate(quoteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found: " + quoteId));

        QuoteRequest qreq = quoteRequestRepository.findById(quote.quoteRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote request not found"));

        // Le devis s'adresse au client qui a émis la demande : c'est lui, et lui
        // seul, qui tranche.
        currentUser.requireOwnership(qreq.clientId, "ce devis");

        QuoteWorkflow.checkQuoteTransition(quote.status, QuoteWorkflow.QUOTE_ACCEPTED);
        QuoteWorkflow.checkStillValid(quote.validUntil);

        // Seconde barrière : deux devis distincts de la même demande
        // verrouilleraient chacun leur propre ligne sans jamais se croiser.
        // L'identifiant est copié car `quote` est réassigné plus bas et ne peut
        // donc pas être capturé par la lambda.
        final String currentQuoteId = quote.id;
        quoteRepository.findFirstByQuoteRequestIdAndStatus(
                        quote.quoteRequestId, QuoteWorkflow.QUOTE_ACCEPTED)
                .filter(accepted -> !accepted.id.equals(currentQuoteId))
                .ifPresent(accepted -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Un devis a déjà été accepté pour cette demande");
                });

        quote.status = QuoteWorkflow.QUOTE_ACCEPTED;
        quote = quoteRepository.save(quote);

        // La demande passe à ACCEPTED : elle n'accueille plus de nouveau devis.
        qreq.status = QuoteWorkflow.REQUEST_ACCEPTED;
        quoteRequestRepository.save(qreq);

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

        notify("SUPPLIER", "Devis accepté pour " + eq.name + " — demande de location créée");
        webhookService.dispatch("QUOTE_ACCEPTED", Map.of(
                "quoteId", quoteId,
                "equipmentId", eq.id,
                "rentalRequestId", rental.id));
        return quote;
    }

    /**
     * Refuse un devis.
     *
     * Même verrou et même contrôle de propriété que l'acceptation : refuser est
     * une décision aussi définitive qu'accepter, et elle appartient au client
     * destinataire.
     *
     * La demande reste PENDING : le client refuse une offre, pas son besoin, et
     * d'autres fournisseurs peuvent encore répondre.
     */
    public Quote rejectQuote(String quoteId) {
        Quote quote = quoteRepository.findByIdForUpdate(quoteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found: " + quoteId));

        QuoteRequest qreq = quoteRequestRepository.findById(quote.quoteRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote request not found"));

        currentUser.requireOwnership(qreq.clientId, "ce devis");
        QuoteWorkflow.checkQuoteTransition(quote.status, QuoteWorkflow.QUOTE_REJECTED);

        quote.status = QuoteWorkflow.QUOTE_REJECTED;
        quote = quoteRepository.save(quote);

        Equipment eq = getEquipment(qreq.equipmentId);

        notify("SUPPLIER", "Devis refusé pour " + eq.name);
        webhookService.dispatch("QUOTE_REJECTED", Map.of(
                "quoteId", quoteId,
                "equipmentId", eq.id));
        return quote;
    }
}
