package ci.volta.backend.config;

import ci.volta.backend.model.DocumentInfo;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.EquipmentLike;
import ci.volta.backend.model.EquipmentReview;
import ci.volta.backend.model.SaleListing;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentLikeRepository;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.EquipmentReviewRepository;
import ci.volta.backend.repository.SaleListingRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.ReferenceService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Le catalogue de présentation.
 *
 * <h2>Pourquoi séparé du jeu de démonstration</h2>
 *
 * Les huit engins vivaient dans {@code seedDemoData}, derrière
 * {@code volta.seed.demo}. Or ce drapeau crée aussi trois comptes au mot de
 * passe écrit en clair dans un dépôt public, dont deux administrateurs. Une
 * instance en ligne qui voulait un catalogue devait donc publier un accès
 * d'administration — et celle qui refusait cet accès restait avec un catalogue
 * vide. C'est exactement ce qui est arrivé : quatorze catégories, zéro engin.
 *
 * Le catalogue n'est pas un jeu d'essai. C'est la vitrine : ce qu'un visiteur
 * voit en arrivant, et sans quoi le site ne montre rien. Il s'amorce donc à
 * part, sans créer le moindre compte utilisable.
 *
 * <h2>Les deux fournisseurs de vitrine</h2>
 *
 * Un engin appartient à quelqu'un : le modèle porte un {@code supplierId}, et
 * les écrans affichent son propriétaire. Ces deux comptes existent donc, mais
 * <strong>sans empreinte de mot de passe</strong> — {@code AuthService.login}
 * refuse tout compte dont {@code passwordHash} est nul, quel que soit le mot de
 * passe présenté. Ce sont des porteurs de données, pas des accès.
 *
 * <h2>Idempotence</h2>
 *
 * La garde porte sur chaque identifiant, et non sur le nombre d'engins. Une
 * garde globale — « s'il existe déjà un engin, ne rien faire » — laisserait un
 * catalogue à moitié amorcé le rester pour toujours, et c'est le défaut qu'avait
 * l'ancien code. Ici, ce qui manque est ajouté, ce qui existe n'est jamais
 * touché : un engin modifié par l'administration garde ses modifications.
 */
final class CatalogSeeder {

    private static final Logger log = LoggerFactory.getLogger(CatalogSeeder.class);

    private CatalogSeeder() {
    }

    /*
     * Les photos du catalogue sont des fichiers du dépôt, servis par nginx
     * sous /engins/. Elles ne passent pas par le volume des téléversements :
     * ce sont deux choses distinctes, et les mélanger ferait disparaître la
     * vitrine le jour où l'on vide le volume.
     */
    static final String IMG_PELLE_KOMATSU = "/engins/pelle-komatsu.jpeg";
    static final String IMG_PELLE_CAT_336E = "/engins/pelle-cat-336e.jpeg";
    static final String IMG_PELLE_CAT_6015B = "/engins/pelle-cat-6015b.jpeg";
    static final String IMG_COMPACTEUR_CAT = "/engins/compacteur-cat.jpeg";
    static final String IMG_CAMION_KAMAZ = "/engins/camion-kamaz.jpeg";
    static final String IMG_GRUE_MOBILE = "/engins/grue-mobile.jpeg";
    static final String IMG_GROUPE_MOBILE = "/engins/groupe-mobile.jpeg";

    /** Les propriétaires des engins de vitrine. Aucun n'est administrateur. */
    private static List<UserAccount> vitrineSuppliers() {
        return List.of(
                DataSeeder.user("u-sup-1", "Boss Diarra", "SUPPLIER", "BTP CI SARL",
                        "contact@btpci.ci", "+225 07 00 00 04", "Abidjan"),
                DataSeeder.user("u-sup-2", "Awa Koné", "SUPPLIER", "Afrique Matériel",
                        "contact@afriquemateriel.ci", "+225 07 00 00 05", "Yamoussoukro"));
    }

