import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import RoleShell from './RoleShell'
import RequireRole from './RequireRole'
import { RouteBoundary } from '../pages/errors'

/**
 * Les quatre espaces connectés partagent RoleShell : la navigation de chacun
 * est lue dans l'arborescence commune (lib/navigation), filtrée par le rôle.
 * Toute la mise en forme — barre latérale, en-tête, couleur d'accent, fond —
 * vit dans la coque, en un seul endroit.
 */

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <RouteBoundary>
          <Outlet />
        </RouteBoundary>
      </main>
      <Footer />
    </div>
  )
}

export function SupplierLayout() {
  return (
    <RequireRole role="SUPPLIER">
      <RoleShell role="SUPPLIER" />
    </RequireRole>
  )
}

export function TechnicalLayout() {
  return (
    <RequireRole role="TECHNICAL">
      <RoleShell role="TECHNICAL" />
    </RequireRole>
  )
}

export function AdminLayout() {
  return (
    <RequireRole role="ADMIN">
      <RoleShell role="ADMIN" />
    </RequireRole>
  )
}

export function ClientLayout() {
  return (
    <RequireRole role="CLIENT">
      <RoleShell role="CLIENT" />
    </RequireRole>
  )
}
