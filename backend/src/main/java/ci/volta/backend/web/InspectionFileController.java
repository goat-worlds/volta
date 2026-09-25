package ci.volta.backend.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
 * Pièces d'une inspection : clichés de terrain et papiers de douane.
 *
 * L'écran du technicien piochait ses « photos » dans la photothèque de
 * démonstration et inventait ses mesures. Un rapport de vérification tire
 * toute sa valeur de ses preuves, et VOLTA classe les engins sur la foi de ces
 * rapports : les fichiers viennent désormais de l'appareil de la personne qui
 * est devant la machine.
 *
 * Le PDF est accepté en plus des images : un certificat de dédouanement est
 * rarement une photo.
 *
 * Même mécanique que les photos d'engin (EquipmentPhotoController) : nom
 * généré, dossier dédié, URL publique renvoyée. Le dossier vit sur le disque
 * du conteneur — sur un hébergement au disque éphémère, il faudra un disque
 * persistant ou un stockage externe derrière la même API.
 */
@RestController
@RequestMapping("/api/inspections/files")
public class InspectionFileController {

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/webp", "application/pdf");

    /** Une pièce d'inspection est une photo ou un document scanné, pas une archive. */
    private static final long MAX_BYTES = 10L * 1024 * 1024;

    private final String uploadDir;

    public InspectionFileController(@Value("${app.inspection-upload-dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TECHNICAL', 'ADMIN')")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le fichier est vide."));
        }
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le fichier dépasse 10 Mo."));
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Formats acceptés : JPEG, PNG, WebP ou PDF."));
        }

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String filename = UUID.randomUUID() + extensionOf(file.getOriginalFilename(), contentType);
        file.transferTo(dir.resolve(filename));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("url", "/uploads/inspections/" + filename));
    }

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
            case "application/pdf" -> ".pdf";
            default -> ".jpg";
        };
    }
}
