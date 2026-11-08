import { HardHat, Handshake, Search, ShoppingCart, type LucideIcon } from 'lucide-react'
import { AUDIENCE_LABELS, AUDIENCE_ORDER, intentsFor, type Intent } from './intents'

/**
 * Navigation publique de VOLTA, en un seul endroit.
 *
 * L'en-tête proposait trois liens — Accueil, Équipements, Fournisseurs — quand
 * le site vend, loue, recrute et accompagne. Volta Market et le recrutement
 * n'étaient joignables que depuis les cartes de l'accueil ; le pied de page
 * répétait les trois mêmes liens. L'en-tête, le menu mobile et le pied de page
 * lisent désormais cette structure : une entrée ajoutée ici apparaît aux trois
 * endroits, avec les mêmes mots.
 *
 * Les liens directs sont les quatre choses qu'un visiteur vient faire le plus
 * souvent ; les huit parcours d'intention sont regroupés derrière « Parcours »,
 * par public, comme sur l'accueil.
 */
export interface SiteLink {
  to: string
  label: string
  /** Une ligne, pour le pied de page et le menu mobile. */
  description?: string
  icon?: LucideIcon
}

/**
 * Le numéro de la plateforme — le seul que le site affiche.
 *
 * C'est celui qu'on publie et qu'on appelle en citant sa référence. Des lignes
 * personnelles l'ont remplacé par moments, et l'une d'elles a survécu dans le
 * formulaire de parcours après avoir été retirée partout ailleurs : le client
 * qui lit deux numéros finit par composer le mauvais, et une ligne personnelle
 * n'a pas de standard derrière elle.
 *
 * Écrit une seule fois : l'en-tête, le pied de page, les cartes d'urgence, le
 * lien WhatsApp et les filigranes (outils/filigrane.py) le lisent ici. Le
 * serveur en garde une copie, `volta.telephone`, pour les photos qu'il
 * filigrane lui-même. `npm run lint` vérifie que les deux concordent et
 * qu'aucun autre numéro n'apparaît dans ce que le site sert.
 */
export const TELEPHONE = {
  affiche: '05 00 99 13 13',
  international: '+225 05 00 99 13 13',
  lien: 'tel:+2250500991313',
}

export const PRIMARY_LINKS: SiteLink[] = [
  // L'ordre est celui de la maquette : Volta Market avant le catalogue.
  { to: '/market', label: 'VOLTA Market', description: 'Engins à vendre, vérifiés avant la mise en vente', icon: ShoppingCart },
  { to: '/catalogue', label: 'Louer un engin', description: 'Le catalogue des engins inspectés', icon: Search },
  { to: '/recrutement', label: 'Recrutement', description: 'Rejoindre l’équipe technique', icon: HardHat },
  // Le proprietaire et l'entreprise n'avaient pas de page a ouvrir : leurs
  // quatre parcours vivaient derriere le menu, meles a ceux du client.
  { to: '/collaborons', label: 'Collaborons', description: 'Proposer son parc, referencer son catalogue, developper ses ventes', icon: Handshake },
]

export interface JourneyColumn {
  heading: string
  intents: Intent[]
}

/** Les huit parcours, par public — même ordre que l'accueil. */
export const JOURNEY_COLUMNS: JourneyColumn[] = AUDIENCE_ORDER.map((audience) => ({
  heading: AUDIENCE_LABELS[audience],
  intents: intentsFor(audience),
})).filter((column) => column.intents.length > 0)

export const JOURNEYS_FEATURE = {
  eyebrow: 'Que souhaitez-vous faire ?',
  title: 'Dites-nous votre besoin, VOLTA fait le reste.',
  description:
    'Huit parcours, un seul principe : vous décrivez, l’équipe qualifie, vérifie et revient vers vous avec une proposition. Suivi par référence, sans compte.',
  ctaLabel: 'Voir tous les parcours',
  to: '/#intentions',
}

export const SECONDARY_LINKS: SiteLink[] = [
  { to: '/suivi', label: 'Suivre ma demande' },
]
