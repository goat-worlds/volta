import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle, StatCard, StatusBadge, fmtPrice } from '../../components/ui'

const SUPPLIER_ID = 'u-sup-1'

export default function SupplierDashboard() {
  const { equipment, rentalRequests, notifications, users } = useStore()
  const mine = equipment.filter((e) => e.supplierId === SUPPLIER_ID)
  const supplier = users.find((u) => u.id === SUPPLIER_ID)
  const published = mine.filter((e) => e.status === 'PUBLISHED').length
  const inVerification = mine.filter((e) =>
    ['SUBMITTED', 'PENDING_INSPECTION', 'INSPECTION_IN_PROGRESS', 'REPORT_SUBMITTED', 'PENDING_ADMIN_REVIEW'].includes(e.status),
  ).length
  const drafts = mine.filter((e) => e.status === 'DRAFT').length
  const requests = rentalRequests.filter((r) => r.supplierId === SUPPLIER_ID)
  const notifs = notifications.filter((n) => n.role === 'SUPPLIER')

  return (
    <div>
      <PageTitle
        title={`Bienvenue, ${supplier?.company} 👋`}
        subtitle="Voici un aperçu de votre activité sur VOLTA."
        actions={
          <Link to="/supplier/equipment/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            + Ajouter un engin
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total engins" value={mine.length} />
        <StatCard label="Publiés" value={published} accent="text-emerald-600" />
        <StatCard label="En vérification" value={inVerification} accent="text-amber-600" />
        <StatCard label="Brouillons" value={drafts} accent="text-slate-600" />
        <StatCard label="Demandes reçues" value={requests.length} accent="text-indigo-600" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Engins récents</h2>
            <Link to="/supplier/equipment" className="text-sm font-medium text-blue-600 hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {mine.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-slate-700">{fmtPrice(e.pricePerDay)} / jour</div>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-bold">Notifications</h2>
          <div className="divide-y divide-slate-100">
            {notifs.slice(0, 6).map((n) => (
              <div key={n.id} className="py-2.5 text-sm">
                <div className="text-slate-700">{n.message}</div>
                <div className="text-xs text-slate-600">{n.date}</div>
              </div>
            ))}
            {notifs.length === 0 && <div className="py-4 text-sm text-slate-700">Aucune notification.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
