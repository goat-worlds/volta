import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { AdminLayout, PublicLayout, SupplierLayout, TechnicalLayout } from './components/Layouts'
import Home from './pages/public/Home'
import Catalogue from './pages/public/Catalogue'
import EquipmentDetail from './pages/public/EquipmentDetail'
import Suppliers from './pages/public/Suppliers'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import SupplierEquipment from './pages/supplier/SupplierEquipment'
import SupplierEquipmentNew from './pages/supplier/SupplierEquipmentNew'
import SupplierRequests from './pages/supplier/SupplierRequests'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEquipment from './pages/admin/AdminEquipment'
import AdminInspections from './pages/admin/AdminInspections'
import AdminReports from './pages/admin/AdminReports'
import AdminRequests from './pages/admin/AdminRequests'
import AdminUsers from './pages/admin/AdminUsers'
import TechnicalDashboard from './pages/technical/TechnicalDashboard'
import TechnicalMissions from './pages/technical/TechnicalMissions'
import TechnicalInspection from './pages/technical/TechnicalInspection'

export default function App() {
  return (
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
          </Route>
          <Route element={<SupplierLayout />}>
            <Route path="/supplier" element={<SupplierDashboard />} />
            <Route path="/supplier/equipment" element={<SupplierEquipment />} />
            <Route path="/supplier/equipment/new" element={<SupplierEquipmentNew />} />
            <Route path="/supplier/requests" element={<SupplierRequests />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/equipment" element={<AdminEquipment />} />
            <Route path="/admin/inspections" element={<AdminInspections />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
          <Route element={<TechnicalLayout />}>
            <Route path="/technical" element={<TechnicalDashboard />} />
            <Route path="/technical/missions" element={<TechnicalMissions />} />
            <Route path="/technical/inspection/:id" element={<TechnicalInspection />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
