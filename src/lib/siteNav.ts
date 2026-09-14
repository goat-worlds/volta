import { Building2, HardHat, Search, ShoppingCart, type LucideIcon } from 'lucide-react'
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

export const PRIMARY_LINKS: SiteLink[] = [
  { to: '/market', label: 'Volta Market', description: 'Engins à vendre, vérifiés avant l’offre', icon: ShoppingCart },
  { to: '/catalogue', label: 'Louer un engin', description: 'Le catalogue des engins inspectés', icon: Search },
  { to: '/recrutement', label: 'Recrutement', description: 'Rejoindre l’équipe technique', icon: HardHat },
  { to: '/fournisseurs', label: 'Fournisseurs', description: 'Les entreprises référencées', icon: Building2 },
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
  title: 'Dites-nous votre besoin, Génie Sélect fait le reste.',
  description:
    'Huit parcours, un seul principe : vous décrivez, l’équipe qualifie, vérifie et revient vers vous avec une proposition. Suivi par référence, sans compte.',
  ctaLabel: 'Voir tous les parcours',
  to: '/#intentions',
}

export const SECONDARY_LINKS: SiteLink[] = [
  { to: '/suivi', label: 'Suivre ma demande' },
]
