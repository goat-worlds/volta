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
    private static final String CHEMIN_SYMBOLE = "marque/logo-volta-mark.png";

    /** Les deux lignes de la marque, identiques à celles du catalogue. */
    private static final String MARQUE = "VOLTA";
    private static final String MAISON = "by GÉNIE SÉLECT DIGITAL";

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
        try (InputStream flux = new ClassPathResource(CHEMIN_SYMBOLE).getInputStream()) {
            symbole = ImageIO.read(flux);
        } catch (IOException | RuntimeException e) {
            log.warn("Symbole de marque illisible ({}) : les photos envoyées ne porteront "
                    + "que le texte.", CHEMIN_SYMBOLE, e);
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

    /**
     * Pose la marque au centre de l'image.
     *
     * Elle vivait dans le coin bas droit. C'est l'endroit le plus discret, et
     * c'est tout le problème : on recadre un coin en deux gestes, et la photo
     * repart sans sa marque. Le but n'est pas de signer poliment, c'est de
     * rendre l'image inutilisable ailleurs — et seul le centre ne peut pas être
     * enlevé sans emporter l'engin avec lui.
     *
     * Le bloc est posé à faible opacité : assez présent pour décourager la
     * reprise, assez transparent pour qu'un loueur juge la machine. Une marque
     * opaque protégerait parfaitement une photo que plus personne ne regarde.
     *
     * La composition est celle des photos du catalogue, que marque
     * `outils/filigrane.py` : symbole, VOLTA, la maison, le numéro. Les deux
     * chemins doivent donner la même image — celui-ci à l'envoi, l'autre à la
     * livraison.
     */
    private void dessinerMarque(Graphics2D g, BufferedImage image) {
        int largeur = image.getWidth();
        int hauteur = image.getHeight();

        double cible = Math.min(largeur * 0.46, hauteur * 1.30);
        int hautSymbole = (int) Math.max(24, cible * 0.26);
        int corpsMarque = (int) Math.max(16, cible * 0.17);
        int corpsPetit = Math.max(9, (int) (corpsMarque * 0.34));

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        Font fMarque = new Font(Font.SANS_SERIF, Font.BOLD, corpsMarque);
        Font fPetit = new Font(Font.SANS_SERIF, Font.BOLD, corpsPetit);
        FontRenderContext regle = g.getFontRenderContext();

        String[] lignes = {MARQUE, MAISON, telephone};
        Font[] fontes = {fMarque, fPetit, fPetit};
        Rectangle2D[] boites = new Rectangle2D[3];
        for (int i = 0; i < 3; i++) {
            boites[i] = fontes[i].getStringBounds(lignes[i], regle);
        }

        int largSymbole = symbole == null
                ? 0
                : (int) Math.round(symbole.getWidth() * (hautSymbole / (double) symbole.getHeight()));
        int interligne = Math.max(3, corpsPetit / 2);

        int largBloc = largSymbole;
        int hautBloc = symbole == null ? 0 : hautSymbole + interligne;
        for (int i = 0; i < 3; i++) {
            largBloc = Math.max(largBloc, (int) Math.ceil(boites[i].getWidth()));
            hautBloc += (int) Math.ceil(boites[i].getHeight()) + interligne;
        }

        int x0 = (largeur - largBloc) / 2;
        int y0 = (hauteur - hautBloc) / 2;

        /*
         * Le bloc est composé à part, puis posé à l'opacité voulue.
         *
         * Peindre directement sur la photo en baissant l'alpha laisserait le
         * liseré transparaître sous le texte pâli : il faut que l'ensemble —
         * lettres et contour — s'efface d'un seul mouvement.
         */
        BufferedImage calque = new BufferedImage(largBloc, hautBloc, BufferedImage.TYPE_INT_ARGB);
        Graphics2D gb = calque.createGraphics();
        gb.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        gb.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        gb.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);

        if (symbole != null) {
            gb.drawImage(symbole, (largBloc - largSymbole) / 2, 0, largSymbole, hautSymbole, null);
        }

        int y = symbole == null ? 0 : hautSymbole + interligne;
        int trait = Math.max(1, corpsMarque / 14);
        for (int i = 0; i < 3; i++) {
            gb.setFont(fontes[i]);
            int largTexte = (int) Math.ceil(boites[i].getWidth());
            int xTexte = (largBloc - largTexte) / 2;
            int yTexte = y + gb.getFontMetrics().getAscent();

            // Le liseré sombre tient sous le blanc quel que soit le fond : au
            // centre d'une photo, la luminance change d'un bout à l'autre du
            // bloc, et une teinte choisie sur la moyenne y échouerait une fois
            // sur deux.
            gb.setColor(new Color(0, 0, 0, 170));
            for (int dx = -trait; dx <= trait; dx++) {
                for (int dy = -trait; dy <= trait; dy++) {
                    if (dx != 0 || dy != 0) {
                        gb.drawString(lignes[i], xTexte + dx, yTexte + dy);
                    }
                }
            }
            gb.setColor(Color.WHITE);
            gb.drawString(lignes[i], xTexte, yTexte);

            y += (int) Math.ceil(boites[i].getHeight()) + interligne;
        }
        gb.dispose();

        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.42f));
        g.drawImage(calque, x0, y0, null);
        g.setComposite(AlphaComposite.SrcOver);
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
