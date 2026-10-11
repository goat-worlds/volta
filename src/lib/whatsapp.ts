import { TELEPHONE } from './siteNav'

/**
 * Le lien WhatsApp de VOLTA, message déjà écrit.
 *
 * <h2>Pourquoi un message pré-rempli</h2>
 *
 * Un bouton qui ouvre une conversation vide laisse au visiteur le soin de dire
 * de quoi il parle. Il écrit « bonjour », on répond « bonjour », et il faut
 * trois allers-retours pour apprendre quelle machine l'intéresse — alors
 * qu'elle était à l'écran au moment du clic. Le message porte donc l'objet et
 * la référence : la première ligne reçue suffit à ouvrir le dossier.
 *
 * Le visiteur peut tout effacer avant d'envoyer : WhatsApp ne fait que
 * pré-remplir la zone de saisie. C'est une amorce, pas un envoi.
 *
 * <h2>Le numéro</h2>
 *
 * Celui de la plateforme, tenu dans {@link TELEPHONE} — une seule source pour
 * le pied de page, les cartes d'urgence et ce lien. `wa.me` veut le numéro au
 * format international sans « + » ni séparateur, ce qui se déduit du lien
 * `tel:` plutôt que d'être recopié à côté : deux écritures du même numéro
 * finissent par diverger, et celle-ci ne se vérifie qu'en cliquant.
 */
const NUMERO_WA = TELEPHONE.lien.replace('tel:+', '')

export interface SujetWhatsapp {
  /** Ce dont on parle : « Pelle CAT 320D », « Commande VOL-ACH-2026-000004 ». */
  objet: string
  /** La référence à citer, si elle existe. */
  reference?: string | null
  /** Une ligne de contexte : prix affiché, dates voulues. */
  precision?: string | null
}

/**
 * Compose le lien `wa.me` avec son message.
 *
 * Le texte est écrit à la première personne du client : c'est lui qui l'enverra,
 * et un message rédigé du point de vue de VOLTA lui ferait relire une phrase
 * qui ne lui ressemble pas avant de l'envoyer en son nom.
 */
export function lienWhatsapp({ objet, reference, precision }: SujetWhatsapp): string {
  const lignes = [
    `Bonjour VOLTA, je suis intéressé par : ${objet}.`,
    reference ? `Référence : ${reference}` : null,
    precision ?? null,
    'Pouvez-vous me rappeler ?',
  ].filter(Boolean)
  return `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(lignes.join('\n'))}`
}
