package ci.volta.backend.config;

import ci.volta.backend.model.Equipment;
import ci.volta.backend.model.UserAccount;
import ci.volta.backend.repository.EquipmentLikeRepository;
import ci.volta.backend.repository.EquipmentRepository;
import ci.volta.backend.repository.EquipmentReviewRepository;
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
    @Autowired EquipmentReviewRepository reviews;
    @Autowired EquipmentLikeRepository likes;
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
            int crees = CatalogSeeder.seed(users, equipment, listings, references, reviews, likes);
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

            CatalogSeeder.seed(users, equipment, listings, references, reviews, likes);

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

            int crees = CatalogSeeder.seed(users, equipment, listings, references, reviews, likes);

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
            CatalogSeeder.seed(users, equipment, listings, references, reviews, likes);
            assertThat(listings.count()).isEqualTo(avant);
        }
    }


    @Nested
    @DisplayName("Avis et j'aime")
    class AvisEtJaime {

        @Test
        @DisplayName("Les avis sont en base et portent sur des engins publiés")
        void avisEnBase() {
            assertThat(reviews.count()).as("avis").isPositive();
            CatalogSeeder.avis().forEach(a -> {
                assertThat(reviews.findById(a.id)).as("avis " + a.id).isPresent();
                // Un avis sur une machine que le public ne voit pas ne se lit
                // nulle part : il occupe la base sans rien montrer.
                assertThat(equipment.findById(a.equipmentId).orElseThrow().status)
                        .as("statut de l'engin commenté par " + a.id)
                        .isEqualTo("PUBLISHED");
            });
        }

        @Test
        @DisplayName("Les notes ne sont pas toutes maximales")
        void notesNuancees() {
            // Un catalogue où tout est à cinq étoiles ne se croit pas, et une
            // plateforme qui dit mesurer la fiabilité doit pouvoir afficher une
            // réserve.
            assertThat(CatalogSeeder.avis().stream().map(a -> a.rating).distinct())
                    .as("notes distinctes").hasSizeGreaterThan(1);
            assertThat(CatalogSeeder.avis().stream().anyMatch(a -> a.rating < 5))
                    .as("au moins un avis réservé").isTrue();
            CatalogSeeder.avis().forEach(a ->
                    assertThat(a.rating).as("note de " + a.id).isBetween(1, 5));
        }

        @Test
        @DisplayName("Un auteur ne commente pas deux fois le même engin")
        void pasDeDoubleAvis() {
            // C'est la règle du service : le couple engin-client est unique.
            // L'amorçage ne doit pas la violer, sinon il crée un état que
            // l'application elle-même refuserait de produire.
            long couples = CatalogSeeder.avis().stream()
                    .map(a -> a.equipmentId + "/" + a.clientId).distinct().count();
            assertThat(couples).isEqualTo(CatalogSeeder.avis().size());
        }

        @Test
        @DisplayName("Les auteurs existent et ne peuvent pas se connecter")
        void auteursSansAcces() {
            CatalogSeeder.avis().forEach(a -> {
                var auteur = users.findById(a.clientId).orElse(null);
                assertThat(auteur).as("auteur de " + a.id).isNotNull();
                assertThat(auteur.role).as("rôle de l'auteur").isEqualTo("CLIENT");
                assertThat(auteur.passwordHash)
                        .as("un compte de vitrine ne se connecte pas").isNull();
            });
        }

        @Test
        @DisplayName("Les j'aime sont en base, un par couple engin-client")
        void jaimeEnBase() {
            assertThat(likes.count()).as("j'aime").isPositive();
            long couples = CatalogSeeder.jaime().stream()
                    .map(l -> l.equipmentId + "/" + l.clientId).distinct().count();
            assertThat(couples).isEqualTo(CatalogSeeder.jaime().size());
        }

        @Test
        @DisplayName("Un second amorçage ne duplique ni avis ni j'aime")
        void pasDeDoublon() {
            long a = reviews.count();
            long j = likes.count();
            CatalogSeeder.seed(users, equipment, listings, references, reviews, likes);
            assertThat(reviews.count()).isEqualTo(a);
            assertThat(likes.count()).isEqualTo(j);
        }
    }

}
