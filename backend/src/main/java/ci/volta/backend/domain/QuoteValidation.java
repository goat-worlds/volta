package ci.volta.backend.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Validation des données de devis et de demande.
 *
 * Ces contrôles s'exécutent côté serveur parce qu'une vérification faite dans le
 * navigateur ne protège personne : l'API est appelable directement, et un prix
 * négatif ou une période inversée y passerait sans obstacle.
 *
 * Les refus sont des 400 : la requête est mal formée, indépendamment de l'état
 * du système. Un état incompatible relève du 409, traité par QuoteWorkflow.
 */
public final class QuoteValidation {

    /** Au-delà, il s'agit plus probablement d'une erreur de saisie que d'un montant réel. */
    private static final long MAX_PRICE = 1_000_000_000L;

    /** Une location de plus de cinq ans relève du contrat, pas de la réservation. */
    private static final long MAX_RENTAL_DAYS = 1825;

    private QuoteValidation() {
    }

    public static void checkPrice(long price) {
        if (price <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le prix doit être strictement positif");
        }
        if (price > MAX_PRICE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le prix dépasse le plafond autorisé");
        }
    }

    public static void checkQuantity(int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La quantité doit être strictement positive");
        }
    }

    /** Un délai négatif n'a pas de sens ; zéro signifie une mise à disposition immédiate. */
    public static void checkDeliveryTime(int days) {
        if (days < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le délai de livraison ne peut pas être négatif");
        }
    }

    /**
     * Vérifie la cohérence de la période demandée.
     *
     * Les dates absentes sont tolérées : le modèle les stocke en texte libre et
     * certaines demandes existantes n'en portent pas. En revanche, dès que les
     * deux sont présentes et lisibles, leur ordre est contrôlé.
     */
    public static void checkPeriod(String startDate, String endDate) {
        LocalDate start = parseOrNull(startDate);
        LocalDate end = parseOrNull(endDate);

        if (start == null || end == null) {
            return;
        }
        if (end.isBefore(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin précède la date de début");
        }
        if (start.plusDays(MAX_RENTAL_DAYS).isBefore(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La période demandée dépasse la durée maximale de location");
        }
    }

    /**
     * Une date de validité déjà passée à la création rendrait le devis
     * inacceptable dès son enregistrement.
     */
    public static void checkValidUntil(String validUntil) {
        LocalDate date = parseOrNull(validUntil);
        if (date != null && date.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de validité est déjà dépassée");
        }
    }

    public static void checkRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    fieldName + " est requis");
        }
    }

    /** Null plutôt qu'une exception : un format inconnu ne doit pas faire échouer la requête. */
    private static LocalDate parseOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
