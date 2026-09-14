import {
  AlertOctagon,
  Bell,
  Briefcase,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  HardHat,
  Heart,
  Inbox,
  LayoutDashboard,
  Plus,
  Receipt,
  ScrollText,
  Search,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../store/types'
import type { FeatureId } from './features'

/**
 * La navigation de VOLTA, en un seul endroit.
 *
 * Chaque espace tenait sa propre liste de liens, plate, et rien n'empêchait
 * d'y mettre une rubrique que le rôle n'avait pas le droit d'ouvrir — l'API
 * refusait, l'écran restait vide. Les quatre listes divergeaient aussi dans
 * leurs mots : « Demandes » signifiait devis chez l'un, location chez l'autre.
 *
 * Ici, une arborescence unique — Market, Ressources, Missions, Techniciens,
 * Entreprises, Commercial, Administration — et pour chaque entrée les rôles
 * qui la voient. La barre latérale filtre ; le menu d'un technicien ne contient
 * ni Administration ni Commercial parce que ces entrées ne le nomment pas.
 *
 * Une entrée peut pointer un module sans serveur (`feature`) : elle reste
 * visible, marquée comme telle, et mène à l'écran qui explique ce qui manque.
 */
export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: Role[]
  /** Vrai pour la racine de l'espace, qui sinon resterait active partout. */
  end?: boolean
  /** Module annoncé mais sans serveur : l'entrée est marquée « bientôt ». */
  feature?: FeatureId
}

export interface NavSection {
  id: string
  /** Absent pour la section d'ouverture, qui n'a pas besoin d'intitulé. */
  label?: string
  items: NavItem[]
}

const ALL: Role[] = ['ADMIN', 'SUPPLIER', 'TECHNICAL', 'CLIENT']

