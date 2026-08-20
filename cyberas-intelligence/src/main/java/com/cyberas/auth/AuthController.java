package com.cyberas.auth;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.util.UUID;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    @Inject
    AuthService authService;

    @Inject
    Mailer mailer;

    private static final Logger LOG = Logger.getLogger(AuthController.class);

    @POST
    @Path("/signup")
    public Response signup(SignupRequest request) {
        try {
            if (!isValidEmail(request.email)) {
                return Response.status(400).entity(new ErrorResponse("Email invalide")).build();
            }
            if (request.password.length() < 8) {
                return Response.status(400).entity(new ErrorResponse("Le mot de passe doit contenir au moins 8 caractères")).build();
            }

            User user = authService.createUser(request.email, request.password, request.role);
            String verificationCode = generateVerificationCode();
            authService.saveVerificationCode(user.id, verificationCode);

            sendVerificationEmail(request.email, verificationCode);

            return Response.ok(new SignupResponse(user.id, user.email, "Vérification envoyée")).build();
        } catch (Exception e) {
            LOG.error("Erreur signup", e);
            return Response.status(500).entity(new ErrorResponse("Erreur lors de l'inscription")).build();
        }
    }

    @POST
    @Path("/verify")
    public Response verify(VerifyRequest request) {
        try {
            boolean valid = authService.verifyCode(request.email, request.verificationCode);
            if (!valid) {
                return Response.status(400).entity(new ErrorResponse("Code de vérification invalide")).build();
            }

            String token = authService.generateToken(request.email);
            String role = authService.getUserRole(request.email);

            return Response.ok(new LoginResponse(token, role)).build();
        } catch (Exception e) {
            LOG.error("Erreur verify", e);
            return Response.status(500).entity(new ErrorResponse("Erreur lors de la vérification")).build();
        }
    }

    @POST
    @Path("/login")
    public Response login(LoginRequest request) {
        try {
            boolean valid = authService.validateCredentials(request.email, request.password);
            if (!valid) {
                return Response.status(401).entity(new ErrorResponse("Email ou mot de passe incorrect")).build();
            }

            String token = authService.generateToken(request.email);
            String role = authService.getUserRole(request.email);

            return Response.ok(new LoginResponse(token, role)).build();
        } catch (Exception e) {
            LOG.error("Erreur login", e);
            return Response.status(500).entity(new ErrorResponse("Erreur lors de la connexion")).build();
        }
    }

    @POST
    @Path("/refresh")
    public Response refresh(@HeaderParam("Authorization") String token) {
        try {
            String email = authService.validateToken(token);
            String newToken = authService.generateToken(email);
            return Response.ok(new RefreshResponse(newToken)).build();
        } catch (Exception e) {
            return Response.status(401).entity(new ErrorResponse("Token invalide")).build();
        }
    }

    private void sendVerificationEmail(String email, String code) {
        mailer.send(Mail.withText(email, "CYBERAS Intelligence - Vérification d'email",
                "Votre code de vérification est: " + code + "\n\nVous avez 30 minutes pour l'utiliser."));
    }

    private String generateVerificationCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    private boolean isValidEmail(String email) {
        return email != null && email.contains("@") && email.contains(".");
    }

    // DTOs
    public static class SignupRequest {
        public String email;
        public String password;
        public String role; // "rssi" or "auditeur"
    }

    public static class SignupResponse {
        public long userId;
        public String email;
        public String message;

        public SignupResponse(long userId, String email, String message) {
            this.userId = userId;
            this.email = email;
            this.message = message;
        }
    }

    public static class VerifyRequest {
        public String email;
        public String verificationCode;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class LoginResponse {
        public String token;
        public String role;

        public LoginResponse(String token, String role) {
            this.token = token;
            this.role = role;
        }
    }

    public static class RefreshResponse {
        public String token;

        public RefreshResponse(String token) {
            this.token = token;
        }
    }

    public static class ErrorResponse {
        public String message;

        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}
