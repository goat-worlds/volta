package ci.volta.backend.config;

import ci.volta.backend.domain.PhoneKey;
import ci.volta.backend.model.Category;
import ci.volta.backend.model.ChecklistItem;
import ci.volta.backend.model.DocumentInfo;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.Inspection;
import ci.volta.backend.model.Notification;
import ci.volta.backend.model.RentalRequest;
import ci.volta.backend.model.Report;
import ci.volta.backend.model.SaleListing;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.CategoryRepository;
import ci.volta.backend.repository.EquipmentLikeRepository;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.EquipmentReviewRepository;
import ci.volta.backend.repository.InspectionRepository;
import ci.volta.backend.repository.NotificationRepository;
import ci.volta.backend.repository.RentalRequestRepository;
import ci.volta.backend.repository.ReportRepository;
import ci.volta.backend.repository.SaleListingRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.AuthService;
import ci.volta.backend.service.ReferenceService;
import ci.volta.backend.service.VoltaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Amorçage de la base.
 *
 * Trois choses distinctes s'y jouent, et les confondre a déjà coûté cher.
 *
 * Le <b>jeu de démonstration</b> — comptes de test au mot de passe écrit en
 * clair dans ce fichier, engins, inspections — est conditionné à
 * `volta.seed.demo`. Il reste actif en développement et le profil d'hébergement
 * le coupe : le dépôt étant public, sur une instance accessible n'importe qui
 * entrait sinon en administrateur.
 *
 * Les <b>catégories</b> ne sont pas un jeu d'essai : c'est la taxonomie du
 * métier, sans laquelle aucun engin ne peut être déposé et le catalogue n'a
 * aucune entrée. Elles étaient prises dans la garde et disparaissaient donc en
 * ligne avec les comptes de test. Elles sont désormais semées partout, une
 * seule fois, sur une table vide.
 *
 * Le <b>premier administrateur</b> vient de la configuration, jamais des
 * sources. Sans lui, une instance de production démarre sans personne pour
 * référencer ni publier un engin : l'inscription par le site ne délivre que des
 * comptes client, et la plateforme reste inadministrable.
 *
 * La normalisation des rôles hérités, enfin, n'est pas un amorçage mais une
 * migration de données : elle s'exécute dans tous les cas.
 */