const TREE: NavSection[] = [
  {
    id: 'home',
    items: [
      { to: '/client', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['CLIENT'], end: true },
      { to: '/supplier', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['SUPPLIER'], end: true },
      { to: '/technical', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['TECHNICAL'], end: true },
      { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['ADMIN'], end: true },
    ],
  },
  {
    id: 'market',
    label: 'Market',
    items: [
      { to: '/client/catalogue', label: 'Louer', icon: Search, roles: ['CLIENT'] },
      { to: '/client/market', label: 'Acheter — Volta Market', icon: ShoppingCart, roles: ['CLIENT'] },
      { to: '/client/locations', label: 'Réserver', icon: CalendarCheck, roles: ['CLIENT'] },
      { to: '/client/demandes', label: 'Demandes de devis', icon: Inbox, roles: ['CLIENT'] },
      { to: '/client/devis', label: 'Devis reçus', icon: Receipt, roles: ['CLIENT'] },
      { to: '/client/favoris', label: 'Favoris', icon: Heart, roles: ['CLIENT'] },

      { to: '/supplier/locations', label: 'Réservations', icon: CalendarCheck, roles: ['SUPPLIER'] },
      { to: '/supplier/demandes', label: 'Demandes de devis', icon: Inbox, roles: ['SUPPLIER'] },
      { to: '/supplier/devis', label: 'Mes devis', icon: Receipt, roles: ['SUPPLIER'] },
      { to: '/supplier/vendre', label: 'Vendre — Volta Market', icon: Tag, roles: ['SUPPLIER'] },

      { to: '/admin/requests', label: 'Réservations', icon: CalendarCheck, roles: ['ADMIN'] },
      { to: '/admin/market', label: 'Volta Market', icon: Tag, roles: ['ADMIN'] },
    ],
  },
  {
    id: 'resources',
    label: 'Ressources',
    items: [
      { to: '/supplier/equipment/new', label: 'Ajouter un engin', icon: Plus, roles: ['SUPPLIER'] },
      { to: '/supplier/equipment', label: 'Mes ressources', icon: Truck, roles: ['SUPPLIER'] },
      { to: '/supplier/anomalies', label: 'Anomalies', icon: AlertOctagon, roles: ['SUPPLIER'] },

      { to: '/technical/missions', label: 'Vérifications', icon: ClipboardCheck, roles: ['TECHNICAL'] },
      { to: '/technical/anomalies', label: 'Anomalies', icon: AlertOctagon, roles: ['TECHNICAL'] },

      { to: '/admin/equipment', label: 'Ressources', icon: Truck, roles: ['ADMIN'] },
      { to: '/admin/inspections', label: 'Vérification', icon: ClipboardCheck, roles: ['ADMIN'] },
      { to: '/admin/reports', label: 'Qualification', icon: FileText, roles: ['ADMIN'] },
      { to: '/admin/anomalies', label: 'Anomalies', icon: AlertOctagon, roles: ['ADMIN'] },
    ],
  },
  {
    id: 'operations',
    label: 'Opérations',
    items: [
      { to: '/client/missions', label: 'Missions', icon: Briefcase, roles: ['CLIENT'], feature: 'MISSIONS' },
      { to: '/client/techniciens', label: 'Techniciens', icon: HardHat, roles: ['CLIENT'], feature: 'TECHNICIANS' },
      { to: '/client/entreprise', label: 'Mon entreprise', icon: Building2, roles: ['CLIENT'], feature: 'COMPANIES' },

      { to: '/technical/interventions', label: 'Missions', icon: Briefcase, roles: ['TECHNICAL'], feature: 'MISSIONS' },

      { to: '/admin/missions', label: 'Missions', icon: Briefcase, roles: ['ADMIN'], feature: 'MISSIONS' },
      { to: '/admin/techniciens', label: 'Techniciens', icon: HardHat, roles: ['ADMIN'], feature: 'TECHNICIANS' },
      { to: '/admin/entreprises', label: 'Entreprises', icon: Building2, roles: ['ADMIN'], feature: 'COMPANIES' },
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    items: [{ to: '/admin/commercial', label: 'Pipeline commercial', icon: Wrench, roles: ['ADMIN'] }],
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { to: '/admin/users', label: 'Utilisateurs', icon: Users, roles: ['ADMIN'] },
      { to: '/admin/audit', label: 'Journal d’audit', icon: ScrollText, roles: ['ADMIN'] },
    ],
  },
  {
    id: 'inbox',
    items: [
      { to: '/client/notifications', label: 'Notifications', icon: Bell, roles: ['CLIENT'] },
      { to: '/supplier/notifications', label: 'Notifications', icon: Bell, roles: ['SUPPLIER'] },
      { to: '/technical/notifications', label: 'Notifications', icon: Bell, roles: ['TECHNICAL'] },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell, roles: ['ADMIN'] },
    ],
  },
]

/** Point d'entrée de chaque rôle, après connexion ou redirection. */
export const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: '/admin',
  SUPPLIER: '/supplier',
  TECHNICAL: '/technical',
  CLIENT: '/client',
}

export const SPACE_LABEL: Record<Role, string> = {
  CLIENT: 'Espace Client',
  SUPPLIER: 'Espace Fournisseur',
  TECHNICAL: 'Équipe Technique',
  ADMIN: 'Administration',
}

export const ROLE_LABEL: Record<Role, string> = {
  CLIENT: 'Client',
  SUPPLIER: 'Fournisseur',
  TECHNICAL: 'Équipe technique',
  ADMIN: 'Administration',
}

/**
 * Les sections visibles par un rôle, vidées de ce qu'il ne peut pas ouvrir.
 * Une section qui ne lui laisse rien disparaît avec son intitulé.
 */
export function navigationFor(role: Role): NavSection[] {
  return TREE.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0)
}

/** Tous les liens d'un rôle, à plat : pour retrouver le titre de la page active. */
export function linksFor(role: Role): NavItem[] {
  return navigationFor(role).flatMap((s) => s.items)
}

export { ALL as ALL_ROLES }
