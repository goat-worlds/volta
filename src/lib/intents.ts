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
  Building2,
  ClipboardList,
  HardHat,
  Package,
  Truck,
  TrendingUp,
  Wrench,
  Settings,
  GraduationCap,
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
  /**
   * La photo de tête de la carte.
   *
   * Les huit parcours se présentaient en cartes de texte, distinguées par
   * un seul pictogramme : il fallait lire les huit titres pour trouver le
   * sien. Une photo se reconnaît avant d'être lue — un chef de chantier
   * repère sa pelle sans avoir à déchiffrer « Je veux louer un engin ».
   *
   * Elle montre le métier du parcours, jamais un engin pris au hasard :
   * une chargeuse sous « rejoindre l'équipe technique » tromperait.
   */
  image: string
  audience: Audience
  kind: RequestKind
}

export const INTENTS: Intent[] = [
  // ---------------------------------------------------------------- Maquette
  // Quatre parcours ajoutes d'apres la maquette d'accueil.
  //
  // Chacun rejoint une route qui existe deja et qui lui correspond : la
  // maintenance et la flotte ont leur formulaire, les pieces se cherchent
  // sur Volta Market, la formation est traitee par l'equipe technique.
  // Leur inventer une route neuve aurait donne quatre pages a batir et,
  // en attendant, quatre cartes tombant sur l'ecran d'erreur.
  //
  // `kind` reprend une nature que le serveur traite deja : c'est une chaine
  // libre, mais en inventer une nouvelle rendrait la demande invisible aux
  // filtres de l'espace DG.
  {
    id: 'MAINTAIN_EQUIPMENT',
    title: 'Je veux faire la maintenance de mon engin',
    description:
      'Entretien courant, panne ou revision : un technicien VOLTA intervient sur votre machine.',
    cta: 'Demander une intervention',
    to: '/demande/technicien',
    icon: Wrench,
    image: '/engins/technicien-maintenance.jpeg',
    audience: 'CLIENT',
    kind: 'TECHNICIAN',
  },
  {
    id: 'FLEET_NEED',
    title: 'Besoin d’une flotte pour votre projet ?',
    description: 'Listez les engins de votre projet.',
    cta: 'Expliquer mon projet',
    to: '/demande/location',
    icon: Truck,
    image: '/engins/camion-kamaz.jpeg',
    audience: 'CLIENT',
    kind: 'RENTAL',
  },
  {
    id: 'BUY_PARTS',
    title: 'Acheter des pièces de rechange',
    description: 'Indiquez la piece et la machine concernee : VOLTA la recherche et vous repond.',
    cta: 'Demander une piece',
    to: '/market',
    icon: Settings,
    image: '/engins/pieces-rechange.jpeg',
    audience: 'CLIENT',
    kind: 'PURCHASE',
  },
  {
    id: 'TRAIN_TEAM',
    title: 'Je veux former mon équipe',
    description: 'Conduite d’engins, securite, maintenance : des formations pratiques et certifiantes.',
    cta: 'Demander une formation',
    to: '/recrutement',
    icon: GraduationCap,
    image: '/engins/formation-equipe.jpeg',
    audience: 'CLIENT',
    kind: 'SUPPORT',
  },
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
    image: '/engins/pelle-cat-6015b.jpeg',
    audience: 'CLIENT',
    kind: 'RENTAL',
  },
  {
    id: 'BUY_EQUIPMENT',
    title: 'Avez-vous des engins à mettre en location ?',
    description: 'Appelez-nous pour une inspection avant la publication.',
    cta: 'Proposer mon engin',
    to: '/proposer-un-engin',
    icon: Truck,
    image: '/engins/parc-chargeuses.jpeg',
    audience: 'OWNER',
    kind: 'EQUIPMENT_OFFER',
  },
  {
    id: 'FIND_TECHNICIAN',
    title: 'Je recherche un technicien ou un opérateur qualifié',
    description:
      'Notre équipe technique est constituée de profils étudiés, auditionnés et sélectionnés par VOLTA.',
    cta: 'Rechercher un technicien',
    to: '/demande/technicien',
    icon: Wrench,
    image: '/engins/technicien-maintenance.jpeg',
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
    image: '/engins/pelle-komatsu.jpeg',
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
    image: '/engins/camion-kamaz.jpeg',
    audience: 'OWNER',
    kind: 'EQUIPMENT_OFFER',
  },
  {
    id: 'BUILD_BASE_LIFE',
    title: 'Construction de base vie',
    description:
      'Nous construisons un cadre de vie. Confiez-nous votre projet de construction.',
    cta: 'Décrire mon projet',
    to: '/demande/base-vie',
    icon: Building2,
    image: '/engins/agence-volta.jpeg',
    audience: 'CLIENT',
    kind: 'CONSTRUCTION',
  },
  {
    id: 'GROW_SALES',
    title: 'Je veux développer mes ventes',
    description:
      'VOLTA vous accompagne dans la structuration et la présentation de votre offre.',
    cta: 'Développer mes ventes',
    to: '/accompagnement',
    icon: TrendingUp,
    image: '/engins/partenaires-poignee-main.jpeg',
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
    image: '/engins/formation-equipe.jpeg',
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

/**
 * Les huit cartes de l'accueil, dans l'ordre de la maquette.
 *
 * La grille affichait tous les parcours classes par public. Il y en a
 * desormais douze : les quatre derniers — proposer son parc, referencer son
 * catalogue, developper ses ventes, rejoindre l'equipe — s'adressent aux
 * partenaires et vivent sur « Collaborons », pas sur la premiere page.
 *
 * Une liste explicite plutot qu'un filtre : l'ordre vient de la maquette et
 * ne se deduit d'aucun champ.
 */
export const PARCOURS_ACCUEIL: IntentId[] = [
  // Premiere rangee : les quatre parcours qui vendent. Ce sont eux qu'on voit
  // en arrivant, et ils disent ce que VOLTA fait pour un chantier en marche —
  // louer, entretenir, trouver quelqu'un, former.
  'RENT_EQUIPMENT',
  'MAINTAIN_EQUIPMENT',
  'FIND_TECHNICIAN',
  'TRAIN_TEAM',
  // Seconde rangee : les demandes plus engageantes, et l'achat en dernier.
  // Acheter un engin est la decision la plus lourde du catalogue : la mettre
  // en tete demanderait au visiteur de s'engager avant d'avoir rien vu.
  'FLEET_NEED',
  'BUILD_BASE_LIFE',
  'BUY_PARTS',
  // En dernier, en bas à droite : c'est l'appel au détenteur d'engins, qui
  // n'arrive pas sur le site pour lui-même mais s'y reconnaît en descendant.
  'BUY_EQUIPMENT',
]
