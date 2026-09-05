package ci.volta.backend.config;

import ci.volta.backend.security.SessionAuthFilter;
import ci.volta.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration de sécurité.
 *
 * Le SessionAuthFilter est indispensable : sans lui, la règle
 * anyRequest().authenticated() n'avait aucun moyen d'être satisfaite, puisque
 * rien ne peuplait le contexte de sécurité à partir du jeton.
 *
 * Les règles ci-dessous constituent une première barrière par rôle. Elles ne
 * suffisent pas : savoir qu'un appelant est SUPPLIER ne dit pas que la
 * ressource visée est la sienne. Le contrôle de propriété est fait dans le
 * service, au plus près de la donnée.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final SessionAuthFilter sessionAuthFilter;
    private final String allowedOrigins;

    public SecurityConfig(AuthService authService,
                          @Value("${volta.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
                          String allowedOrigins) {
        // Instancié ici plutôt qu'injecté : le filtre n'est pas un bean, afin de
        // n'exister que dans la chaîne de sécurité.
        this.sessionAuthFilter = new SessionAuthFilter(authService);
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Sans cookie de session, il n'y a pas de requête intersite à forger :
            // le jeton voyage dans un en-tête que le navigateur n'ajoute pas seul.
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(authz -> authz
                // --- Public ---
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/equipment").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                // Spring redirige vers /error après une exception du contrôleur.
                // Protéger cette route ferait répondre 401 à la place du statut
                // réellement levé — un 404 ou un 409 deviendrait un 401.
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // --- Comptes ---
                // Créer un compte ou changer un rôle relève de l'administration.
                .requestMatchers(HttpMethod.POST, "/api/users").hasRole("ADMIN")
                // La consultation reste ouverte aux utilisateurs identifiés :
                // l'application a besoin de l'annuaire — le technicien doit
                // nommer le propriétaire de l'engin qu'il inspecte, le client le
                // loueur qui lui répond. Les coordonnées, elles, sont retirées
                // de la réponse pour tout le monde sauf l'administration
                // (VoltaService.listVisibleUsers), et la modification est
                // contrôlée pièce par pièce dans le service.
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // --- Catalogue : consultation ouverte, écriture réservée ---
                .requestMatchers(HttpMethod.POST, "/api/equipment").hasAnyRole("SUPPLIER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/equipment/**").hasAnyRole("SUPPLIER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/equipment/**").hasAnyRole("SUPPLIER", "ADMIN")
                .requestMatchers("/api/equipment/*/submit").hasAnyRole("SUPPLIER", "ADMIN")
                .requestMatchers("/api/equipment/*/publish",
                                 "/api/equipment/*/unpublish",
                                 "/api/equipment/*/reject",
                                 "/api/equipment/*/request-correction",
                                 "/api/equipment/*/reference").hasRole("ADMIN")

                // --- Demandes de devis : émises par le client ---
                .requestMatchers(HttpMethod.POST, "/api/quote-requests").hasAnyRole("CLIENT", "ADMIN")

                // --- Devis : rédigés par le fournisseur, tranchés par le client ---
                .requestMatchers(HttpMethod.POST, "/api/quotes").hasAnyRole("SUPPLIER", "ADMIN")
                .requestMatchers("/api/quotes/*/accept", "/api/quotes/*/reject").hasAnyRole("CLIENT", "ADMIN")

                // --- Inspections : métier du technicien ---
                .requestMatchers(HttpMethod.POST, "/api/inspections").hasAnyRole("TECHNICAL", "ADMIN")
                .requestMatchers("/api/inspections/**").hasAnyRole("TECHNICAL", "ADMIN")

                .anyRequest().authenticated()
            )

            // Le filtre précède l'authentification par formulaire : le contexte
            // doit être peuplé avant que les règles ci-dessus soient évaluées.
            .addFilterBefore(sessionAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // Sans ces gestionnaires, Spring renvoie une page de connexion HTML
            // à un client qui attend du JSON.
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authEx) ->
                    writeError(response, 401, "Authentification requise"))
                .accessDeniedHandler((request, response, deniedEx) ->
                    writeError(response, 403, "Vous n'avez pas les droits nécessaires pour cette action"))
            );

        return http.build();
    }

    /**
     * Réponse d'erreur JSON, de même forme que celles du GlobalExceptionHandler.
     *
     * Le JSON est écrit à la main plutôt que par un ObjectMapper : ces
     * gestionnaires s'exécutent avant la couche de sérialisation de Spring MVC,
     * et le message est la seule valeur variable.
     */
    private void writeError(jakarta.servlet.http.HttpServletResponse response,
                            int status, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String error = status == 401 ? "Unauthorized" : "Forbidden";
        // Les guillemets du message sont échappés : un message non échappé
        // produirait un JSON invalide.
        String safeMessage = message == null ? "" : message.replace("\\", "\\\\").replace("\"", "\\\"");

        response.getWriter().write(
                "{\"status\":" + status
                + ",\"error\":\"" + error + "\""
                + ",\"message\":\"" + safeMessage + "\"}");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Les origines sont désormais énumérées : avec "*" et allowCredentials,
        // n'importe quel site pouvait appeler l'API avec les droits du visiteur.
        configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