    static List<Equipment> catalogue() {
        return List.of(
                eq("eq-1", "Komatsu PC210LC-8", "c-pelle", "Komatsu", "PC210LC-8", 2018, 3900,
                        "Abidjan, Côte d'Ivoire", 250000, true, true,
                        "Pelle hydraulique fiable, puissante et économique en carburant. Idéale pour les travaux de terrassement, carrières et grands chantiers.",
                        List.of(IMG_PELLE_KOMATSU),
                        List.of(new DocumentInfo("Certificat CE", "PDF"), new DocumentInfo("Facture d'achat", "PDF"),
                                new DocumentInfo("Rapport d'inspection 2025", "PDF")),
                        "u-sup-1", "PUBLISHED", "GOLD", "Très bon état", "2026-05-10"),
                eq("eq-2", "Caterpillar 336E L", "c-pelle", "Caterpillar", "336E L", 2017, 5200,
                        "Abidjan, Côte d'Ivoire", 270000, true, false,
                        "Pelle hydraulique polyvalente, entretien à jour, prête pour chantier.",
                        List.of(IMG_PELLE_CAT_336E),
                        List.of(new DocumentInfo("Certificat CE", "PDF")),
                        "u-sup-2", "PUBLISHED", "SILVER", "Bon état", "2026-05-12"),
                eq("eq-3", "Kamaz 65115", "c-camion", "Kamaz", "65115", 2019, 2800,
                        "Abidjan, Côte d'Ivoire", 200000, true, true,
                        "Camion benne 6x4 grande capacité pour transport de matériaux.",
                        List.of(IMG_CAMION_KAMAZ),
                        List.of(new DocumentInfo("Manuel d'utilisation", "PDF")),
                        "u-sup-1", "PUBLISHED", "GOLD", "Très bon état", "2026-05-14"),
                eq("eq-4", "Caterpillar CS56B", "c-compacteur", "Caterpillar", "CS56B", 2016, 4100,
                        "Bouaké, Côte d'Ivoire", 120000, true, false,
                        "Compacteur monocylindre vibrant pour travaux de compactage de sols.",
                        List.of(IMG_COMPACTEUR_CAT),
                        List.of(new DocumentInfo("Certificat CE", "PDF")),
                        "u-sup-2", "PUBLISHED", "BASIC", "Bon état", "2026-05-15"),
                eq("eq-5", "Caterpillar 6015B", "c-pelle", "Caterpillar", "6015B", 2015, 6100,
                        "Yamoussoukro, Côte d'Ivoire", 800000, true, true,
                        "Pelle minière lourde, soumise pour vérification VOLTA.",
                        List.of(IMG_PELLE_CAT_6015B),
                        List.of(new DocumentInfo("Facture d'achat", "PDF")),
                        "u-sup-1", "SUBMITTED", null, "Bon état", "2026-08-10"),
                eq("eq-6", "Atlas Copco XRVS 476", "c-groupe", "Atlas Copco", "XRVS 476", 2020, 1800,
                        "Abidjan, Côte d'Ivoire", 90000, true, false,
                        "Compresseur mobile sur remorque en cours de vérification.",
                        List.of(IMG_GROUPE_MOBILE),
                        List.of(),
                        "u-sup-1", "PENDING_INSPECTION", null, "Très bon état", "2026-08-11"),
                eq("eq-7", "Liebherr LTM 1050", "c-grue", "Liebherr", "LTM 1050", 2014, 8000,
                        "Yamoussoukro, Côte d'Ivoire", 500000, true, true,
                        "Grue mobile 50 tonnes. Brouillon en cours de complétion.",
                        List.of(IMG_GRUE_MOBILE),
                        List.of(),
                        "u-sup-1", "DRAFT", null, "État moyen", "2026-08-13"),
                eq("eq-8", "Grove GMK4100", "c-grue", "Grove", "GMK4100", 2016, 5400,
                        "Bouaké, Côte d'Ivoire", 450000, true, false,
                        "Grue mobile 100 tonnes, rapport transmis, en attente de décision.",
                        List.of(IMG_GRUE_MOBILE),
                        List.of(new DocumentInfo("Certificat CE", "PDF")),
                        "u-sup-2", "PENDING_ADMIN_REVIEW", null, "Bon état", "2026-08-08"));
    }


