package ci.volta.backend.repository;

import ci.volta.backend.model.PublicRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PublicRequestRepository extends JpaRepository<PublicRequest, String> {

    Optional<PublicRequest> findByReference(String reference);

    List<PublicRequest> findAllByOrderByCreatedAtDesc();

    /** Ce qu'un fournisseur voit : uniquement ce que VOLTA lui a transmis. */
    List<PublicRequest> findBySupplierIdOrderByCreatedAtDesc(String supplierId);

    /**
     * Les demandes d'un client : les siennes par le compte, et celles qu'il a
     * déposées avant d'en avoir un.
     *
     * Les trois critères coexistent parce que le dépôt reste ouvert aux
     * visiteurs. {@code clientId} n'existe que depuis l'ajout de ce champ : les
     * demandes antérieures, et celles faites sans être connecté, ne se
     * rattachent à leur auteur que par le courriel ou le numéro. Chercher sur
     * le seul identifiant les laisserait invisibles pour toujours.
     *
     * Le numéro est comparé tel qu'il a été saisi : la demande ne garde pas sa
     * forme normalisée. Un client qui écrit « +225 07 00 00 07 » ici et
     * « 0700000007 » là ne sera rapproché que par le courriel — ou par le
     * compte, dès lors qu'il dépose en étant connecté.
     */
    @Query("select r from PublicRequest r"
            + " where (:clientId is not null and r.clientId = :clientId)"
            + "    or (:email is not null and lower(r.contactEmail) = :email)"
            + "    or (:phone is not null and r.contactPhone = :phone)"
            + " order by r.createdAt desc")
    List<PublicRequest> findMine(@Param("clientId") String clientId,
                                 @Param("email") String email,
                                 @Param("phone") String phone);
}
