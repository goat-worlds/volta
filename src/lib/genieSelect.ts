import {
  Building2,
  Clock,
  GraduationCap,
  MapPin,
  Radio,
  ShieldCheck,
  ShoppingCart,
  Target,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * Génie Sélect : le groupe derrière VOLTA.
 *
 * Le site ne nommait le groupe que dans la signature du logo et dans quelques
 * phrases de garantie — « un vérificateur mandaté par Génie Sélect ». Un
 * visiteur venu louer une pelle ne pouvait pas savoir que le même groupe
 * installe des bases vie, répare les machines, forme les conducteurs et suit
 * les flottes.
 *
 * Les six expertises sont déclarées ici et nulle part ailleurs : l'accueil, la
 * page « Collaborons » et le menu de l'en-tête lisent cette liste. Trois copies
 * auraient fini par se contredire sur un intitulé ou un renvoi.
 */

/**
 * Les teintes d'un pôle.
 *
 * <h2>Pourquoi six couleurs sur un site qui n'en a que deux</h2>
 *
 * VOLTA tient à l'ambre et à l'acier, et les six cartes étaient donc
 * identiques. Mais ces six marques existent en dehors du site : elles ont leur
 * papier à en-tête, leurs devis, leurs interlocuteurs. Un client de GS
 * MAINTENANCE reconnaît le vert avant de lire le mot. Les aplatir revenait à
 * présenter six sociétés comme un seul rayon.
 *
 * La couleur ne sort pas de cette section : le reste de la page garde l'ambre
 * et l'acier. Six accents sur une grille, c'est une signalétique ; six accents
 * partout, c'est un site qui n'a plus de couleur du tout.
 *
 * Les classes sont écrites en entier plutôt que composées à la volée : Tailwind
 * lit le code source pour décider de ce qu'il génère, et une classe assemblée
 * par concaténation n'existerait pas dans la feuille de style finale.
 */
export interface Teintes {
  /** La pastille qui porte le pictogramme. */
  tuile: string
  /** L'accroche, sous la marque. */
  texte: string
  /** Le bouton plein, en pied de carte. */
  bouton: string
  /** Les coches de la liste. */
  coche: string
  /** Le bandeau de tête, quand le pôle n'a pas de photo. */
  bandeau: string
}

export interface Expertise {
  /** Le numéro affiché sur la carte. Il vient de l'ordre, pas d'une saisie. */
  id: string
  /** La marque du domaine, telle qu'elle s'écrit : GS RENTAL, GS INVEST… */
  nom: string
  /** Ce que le visiteur vient y faire, dit à la première personne du pluriel. */
  accroche: string
  texte: string
  icon: LucideIcon
  couleur: Teintes
  /**
   * Ce que le pôle couvre, en phrases plutôt qu'en mots.
   *
   * C'étaient des étiquettes d'un mot — « Pelles », « Bureaux », « Sécurité ».
   * Posées côte à côte, elles se lisaient comme un nuage de mots-clés : on
   * voyait le périmètre, jamais l'engagement. « Location courte ou longue
   * durée » dit quelque chose que « Pelles » ne dit pas.
   */
  points: readonly string[]
  /** Où mène la carte. */
  to: string
  /**
   * Les autres portes du même pôle.
   *
   * <p>Un domaine n'ouvre pas toujours sur un seul geste. GS RENTAL en a deux,
   * qui ne s'adressent pas à la même personne : celui qui vient choisir une
   * machine parcourt le catalogue ; celui qui doit équiper un chantier entier
   * ne cherche pas une pelle, il décrit un besoin de flotte. Les renvoyer tous
   * les deux au catalogue faisait repartir le second, qui n'y trouvait rien
   * qui lui parle.
   *
   * <p>Facultatif, et volontairement court : trois portes sur une carte, ce
   * n'est plus une carte, c'est un menu.
   */
  portes?: readonly { libelle: string; to: string }[]
  /**
   * La photo de tête de la carte.
   *
   * Absente, la carte porte un bandeau à sa couleur et son pictogramme en
   * grand. Mieux vaut un aplat assumé qu'une photo d'engin posée sous un
   * intitulé qu'elle ne représente pas : une pelle sous « Base Vie » dirait le
   * contraire du texte, et une machine sous « Formez mon équipe » aussi.
   */
  image?: string
}

const AMBRE: Teintes = {
  tuile: 'bg-btp-500',
  texte: 'text-btp-600',
  bouton: 'bg-btp-500 hover:bg-btp-600',
  coche: 'text-btp-500',
  bandeau: 'from-btp-400 to-btp-600',
}
const ACIER: Teintes = {
  tuile: 'bg-acier-800',
  texte: 'text-acier-700',
  bouton: 'bg-acier-800 hover:bg-acier-900',
  coche: 'text-acier-600',
  bandeau: 'from-acier-600 to-acier-900',
}
const VERT: Teintes = {
  tuile: 'bg-emerald-600',
  texte: 'text-emerald-700',
  bouton: 'bg-emerald-600 hover:bg-emerald-700',
  coche: 'text-emerald-600',
  bandeau: 'from-emerald-500 to-emerald-700',
}
const ROUGE: Teintes = {
  tuile: 'bg-red-600',
  texte: 'text-red-700',
  bouton: 'bg-red-600 hover:bg-red-700',
  coche: 'text-red-600',
  bandeau: 'from-red-500 to-red-700',
}
const VIOLET: Teintes = {
  tuile: 'bg-violet-600',
  texte: 'text-violet-700',
  bouton: 'bg-violet-600 hover:bg-violet-700',
  coche: 'text-violet-600',
  bandeau: 'from-violet-500 to-violet-700',
}
const BLEU: Teintes = {
  tuile: 'bg-blue-600',
  texte: 'text-blue-700',
  bouton: 'bg-blue-600 hover:bg-blue-700',
  coche: 'text-blue-600',
  bandeau: 'from-blue-500 to-blue-700',
}

export const EXPERTISES: readonly Expertise[] = [
  {
    id: '01',
    nom: 'GS RENTAL',
    accroche: 'Louez des engins',
    texte:
      'Accédez rapidement à un large choix d’engins de chantier performants et bien entretenus.',
    icon: Truck,
    couleur: AMBRE,
    points: [
      'Engins disponibles immédiatement',
      'Location courte ou longue durée',
      'Accompagnement personnalisé',
    ],
    to: '/catalogue',
    // Équiper un chantier entier ne se fait pas en cliquant machine par
    // machine : on décrit ce qu'il faut, et VOLTA compose la flotte.
    portes: [{ libelle: 'Besoin de flotte ?', to: '/demande/location' }],
    image: '/engins/pelle-cat-336e.jpeg',
  },
  {
    id: '02',
    nom: 'GS CONSTRUCTION',
    accroche: 'Base Vie',
    texte: 'Installez vos bases vie complètes et modulaires sur vos chantiers.',
    icon: Building2,
    couleur: ACIER,
    points: ['Bungalows et sanitaires', 'Bureaux et salles de réunion', 'Solutions sur mesure'],
    to: '/demande/location',
    // Seul pôle sans photo : rien dans le fonds ne montre une base vie.
    // Un immeuble de bureaux ou une pelle y dirait le contraire du texte.
  },
  {
    id: '03',
    nom: 'GS MAINTENANCE',
    accroche: 'Réparez vos engins',
    texte:
      'Maintenance préventive et corrective par des experts pour garantir la disponibilité de vos équipements.',
    icon: Wrench,
    couleur: VERT,
    points: ['Entretien et réparation', 'Pièces d’origine', 'Suivi et planification'],
    to: '/demande/technicien',
    image: '/engins/technicien-maintenance.jpeg',
  },
  {
    id: '04',
    nom: 'GS INVEST',
    accroche: 'Achetez un engin',
    texte: 'Acquérez des engins neufs ou d’occasion avec un accompagnement professionnel.',
    icon: ShoppingCart,
    couleur: ROUGE,
    points: ['Engins neufs et d’occasion', 'Financement possible', 'Conseil et accompagnement'],
    to: '/market',
    image: '/engins/parc-chargeuses.jpeg',
  },
  {
    id: '05',
    nom: 'GS DIGITAL',
    accroche: 'Smart Fleet',
    texte: 'Suivez et optimisez votre flotte en temps réel grâce à nos solutions digitales.',
    icon: Radio,
    couleur: VIOLET,
    points: ['Géolocalisation', 'Suivi d’activité', 'Tableaux de bord', 'Alertes et reporting'],
    to: '/accompagnement',
    image: '/engins/verificateur-tablette.jpeg',
  },
  {
    id: '06',
    nom: 'GS ACADEMY',
    accroche: 'Formez mon équipe',
    texte: 'Développez les compétences de vos équipes avec des formations pratiques et certifiantes.',
    icon: GraduationCap,
    couleur: BLEU,
    points: ['Conduite d’engins', 'Sécurité sur chantier', 'Maintenance', 'Certification'],
    to: '/recrutement',
    image: '/engins/formation-equipe.jpeg',
  },
]

/** Les quatre promesses affichées sous la couverture. */
export const PROMESSES: readonly { icon: LucideIcon; titre: string; detail: string }[] = [
  { icon: Target, titre: 'Des solutions', detail: 'concrètes' },
  { icon: Clock, titre: 'Un accompagnement', detail: 'de bout en bout' },
  { icon: ShieldCheck, titre: 'Des experts', detail: 'à vos côtés' },
  { icon: MapPin, titre: 'Une présence locale', detail: 'en Côte d’Ivoire et en Afrique' },
]

/**
 * Les chiffres du bandeau, sous les six cartes.
 *
 * Ils viennent de la maquette et engagent la maison : ce sont des affirmations
 * sur son parc, ses partenaires et ses clients, pas des éléments de décor. Ils
 * sont donc tenus ici, à un seul endroit, pour qu'on sache où les corriger le
 * jour où le parc grandit.
 */
export const CHIFFRES: readonly { valeur: string; libelle: string }[] = [
  { valeur: '+500', libelle: 'engins dans notre parc' },
  { valeur: '+200', libelle: 'entreprises partenaires' },
  { valeur: '98 %', libelle: 'de satisfaction client' },
]
