package ci.volta.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sert les photos d'engins envoyées via EquipmentPhotoController.
 *
 * Sans ce mappage, les fichiers écrits dans `app.upload-dir` existent sur le
 * disque du serveur mais ne répondent à aucune URL : le contrôleur renvoie
 * "/uploads/equipment/{uuid}.jpg", et c'est cette règle qui fait correspondre
 * ce chemin au dossier réel.
 */
@Configuration
public class UploadConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/equipment/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
