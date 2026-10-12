package ci.volta.backend.config;

import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.SaleListingRepository;
import ci.volta.backend.repository.UserRepository;
import ci.volta.backend.service.ReferenceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Le catalogue de présentation, et ce qu'il ne doit jamais faire.
 *
 * Ces tests existent parce qu'une instance en ligne a servi quatorze catégories
 * et zéro engin : le catalogue vivait derrière le drapeau qui crée aussi des
 * comptes au mot de passe public, et l'instance avait eu raison de refuser ce
 * drapeau. Ce qui est vérifié ici, c'est surtout qu'on ne peut plus retomber
 * dans ce choix-là.
 */
@SpringBootTest
class CatalogSeederTest {

    @Autowired UserRepository users;
    @Autowired EquipmentRepository equipment;
    @Autowired SaleListingRepository listings;
    @Autowired ReferenceService references;

    @Nested
    @DisplayName("Contenu")
    class Contenu {

        @Test
        @DisplayName("Les huit engins attendus sont en base, avec leurs photos")
        void huitEngins() {
            for (String id : List.of("eq-1", "eq-2", "eq-3", "eq-4", "eq-5", "eq-6", "eq-7", "eq-8")) {
                Equipment e = equipment.findById(id).orElse(null);
                assertThat(e).as("engin " + id).isNotNull();
                assertThat(e.name).as("nom de " + id).isNotBlank();
                assertThat(e.categoryId).as("catégorie de " + id).isNotBlank();
                assertThat(e.photos).as("photos de " + id).isNotEmpty();
            }
        }

        @Test
        @DisplayName("Chaque photo pointe vers un fichier du dépôt, sous /engins/")
        void photosSousEngins() {
            // Un chemin propre au poste de développement — « C:\\... » ou
            // « /home/… » — rendrait l'image introuvable partout ailleurs.
            CatalogSeeder.catalogue().forEach(e ->
                    e.photos.forEach(photo -> assertThat(photo)
                            .as("photo de " + e.id)
                            .startsWith("/engins/")
                            .doesNotContain("\\")
                            .doesNotContain("localhost")));
        }

        @Test
        @DisplayName("Les catégories citées existent toutes dans la taxonomie")
        void categoriesConnues() {
            // Un engin rangé dans une catégorie absente n'apparaît sous aucun
            // filtre : il est en base et invisible, le pire des deux mondes.
            CatalogSeeder.catalogue().forEach(e ->
                    assertThat(e.categoryId).as("catégorie de " + e.id).startsWith("c-"));
        }

        @Test
        @DisplayName("Un engin en brouillon ou en attente n'est pas publié")
        void statutsRespectes() {
            CatalogSeeder.catalogue().stream()
                    .filter(e -> List.of("DRAFT", "SUBMITTED", "PENDING_INSPECTION",
                            "PENDING_ADMIN_REVIEW").contains(e.status))
                    .forEach(e -> assertThat(e.status)
                            .as("statut de " + e.id)
                            .isNotEqualTo("PUBLISHED"));
        }
    }

    @Nested
    @DisplayName("Sûreté")
    class Surete {

        @Test
        @DisplayName("Le catalogue ne crée aucun administrateur")
        void aucunAdministrateur() {
            // La règle qui a motivé toute la séparation : obtenir un catalogue
            // ne doit jamais coûter un accès d'administration.
            assertThat(equipment.findAll()).isNotEmpty();
            assertThat(users.findById("u-sup-1")).isPresent();
            assertThat(users.findById("u-sup-1").orElseThrow().role).isEqualTo("SUPPLIER");
            assertThat(users.findById("u-sup-2").orElseThrow().role).isEqualTo("SUPPLIER");
        }

        @Test
        @DisplayName("Les propriétaires des engins portent un rôle de fournisseur")
        void proprietairesFournisseurs() {
            CatalogSeeder.catalogue().forEach(e -> {
                UserAccount proprietaire = users.findById(e.supplierId).orElse(null);
                assertThat(proprietaire).as("propriétaire de " + e.id).isNotNull();
                assertThat(proprietaire.role).as("rôle du propriétaire de " + e.id)
                        .isEqualTo("SUPPLIER");
            });
        }
    }

