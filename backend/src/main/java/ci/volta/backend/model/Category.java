package ci.volta.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    public String id;
    public String name;
    public String icon;

    /**
     * La photo de la catégorie.
     *
     * Le pictogramme suffit dans un filtre, pas sur une carte : « Niveleuse »
     * et « Compacteur » se distinguent à l'image avant de se lire, et c'est ce
     * qui permet à un chef de chantier de trouver sa machine sans déchiffrer
     * dix intitulés. Nulle tant qu'aucune photo n'a été posée — la carte
     * retombe alors sur son pictogramme.
     */
    public String image;
}
