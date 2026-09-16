package ci.volta.backend.model;

import ci.volta.backend.model.converters.JsonConverters;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Demande d'un parcours public : location, achat libre, technicien, offre
 * d'engin, catalogue, GOLD, accompagnement, candidature à l'équipe technique.
 *
 * Huit intentions, une seule table : elles ne diffèrent que par les réponses
 * du formulaire, portées par {@code payload}. Aucune n'exige de compte au
 * dépôt — le déposant reçoit une référence et un secret de suivi, jamais un
 * accès à son propre dossier.
 */
@Entity
@Table(name = "public_requests")
public class PublicRequest {

    @Id
    public String id;

    /** Référence lisible : « VOL-REQ-2026-000001 ». */
    public String reference;

    /**
     * Secret de suivi remis avec la référence. La référence est séquentielle
     * et se devine ; le suivi public exige les deux. Jamais sérialisé : il
     * n'est communiqué qu'une fois, dans l'accusé de dépôt.
     */
    @JsonIgnore
    @Column(length = 32)
    public String trackingToken;

    /** Nature déduite de l'intention (RENTAL, PURCHASE, TECHNICIAN, EQUIPMENT_OFFER, SUPPORT, GOLD). */
    public String kind;

    /** Intention d'origine (RENT_EQUIPMENT, BUY_EQUIPMENT, JOIN_TECHNICAL_TEAM…). */
    public String intent;

    @Column(columnDefinition = "TEXT")
    public String subject;

    public String contactName;
    public String contactCompany = "";
    public String contactPhone;
    public String contactEmail;
    public String contactCity = "";

    public String location = "";
    public String status;
    public String priority;

    /** Administrateur qui en a la charge, s'il est désigné. */
    public String ownerId;

    /**
     * Réponses propres au parcours emprunté : un besoin de location et une
     * candidature GOLD ne remplissent pas les mêmes champs, et les aplatir en
     * colonnes obligerait à rendre optionnel presque tout le modèle.
     */
    @Convert(converter = JsonConverters.StringMapConverter.class)
    @Column(columnDefinition = "TEXT")
    public Map<String, String> payload = new LinkedHashMap<>();

    /** Historique horodaté des décisions de traitement, en texte libre. */
    @Column(columnDefinition = "TEXT")
    public String notes = "";

    public String createdAt;
    public String updatedAt;
}
