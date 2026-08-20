import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MarketingLayout } from './layouts/MarketingLayout'
import { AppLayout } from './layouts/AppLayout'
import { LandingPage } from './pages/marketing/LandingPage'
import { PlateformePage } from './pages/marketing/PlateformePage'
import { SolutionsPage } from './pages/marketing/SolutionsPage'
import { AgentsIaPage as AgentsIaMarketingPage } from './pages/marketing/AgentsIaPage'
import { RessourcesPage } from './pages/marketing/RessourcesPage'
import { AProposPage } from './pages/marketing/AProposPage'
import { TarifsPage } from './pages/marketing/TarifsPage'
import { ContactPage } from './pages/marketing/ContactPage'
import { DemoPage } from './pages/marketing/DemoPage'
import { CaseStudiesPage } from './pages/marketing/CaseStudiesPage'
import { SelectRoleInscription } from './pages/auth/SelectRoleInscription'
import { RssiInscriptionPage } from './pages/auth/RssiInscriptionPage'
import { AdminInscriptionPage } from './pages/auth/AdminInscriptionPage'
import { AuditorInvitationPage } from './pages/auth/AuditorInvitationPage'
import { LoginPage } from './pages/auth/LoginPage'
import { PlaceholderPage } from './pages/app/PlaceholderPage'
import { AuditeurDashboard } from './pages/app/auditeur/AuditeurDashboard'
import { MissionsListPage } from './pages/app/auditeur/MissionsListPage'
import { MissionCommandCenter } from './pages/app/auditeur/MissionCommandCenter'
import { WizardStepPage } from './pages/app/auditeur/WizardStepPage'
import { VulnerabilitesPage } from './pages/app/auditeur/VulnerabilitesPage'
import { ISO27001AuditPage } from './pages/app/auditeur/ISO27001AuditPage'
import { AuditFormPage } from './pages/app/auditeur/AuditFormPage'
import { AgentsIaPage } from './pages/app/shared/AgentsIaPage'
import { AdminDashboard } from './pages/app/admin/AdminDashboard'
import { UtilisateursPage, OrganisationsPage } from './pages/app/admin/AdminTablesPages'
import { AbonnementsPage, LogsPage } from './pages/app/admin/AdminOpsPages'
import { AdminAuditActionsPage } from './pages/app/admin/AdminAuditActionsPage'
import { RssiDashboard } from './pages/app/rssi/RssiDashboard'
import { RisquesPage, RapportsPage, RssiMissionsPage } from './pages/app/rssi/RssiPages'
import { AssetsManagementPage } from './pages/app/rssi/AssetsManagementPage'
import { ManageAuditorsPage } from './pages/app/rssi/ManageAuditorsPage'
import { SubscriptionPage } from './pages/app/rssi/SubscriptionPage'
import { MissionCreationPage } from './pages/app/rssi/MissionCreationPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plateforme" element={<PlateformePage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/agents-ia" element={<AgentsIaMarketingPage />} />
          <Route path="/ressources" element={<RessourcesPage />} />
          <Route path="/a-propos" element={<AProposPage />} />
          <Route path="/tarifs" element={<TarifsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/cas-clients" element={<CaseStudiesPage />} />
        </Route>

        <Route path="/inscription" element={<SelectRoleInscription />} />
        <Route path="/inscription/rssi" element={<RssiInscriptionPage />} />
        <Route path="/inscription/admin" element={<AdminInscriptionPage />} />
        <Route path="/invitation/auditeur" element={<AuditorInvitationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<LoginPage />} />

        <Route
          path="/app/auditeur"
          element={
            <ProtectedRoute>
              <AppLayout role="auditeur" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AuditeurDashboard />} />
          <Route path="missions" element={<MissionsListPage />} />
          <Route path="missions/:id" element={<MissionCommandCenter />} />
          <Route path="missions/:id/:step" element={<WizardStepPage />} />
          <Route path="vulnerabilites" element={<VulnerabilitesPage />} />
          <Route path="audit-iso27001" element={<ISO27001AuditPage />} />
          <Route path="nouvelle-mission" element={<AuditFormPage />} />
          <Route path="agents" element={<AgentsIaPage />} />
          <Route path="parametres" element={<PlaceholderPage title="Paramètres" />} />
        </Route>

        <Route
          path="/app/admin"
          element={
            <ProtectedRoute>
              <AppLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="utilisateurs" element={<UtilisateursPage />} />
          <Route path="organisations" element={<OrganisationsPage />} />
          <Route path="abonnements" element={<AbonnementsPage />} />
          <Route path="audits" element={<AdminAuditActionsPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="agents" element={<AgentsIaPage />} />
          <Route path="parametres" element={<PlaceholderPage title="Paramètres" />} />
        </Route>

        <Route
          path="/app/rssi"
          element={
            <ProtectedRoute>
              <AppLayout role="rssi" />
            </ProtectedRoute>
          }
        >
          <Route index element={<RssiDashboard />} />
          <Route path="risques" element={<RisquesPage />} />
          <Route path="vulnerabilites" element={<VulnerabilitesPage dark />} />
          <Route path="missions" element={<RssiMissionsPage />} />
          <Route path="missions/creer" element={<MissionCreationPage />} />
          <Route path="assets" element={<AssetsManagementPage />} />
          <Route path="rapports" element={<RapportsPage />} />
          <Route path="auditeurs" element={<ManageAuditorsPage />} />
          <Route path="abonnement" element={<SubscriptionPage />} />
          <Route path="agents" element={<AgentsIaPage />} />
          <Route path="parametres" element={<PlaceholderPage title="Paramètres" dark />} />
        </Route>
      </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
