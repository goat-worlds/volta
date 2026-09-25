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
  /** Ce que VOLTA fait de la demande — la promesse, pas la mécanique. */
  description: string
  /** Libellé du bouton : un verbe, jamais « en savoir plus ». */
  cta: string
  to: string
  icon: LucideIcon
  audience: Audience
  kind: RequestKind
}

export const INTENTS: Intent[] = [
  // Louer et acheter mènent au catalogue, pas à un formulaire : celui qui
  // cherche un engin veut d'abord voir ce qui existe. La demande vient
  // ensuite, depuis la fiche de l'engin choisi. Le formulaire libre
  // (/demande/location) reste servi pour qui n'a rien trouvé, mais n'est plus
  // la porte d'entrée.
  {
    id: 'RENT_EQUIPMENT',
    title: 'Je veux louer un engin',
    description: 'Parcourez les engins inspectés, disponibles à la location.',
    cta: 'Voir les engins à louer',
    to: '/catalogue',
    icon: Truck,
    audience: 'CLIENT',
    kind: 'RENTAL',
  },
  {
    id: 'BUY_EQUIPMENT',
    title: 'Je veux acheter un engin',
    description:
      'Parcourez les engins à vendre sur Volta Market, vérifiés avant l’offre.',
    cta: 'Voir les engins à vendre',
    to: '/market',
    icon: ShoppingCart,
    audience: 'CLIENT',
    kind: 'PURCHASE',
  },
  {
    id: 'FIND_TECHNICIAN',
    title: 'Je recherche un technicien',
    description:
      'Notre équipe technique est constituée de profils étudiés, auditionnés et sélectionnés par VOLTA.',
    cta: 'Rechercher un technicien',
    to: '/demande/technicien',
    icon: Wrench,
    audience: 'CLIENT',
    kind: 'TECHNICIAN',
  },
  {
    id: 'OFFER_EQUIPMENT',
    // « Louer mon engin » se lit dans les deux sens : le propriétaire croyait
    // qu'il allait en louer un. « Mettre en location » ne laisse aucun doute.
    title: 'Je veux mettre mon engin en location',
    description:
      'Présentez votre équipement et laissez VOLTA identifier les opportunités correspondant à votre matériel.',
    cta: 'Mettre mon engin en location',
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
      'VOLTA vous accompagne dans la structuration et la présentation de votre offre.',
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
