package ci.volta.backend.service;

import jakarta.annotation.PostConstruct;
import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.font.FontRenderContext;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import javax.imageio.ImageIO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/**
 * Incruste la marque VOLTA dans les images téléversées.
 *
 * <h2>Pourquoi au serveur et non à la construction</h2>
 *
 * Les photos du catalogue sont marquées par {@code outils/filigrane.py}, qui
 * repart des originaux avant chaque livraison. Ce script ne voit que les
 * fichiers du dépôt : une photo envoyée par un fournisseur depuis son téléphone
 * ne passe jamais devant lui, et arrivait donc nue sur le site — exactement les
 * images qu'on retrouve ensuite ailleurs sans savoir d'où elles viennent.
 *
 * Le téléversement est le seul passage obligé. Marquer ici, c'est marquer tout
 * ce qui entre, aujourd'hui comme demain, sans qu'un nouvel écran d'envoi ait à
 * y penser.
 *
 * <h2>Ce que le filigrane dit</h2>
 *
 * Le symbole de la marque et le numéro. Le mot VOLTA n'est pas écrit : le
 * symbole le porte déjà, et l'ajouter donnait la marque deux fois.
 *
 * La couleur du texte se choisit d'après la luminance du coin où il se pose —
 * blanc sur un châssis sombre, gris très foncé sur un ciel clair. Une teinte
 * fixe disparaîtrait sur la moitié des photos.
 *
 * <h2>Ce qui n'est pas traité</h2>
 *
 * Le WebP : {@link ImageIO} ne sait pas le lire sans greffon, et une image
 * qu'on ne peut pas ouvrir est une image qu'on ne peut pas marquer. Plutôt que
 * de la stocker nue, les écrans d'envoi ne l'acceptent plus.
 */
@Service
public class WatermarkService {

    private static final Logger log = LoggerFactory.getLogger(WatermarkService.class);

    /** Le symbole seul, découpé du bloc de marque. */
    private static final String MARQUE = "marque/logo-volta-mark.png";

    /** Hauteur du symbole, en fraction de la largeur de la photo. */
    private static final double PART_LARGEUR = 0.055;

    /** Plafond en fraction de la hauteur : une bande étroite ne doit pas être mangée. */
    private static final double PART_HAUTEUR = 0.130;

    private static final int HAUTEUR_MINIMALE = 18;
    private static final int HAUTEUR_MAXIMALE = 92;

    private final String telephone;
    private BufferedImage symbole;

    public WatermarkService(@Value("${volta.telephone:}") String telephone) {
        this.telephone = telephone == null ? "" : telephone.trim();
    }

    /**
     * Charge le symbole une fois pour toutes.
     *
     * Le relire à chaque envoi coûterait un accès disque par photo, et une
     * absence de fichier ne se découvrirait qu'au premier téléversement — en
     * production, un samedi. Ici, le défaut se voit au démarrage.
     */
    @PostConstruct
    void chargerSymbole() {
        try (InputStream flux = new ClassPathResource(MARQUE).getInputStream()) {
            symbole = ImageIO.read(flux);
        } catch (IOException | RuntimeException e) {
            log.warn("Symbole de marque illisible ({}) : les photos envoyées ne porteront "
                    + "que le numéro.", MARQUE, e);
        }
    }

    /** Vrai si ce type d'image peut être ouvert, donc marqué. */
    public boolean saitMarquer(String contentType) {
        if (contentType == null) {
            return false;
        }
        String type = contentType.toLowerCase(java.util.Locale.ROOT);
        return type.equals("image/jpeg") || type.equals("image/png");
    }

