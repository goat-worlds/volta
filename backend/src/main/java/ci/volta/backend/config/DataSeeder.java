package ci.volta.backend.config;

import ci.volta.backend.model.Category;
import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.DocumentInfo;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.Report;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.CategoryRepository;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.repository.ReportRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.VoltaService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    private static final String IMG_EXCAVATOR = unsplash("1580901368919-7738efb0f87e");
    private static final String IMG_EXCAVATOR_QUARRY = unsplash("1517089596392-fb9a9033e05b");
    private static final String IMG_MINING_MACHINES = unsplash("1523848309072-c199db53f137");
    private static final String IMG_TRUCK = unsplash("1616432043562-3671ea2e5242");
    private static final String IMG_TRUCK_ROAD = unsplash("1519003722824-194d4455a60c");
    private static final String IMG_CRANES = unsplash("1429497419816-9ca5cfb4571a");
    private static final String IMG_SITE_WORKERS = unsplash("1504307651254-35680f356dfd");
    private static final String IMG_SITE_AERIAL = unsplash("1541888946425-d81bb19240f5");

    private static String unsplash(String id) {
        return "https://images.unsplash.com/photo-" + id + "?w=640&q=70";
    }

    private static UserAccount user(String id, String name, String role, String company, String email, String phone, String city) {
        UserAccount u = new UserAccount();
        u.id = id;
        u.name = name;
        u.role = role;
        u.company = company;
        u.email = email;
        u.phone = phone;
        u.city = city;
        return u;
    }

    private static Category category(String id, String name, String icon) {
        Category c = new Category();
        c.id = id;
        c.name = name;
        c.icon = icon;
        return c;
    }

    private static List<ChecklistItem> checklist(String result) {
        return VoltaService.CHECKLIST_TEMPLATE.stream()
                .map(c -> new ChecklistItem(c.section, c.label, result, c.observation))
                .toList();
    }

    @Bean
    CommandLineRunner seedData(
            UserRepository users,
            CategoryRepository categories,
            EquipmentRepository equipment,
            InspectionRepository inspections,
            ReportRepository reports,
            RentalRequestRepository rentalRequests,
            NotificationRepository notifications) {
        return args -> {
            if (users.count() > 0) {
                return;
            }

            users.saveAll(List.of(
                    user("u-admin", "Kouadio Félix", "ADMIN", "VOLTA", "admin@volta.ci", "+225 07 00 00 01", "Abidjan"),
                    user("u-sup-1", "Boss Diarra", "SUPPLIER", "BTP CI SARL", "contact@btpci.ci", "+225 07 00 00 02", "Abidjan"),
                    user("u-sup-2", "Awa Koné", "SUPPLIER", "Afrique Matériel", "contact@afriquemateriel.ci", "+225 07 00 00 03", "Yamoussoukro"),
                    user("u-tech-1", "Yao Kouassi", "TECHNICAL", "Société Technique ABC", "inspection@abc.ci", "+225 07 00 00 04", "Abidjan"),
                    user("u-client-1", "Jean Konan", "CLIENT", "Entreprise BTP Konan", "jean@konan.ci", "+225 07 00 00 05", "Abidjan")));

            categories.saveAll(List.of(
                    category("c-pelle", "Pelles hydrauliques", "🚜"),
                    category("c-chargeuse", "Chargeuses", "🏗️"),
                    category("c-benne", "Bennes", "🚚"),
                    category("c-bulldozer", "Bulldozers", "🛠️"),
                    category("c-compacteur", "Compacteurs", "⚙️"),
                    category("c-grue", "Grues", "🏙️")));

            equipment.saveAll(List.of(
                    eq("eq-1", "Caterpillar 320D2", "c-pelle", "Caterpillar", "320D2", 2016, 4528,
                            "Abidjan, Côte d'Ivoire", 250000, true, true,
                            "Pelle hydraulique fiable, puissante et économique en carburant. Idéale pour les travaux de terrassement, carrières et grands chantiers.",
                            List.of(IMG_EXCAVATOR, IMG_EXCAVATOR_QUARRY, IMG_MINING_MACHINES),
                            List.of(new DocumentInfo("Certificat CE", "PDF"), new DocumentInfo("Facture d'achat", "PDF"),
                                    new DocumentInfo("Rapport d'inspection 2025", "PDF")),
                            "u-sup-1", "PUBLISHED", "GOLD", "Très bon état", "2026-05-10"),
                    eq("eq-2", "Komatsu PC210LC-8", "c-pelle", "Komatsu", "PC210LC-8", 2018, 3900,
                            "Abidjan, Côte d'Ivoire", 220000, true, false,
                            "Pelle hydraulique polyvalente, entretien à jour, prête pour chantier.",
                            List.of(IMG_EXCAVATOR_QUARRY, IMG_EXCAVATOR),
                            List.of(new DocumentInfo("Certificat CE", "PDF")),
                            "u-sup-2", "PUBLISHED", "SILVER", "Bon état", "2026-05-12"),
                    eq("eq-3", "Volvo A40G", "c-benne", "Volvo", "A40G", 2019, 2800,
                            "Abidjan, Côte d'Ivoire", 350000, true, true,
                            "Tombereau articulé grande capacité pour transport de matériaux.",
                            List.of(IMG_TRUCK, IMG_TRUCK_ROAD),
                            List.of(new DocumentInfo("Manuel d'utilisation", "PDF")),
                            "u-sup-1", "PUBLISHED", "GOLD", "Très bon état", "2026-05-14"),
                    eq("eq-4", "Caterpillar D6T", "c-bulldozer", "Caterpillar", "D6T", 2015, 6100,
                            "Bouaké, Côte d'Ivoire", 180000, false, true,
                            "Bulldozer robuste pour travaux de nivellement et défrichage.",
                            List.of(IMG_MINING_MACHINES),
                            List.of(new DocumentInfo("Certificat CE", "PDF")),
                            "u-sup-2", "PUBLISHED", "BASIC", "Bon état", "2026-05-15"),
                    eq("eq-5", "Hitachi ZX350LC-5", "c-pelle", "Hitachi", "ZX350LC-5", 2017, 5200,
                            "Abidjan, Côte d'Ivoire", 270000, true, false,
                            "Pelle hydraulique lourde, soumise pour vérification VOLTA.",
                            List.of(IMG_EXCAVATOR, IMG_MINING_MACHINES),
                            List.of(new DocumentInfo("Facture d'achat", "PDF")),
                            "u-sup-1", "SUBMITTED", null, "Bon état", "2026-08-10"),
                    eq("eq-6", "JCB 3CX", "c-chargeuse", "JCB", "3CX", 2020, 1800,
                            "Abidjan, Côte d'Ivoire", 150000, true, false,
                            "Tractopelle compacte en cours de vérification.",
                            List.of(IMG_EXCAVATOR_QUARRY),
                            List.of(),
                            "u-sup-1", "PENDING_INSPECTION", null, "Très bon état", "2026-08-11"),
                    eq("eq-7", "Liebherr LTM 1050", "c-grue", "Liebherr", "LTM 1050", 2014, 8000,
                            "Yamoussoukro, Côte d'Ivoire", 500000, true, true,
                            "Grue mobile 50 tonnes. Brouillon en cours de complétion.",
                            List.of(IMG_CRANES),
                            List.of(),
                            "u-sup-1", "DRAFT", null, "État moyen", "2026-08-13"),
                    eq("eq-8", "Bomag BW213", "c-compacteur", "Bomag", "BW213", 2016, 4100,
                            "Bouaké, Côte d'Ivoire", 120000, true, false,
                            "Compacteur monocylindre, rapport transmis, en attente de décision.",
                            List.of(IMG_SITE_AERIAL),
                            List.of(new DocumentInfo("Certificat CE", "PDF")),
                            "u-sup-2", "PENDING_ADMIN_REVIEW", null, "Bon état", "2026-08-08")));

            Inspection insp1 = new Inspection();
            insp1.id = "insp-1";
            insp1.equipmentId = "eq-6";
            insp1.technicalTeamId = "u-tech-1";
            insp1.assignedAt = "2026-08-12";
            insp1.status = "ASSIGNED";
            insp1.checklist = checklist(null);

            Inspection insp2 = new Inspection();
            insp2.id = "insp-2";
            insp2.equipmentId = "eq-8";
            insp2.technicalTeamId = "u-tech-1";
            insp2.assignedAt = "2026-08-09";
            insp2.status = "DONE";
            insp2.checklist = checklist("CONFORME");
            insp2.photos = List.of(IMG_SITE_WORKERS);
            inspections.saveAll(List.of(insp1, insp2));

            Report rep1 = new Report();
            rep1.id = "rep-1";
            rep1.inspectionId = "insp-2";
            rep1.equipmentId = "eq-8";
            rep1.submittedAt = "2026-08-10";
            rep1.summary = "Équipement globalement conforme. Aucune anomalie majeure détectée.";
            rep1.checklist = checklist("CONFORME");
            reports.save(rep1);

            RentalRequest req1 = new RentalRequest();
            req1.id = "req-1";
            req1.reference = "VOL-2026-00123";
            req1.equipmentId = "eq-1";
            req1.supplierId = "u-sup-1";
            req1.startDate = "2026-08-20";
            req1.endDate = "2026-09-20";
            req1.location = "Chantier Abidjan Nord";
            req1.withOperator = true;
            req1.transport = true;
            req1.comment = "Travaux de terrassement, besoin urgent.";
            req1.clientName = "Jean Konan";
            req1.clientPhone = "+225 07 00 00 05";
            req1.clientEmail = "jean@konan.ci";
            req1.status = "PENDING";
            req1.createdAt = "2026-08-14";
            rentalRequests.save(req1);

            notifications.saveAll(List.of(
                    new Notification("n-1", "ADMIN", "Hitachi ZX350LC-5 soumis par BTP CI SARL", "2026-08-10", false),
                    new Notification("n-2", "SUPPLIER", "Votre équipement JCB 3CX est en attente d'inspection", "2026-08-12", false),
                    new Notification("n-3", "TECHNICAL", "Nouvelle mission assignée : JCB 3CX", "2026-08-12", false)));
        };
    }

    private static Equipment eq(String id, String name, String categoryId, String brand, String model, int year,
            int hours, String location, long pricePerDay, boolean available, boolean withOperator, String description,
            List<String> photos, List<DocumentInfo> documents, String supplierId, String status, String level,
            String declaredCondition, String createdAt) {
        Equipment e = new Equipment();
        e.id = id;
        e.name = name;
        e.categoryId = categoryId;
        e.brand = brand;
        e.model = model;
        e.year = year;
        e.hours = hours;
        e.location = location;
        e.pricePerDay = pricePerDay;
        e.available = available;
        e.withOperator = withOperator;
        e.description = description;
        e.photos = photos;
        e.documents = documents;
        e.supplierId = supplierId;
        e.status = status;
        e.level = level;
        e.declaredCondition = declaredCondition;
        e.createdAt = createdAt;
        return e;
    }
}