    /**
     * Les annonces de Volta Market.
     *
     * Même raison que les engins : elles vivaient derrière le drapeau de
     * démonstration, et le Market restait vide sur une instance qui refusait
     * de créer des comptes au mot de passe public. Un site qui propose de
     * louer et d'acheter doit montrer les deux.
     *
     * Quatre sont publiées, la cinquième est soumise à l'examen de VOLTA :
     * la vitrine montre aussi que les annonces passent par une validation.
     */
    static List<SaleListing> annonces(ReferenceService references) {
        return List.of(
                sale("sale-1", references.next(ReferenceService.LISTING),
                        "Pelle hydraulique Komatsu PC210LC-8", "c-pelle", "Komatsu", "PC210LC-8", 2018, 3900,
                        "Abidjan, Côte d'Ivoire", "OCCASION", 68_000_000L, true,
                        "Pelle 21 tonnes révisée, chaîne cinématique contrôlée, godet 1,2 m³. Carnet d'entretien complet.",
                        List.of(CatalogSeeder.IMG_PELLE_KOMATSU),
                        List.of(new DocumentInfo("Carte grise", "PDF"), new DocumentInfo("Rapport d'inspection 2025", "PDF")),
                        "eq-1", "u-sup-1", "PUBLISHED", true, "2026-08-20"),
                sale("sale-2", references.next(ReferenceService.LISTING),
                        "Camion benne Kamaz 65115 6x4", "c-camion", "Kamaz", "65115", 2019, 2800,
                        "Abidjan, Côte d'Ivoire", "OCCASION", 32_000_000L, true,
                        "Benne 15 m³, moteur révisé à 2 500 h, pneus neufs. Dédouané, documents à jour.",
                        List.of(CatalogSeeder.IMG_CAMION_KAMAZ),
                        List.of(new DocumentInfo("Carte grise", "PDF"), new DocumentInfo("Documents douaniers", "PDF")),
                        "eq-3", "u-sup-1", "PUBLISHED", true, "2026-08-22"),
                sale("sale-3", references.next(ReferenceService.LISTING),
                        "Compacteur Caterpillar CS56B", "c-compacteur", "Caterpillar", "CS56B", 2016, 4100,
                        "Bouaké, Côte d'Ivoire", "OCCASION", 24_500_000L, false,
                        "Compacteur monocylindre vibrant 12 tonnes. Bille lisse, kit patins disponible.",
                        List.of(CatalogSeeder.IMG_COMPACTEUR_CAT),
                        List.of(new DocumentInfo("Certificat CE", "PDF")),
                        "eq-4", "u-sup-2", "PUBLISHED", false, "2026-08-25"),
                sale("sale-4", references.next(ReferenceService.LISTING),
                        "Groupe électrogène Atlas Copco QAS 150", "c-groupe", "Atlas Copco", "QAS 150", 2023, 0,
                        "Abidjan, Côte d'Ivoire", "NEUF", 18_900_000L, false,
                        "Groupe 150 kVA neuf, capotage insonorisé, livraison sur site possible.",
                        List.of(CatalogSeeder.IMG_GROUPE_MOBILE),
                        List.of(new DocumentInfo("Fiche technique", "PDF"), new DocumentInfo("Garantie constructeur", "PDF")),
                        null, "u-sup-2", "PUBLISHED", true, "2026-08-28"),
                sale("sale-5", references.next(ReferenceService.LISTING),
                        "Grue mobile Liebherr LTM 1050", "c-grue", "Liebherr", "LTM 1050", 2014, 8000,
                        "Yamoussoukro, Côte d'Ivoire", "OCCASION", 145_000_000L, true,
                        "Grue mobile 50 tonnes, flèche 38 m. Annonce en attente d'examen par l'équipe VOLTA.",
                        List.of(CatalogSeeder.IMG_GRUE_MOBILE),
                        List.of(),
                        "eq-7", "u-sup-1", "SUBMITTED", false, null));
    }


