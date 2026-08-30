package ci.volta.backend.web;

import ci.volta.backend.model.UserAccount;
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

    public record RegisterRequest(String name, String email, String phone, String password) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record AuthResponse(String token, UserAccount user) {
    }

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody RegisterRequest body) {
        AuthService.AuthResult result = authService.register(body.name(), body.email(), body.phone(), body.password());
        return new AuthResponse(result.token(), result.user());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest body) {
        AuthService.AuthResult result = authService.login(body.email(), body.password());
        return new AuthResponse(result.token(), result.user());
    }

    @GetMapping("/me")
    public UserAccount me(@RequestHeader(value = "X-Session-Token", required = false) String token) {
        return authService.me(token);
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader(value = "X-Session-Token", required = false) String token) {
        authService.logout(token);
    }
}
