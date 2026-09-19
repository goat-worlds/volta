import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { ToastProvider } from './components/feedback/Toaster'
import { AdminLayout, ClientLayout, PublicLayout, SupplierLayout, TechnicalLayout } from './components/Layouts'
import Home from './pages/public/Home'
import ScrollManager from './components/ScrollManager'

/**
 * Découpage du bundle par page.
 *
 * Avant ce fichier, les 47 pages (admin, client, fournisseur, technicien,
 * public) étaient importées de façon statique : un visiteur qui ne consultait
 * que la vitrine publique téléchargeait aussi le code des quatre espaces
 * privés, dans un seul fichier JS de 600 Ko. `lazy()` fait de chaque page un
 * fichier à part, chargé au moment où la route est atteinte — pas avant.
 *
 * `Home` reste importée normalement : c'est la première page vue par la
 * plupart des visiteurs, la charger en différé retarderait l'affichage
 * qu'elle doit au contraire accélérer.
 */
const Catalogue = lazy(() => import('./pages/public/Catalogue'))
const EquipmentDetail = lazy(() => import('./pages/public/EquipmentDetail'))
const Suppliers = lazy(() => import('./pages/public/Suppliers'))
const Login = lazy(() => import('./pages/public/Login'))
const Register = lazy(() => import('./pages/public/Register'))
const RequestTracking = lazy(() => import('./pages/public/RequestTracking'))
const Market = lazy(() => import('./pages/public/Market'))
const MarketListing = lazy(() => import('./pages/public/MarketListing'))
const Recruitment = lazy(() => import('./pages/public/Recruitment'))
const JourneyPage = lazy(() => import('./pages/journeys/JourneyPage'))

const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'))
const ClientQuoteRequests = lazy(() => import('./pages/client/ClientQuoteRequests'))
const ClientQuoteRequestDetail = lazy(() => import('./pages/client/ClientQuoteRequestDetail'))
const ClientNewQuoteRequest = lazy(() => import('./pages/client/ClientNewQuoteRequest'))
const ClientQuotes = lazy(() => import('./pages/client/ClientQuotes'))
const ClientRentals = lazy(() => import('./pages/client/ClientRentals'))
const ClientFavorites = lazy(() => import('./pages/client/ClientFavorites'))

const SupplierDashboard = lazy(() => import('./pages/supplier/SupplierDashboard'))
const SupplierEquipment = lazy(() => import('./pages/supplier/SupplierEquipment'))
const SupplierEquipmentNew = lazy(() => import('./pages/supplier/SupplierEquipmentNew'))
const SupplierRequests = lazy(() => import('./pages/supplier/SupplierRequests'))
const SupplierQuoteRequests = lazy(() => import('./pages/supplier/SupplierQuoteRequests'))
const SupplierQuotes = lazy(() => import('./pages/supplier/SupplierQuotes'))
const SupplierListings = lazy(() => import('./pages/supplier/SupplierListings'))

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminEquipment = lazy(() => import('./pages/admin/AdminEquipment'))
const AdminInspections = lazy(() => import('./pages/admin/AdminInspections'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests'))
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminCommercial = lazy(() => import('./pages/admin/AdminCommercial'))
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'))
const AdminMarket = lazy(() => import('./pages/admin/AdminMarket'))

const TechnicalDashboard = lazy(() => import('./pages/technical/TechnicalDashboard'))
const TechnicalMissions = lazy(() => import('./pages/technical/TechnicalMissions'))
const TechnicalInspection = lazy(() => import('./pages/technical/TechnicalInspection'))

const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const AnomaliesPage = lazy(() => import('./pages/AnomaliesPage'))
const FeatureUnavailable = lazy(() => import('./pages/FeatureUnavailable'))
const NotFoundLazy = lazy(() => import('./pages/errors').then((m) => ({ default: m.NotFound })))

/** Le temps d'un chargement de page différée : discret, jamais un écran vide brut. */
function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-btp-500" />
    </div>
  )
}