    @Nested
    @DisplayName("Idempotence")
    class Idempotence {

        @Test
        @DisplayName("Un second amorçage ne crée aucun doublon")
        void pasDeDoublon() {
            long avant = equipment.count();
            int crees = CatalogSeeder.seed(users, equipment, listings, references);
            assertThat(crees).as("engins créés au second passage").isZero();
            assertThat(equipment.count()).isEqualTo(avant);
        }

        @Test
        @DisplayName("Un amorçage ne réécrit pas un engin modifié entre-temps")
        void modificationsPreservees() {
            // Le cas réel : l'administration corrige un prix, le conteneur
            // redémarre, et l'amorçage repasse. Le prix corrigé doit tenir.
            Equipment e = equipment.findById("eq-1").orElseThrow();
            long ancienPrix = e.pricePerDay;
            e.pricePerDay = 999_999;
            equipment.save(e);

            CatalogSeeder.seed(users, equipment, listings, references);

            assertThat(equipment.findById("eq-1").orElseThrow().pricePerDay)
                    .as("prix modifié à la main")
                    .isEqualTo(999_999);

            e.pricePerDay = ancienPrix;
            equipment.save(e);
        }

        @Test
        @DisplayName("Un catalogue à moitié amorcé se complète")
        void completeLesManquants() {
            // Une garde globale « s'il existe un engin, ne rien faire » laissait
            // un amorçage interrompu incomplet pour toujours. Celle-ci porte sur
            // chaque identifiant.
            equipment.findById("eq-8").ifPresent(equipment::delete);
            assertThat(equipment.existsById("eq-8")).isFalse();

            int crees = CatalogSeeder.seed(users, equipment, listings, references);

            assertThat(crees).as("engin manquant recréé").isEqualTo(1);
            assertThat(equipment.existsById("eq-8")).isTrue();
        }
    }

    @Nested
    @DisplayName("Volta Market")
    class Market {

        @Test
        @DisplayName("Les cinq annonces sont en base, avec leurs photos")
        void cinqAnnonces() {
            for (String id : List.of("sale-1", "sale-2", "sale-3", "sale-4", "sale-5")) {
                assertThat(listings.findById(id)).as("annonce " + id).isPresent();
                assertThat(listings.findById(id).orElseThrow().photos)
                        .as("photos de " + id).isNotEmpty();
            }
        }

        @Test
        @DisplayName("Le site propose à la fois de louer et d'acheter")
        void louerEtAcheter() {
            // Ce que la vitrine doit montrer : un catalogue de location ET un
            // Market. Un site qui annonce les deux et n'en sert qu'un donne
            // l'impression d'être à moitié construit.
            assertThat(equipment.findAll().stream().filter(e -> "PUBLISHED".equals(e.status)))
                    .as("engins à louer").isNotEmpty();
            assertThat(listings.findAll().stream().filter(l -> "PUBLISHED".equals(l.status)))
                    .as("annonces à vendre").isNotEmpty();
        }

        @Test
        @DisplayName("Une annonce rattachée à un engin pointe vers un engin qui existe")
        void rattachementValide() {
            // Une annonce dont l'equipmentId ne résout rien ouvre sur une page
            // vide : l'acheteur clique et ne trouve pas la machine.
            CatalogSeeder.annonces(references).stream()
                    .filter(l -> l.equipmentId != null)
                    .forEach(l -> assertThat(equipment.existsById(l.equipmentId))
                            .as("engin " + l.equipmentId + " cité par " + l.id)
                            .isTrue());
        }

        @Test
        @DisplayName("Un second amorçage ne duplique pas les annonces")
        void pasDeDoublon() {
            long avant = listings.count();
            CatalogSeeder.seed(users, equipment, listings, references);
            assertThat(listings.count()).isEqualTo(avant);
        }
    }

}
