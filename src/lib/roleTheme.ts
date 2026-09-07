import type { Role } from '../store/types'

/**
 * Couleur d'accent de chaque espace.
 *
 * La coque appliquait l'ambre de la marque aux quatre rôles, au nom de l'unité.
 * Mais les écrans, eux, ne l'avaient jamais suivie : l'administration bâtit ses
 * actions en indigo, l'équipe technique en émeraude, le client en bleu, seul le
 * fournisseur est en ambre. La barre latérale contredisait donc le contenu
 * qu'elle encadrait, et le reste — cartes blanches sur fond gris — ne portait
 * aucune couleur du tout.
 *
 * L'accent reprend la teinte que chaque espace utilisait déjà. La structure ne
 * change pas d'un rôle à l'autre : même barre, même en-tête, même disposition.
 * Seule la teinte suit le métier, et elle sert de repère — on sait d'un coup
 * d'œil dans quel espace on se trouve.
 *
 * Les classes sont écrites en entier : Tailwind lit les sources telles quelles
 * et ne génère pas une classe composée à l'exécution.
 */
export interface RoleTheme {
  /** Lien actif de la barre latérale. */
  navActive: string
  /** Pastille de comptage sur un lien actif, où le fond est déjà coloré. */
  badgeOnActive: string
  /** Pastille de comptage sur un lien au repos. */
  badgeIdle: string
  /** Bandeau supérieur de l'en-tête, qui signe l'espace. */
  headerBar: string
  /** Pastille d'initiale de l'utilisateur. */
  avatar: string
  /** Fond de la zone de contenu, très légèrement teinté. */
  canvas: string
  /** Texte d'accent — titres de section, liens. */
  text: string
  /** Fond doux des tuiles de chiffres. */
  tileChip: string
  /** Bouton d'action principal de l'espace. */
  button: string
}

const THEMES: Record<Role, RoleTheme> = {
  // L'administration arbitre : l'indigo de ses boutons de décision.
  ADMIN: {
    navActive: 'bg-indigo-500 text-white',
    badgeOnActive: 'bg-white/25 text-white',
    badgeIdle: 'bg-indigo-500 text-white',
    headerBar: 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-acier-800',
    avatar: 'bg-indigo-500 text-white',
    canvas: 'bg-indigo-50/40',
    text: 'text-indigo-700',
    tileChip: 'bg-indigo-50 text-indigo-600',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
  },
  // Le fournisseur apporte les engins : l'ambre chantier de la marque.
  SUPPLIER: {
    navActive: 'bg-btp-400 text-acier-900',
    badgeOnActive: 'bg-acier-900 text-btp-300',
    badgeIdle: 'bg-btp-500 text-white',
    headerBar: 'bg-gradient-to-r from-btp-400 via-btp-500 to-acier-800',
    avatar: 'bg-btp-400 text-acier-900',
    canvas: 'bg-btp-50/50',
    text: 'text-btp-700',
    tileChip: 'bg-btp-50 text-btp-600',
    button: 'bg-btp-500 text-white hover:bg-btp-600 focus-visible:ring-btp-400',
  },
  // L'équipe technique atteste la conformité : l'émeraude de ses contrôles.
  TECHNICAL: {
    navActive: 'bg-emerald-500 text-white',
    badgeOnActive: 'bg-white/25 text-white',
    badgeIdle: 'bg-emerald-500 text-white',
    headerBar: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-acier-800',
    avatar: 'bg-emerald-500 text-white',
    canvas: 'bg-emerald-50/40',
    text: 'text-emerald-700',
    tileChip: 'bg-emerald-50 text-emerald-600',
    button: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
  },
  // Le client compare et décide : le bleu de ses écrans de devis.
  CLIENT: {
    navActive: 'bg-blue-500 text-white',
    badgeOnActive: 'bg-white/25 text-white',
    badgeIdle: 'bg-blue-500 text-white',
    headerBar: 'bg-gradient-to-r from-blue-500 via-blue-400 to-acier-800',
    avatar: 'bg-blue-500 text-white',
    canvas: 'bg-blue-50/40',
    text: 'text-blue-700',
    tileChip: 'bg-blue-50 text-blue-600',
    button: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  },
}

export function roleTheme(role: Role): RoleTheme {
  return THEMES[role] ?? THEMES.CLIENT
}
