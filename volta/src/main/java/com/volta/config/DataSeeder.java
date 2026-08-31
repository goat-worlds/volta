package com.volta.config;

import com.volta.domain.*;
import com.volta.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
  private final UserRepository userRepository;
  private final CategoryRepository categoryRepository;
  private final EquipmentRepository equipmentRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  public void run(String... args) throws Exception {
    if (userRepository.count() > 0) {
      log.info("Database already seeded, skipping...");
      return;
    }

    log.info("Seeding database...");

    // Create categories
    seedCategories();

    // Create users
    seedUsers();

    // Create equipment
    seedEquipment();

    log.info("Database seeded successfully!");
  }

  private void seedCategories() {
    List<Category> categories = Arrays.asList(
        Category.builder().id("c-pelle").name("Pelles hydrauliques").icon("pelle").build(),
        Category.builder().id("c-chargeuse").name("Chargeuses").icon("chargeuse").build(),
        Category.builder().id("c-benne").name("Bennes").icon("benne").build(),
        Category.builder().id("c-bulldozer").name("Bulldozers").icon("bulldozer").build(),
        Category.builder().id("c-compacteur").name("Compacteurs").icon("compacteur").build(),
        Category.builder().id("c-grue").name("Grues").icon("grue").build()
    );
    categoryRepository.saveAll(categories);
    log.info("Categories seeded: {}", categories.size());
  }

  private void seedUsers() {
    List<User> users = Arrays.asList(
        User.builder()
            .id("u-admin")
            .name("Kouadio Félix")
            .email("admin@volta.ci")
            .passwordHash(passwordEncoder.encode("password123"))
            .role(Role.ADMIN)
            .company("VOLTA")
            .phone("+225 07 00 00 01")
            .city("Abidjan")
            .build(),
        User.builder()
            .id("u-sup-1")
            .name("Boss Diarra")
            .email("supplier@volta.ci")
            .passwordHash(passwordEncoder.encode("password123"))
            .role(Role.SUPPLIER)
            .company("BTP CI SARL")
            .phone("+225 07 00 00 02")
            .city("Abidjan")
            .build(),
        User.builder()
            .id("u-sup-2")
            .name("Awa Koné")
            .email("supplier2@volta.ci")
            .passwordHash(passwordEncoder.encode("password123"))
            .role(Role.SUPPLIER)
            .company("Afrique Matériel")
            .phone("+225 07 00 00 03")
            .city("Yamoussoukro")
            .build(),
        User.builder()
            .id("u-tech-1")
            .name("Yao Kouassi")
            .email("technical@volta.ci")
            .passwordHash(passwordEncoder.encode("password123"))
            .role(Role.TECHNICAL)
            .company("Société Technique ABC")
            .phone("+225 07 00 00 04")
            .city("Abidjan")
            .build(),
        User.builder()
            .id("u-client-1")
            .name("Jean Konan")
            .email("client@volta.ci")
            .passwordHash(passwordEncoder.encode("password123"))
            .role(Role.CLIENT)
            .company("Entreprise BTP Konan")
            .phone("+225 07 00 00 05")
            .city("Abidjan")
            .build()
    );
    userRepository.saveAll(users);
    log.info("Users seeded: {}", users.size());
  }

  private void seedEquipment() {
    List<Equipment> equipment = Arrays.asList(
        Equipment.builder()
            .id("eq-1")
            .name("Caterpillar 320D2")
            .categoryId("c-pelle")
            .brand("Caterpillar")
            .model("320D2")
            .year(2016)
            .hours(4528)
            .location("Abidjan, Côte d'Ivoire")
            .description("Pelle hydraulique fiable, puissante et économique en carburant. Idéale pour les travaux de terrassement, carrières et grands chantiers.")
            .photos(Arrays.asList(
                "https://picsum.photos/seed/cat320-1/640/420",
                "https://picsum.photos/seed/cat320-2/640/420",
                "https://picsum.photos/seed/cat320-3/640/420"
            ))
            .supplierId("u-sup-1")
            .status(EquipmentStatus.PUBLISHED)
            .category('A')
            .declaredCondition("Très bon état")
            .pricePerDay(new BigDecimal("50000"))
            .tier(EquipmentTier.GOLD)
            .likes(128)
            .build(),
        Equipment.builder()
            .id("eq-2")
            .name("Komatsu PC210LC-8")
            .categoryId("c-pelle")
            .brand("Komatsu")
            .model("PC210LC-8")
            .year(2018)
            .hours(3900)
            .location("Abidjan, Côte d'Ivoire")
            .description("Pelle hydraulique polyvalente, entretien à jour, prête pour chantier.")
            .photos(Arrays.asList(
                "https://picsum.photos/seed/komatsu-1/640/420",
                "https://picsum.photos/seed/komatsu-2/640/420"
            ))
            .supplierId("u-sup-2")
            .status(EquipmentStatus.PUBLISHED)
            .category('B')
            .declaredCondition("Bon état")
            .pricePerDay(new BigDecimal("40000"))
            .tier(EquipmentTier.SILVER)
            .likes(86)
            .build(),
        Equipment.builder()
            .id("eq-3")
            .name("Volvo A40G")
            .categoryId("c-benne")
            .brand("Volvo")
            .model("A40G")
            .year(2019)
            .hours(2100)
            .location("Abidjan, Côte d'Ivoire")
            .description("Benne articulée de 24 tonnes de capacité. Excellente pour travaux de terrassement et transport de matériaux.")
            .photos(Arrays.asList(
                "https://picsum.photos/seed/volvo-1/640/420",
                "https://picsum.photos/seed/volvo-2/640/420"
            ))
            .supplierId("u-sup-1")
            .status(EquipmentStatus.PUBLISHED)
            .category('A')
            .declaredCondition("Très bon état")
            .pricePerDay(new BigDecimal("45000"))
            .tier(EquipmentTier.GOLD)
            .likes(112)
            .build(),
        Equipment.builder()
            .id("eq-4")
            .name("CAT D9R")
            .categoryId("c-bulldozer")
            .brand("Caterpillar")
            .model("D9R")
            .year(2017)
            .hours(3500)
            .location("Yamoussoukro, Côte d'Ivoire")
            .description("Bulldozer puissant pour grands projets. Équipé de lame large et ripper arrière.")
            .photos(Arrays.asList(
                "https://picsum.photos/seed/bull-1/640/420",
                "https://picsum.photos/seed/bull-2/640/420"
            ))
            .supplierId("u-sup-2")
            .status(EquipmentStatus.PUBLISHED)
            .category('C')
            .declaredCondition("Bon état")
            .pricePerDay(new BigDecimal("55000"))
            .tier(EquipmentTier.BASIC)
            .likes(75)
            .build(),
        Equipment.builder()
            .id("eq-5")
            .name("Compacteur Bomag BW 213")
            .categoryId("c-compacteur")
            .brand("Bomag")
            .model("BW 213")
            .year(2015)
            .hours(2800)
            .location("Abidjan, Côte d'Ivoire")
            .description("Compacteur tandem vibrant 13 tonnes. Idéal pour compactage de chaussées et pistes.")
            .photos(Arrays.asList(
                "https://picsum.photos/seed/comp-1/640/420",
                "https://picsum.photos/seed/comp-2/640/420"
            ))
            .supplierId("u-sup-1")
            .status(EquipmentStatus.PUBLISHED)
            .category('D')
            .declaredCondition("Bon état")
            .pricePerDay(new BigDecimal("35000"))
            .tier(EquipmentTier.SILVER)
            .likes(62)
            .build()
    );
    equipmentRepository.saveAll(equipment);
    log.info("Equipment seeded: {}", equipment.size());
  }
}