    /**
     * Les clients de vitrine, auteurs des avis.
     *
     * Le modèle exige un auteur : c'est le couple engin-client qui empêche le
     * doublon, et un avis sans client passerait deux fois. Ces comptes existent
     * donc, sans empreinte de mot de passe comme les fournisseurs.
     *
     * Ils ne sont jamais montrés : ReviewView ne rend que la note, le
     * commentaire et la date. Aucun avis ne se présente donc sous l'identité
     * d'une entreprise réelle.
     *
     * Le domaine « .invalid » est réservé par le RFC 2606 : ces adresses ne
     * peuvent pas exister, et personne ne recevra de courrier par erreur.
     */
    private static List<UserAccount> vitrineClients() {
        return List.of(
                DataSeeder.user("u-cli-v1", "Client vitrine 1", "CLIENT", "Entreprise A",
                        "vitrine1@exemple.invalid", "+225 07 00 00 20", "Abidjan"),
                DataSeeder.user("u-cli-v2", "Client vitrine 2", "CLIENT", "Entreprise B",
                        "vitrine2@exemple.invalid", "+225 07 00 00 21", "Bouaké"),
                DataSeeder.user("u-cli-v3", "Client vitrine 3", "CLIENT", "Entreprise C",
                        "vitrine3@exemple.invalid", "+225 07 00 00 22", "San-Pédro"));
    }

    /**
     * Les avis de présentation.
     *
     * Ils portent sur les quatre engins publiés : commenter une machine que
     * personne ne voit n'apprendrait rien au visiteur.
     *
     * Les notes ne sont pas toutes à cinq. Un catalogue où tout est parfait ne
     * se croit pas, et une plateforme qui dit mesurer la fiabilité doit pouvoir
     * afficher une réserve.
     */
    static List<EquipmentReview> avis() {
        return List.of(
                avis("av-1", "eq-1", "u-cli-v1", 5,
                        "Pelle livrée à l'heure sur notre chantier de Yopougon. "
                        + "Chauffeur expérimenté, aucune panne sur trois semaines.",
                        "2026-06-14"),
                avis("av-2", "eq-1", "u-cli-v2", 4,
                        "Bon matériel, bien entretenu. La livraison a pris une demi-journée "
                        + "de plus que prévu, sans conséquence sur le planning.",
                        "2026-07-02"),
                avis("av-3", "eq-2", "u-cli-v1", 5,
                        "Rendement supérieur à ce que nous attendions sur du terrassement "
                        + "en terre rouge. Nous la reprendrons.",
                        "2026-07-19"),
                avis("av-4", "eq-2", "u-cli-v3", 4,
                        "Machine solide. Prévoir le ravitaillement en carburant : "
                        + "la consommation est à la hauteur de la puissance.",
                        "2026-08-03"),
                avis("av-5", "eq-3", "u-cli-v2", 5,
                        "Benne disponible au jour près pendant la saison des pluies, "
                        + "ce qui n'est pas si courant. Documents en règle.",
                        "2026-08-21"),
                avis("av-6", "eq-3", "u-cli-v3", 3,
                        "Camion correct, mais arrivé avec un pneu en fin de vie, "
                        + "remplacé par le loueur dès le signalement.",
                        "2026-09-05"),
                avis("av-7", "eq-4", "u-cli-v1", 4,
                        "Compactage régulier sur deux kilomètres de piste. Rien à redire "
                        + "sur la machine ni sur le suivi.",
                        "2026-09-17"));
    }

    private static EquipmentReview avis(String id, String equipmentId, String clientId,
                                        int rating, String comment, String jour) {
        EquipmentReview r = new EquipmentReview();
        r.id = id;
        r.equipmentId = equipmentId;
        r.clientId = clientId;
        r.rating = rating;
        r.comment = comment;
        r.createdAt = jour;
        r.updatedAt = jour;
        r.hidden = false;
        return r;
    }

    /**
     * Les « j'aime », en petit nombre et assumé.
     *
     * Trois clients de vitrine, donc trois au plus par engin. Gonfler ce
     * compteur à coups de comptes fictifs donnerait un chiffre flatteur et
     * faux ; un compteur public ne vaut que s'il compte quelque chose.
     */
    static List<EquipmentLike> jaime() {
        return List.of(
                jaime("lk-1", "eq-1", "u-cli-v1", "2026-06-14"),
                jaime("lk-2", "eq-1", "u-cli-v2", "2026-07-02"),
                jaime("lk-3", "eq-1", "u-cli-v3", "2026-07-30"),
                jaime("lk-4", "eq-2", "u-cli-v1", "2026-07-19"),
                jaime("lk-5", "eq-2", "u-cli-v3", "2026-08-03"),
                jaime("lk-6", "eq-3", "u-cli-v2", "2026-08-21"),
                jaime("lk-7", "eq-4", "u-cli-v1", "2026-09-17"),
                jaime("lk-8", "eq-4", "u-cli-v2", "2026-09-20"));
    }

