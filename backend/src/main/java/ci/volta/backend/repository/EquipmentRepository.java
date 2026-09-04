package ci.volta.backend.repository;

import ci.volta.backend.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, String> {

    /**
     * Équipements visibles au catalogue public.
     *
     * Seuls les équipements publiés y figurent : un matériel encore en DRAFT ou
     * SUBMITTED n'a été ni inspecté ni classé, et l'exposer contredirait la
     * promesse d'équipements vérifiés faite au client.
     */
    List<Equipment> findByStatus(String status);

    /** Catalogue d'un fournisseur, tous statuts confondus. */
    List<Equipment> findBySupplierId(String supplierId);
}
