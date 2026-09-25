package ci.volta.backend.model;

import ci.volta.backend.model.converters.JsonConverters;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inspections")
public class Inspection {
    @Id
    public String id;
    /** Référence métier stable, ex. VOL-VER-2026-000001. */
    public String reference;
    public String equipmentId;
    public String technicalTeamId;
    public String assignedAt;
    public String status;
    @Convert(converter = JsonConverters.ChecklistConverter.class)
    @Column(columnDefinition = "TEXT")
    public List<ChecklistItem> checklist = new ArrayList<>();
    @Convert(converter = JsonConverters.StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    public List<String> photos = new ArrayList<>();
    @Convert(converter = JsonConverters.StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    public List<String> anomalies = new ArrayList<>();

    /**
     * Papiers de douane de l'engin, téléversés par le technicien.
     *
     * Un engin importé sans dédouanement en règle ne peut ni changer de main
     * ni franchir une frontière : le vérifier sur place, pièces à l'appui,
     * évite de découvrir le problème une fois la location engagée. Comme les
     * photos, la liste porte les chemins des fichiers, pas leur contenu.
     */
    @Convert(converter = JsonConverters.StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    public List<String> customsDocuments = new ArrayList<>();

    /**
     * Capacité de l'équipe mécanique à se déplacer jusqu'à l'engin.
     *
     * Un engin conforme mais que personne ne peut aller entretenir n'est pas
     * exploitable ; le technicien constate sur place de quels moyens dispose
     * le fournisseur.
     */
    @Column(columnDefinition = "TEXT")
    public String teamMobility;

    /** Sous quel délai le fournisseur peut réellement mettre l'engin à disposition. */
    public String availabilityLeadTime;
}