    private static EquipmentLike jaime(String id, String equipmentId, String clientId, String jour) {
        EquipmentLike l = new EquipmentLike();
        l.id = id;
        l.equipmentId = equipmentId;
        l.clientId = clientId;
        l.createdAt = jour;
        return l;
    }

    /**
     * Amorce ce qui manque, ne touche à rien d'autre.
     *
     * Renvoie le nombre d'engins réellement créés, pour que l'appelant puisse
     * le journaliser : un amorçage silencieux ne se distingue pas d'un amorçage
     * qui n'a pas eu lieu.
     */
    static int seed(UserRepository users, EquipmentRepository equipment,
                    SaleListingRepository listings, ReferenceService references,
                    EquipmentReviewRepository reviews, EquipmentLikeRepository likes) {
        for (UserAccount s : vitrineClients()) {
            if (!users.existsById(s.id)) {
                s.passwordHash = null;
                users.save(s);
            }
        }

        for (UserAccount s : vitrineSuppliers()) {
            if (!users.existsById(s.id)) {
                // Sans empreinte : le compte porte les engins, il ne se
                // connecte pas. Le jeu de démonstration, lui, leur en pose une.
                s.passwordHash = null;
                users.save(s);
            }
        }

        int crees = 0;
        for (Equipment e : catalogue()) {
            if (!equipment.existsById(e.id)) {
                equipment.save(e);
                crees++;
            }
        }
        /*
         * Les annonces, après les engins : plusieurs s'y rattachent par
         * leur equipmentId, et une annonce qui pointe vers un engin absent
         * n'ouvre sur rien.
         *
         * La référence n'est tirée que pour une annonce réellement créée :
         * l'appeler pour une annonce déjà présente consommerait un numéro
         * de la séquence à chaque démarrage, et la numérotation du Market
         * se mettrait à sauter sans que rien ne l'explique.
         */
        int annoncesCreees = 0;
        for (SaleListing l : annonces(references)) {
            if (!listings.existsById(l.id)) {
                listings.save(l);
                annoncesCreees++;
            }
        }

        /*
         * Avis et « j'aime » après les engins, pour la même raison que les
         * annonces : un avis sur un engin absent ne s'affiche nulle part.
         *
         * Garde par identifiant, donc un avis masqué par l'administration
         * reste masqué au redémarrage suivant.
         */
        for (EquipmentReview r : avis()) {
            if (equipment.existsById(r.equipmentId) && !reviews.existsById(r.id)) {
                reviews.save(r);
            }
        }
        for (EquipmentLike l : jaime()) {
            if (equipment.existsById(l.equipmentId) && !likes.existsById(l.id)) {
                likes.save(l);
            }
        }

        if (crees > 0 || annoncesCreees > 0) {
            log.info("Catalogue de présentation : {} engin(s) et {} annonce(s) ajoutés.",
                    crees, annoncesCreees);
        }
        return crees;
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

    private static SaleListing sale(String id, String reference, String title, String categoryId, String brand,
            String model, int year, int hours, String location, String condition, long askingPrice,
            boolean negotiable, String description, List<String> photos, List<DocumentInfo> documents,
            String equipmentId, String sellerId, String status, boolean featured, String publishedAt) {
        SaleListing l = new SaleListing();
        l.id = id;
        l.reference = reference;
        l.title = title;
        l.categoryId = categoryId;
        l.brand = brand;
        l.model = model;
        l.year = year;
        l.hours = hours;
        l.location = location;
        l.condition = condition;
        l.askingPrice = askingPrice;
        l.negotiable = negotiable;
        l.description = description;
        l.photos = photos;
        l.documents = documents;
        l.equipmentId = equipmentId;
        l.sellerId = sellerId;
        l.status = status;
        l.featured = featured;
        l.createdAt = "2026-08-18";
        l.updatedAt = publishedAt == null ? "2026-08-18" : publishedAt;
        l.publishedAt = publishedAt;
        return l;
    }
}
