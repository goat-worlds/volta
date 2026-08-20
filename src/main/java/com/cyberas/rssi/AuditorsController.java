package com.cyberas.rssi;

import com.cyberas.auth.AuthService;
import com.cyberas.auth.User;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.List;

@Path("/api/rssi/auditors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("rssi")
public class AuditorsController {

    @Inject
    EntityManager em;

    @Inject
    AuthService authService;

    @Inject
    Mailer mailer;

    @Context
    SecurityContext securityContext;

    private static final Logger LOG = Logger.getLogger(AuditorsController.class);

    @GET
    public Response listAuditors() {
        try {
            String rssiBareLogin = securityContext.getUserPrincipal().getName();
            User rssiUser = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", rssiBareLogin)
                    .getSingleResult();

            List<Auditor> auditors = em.createQuery("SELECT a FROM Auditor a WHERE a.rssiId = :rssiId", Auditor.class)
                    .setParameter("rssiId", rssiUser.id)
                    .getResultList();

            return Response.ok(auditors).build();
        } catch (Exception e) {
            LOG.error("Erreur lors de la récupération des auditeurs", e);
            return Response.status(500).entity(new ErrorResponse("Erreur serveur")).build();
        }
    }

    @POST
    @Path("/invite")
    @Transactional
    public Response inviteAuditor(InviteRequest request) {
        try {
            String rssiBareLogin = securityContext.getUserPrincipal().getName();
            User rssiUser = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", rssiBareLogin)
                    .getSingleResult();

            // Create auditor record
            Auditor auditor = new Auditor();
            auditor.rssiId = rssiUser.id;
            auditor.email = request.email;
            auditor.name = request.name;
            auditor.status = "en_attente";
            auditor.createdAt = Instant.now();

            em.persist(auditor);

            // Send invitation email
            sendInvitationEmail(request.email, request.name);

            return Response.ok(auditor).build();
        } catch (Exception e) {
            LOG.error("Erreur lors de l'invitation", e);
            return Response.status(500).entity(new ErrorResponse("Erreur lors de l'invitation")).build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response removeAuditor(@PathParam("id") Long id) {
        try {
            Auditor auditor = em.find(Auditor.class, id);
            if (auditor == null) {
                return Response.status(404).entity(new ErrorResponse("Auditeur non trouvé")).build();
            }

            // Verify ownership
            String rssiBareLogin = securityContext.getUserPrincipal().getName();
            User rssiUser = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", rssiBareLogin)
                    .getSingleResult();

            if (!auditor.rssiId.equals(rssiUser.id)) {
                return Response.status(403).entity(new ErrorResponse("Non autorisé")).build();
            }

            em.remove(auditor);
            return Response.noContent().build();
        } catch (Exception e) {
            LOG.error("Erreur lors de la suppression", e);
            return Response.status(500).entity(new ErrorResponse("Erreur serveur")).build();
        }
    }

    private void sendInvitationEmail(String email, String name) {
        String subject = "CYBERAS Intelligence - Invitation d'audit";
        String body = "Bonjour " + name + ",\n\n" +
                "Vous êtes invité à rejoindre CYBERAS Intelligence en tant qu'auditeur.\n" +
                "Vous pouvez consulter et participer aux missions d'audit assignées.\n\n" +
                "Accédez à la plateforme: https://cyberas.local\n" +
                "Rôle: Auditeur\n\n" +
                "Cordialement,\nLe RSSI";
        mailer.send(Mail.withText(email, subject, body));
    }

    // DTOs
    public static class InviteRequest {
        public String email;
        public String name;
    }

    public static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
