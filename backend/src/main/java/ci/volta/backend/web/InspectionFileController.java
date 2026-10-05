package ci.volta.backend.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ci.volta.backend.service.WatermarkService;
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

    /**
     * Le WebP en a été retiré : ImageIO ne sait pas l'ouvrir sans greffon, donc
     * pas le filigraner, et une image non marquée n'a pas sa place au dossier.
     * Le PDF reste — c'est un document scanné, pas une photo à rediffuser.
     */
    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "application/pdf");

    /** Une pièce d'inspection est une photo ou un document scanné, pas une archive. */
    private static final long MAX_BYTES = 10L * 1024 * 1024;

    private final String uploadDir;
    private final WatermarkService watermark;

    public InspectionFileController(@Value("${app.inspection-upload-dir}") String uploadDir,
                                    WatermarkService watermark) {
        this.uploadDir = uploadDir;
        this.watermark = watermark;
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
                    .body(Map.of("message", "Formats acceptés : JPEG, PNG ou PDF."));
        }

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String filename = UUID.randomUUID() + extensionOf(file.getOriginalFilename(), contentType);
        // Les photos d'inspection partent dans les rapports : elles portent la
        // marque comme les autres. Un PDF traverse intact — on ne sait pas le
        // marquer, et il n'est pas destiné à circuler comme une image.
        byte[] contenu = watermark.saitMarquer(contentType)
                ? watermark.marquer(file.getBytes(), contentType)
                : file.getBytes();
        Files.write(dir.resolve(filename), contenu);

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