@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    static UserAccount user(String id, String name, String role, String company, String email, String phone, String city) {
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

    /**
     * Rôles écrits par une version antérieure du semis.
     *
     * « DG » et « VERIFICATEUR » n'ont jamais existé dans le modèle : les
     * comptes qui les portent s'authentifient mais n'obtiennent aucune
     * autorisation et n'ont pas d'espace où atterrir — ils paraissent cassés.
     * La correspondance est appliquée à chaque démarrage plutôt qu'une fois,
     * car une base déjà semée ne repasse jamais par la création des comptes.
     */
    private static final java.util.Map<String, String> LEGACY_ROLES =
            java.util.Map.of("DG", "ADMIN", "VERIFICATEUR", "TECHNICAL");

    private static void normalizeLegacyRoles(UserRepository users) {
        List<UserAccount> outdated = users.findAll().stream()
                .filter(u -> u.role != null && LEGACY_ROLES.containsKey(u.role.trim().toUpperCase()))
                .peek(u -> u.role = LEGACY_ROLES.get(u.role.trim().toUpperCase()))
                .toList();
        if (!outdated.isEmpty()) {
            users.saveAll(outdated);
        }
    }

    /**
     * Remplit la clé téléphone des comptes créés avant son existence.
     *
     * La colonne est ajoutée vide par Hibernate sur une base déjà peuplée : sans
     * ce rattrapage, aucun compte existant ne pourrait se connecter par son
     * numéro, et le défaut ne se verrait qu'au premier client qui essaie. Comme
     * la normalisation des rôles hérités, c'est une migration de données — elle
     * tourne à chaque démarrage et ne touche que ce qui manque.
     */
    private static void backfillPhoneKeys(UserRepository users) {
        List<UserAccount> aCompleter = users.findAll().stream()
                .filter(u -> u.phoneKey == null || u.phoneKey.isBlank())
                .filter(u -> PhoneKey.of(u.phone) != null)
                .peek(u -> u.phoneKey = PhoneKey.of(u.phone))
                .toList();
        if (!aCompleter.isEmpty()) {
            users.saveAll(aCompleter);
            log.info("Clé téléphone renseignée pour {} compte(s).", aCompleter.size());
        }
    }

    private static Category category(String id, String name, String icon) {
        Category c = new Category();
        c.id = id;
        c.name = name;
        c.icon = icon;
        return c;
    }

    /**
     * Taxonomie du catalogue. Les identifiants sont stables : le jeu de
     * démonstration s'y réfère, et une base déjà semée ne doit pas voir ses
     * catégories dupliquées sous d'autres clés.
     */
    private static List<Category> catalogCategories() {
        return List.of(
                category("c-pelle", "Pelles", "🚜"),
                category("c-chargeuse", "Chargeuses", "🏗️"),
                category("c-grue", "Grues", "🏙️"),
                category("c-camion", "Camions", "🚚"),
                category("c-compacteur", "Compacteurs", "⚙️"),
                category("c-bulldozer", "Bulldozers", "🚜"),
                category("c-niveleuse", "Niveleuses", "🛣️"),
                category("c-foreuse", "Foreuses", "🔩"),
                category("c-groupe", "Groupes électrogènes", "🔌"),
                // Quatre familles que le chantier loue autant que les engins de
                // terrassement, et qui tombaient jusqu'ici dans « Autres » :
                // un chef de chantier qui cherche une citerne à eau ne pense
                // pas à ouvrir une rubrique fourre-tout.
                category("c-tractopelle", "Tractopelles", "🚜"),
                category("c-citerne-eau", "Citernes à eau", "💧"),
                category("c-citerne-carburant", "Citernes à carburant", "⛽"),
                category("c-car-personnel", "Cars de transport de personnel", "🚌"),
                // « Équipement » n'est pas une famille d'engins : c'est tout ce
                // qui s'ajoute au parc sans rouler — compresseurs, pompes,
                // groupes de soudage, matériel de première installation. Elle
                // ferme la liste parce qu'elle recueille ce que les autres ne
                // nomment pas.
                // Une seule case de fin, et non deux.
                //
                // « Équipement » et « Autres » coexistaient : le fournisseur
                // devait deviner si un compresseur était l'un ou l'autre, et le
                // client chercher dans les deux. Elles recouvraient la même
                // chose — ce que la taxonomie ne nomme pas — et les dissocier
                // n'ajoutait qu'une hésitation.
                category("c-equipement", "Autres équipements", "🧰"));
    }

    /**
     * Premier administrateur, tiré de la configuration.
     *
     * L'amorçage n'a lieu que tant qu'aucun administrateur n'existe : passé ce
     * point, les variables deviennent inertes. Sans cette garde, un mot de passe
     * laissé dans le tableau de bord de l'hébergeur rouvrirait un accès à chaque
     * redémarrage, y compris après que l'exploitant l'a changé.
     *
     * Si l'adresse correspond à un compte déjà inscrit, ce compte est promu
     * plutôt que dupliqué — c'est le cas courant : on s'inscrit par le site,
     * puis on se donne le rôle. Son mot de passe n'est alors pas touché.
     */
    private static void bootstrapAdmin(UserRepository users, AuthService authService,
                                       String email, String password, String name) {
        if (email == null || email.isBlank()) {
            if (password != null && !password.isBlank()) {
                log.warn("volta.admin.password est renseigné sans volta.admin.email : "
                        + "aucun administrateur n'est amorcé.");
            }
            return;
        }

        boolean adminExists = users.findAll().stream()
                .anyMatch(u -> "ADMIN".equalsIgnoreCase(u.role));
        if (adminExists) {
            log.info("Un administrateur existe déjà : volta.admin.* est sans effet.");
            return;
        }

        UserAccount existing = users.findByEmailIgnoreCase(email).orElse(null);
        if (existing != null) {
            existing.role = "ADMIN";
            users.save(existing);
            log.info("Compte {} promu administrateur.", email);
            return;
        }

        if (password == null || password.isBlank()) {
            log.warn("volta.admin.email est renseigné sans volta.admin.password et "
                    + "aucun compte ne porte cette adresse : aucun administrateur n'est amorcé.");
            return;
        }

        UserAccount admin = user("u-" + java.util.UUID.randomUUID().toString().substring(0, 8),
                name, "ADMIN", "VOLTA", email, "", "");
        admin.passwordHash = authService.encodePassword(password);
        users.save(admin);
        log.info("Administrateur initial créé pour {}.", email);
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
            NotificationRepository notifications,
            SaleListingRepository listings,
            EquipmentReviewRepository reviews,
            EquipmentLikeRepository likes,
            AuthService authService,
            ReferenceService referenceService,
            @Value("${volta.seed.demo:false}") boolean seedDemo,
            @Value("${volta.seed.catalog:true}") boolean seedCatalog,
            @Value("${volta.admin.email:}") String adminEmail,
            @Value("${volta.admin.password:}") String adminPassword,
            @Value("${volta.admin.name:Administration}") String adminName) {
        return args -> {
            // La migration des rôles hérités porte sur des données réelles :
            // elle s'exécute avant la garde, et donc partout.
            normalizeLegacyRoles(users);
            backfillPhoneKeys(users);

            // Taxonomie et premier administrateur ne sont pas du jeu d'essai :
            // ils précèdent la garde et valent aussi en production.
            if (categories.count() == 0) {
                categories.saveAll(catalogCategories());
            }
            bootstrapAdmin(users, authService, adminEmail, adminPassword, adminName);

            /*
             * Le catalogue de présentation, hors du jeu d'essai.
             *
             * Il vivait derrière volta.seed.demo, lequel crée des comptes
             * au mot de passe écrit en clair dans un dépôt public. Une
             * instance en ligne devait donc choisir entre un catalogue et
             * un accès d'administration ouvert à tous. Elle a choisi la
             * sûreté, et le site est resté vide.
             */
            if (seedCatalog) {
                CatalogSeeder.seed(users, equipment, listings, referenceService, reviews, likes);
            }

            if (seedDemo) {
                seedDemoData(users, equipment, inspections, reports, rentalRequests, notifications, authService);
            } else {
                log.info("Jeu de démonstration désactivé (volta.seed.demo=false) : "
                        + "aucun compte de test n'est créé.");
            }

            // Migration de données : les lignes créées avant l'introduction des
            // références métier en reçoivent une, jeu d'essai ou données réelles.
            backfillReferences(equipment, inspections, rentalRequests, referenceService);
        };
    }

    private static void backfillReferences(EquipmentRepository equipment, InspectionRepository inspections,
                                           RentalRequestRepository rentalRequests, ReferenceService references) {
        equipment.findAll().stream()
                .filter(e -> e.reference == null || e.reference.isBlank())
                .forEach(e -> {
                    e.reference = references.next(ReferenceService.RESOURCE);
                    equipment.save(e);
                });
        inspections.findAll().stream()
                .filter(i -> i.reference == null || i.reference.isBlank())
                .forEach(i -> {
                    i.reference = references.next(ReferenceService.VERIFICATION);
                    inspections.save(i);
                });
        rentalRequests.findAll().stream()
                .filter(r -> r.reference == null || r.reference.isBlank())
                .forEach(r -> {
                    r.reference = references.next(ReferenceService.RENTAL);
                    rentalRequests.save(r);
                });
    }

    private static void seedDemoData(UserRepository users, EquipmentRepository equipment,
                                     InspectionRepository inspections, ReportRepository reports,
                                     RentalRequestRepository rentalRequests, NotificationRepository notifications,
                                     AuthService authService) {
        log.warn("Jeu de démonstration ACTIF : des comptes au mot de passe public "
                + "sont créés. À ne jamais activer sur une instance accessible.");

        String defaultHash = authService.encodePassword("password123");

        if (users.findByEmailIgnoreCase("dg@volta.com").isEmpty()) {
            UserAccount dgUser = user("u-dg", "Direction", "ADMIN", "VOLTA", "dg@volta.com", "+225 07 00 00 00", "Abidjan");
            dgUser.passwordHash = defaultHash;
            users.save(dgUser);
        }
        if (users.findByEmailIgnoreCase("supplier@volta.com").isEmpty()) {
            UserAccount supplierUser = user("u-supplier", "Supplier Test", "SUPPLIER", "Test Supplier", "supplier@volta.com", "+225 07 00 00 01", "Abidjan");
            supplierUser.passwordHash = defaultHash;
            users.save(supplierUser);
        }
        if (users.findByEmailIgnoreCase("verificateur@volta.com").isEmpty()) {
            UserAccount techUser = user("u-tech", "Équipe technique", "TECHNICAL", "VOLTA", "verificateur@volta.com", "+225 07 00 00 02", "Abidjan");
            techUser.passwordHash = defaultHash;
            users.save(techUser);
        }

        /*
         * Le catalogue n'est plus ici : il est amorcé à part, par
         * CatalogSeeder, et vaut aussi en production. Ne restent sous ce
         * drapeau que les comptes au mot de passe public et les pièces qui
         * n'ont de sens qu'en démonstration — inspections, rapports,
         * demandes de location.
         *
         * La garde globale « s'il existe déjà un engin, ne rien faire » a
         * disparu avec lui : chaque élément vérifie sa propre présence, si
         * bien qu'un jeu à moitié amorcé se complète au lieu de rester tel
         * quel.
         */
        // Les fournisseurs de vitrine existent sans mot de passe. En
        // démonstration, on leur en pose un pour pouvoir s'y connecter.
        for (String id : List.of("u-sup-1", "u-sup-2")) {
            users.findById(id).filter(u -> u.passwordHash == null).ifPresent(u -> {
                u.passwordHash = defaultHash;
                users.save(u);
            });
        }

        // u-sup-1 et u-sup-2 ne figurent plus ici : CatalogSeeder les a
        // posés, et les réenregistrer écraserait ce que l'administration
        // aurait pu y changer.
        List<UserAccount> seededUsers = List.of(
                user("u-admin", "Kouadio Félix", "ADMIN", "VOLTA", "admin@volta.ci", "+225 07 00 00 03", "Abidjan"),
                user("u-tech-1", "Yao Kouassi", "TECHNICAL", "Société Technique ABC", "inspection@abc.ci", "+225 07 00 00 06", "Abidjan"),
                user("u-client-1", "Jean Konan", "CLIENT", "Entreprise BTP Konan", "jean@konan.ci", "+225 07 00 00 07", "Abidjan"));
        seededUsers.stream().filter(u -> !users.existsById(u.id)).forEach(u -> {
            u.passwordHash = defaultHash;
            users.save(u);
        });

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
        insp2.photos = List.of(CatalogSeeder.IMG_GRUE_MOBILE);
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
        req1.clientId = "u-client-1";
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
                new Notification("n-1", "ADMIN", "Caterpillar 6015B soumis par BTP CI SARL", "2026-08-10", false),
                new Notification("n-2", "SUPPLIER", "Votre équipement Atlas Copco XRVS 476 est en attente d'inspection", "2026-08-12", false),
                new Notification("n-3", "TECHNICAL", "Nouvelle mission assignée : Atlas Copco XRVS 476", "2026-08-12", false)));
}

    /**
     * Vitrine Volta Market de démonstration.
     *
     * Semée à part du catalogue : une base où le matériel existe déjà mais où
     * le Market vient d'être introduit doit tout de même montrer des annonces.
     * La garde porte donc sur la table des annonces elle-même.
     */

}
