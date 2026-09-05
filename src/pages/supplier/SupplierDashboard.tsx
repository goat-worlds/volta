import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { quoteRequestsClient, quotesClient } from '../../store/quotesClient'
import { Card, PageTitle, StatCard, StatusBadge, fmtPrice } from '../../components/ui'

export default function SupplierDashboard() {
  const { equipment, rentalRequests, notifications, currentUser } = useStore()
  // Le parc affiché est celui du compte connecté. Un identifiant écrit en dur
  // aurait montré à chaque fournisseur les engins d'un autre.
  const supplierId = currentUser?.id
  const mine = equipment.filter((e) => e.supplierId === supplierId)
  const published = mine.filter((e) => e.status === 'PUBLISHED').length
  const inVerification = mine.filter((e) =>
    ['SUBMITTED', 'PENDING_INSPECTION', 'INSPECTION_IN_PROGRESS', 'REPORT_SUBMITTED', 'PENDING_ADMIN_REVIEW'].includes(e.status),
  ).length
  const drafts = mine.filter((e) => e.status === 'DRAFT').length
  const rentals = rentalRequests.filter((r) => r.supplierId === supplierId)
  const notifs = notifications.filter((n) => n.role === 'SUPPLIER')

  // Les demandes de devis vivent hors du store, qui ne charge que les
  // ressources historiques. C'est pourtant le chiffre qui appelle une action :
  // une demande sans réponse est un client qui attend.
  const [awaiting, setAwaiting] = useState<number | null>(null)
  useEffect(() => {
    if (!supplierId) return
    let cancelled = false
    void (async () => {
      try {
        const [reqs, quotes] = await Promise.all([
          quoteRequestsClient.listBySupplier(supplierId),
          quotesClient.listBySupplier(supplierId),
        ])
        const answered = new Set(quotes.map((q) => q.quoteRequestId))
        if (!cancelled) {
          setAwaiting(reqs.filter((r) => r.status === 'PENDING' && !answered.has(r.id)).length)
        }
      } catch {
        if (!cancelled) setAwaiting(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supplierId])

  return (
    <div>
      <PageTitle
        title={`Bienvenue, ${currentUser?.company || currentUser?.name || ''}`}
        subtitle="Voici un aperçu de votre activité sur VOLTA."
        actions={
          <Link to="/supplier/equipment/new" className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500">
            + Ajouter un engin
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total engins" value={mine.length} />
        <StatCard label="Publiés" value={published} accent="text-emerald-600" />
        <StatCard label="En vérification" value={inVerification} accent="text-amber-600" />
        <StatCard label="Brouillons" value={drafts} accent="text-slate-600" />
        <StatCard label="Locations" value={rentals.length} accent="text-slate-600" />
      </div>

      {awaiting !== null && awaiting > 0 && (
        <Link
          to="/supplier/demandes"
          className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 transition hover:bg-amber-100"
        >
          <span className="text-sm font-semibold text-amber-900">
            {awaiting} demande{awaiting > 1 ? 's' : ''} de devis sans réponse
          </span>
          <span className="text-sm font-semibold text-amber-700">Répondre →</span>
        </Link>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Engins récents</h2>
            <Link to="/supplier/equipment" className="text-sm font-medium text-amber-600 hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {mine.length === 0 && (
              <div className="py-4 text-sm text-slate-500">
                Aucun engin déclaré. Commencez par en ajouter un.
              </div>
            )}
            {mine.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-slate-500">{fmtPrice(e.pricePerDay)} / jour</div>
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
                <div className="text-xs text-slate-400">{n.date}</div>
              </div>
            ))}
            {notifs.length === 0 && <div className="py-4 text-sm text-slate-500">Aucune notification.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
