package ci.volta.backend.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Envoi des photos d'engins.
 *
 * Avant ce contrôleur, un fournisseur choisissait parmi sept visuels de
 * démonstration codés dans le frontend (lib/enginPhotos.ts) — faute de mieux,
 * comme le disait le commentaire de ce fichier. Ici, le fichier envoyé est
 * écrit sur disque sous un nom généré (UUID + extension d'origine), dans un
 * unique dossier ; l'URL publique renvoyée est ce que l'écran ajoute ensuite
 * à `Equipment.photos`, colonne déjà prévue pour porter une liste de chemins.
 *
 * Le nom d'origine n'est jamais réutilisé tel quel : un fournisseur pourrait
 * envoyer deux fichiers « photo.jpg » sans le savoir, et l'un écraserait
 * l'autre. L'UUID élimine aussi tout risque de traversée de chemin
 * (« ../../ ») que le nom d'origine pourrait contenir.
 *
 * Limite connue : le dossier est sur le disque du conteneur. En local et sur
 * un serveur à disque persistant, les fichiers restent. Sur l'offre gratuite
 * de Render (voir render.yaml), le disque est éphémère — un redéploiement ou
 * un redémarrage efface le dossier. Tant qu'aucun disque persistant n'est
 * attaché au service, ce mécanisme ne convient qu'au développement local ;
 * une mise en production sur Render demandera soit un disque payant, soit un
 * stockage externe (S3 ou équivalent) derrière la même API.
 */
@RestController
@RequestMapping("/api/equipment/photos")
public class EquipmentPhotoController {

    /** Types dont le contenu est bien une image, quel que soit le nom du fichier. */
    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/webp");

    /** Au-delà, ce n'est plus une photo de fiche produit mais un fichier à héberger ailleurs. */
    private static final long MAX_BYTES = 8L * 1024 * 1024;

    private final String uploadDir;

    public EquipmentPhotoController(@Value("${app.upload-dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le fichier est vide."));
        }
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("message", "La photo dépasse 8 Mo."));
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seules les images JPEG, PNG ou WebP sont acceptées."));
        }

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String extension = extensionOf(file.getOriginalFilename(), contentType);
        String filename = UUID.randomUUID() + extension;

        // resolve() rejette tout composant absolu ou remontant dans filename
        // avant l'écriture, mais filename vient d'un UUID que nous générons :
        // la vérification est redondante, pas une garantie qu'il faille contourner.
        Path target = dir.resolve(filename);
        file.transferTo(target);

        String publicUrl = "/uploads/equipment/" + filename;
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", publicUrl));
    }

    /**
     * Extension du fichier stocké : celle du nom d'origine si elle existe et
     * reste courte (protection contre un nom fabriqué sans extension réelle),
     * sinon déduite du type MIME déjà validé plus haut.
     */
    private String extensionOf(String originalFilename, String contentType) {
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
            if (ext.length() <= 6 && ext.matches("\\.[a-z0-9]+")) {
                return ext;
            }
        }
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