    /**
     * Rend l'image marquée, encodée dans le même format.
     *
     * En cas d'échec — format inattendu, image corrompue — l'original est
     * renvoyé tel quel plutôt que de refuser l'envoi : perdre la photo d'un
     * fournisseur coûte plus cher que de perdre un filigrane, et le défaut est
     * journalisé pour être vu.
     */
    public byte[] marquer(byte[] original, String contentType) {
        try {
            BufferedImage source = ImageIO.read(new java.io.ByteArrayInputStream(original));
            if (source == null) {
                log.warn("Image illisible à l'envoi ({}) : stockée sans filigrane.", contentType);
                return original;
            }

            BufferedImage sortie = new BufferedImage(
                    source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
            Graphics2D g = sortie.createGraphics();
            g.drawImage(source, 0, 0, Color.WHITE, null);
            dessinerMarque(g, sortie);
            g.dispose();

            String format = "image/png".equalsIgnoreCase(contentType) ? "png" : "jpg";
            ByteArrayOutputStream dehors = new ByteArrayOutputStream();
            ImageIO.write(sortie, format, dehors);
            return dehors.toByteArray();
        } catch (IOException | RuntimeException e) {
            log.warn("Filigrane impossible : l'image est stockée telle quelle.", e);
            return original;
        }
    }

    private void dessinerMarque(Graphics2D g, BufferedImage image) {
        int largeur = image.getWidth();
        int hauteur = image.getHeight();

        int hautSymbole = (int) Math.max(HAUTEUR_MINIMALE,
                Math.min(Math.min(largeur * PART_LARGEUR, hauteur * PART_HAUTEUR), HAUTEUR_MAXIMALE));
        int corps = Math.max(9, (int) (hautSymbole * 0.30));
        int marge = Math.max(8, (int) (largeur * 0.018));

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        Font police = new Font(Font.SANS_SERIF, Font.BOLD, corps);
        g.setFont(police);
        FontRenderContext regle = g.getFontRenderContext();
        Rectangle2D boite = police.getStringBounds(telephone, regle);

        int largSymbole = symbole == null
                ? 0
                : (int) Math.round(symbole.getWidth() * (hautSymbole / (double) symbole.getHeight()));
        int ecart = symbole == null ? 0 : Math.max(6, hautSymbole / 6);

        int largBloc = largSymbole + ecart + (int) Math.ceil(boite.getWidth());
        int hautBloc = Math.max(hautSymbole, (int) Math.ceil(boite.getHeight()));

        int x = largeur - largBloc - marge;
        int y = hauteur - hautBloc - marge;

        Color teinte = teinteLisible(image, x, y, largBloc, hautBloc);

        if (symbole != null) {
            g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.92f));
            g.drawImage(symbole, x, y + (hautBloc - hautSymbole) / 2, largSymbole, hautSymbole, null);
            g.setComposite(AlphaComposite.SrcOver);
        }

        // `getAscent` et non le haut de la boîte : `drawString` place la ligne
        // de base, pas le sommet du texte.
        int yTexte = y + (hautBloc - (int) boite.getHeight()) / 2 + g.getFontMetrics().getAscent();
        int xTexte = x + largSymbole + ecart;

        /*
         * Un liseré de la couleur opposée, derrière le numéro.
         *
         * La teinte adaptative suffit sur un fond uni : blanc sur sombre, gris
         * très foncé sur clair. Elle échoue partout ailleurs — terre remuée,
         * bitume, bardage tacheté — où la luminance moyenne tombe au milieu et
         * où aucune des deux couleurs ne se détache. La lettre et son contour
         * étant opposés, ils ne peuvent pas disparaître ensemble.
         *
         * Dessiné en huit décalages plutôt qu'avec un trait : Graphics2D ne sait
         * pas contourner un texte sans passer par son tracé vectoriel, et huit
         * copies coûtent moins qu'un Shape pour une chaîne de treize caractères.
         */
        Color contour = teinte.equals(Color.WHITE) ? Color.BLACK : Color.WHITE;
        int epaisseur = Math.max(1, corps / 9);
        g.setColor(contour);
        for (int dx = -epaisseur; dx <= epaisseur; dx++) {
            for (int dy = -epaisseur; dy <= epaisseur; dy++) {
                if (dx != 0 || dy != 0) {
                    g.drawString(telephone, xTexte + dx, yTexte + dy);
                }
            }
        }

        g.setColor(teinte);
        g.drawString(telephone, xTexte, yTexte);
    }

    /**
     * Blanc sur fond sombre, gris très foncé sur fond clair.
     *
     * La luminance est mesurée sur le rectangle que le bloc va couvrir, et non
     * sur l'image entière : une photo globalement sombre peut avoir un ciel
     * clair précisément dans ce coin-là.
     */
    private Color teinteLisible(BufferedImage image, int x, int y, int largeur, int hauteur) {
        long somme = 0;
        int points = 0;
        int xMax = Math.min(image.getWidth(), x + largeur);
        int yMax = Math.min(image.getHeight(), y + hauteur);

        for (int py = Math.max(0, y); py < yMax; py += 3) {
            for (int px = Math.max(0, x); px < xMax; px += 3) {
                int rgb = image.getRGB(px, py);
                int r = (rgb >> 16) & 0xFF;
                int v = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                somme += (long) (0.299 * r + 0.587 * v + 0.114 * b);
                points++;
            }
        }

        if (points == 0) {
            return Color.WHITE;
        }
        return somme / points < 128 ? Color.WHITE : new Color(26, 26, 26);
    }
}
