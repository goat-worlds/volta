/**
 * Les intentions.
 *
 * La plateforme demandait à l'arrivant de se désigner : client, fournisseur,
 * technicien. C'est lui faire porter une organisation qui n'est pas la sienne —
 * un chef de chantier qui cherche une pelle pour lundi ne se pense pas comme
 * « client », et l'entreprise qui loue son matériel le matin en cherche l'après-
 * midi. La question posée est donc devenue : que voulez-vous faire ?
 *
 * Chaque intention porte le formulaire qu'elle ouvre et la nature de demande
 * qu'elle produit. Le rôle, lui, reste interne : il gouverne les permissions
 * (§30), jamais l'entrée.
 *
 * Une seule liste, tenue ici : l'accueil, le menu et les pages d'atterrissage
 * la lisent tous. Trois formulations divergentes du même parcours donneraient
 * trois promesses différentes pour un même traitement.
 */
import {
  Boxes,
  ClipboardList,
  HardHat,
  Package,
  ShoppingCart,
  Star,
  Truck,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { Audience, IntentId, RequestKind } from '../types/domain'

export interface Intent {
  id: IntentId
  /** Formulé à la première personne : c'est l'utilisateur qui parle. */
  title: string
  /** Ce que Génie Sélect fait de la demande — la promesse, pas la mécanique. */
  description: string
  /** Libellé du bouton : un verbe, jamais « en savoir plus ». */
  cta: string
  to: string
  icon: LucideIcon
  audience: Audience
  kind: RequestKind
}

export const INTENTS: Intent[] = [
  {
    id: 'RENT_EQUIPMENT',
    title: 'Je veux louer un engin',
    description: 'Trouvez l’équipement adapté à votre chantier.',
    cta: 'Trouver un engin',
    to: '/demande/location',
    icon: Truck,
    audience: 'CLIENT',
    kind: 'RENTAL',
  },
  {
    id: 'BUY_EQUIPMENT',
    title: 'Je veux acheter un engin',
    description:
      'Découvrez les équipements disponibles sur Volta Market et demandez votre devis.',
    cta: 'Voir Volta Market',
    to: '/market',
    icon: ShoppingCart,
    audience: 'CLIENT',
    kind: 'PURCHASE',
  },
  {
    id: 'FIND_TECHNICIAN',
    title: 'Je recherche un technicien',
    description:
      'Notre équipe technique est constituée de profils étudiés, auditionnés et sélectionnés par Génie Sélect.',
    cta: 'Rechercher un technicien',
    to: '/demande/technicien',
    icon: Wrench,
    audience: 'CLIENT',
    kind: 'TECHNICIAN',
  },
  {
    id: 'OFFER_EQUIPMENT',
    title: 'Je veux louer mon engin',
    description:
      'Présentez votre équipement et laissez Génie Sélect identifier les opportunités correspondant à votre matériel.',
    cta: 'Proposer mon engin',
    to: '/proposer-un-engin',
    icon: Package,
    audience: 'OWNER',
    kind: 'EQUIPMENT_OFFER',
  },
  {
    id: 'LIST_CATALOG',
    title: 'Je veux présenter mes équipements',
    description: 'Référencez vos équipements, produits et solutions sur Volta.',
    cta: 'Présenter mon catalogue',
    to: '/catalogue-entreprise',
    icon: Boxes,
    audience: 'OWNER',
    kind: 'EQUIPMENT_OFFER',
  },
  {
    id: 'BECOME_GOLD',
    title: 'Je veux devenir GOLD',
    description:
      'Améliorez votre référencement, votre visibilité et votre capacité à accéder à de nouvelles opportunités.',
    cta: 'Découvrir GOLD',
    to: '/gold',
    icon: Star,
    audience: 'COMPANY',
    kind: 'GOLD',
  },
  {
    id: 'GROW_SALES',
    title: 'Je veux développer mes ventes',
    description:
      'Génie Sélect vous accompagne dans la structuration et la présentation de votre offre.',
    cta: 'Développer mes ventes',
    to: '/accompagnement',
    icon: TrendingUp,
    audience: 'COMPANY',
    kind: 'SUPPORT',
  },
  {
    id: 'JOIN_TECHNICAL_TEAM',
    title: 'Je veux rejoindre l’équipe technique',
    description: 'Déposez votre CV et rejoignez notre processus de sélection.',
    cta: 'Rejoindre l’équipe',
    to: '/recrutement',
    icon: HardHat,
    audience: 'TECHNICIAN',
    kind: 'SUPPORT',
  },
]

/**
 * Regroupement des intentions.
 *
 * Les libellés décrivent une situation, jamais une qualité : « vous avez du
 * matériel » et non « vous êtes fournisseur ». La même entreprise se reconnaît
 * dans deux groupes le même jour, ce qu'un intitulé de rôle lui interdirait.
 */
export const AUDIENCE_LABELS: Record<Audience, string> = {
  CLIENT: 'Vous avez un besoin',
  OWNER: 'Vous avez du matériel',
  COMPANY: 'Vous développez votre activité',
  TECHNICIAN: 'Vous cherchez des missions',
}

/** Ordre d'apparition des groupes sur les écrans qui les présentent tous. */
export const AUDIENCE_ORDER: Audience[] = ['CLIENT', 'OWNER', 'COMPANY', 'TECHNICIAN']

export function intentsFor(audience: Audience): Intent[] {
  return INTENTS.filter((intent) => intent.audience === audience)
}

export function intentById(id: IntentId): Intent | undefined {
  return INTENTS.find((intent) => intent.id === id)
}

/** Icône neutre pour un écran qui affiche une demande sans intention connue. */
export const FALLBACK_INTENT_ICON = ClipboardList
