package ci.volta.backend.model;

import ci.volta.backend.model.converters.JsonConverters;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/**
 * Annonce de vente sur Volta Market (voir MarketWorkflow).
 *
 * Elle est distincte de l'équipement du catalogue de location : un engin
 * référencé peut être mis en vente (equipmentId le rattache), mais un vendeur
 * peut aussi proposer un matériel qui n'a jamais été loué. Le prix demandé est
 * une déclaration du vendeur ; l'offre que reçoit l'acheteur est préparée par
 * Génie Sélect après vérification.
 */
@Entity
@Table(name = "sale_listings")
public class SaleListing {
    @Id
    public String id;
    /** Référence métier, ex. VOL-MKT-2026-000001. */
    public String reference;
    public String title;
    public String categoryId;
    public String brand;
    public String model;
    @Column(name = "model_year")
    public Integer year;
    public Integer hours;
    public String location;
    /** NEUF ou OCCASION. « condition » est un mot réservé de MariaDB. */
    @Column(name = "item_condition")
    public String condition;
    /** Prix demandé en FCFA, tel que déclaré par le vendeur. */
    public long askingPrice;
    public boolean negotiable;
    @Column(columnDefinition = "TEXT")
    public String description;
    @Convert(converter = JsonConverters.StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    public List<String> photos = new ArrayList<>();
    @Convert(converter = JsonConverters.DocumentListConverter.class)
    @Column(columnDefinition = "TEXT")
    public List<DocumentInfo> documents = new ArrayList<>();
    /** Engin du catalogue dont l'annonce est issue, ou null. */
    public String equipmentId;
    public String sellerId;
    public String status;
    /** Mise en avant décidée par l'équipe VOLTA, jamais par le vendeur. */
    public boolean featured;
    /** Motif du dernier rejet, pour que le vendeur sache quoi corriger. */
    @Column(columnDefinition = "TEXT")
    public String reviewNote;
    /**
     * Commandes que le vendeur n'a pas pu honorer sur cette annonce.
     *
     * La charte fournisseur engage à pouvoir livrer ce qui est publié. Un
     * manquement isolé arrive ; répété, il fait perdre au catalogue sa
     * promesse. Au troisième, l'annonce est retirée de la vitrine — retirée,
     * pas supprimée : l'historique et la décision restent consultables.
     *
     * Le type est primitif avec un défaut à zéro : les annonces déjà en base
     * n'ont pas la colonne, et une valeur nulle ferait échouer la lecture.
     */
    public int deliveryFailureCount;
    public String createdAt;
    public String updatedAt;
    public String publishedAt;
    public String soldAt;
}
