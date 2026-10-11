package ci.volta.backend.model;

import ci.volta.backend.model.converters.JsonConverters;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipment")
public class Equipment {
    @Id
    public String id;
    /** Référence métier stable, ex. VOL-RES-2026-000001. */
    public String reference;
    public String name;
    public String categoryId;
    public String brand;
    public String model;
    @Column(name = "model_year")
    public int year;
    public int hours;
    public String location;
    public long pricePerDay;
    public boolean available;
    public boolean withOperator;
    @Column(columnDefinition = "TEXT")
    public String description;
    @Convert(converter = JsonConverters.StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    public List<String> photos = new ArrayList<>();
    @Convert(converter = JsonConverters.DocumentListConverter.class)
    @Column(columnDefinition = "TEXT")
    public List<DocumentInfo> documents = new ArrayList<>();
    public String supplierId;
    public String status;
    public String level;
    public String declaredCondition;
    /**
     * Les caractéristiques de la plaque.
     *
     * <h2>Pourquoi des chaînes et non des nombres</h2>
     *
     * Une puissance se lit « 148 kW (198 ch) », un poids « 21 500 kg », un
     * godet « 1,2 m³ ». Les stocker en nombres obligerait à choisir une unité
     * par champ, à convertir ce que le fournisseur recopie de sa documentation,
     * et à inventer ce qu'il ne sait pas. On n'en fait aucun calcul : on les
     * affiche. Une chaîne les rend telles qu'elles sont écrites sur l'engin.
     *
     * Le filtre du catalogue ne s'appuie sur aucune d'elles — il trie par
     * catégorie et par prix, qui sont, eux, des nombres.
     */
    public String power;
    public String operatingWeight;
    public String bucketCapacity;
    public String dimensions;

    /** Ce que la liste ci-dessus ne prévoit pas : attache rapide, flèche, options. */
    @Lob
    @Column(columnDefinition = "TEXT")
    public String otherSpecs;

    /**
     * Date du dernier rapport d'inspection validé.
     *
     * Recopiée ici plutôt que recherchée dans les inspections : la fiche d'un
     * engin et le catalogue l'affichent, et aller la chercher par une jointure
     * à chaque vignette coûterait une requête par engin pour une date qui ne
     * change que deux fois par an.
     */
    /**
     * Combien de fois l'engin a été annoncé disponible sans l'être.
     *
     * Une disponibilité affichée est une promesse : c'est sur elle que VOLTA
     * engage un marché, et c'est elle qui s'effondre quand la machine n'est pas
     * là. Un oubli se comprend ; trois ne sont plus un oubli.
     *
     * Au troisième, l'engin quitte le catalogue. Le fournisseur garde son
     * compte et sa fiche — il peut corriger et resoumettre — mais sa machine ne
     * s'affiche plus tant qu'elle n'a pas repassé le circuit.
     */
    public int unavailabilityStrikes;

    public String lastInspectionAt;

    /**
     * Le plancher du fournisseur, en FCFA.
     *
     * {@code pricePerDay} est la première proposition : ce que le client voit
     * et ce sur quoi il demande un devis. Ce champ est l'autre borne — le prix
     * sous lequel le fournisseur ne descend pas, qu'il fixe en confiant sa
     * machine à l'inspection.
     *
     * Il ne sort jamais vers le client : c'est la marge de négociation de
     * VOLTA, et la connaître reviendrait à négocier contre soi-même. Voir
     * {@code VoltaService} pour le masquage.
     */
    @JsonIgnore
    public Long priceFloor;

    public String createdAt;
}
