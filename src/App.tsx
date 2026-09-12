import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { ToastProvider } from './components/feedback/Toaster'
import { AdminLayout, ClientLayout, PublicLayout, SupplierLayout, TechnicalLayout } from './components/Layouts'
import Home from './pages/public/Home'
import Catalogue from './pages/public/Catalogue'
import EquipmentDetail from './pages/public/EquipmentDetail'
import Suppliers from './pages/public/Suppliers'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import RequestTracking from './pages/public/RequestTracking'
import JourneyPage from './pages/journeys/JourneyPage'
import ClientDashboard from './pages/client/ClientDashboard'
import ClientQuoteRequests from './pages/client/ClientQuoteRequests'
import ClientQuoteRequestDetail from './pages/client/ClientQuoteRequestDetail'
import ClientNewQuoteRequest from './pages/client/ClientNewQuoteRequest'
import ClientQuotes from './pages/client/ClientQuotes'
import ClientRentals from './pages/client/ClientRentals'
import ClientFavorites from './pages/client/ClientFavorites'
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import SupplierEquipment from './pages/supplier/SupplierEquipment'
import SupplierEquipmentNew from './pages/supplier/SupplierEquipmentNew'
import SupplierRequests from './pages/supplier/SupplierRequests'
import SupplierQuoteRequests from './pages/supplier/SupplierQuoteRequests'
import SupplierQuotes from './pages/supplier/SupplierQuotes'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEquipment from './pages/admin/AdminEquipment'
import AdminInspections from './pages/admin/AdminInspections'
import AdminReports from './pages/admin/AdminReports'
import AdminRequests from './pages/admin/AdminRequests'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCommercial from './pages/admin/AdminCommercial'
import AdminAudit from './pages/admin/AdminAudit'
import TechnicalDashboard from './pages/technical/TechnicalDashboard'
import TechnicalMissions from './pages/technical/TechnicalMissions'
import TechnicalInspection from './pages/technical/TechnicalInspection'
import NotificationsPage from './pages/NotificationsPage'
import AnomaliesPage from './pages/AnomaliesPage'
import FeatureUnavailable from './pages/FeatureUnavailable'
import { NotFound } from './pages/errors'

export default function App() {
  return (
    // Les notifications sont montées au-dessus du magasin : c'est lui qui les
    // émet quand la synchronisation rapporte un changement.
    <ToastProvider>
      <StoreProvider>
        <BrowserRouter>
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
              <Route path="/market" element={<JourneyPage intent="BUY_EQUIPMENT" />} />
              <Route path="/proposer-un-engin" element={<JourneyPage intent="OFFER_EQUIPMENT" />} />
              <Route path="/catalogue-entreprise" element={<JourneyPage intent="LIST_CATALOG" />} />
              <Route path="/gold" element={<JourneyPage intent="BECOME_GOLD" />} />
              <Route path="/accompagnement" element={<JourneyPage intent="GROW_SALES" />} />
              <Route path="/equipe-technique" element={<JourneyPage intent="JOIN_TECHNICAL_TEAM" />} />

              <Route path="/suivi" element={<RequestTracking />} />

              {/* Toute adresse inconnue tombe ici, dans la coque publique. */}
              <Route path="*" element={<NotFound />} />
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
              {/* Modules annoncés, sans serveur : l'écran le dit, il ne simule pas. */}
              <Route path="/client/acheter" element={<FeatureUnavailable feature="MARKET_BUY" />} />
              <Route path="/client/missions" element={<FeatureUnavailable feature="MISSIONS" />} />
              <Route path="/client/techniciens" element={<FeatureUnavailable feature="TECHNICIANS" />} />
              <Route path="/client/entreprise" element={<FeatureUnavailable feature="COMPANIES" />} />
              <Route path="/client/*" element={<NotFound />} />
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
              <Route path="/supplier/vendre" element={<FeatureUnavailable feature="MARKET_SELL" />} />
              <Route path="/supplier/*" element={<NotFound />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/equipment" element={<AdminEquipment />} />
              <Route path="/admin/inspections" element={<AdminInspections />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/admin/anomalies" element={<AnomaliesPage />} />
              <Route path="/admin/commercial" element={<AdminCommercial />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/audit" element={<AdminAudit />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
              <Route path="/admin/missions" element={<FeatureUnavailable feature="MISSIONS" />} />
              <Route path="/admin/techniciens" element={<FeatureUnavailable feature="TECHNICIANS" />} />
              <Route path="/admin/entreprises" element={<FeatureUnavailable feature="COMPANIES" />} />
              <Route path="/admin/*" element={<NotFound />} />
            </Route>
            <Route element={<TechnicalLayout />}>
              <Route path="/technical" element={<TechnicalDashboard />} />
              <Route path="/technical/missions" element={<TechnicalMissions />} />
              <Route path="/technical/inspection/:id" element={<TechnicalInspection />} />
              <Route path="/technical/anomalies" element={<AnomaliesPage />} />
              <Route path="/technical/notifications" element={<NotificationsPage />} />
              <Route path="/technical/interventions" element={<FeatureUnavailable feature="MISSIONS" />} />
              <Route path="/technical/*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ToastProvider>
  )
}
