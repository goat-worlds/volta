import { Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Plus, Inbox, FileText, ClipboardCheck,
  Users, Package, Search, Receipt, CalendarCheck, Heart, Wrench, Bell,
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import RoleShell, { type ShellLink } from './RoleShell'
import RequireRole from './RequireRole'

/**
 * Les quatre espaces connectés partagent RoleShell : ils ne se distinguent que
 * par leur navigation. Toute la mise en forme — barre latérale, en-tête,
 * couleur d'accent, fond — vit dans la coque, en un seul endroit.
 */

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

// Le parcours fournisseur, dans l'ordre où il se vit : on déclare un engin, on
// le fait vérifier, on répond aux demandes, on suit les locations conclues.
const SUPPLIER_LINKS: ShellLink[] = [
  { to: '/supplier', label: 'Tableau de bord', end: true, icon: LayoutDashboard },
  { to: '/supplier/equipment/new', label: 'Ajouter un engin', icon: Plus },
  { to: '/supplier/equipment', label: 'Mes engins', icon: Truck },
  { to: '/supplier/demandes', label: 'Demandes de devis', icon: Inbox },
  { to: '/supplier/devis', label: 'Mes devis', icon: Receipt },
  { to: '/supplier/locations', label: 'Locations', icon: CalendarCheck },
  { to: '/supplier/notifications', label: 'Notifications', icon: Bell },
]

const TECHNICAL_LINKS: ShellLink[] = [
  { to: '/technical', label: 'Tableau de bord', end: true, icon: LayoutDashboard },
  { to: '/technical/missions', label: 'Mes missions', icon: Wrench },
  { to: '/technical/notifications', label: 'Notifications', icon: Bell },
]

const ADMIN_LINKS: ShellLink[] = [
  { to: '/admin', label: 'Tableau de bord', end: true, icon: LayoutDashboard },
  { to: '/admin/equipment', label: 'Engins', icon: Truck },
  { to: '/admin/inspections', label: 'Inspections', icon: ClipboardCheck },
  { to: '/admin/reports', label: 'Rapports', icon: FileText },
  { to: '/admin/requests', label: 'Demandes', icon: Inbox },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
]

const CLIENT_LINKS: ShellLink[] = [
  { to: '/client', label: 'Tableau de bord', end: true, icon: LayoutDashboard },
  { to: '/client/catalogue', label: 'Catalogue', icon: Search },
  { to: '/client/favoris', label: 'Mes favoris', icon: Heart },
  { to: '/client/demandes', label: 'Mes demandes', icon: Package },
  { to: '/client/devis', label: 'Mes devis', icon: Receipt },
  { to: '/client/locations', label: 'Mes locations', icon: CalendarCheck },
  { to: '/client/notifications', label: 'Notifications', icon: Bell },
]

export function SupplierLayout() {
  return (
    <RequireRole role="SUPPLIER">
      <RoleShell role="SUPPLIER" space="Espace Fournisseur" links={SUPPLIER_LINKS} />
    </RequireRole>
  )
}

export function TechnicalLayout() {
  return (
    <RequireRole role="TECHNICAL">
      <RoleShell role="TECHNICAL" space="Équipe Technique" links={TECHNICAL_LINKS} />
    </RequireRole>
  )
}

export function AdminLayout() {
  return (
    <RequireRole role="ADMIN">
      <RoleShell role="ADMIN" space="Administration" links={ADMIN_LINKS} />
    </RequireRole>
  )
}

export function ClientLayout() {
  return (
    <RequireRole role="CLIENT">
      <RoleShell role="CLIENT" space="Espace Client" links={CLIENT_LINKS} />
    </RequireRole>
  )
}
