import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { PublicLayout } from './components/Layouts'
import GlobalNavbar from './components/GlobalNavbar'
import Home from './pages/public/Home'
import Catalogue from './pages/public/Catalogue'
import EquipmentDetail from './pages/public/EquipmentDetail'
import Suppliers from './pages/public/Suppliers'
import Pricing from './pages/public/Pricing'
import Login from './pages/public/Login'
import Signup from './pages/public/Signup'
import ClientDashboard from './pages/dashboards/ClientDashboard'
import SupplierDashboard from './pages/dashboards/SupplierDashboard'
import TechnicalDashboard from './pages/dashboards/TechnicalDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import AdminQuotes from './pages/admin/AdminQuotes'
import AdminInspections from './pages/admin/AdminInspections'
import AdminValidate from './pages/admin/AdminValidate'
import AdminEquipmentSubmissions from './pages/admin/AdminEquipmentSubmissions'
import TechnicalMissions from './pages/technical/TechnicalMissions'
import TechnicalInspection from './pages/technical/TechnicalInspection'
import SupplierEquipment from './pages/supplier/SupplierEquipment'
import SupplierAddEquipment from './pages/supplier/SupplierAddEquipment'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <GlobalNavbar />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/fournisseurs" element={<Suppliers />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboard Routes */}
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
          <Route path="/technical-dashboard" element={<TechnicalDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Admin workspace */}
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="/admin/quotes" element={<AdminQuotes />} />
          <Route path="/admin/submissions" element={<AdminEquipmentSubmissions />} />
          <Route path="/admin/inspections" element={<AdminInspections />} />
          <Route path="/admin/validate/:id" element={<AdminValidate />} />

          {/* Technical workspace */}
          <Route path="/technical" element={<Navigate to="/technical-dashboard" replace />} />
          <Route path="/technical/missions" element={<TechnicalMissions />} />
          <Route path="/technical/inspection/:id" element={<TechnicalInspection />} />

          {/* Supplier workspace */}
          <Route path="/supplier" element={<Navigate to="/supplier-dashboard" replace />} />
          <Route path="/supplier/equipment" element={<SupplierEquipment />} />
          <Route path="/supplier/equipment/new" element={<SupplierAddEquipment />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
