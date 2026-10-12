package ci.volta.backend.config;

import ci.volta.backend.model.DocumentInfo;
import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.UserRepository;
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
     * Amorce ce qui manque, ne touche à rien d'autre.
     *
     * Renvoie le nombre d'engins réellement créés, pour que l'appelant puisse
     * le journaliser : un amorçage silencieux ne se distingue pas d'un amorçage
     * qui n'a pas eu lieu.
     */
    static int seed(UserRepository users, EquipmentRepository equipment) {
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
        if (crees > 0) {
            log.info("Catalogue de présentation : {} engin(s) ajouté(s).", crees);
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
}
