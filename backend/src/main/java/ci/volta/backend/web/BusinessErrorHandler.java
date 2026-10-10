package ci.volta.backend.web;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Rend au client la raison d'un refus.
 *
 * <h2>Le défaut</h2>
 *
 * Le service refuse en expliquant : « Le RCCM et la DFE sont requis »,
 * « Signez le contrat de collaboration pour activer votre compte »,
 * « Aucune proposition n'attend votre réponse ». Ces phrases sont la moitié du
 * travail — elles disent quoi faire. Elles n'arrivaient nulle part : la
 * réponse d'erreur par défaut ne porte que le code, et l'écran affichait son
 * texte générique à la place. Toutes ces phrases étaient écrites pour rien.
 *
 * <h2>Pourquoi pas un réglage</h2>
 *
 * {@code server.error.include-message=always} est la réponse habituelle. Elle
 * reste sans effet ici : le socle est Spring Boot 4, dont le traitement des
 * erreurs a changé, et s'en remettre à un nom de propriété qui dépend d'une
 * version est précisément ce qui a fait disparaître les messages sans que
 * personne ne le remarque. Cette classe le fait explicitement — elle vaudra
 * encore à la prochaine montée de version.
 *
 * <h2>Ce qui sort</h2>
 *
 * Le corps a la forme que la couche HTTP du front lit déjà : un objet avec
 * {@code message}. Ni trace, ni nom de classe, ni chemin interne — un refus
 * explique ce que l'appelant doit faire, il ne décrit pas le serveur.
 *
 * Sans raison, rien n'est inventé : le champ est omis, et l'écran reprend son
 * texte générique, qui vaut mieux qu'une phrase creuse.
 */
@RestControllerAdvice
public class BusinessErrorHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> onBusinessRefusal(ResponseStatusException e) {
        HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
        Map<String, Object> corps = new LinkedHashMap<>();
        corps.put("timestamp", Instant.now().toString());
        corps.put("status", e.getStatusCode().value());
        corps.put("error", status == null ? "Error" : status.getReasonPhrase());
        if (e.getReason() != null && !e.getReason().isBlank()) {
            corps.put("message", e.getReason());
        }
        return ResponseEntity.status(e.getStatusCode()).body(corps);
    }
}
