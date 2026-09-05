package ci.volta.backend.web;

import ci.volta.backend.model.UserAccount;
import ci.volta.backend.security.CurrentUser;
import ci.volta.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * Le rôle, la raison sociale et la ville sont facultatifs dans le contrat :
     * un client s'inscrit sans les renseigner. AuthService refuse les
     * combinaisons incohérentes — un rôle non attribuable, ou un fournisseur
     * sans structure.
     */
    public record RegisterRequest(String name, String email, String phone, String password,
                                  String role, String company, String city) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record AuthResponse(String token, UserAccount user) {
    }

    private final AuthService authService;
    private final CurrentUser currentUser;

    public AuthController(AuthService authService, CurrentUser currentUser) {
        this.authService = authService;
        this.currentUser = currentUser;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody RegisterRequest body) {
        AuthService.AuthResult result = authService.register(
                body.name(), body.email(), body.phone(), body.password(),
                body.role(), body.company(), body.city());
        return new AuthResponse(result.token(), result.user());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest body) {
        AuthService.AuthResult result = authService.login(body.email(), body.password());
        return new AuthResponse(result.token(), result.user());
    }

    /**
     * Utilisateur de la session en cours.
     *
     * Lisait le jeton dans X-Session-Token uniquement : un appel portant le
     * jeton dans l'en-tête Authorization — que le filtre accepte pourtant —
     * repartait en 401. On s'appuie sur le contexte de sécurité, déjà peuplé
     * par le filtre, quelle que soit la forme de l'en-tête.
     */
    @GetMapping("/me")
    public UserAccount me() {
        return currentUser.require();
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader(value = "X-Session-Token", required = false) String token) {
        authService.logout(token);
    }
}
