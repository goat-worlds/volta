package ci.volta.backend.security;

import ci.volta.backend.model.UserAccount;
import ci.volta.backend.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Authentifie les requêtes à partir du jeton de session.
 *
 * Cette pièce manquait : SecurityConfig exigeait une requête authentifiée mais
 * aucun filtre ne peuplait le contexte de sécurité. Les jetons émis par
 * AuthService n'étaient donc jamais vérifiés, et le rôle porté par l'utilisateur
 * n'atteignait jamais la chaîne d'autorisation.
 *
 * Le filtre se contente de poser l'identité quand le jeton est valide. Il ne
 * refuse rien lui-même : décider du 401 ou du 403 revient à la chaîne de
 * sécurité, qui seule connaît les règles de la route demandée.
 */
@Component
public class SessionAuthFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String BEARER = "Bearer ";
    /** Certains clients envoient le jeton hors du header standard. */
    private static final String FALLBACK_HEADER = "X-Session-Token";

    private final AuthService authService;

    public SessionAuthFilter(AuthService authService) {
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // Une identité déjà posée n'est pas écrasée : le filtre peut être
        // traversé plusieurs fois selon la configuration.
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = extractToken(request);

            authService.resolveUser(token).ifPresent(user -> {
                var authentication = new UsernamePasswordAuthenticationToken(
                        user, null, authorities(user));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header != null && header.startsWith(BEARER)) {
            return header.substring(BEARER.length()).trim();
        }
        // Le jeton n'est pas un JWT : un client peut légitimement l'envoyer
        // brut, sans préfixe.
        if (header != null && !header.isBlank()) {
            return header.trim();
        }
        return request.getHeader(FALLBACK_HEADER);
    }

    /**
     * Le rôle est préfixé « ROLE_ » car c'est la convention qu'attend
     * hasRole() ; sans ce préfixe, aucune règle d'autorisation ne
     * correspondrait, quel que soit le rôle réellement porté.
     */
    private List<SimpleGrantedAuthority> authorities(UserAccount user) {
        String role = user.role == null || user.role.isBlank() ? "CLIENT" : user.role.trim().toUpperCase();
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }
}