export default function App() {
  return (
    // Les notifications sont montées au-dessus du magasin : c'est lui qui les
    // émet quand la synchronisation rapporte un changement.
    <ToastProvider>
      <StoreProvider>
        <BrowserRouter>
          <ScrollManager />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/equipment/:id" element={<EquipmentDetail />} />
                <Route path="/fournisseurs" element={<Suppliers />} />
                <Route path="/connexion" element={<Login />} />
                <Route path="/inscription" element={<Register />} />

                {/* Les huit parcours de l'accueil. L'adresse est en français et
                    décrit l'intention : elle se dicte au téléphone et se retrouve
                    dans un historique de navigation. */}
                <Route path="/demande/location" element={<JourneyPage intent="RENT_EQUIPMENT" />} />
                <Route path="/demande/technicien" element={<JourneyPage intent="FIND_TECHNICIAN" />} />
                {/* Volta Market : la vitrine d'abord, le formulaire libre pour
                    qui n'a pas trouvé. « demande » précède « :id ». */}
                <Route path="/market" element={<Market />} />
                <Route path="/market/demande" element={<JourneyPage intent="BUY_EQUIPMENT" />} />
                <Route path="/market/:id" element={<MarketListing />} />
                <Route path="/proposer-un-engin" element={<JourneyPage intent="OFFER_EQUIPMENT" />} />
                <Route path="/catalogue-entreprise" element={<JourneyPage intent="LIST_CATALOG" />} />
                <Route path="/gold" element={<JourneyPage intent="BECOME_GOLD" />} />
                <Route path="/accompagnement" element={<JourneyPage intent="GROW_SALES" />} />
                {/* Recrutement : la page dit les métiers et le processus avant
                    d'ouvrir le dépôt de CV. L'ancienne adresse reste servie. */}
                <Route path="/recrutement" element={<Recruitment />} />
                <Route path="/recrutement/candidature" element={<JourneyPage intent="JOIN_TECHNICAL_TEAM" />} />
                <Route path="/equipe-technique" element={<Navigate to="/recrutement" replace />} />

                <Route path="/suivi" element={<RequestTracking />} />

                {/* Toute adresse inconnue tombe ici, dans la coque publique. */}
                <Route path="*" element={<NotFoundLazy />} />
              </Route>
              <Route element={<ClientLayout />}>
                <Route path="/client" element={<ClientDashboard />} />
                {/* Le catalogue et la fiche produit sont ceux du public : les
                    dupliquer ferait deux vues à maintenir pour un même contenu. */}
                <Route path="/client/catalogue" element={<Catalogue />} />
                <Route path="/client/equipment/:id" element={<EquipmentDetail />} />
                {/* La route « nouvelle » précède « :id », sinon elle serait
                    interprétée comme un identifiant de demande. */}
                <Route path="/client/demandes/nouvelle" element={<ClientNewQuoteRequest />} />
                <Route path="/client/demandes/:id" element={<ClientQuoteRequestDetail />} />
                <Route path="/client/demandes" element={<ClientQuoteRequests />} />
                <Route path="/client/devis" element={<ClientQuotes />} />
                <Route path="/client/locations" element={<ClientRentals />} />
                <Route path="/client/favoris" element={<ClientFavorites />} />
                <Route path="/client/notifications" element={<NotificationsPage />} />
                {/* Le Market est le même qu'en public, monté dans l'espace pour
                    garder la barre latérale. */}
                <Route path="/client/market" element={<Market />} />
                <Route path="/client/market/demande" element={<JourneyPage intent="BUY_EQUIPMENT" />} />
                <Route path="/client/market/:id" element={<MarketListing />} />
                <Route path="/client/acheter" element={<Navigate to="/client/market" replace />} />
                {/* Modules annoncés, sans serveur : l'écran le dit, il ne simule pas. */}
                <Route path="/client/missions" element={<FeatureUnavailable feature="MISSIONS" />} />
                <Route path="/client/techniciens" element={<FeatureUnavailable feature="TECHNICIANS" />} />
                <Route path="/client/entreprise" element={<FeatureUnavailable feature="COMPANIES" />} />
                <Route path="/client/*" element={<NotFoundLazy />} />
              </Route>
              <Route element={<SupplierLayout />}>
                <Route path="/supplier" element={<SupplierDashboard />} />
                <Route path="/supplier/equipment" element={<SupplierEquipment />} />
                <Route path="/supplier/equipment/new" element={<SupplierEquipmentNew />} />
                <Route path="/supplier/demandes" element={<SupplierQuoteRequests />} />
                <Route path="/supplier/devis" element={<SupplierQuotes />} />
                {/* Une location naît de l'acceptation d'un devis : c'est la fin du
                    parcours. L'ancienne adresse reste servie. */}
                <Route path="/supplier/locations" element={<SupplierRequests />} />
                <Route path="/supplier/requests" element={<SupplierRequests />} />
                <Route path="/supplier/anomalies" element={<AnomaliesPage />} />
                <Route path="/supplier/notifications" element={<NotificationsPage />} />
                <Route path="/supplier/vendre" element={<SupplierListings />} />
                <Route path="/supplier/*" element={<NotFoundLazy />} />
              </Route>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/equipment" element={<AdminEquipment />} />
                <Route path="/admin/inspections" element={<AdminInspections />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/requests" element={<AdminRequests />} />
                <Route path="/admin/demandes" element={<AdminSubmissions />} />
                <Route path="/admin/anomalies" element={<AnomaliesPage />} />
                <Route path="/admin/commercial" element={<AdminCommercial />} />
                <Route path="/admin/market" element={<AdminMarket />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/audit" element={<AdminAudit />} />
                <Route path="/admin/notifications" element={<NotificationsPage />} />
                <Route path="/admin/missions" element={<FeatureUnavailable feature="MISSIONS" />} />
                <Route path="/admin/techniciens" element={<FeatureUnavailable feature="TECHNICIANS" />} />
                <Route path="/admin/entreprises" element={<FeatureUnavailable feature="COMPANIES" />} />
                <Route path="/admin/*" element={<NotFoundLazy />} />
              </Route>
              <Route element={<TechnicalLayout />}>
                <Route path="/technical" element={<TechnicalDashboard />} />
                <Route path="/technical/missions" element={<TechnicalMissions />} />
                <Route path="/technical/inspection/:id" element={<TechnicalInspection />} />
                <Route path="/technical/anomalies" element={<AnomaliesPage />} />
                <Route path="/technical/notifications" element={<NotificationsPage />} />
                <Route path="/technical/interventions" element={<FeatureUnavailable feature="MISSIONS" />} />
                <Route path="/technical/*" element={<NotFoundLazy />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </StoreProvider>
    </ToastProvider>
  )
}
