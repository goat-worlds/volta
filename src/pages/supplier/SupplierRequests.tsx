import { useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, Toast } from '../../components/ui'

const SUPPLIER_ID = 'u-sup-1'

const REQUEST_STATUS = {
  PENDING: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  ACCEPTED: { label: 'Acceptée', cls: 'bg-emerald-100 text-emerald-700' },
  DECLINED: { label: 'Refusée', cls: 'bg-red-100 text-red-700' },
} as const

export default function SupplierRequests() {
  const { rentalRequests, equipment, respondRentalRequest } = useStore()
  const [toast, setToast] = useState<string | null>(null)
  const mine = rentalRequests.filter((r) => r.supplierId === SUPPLIER_ID)

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div>
      <PageTitle title="Demandes reçues" subtitle="Demandes de devis envoyées par les clients." />
      {mine.length === 0 ? (
        <EmptyState title="Aucune demande reçue" subtitle="Les demandes de devis apparaîtront ici." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Engin</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Lieu</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mine.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-blue-700">{r.reference}</td>
                  <td className="px-4 py-3">{equipment.find((e) => e.id === r.equipmentId)?.name}</td>
                  <td className="px-4 py-3">
                    <div>{r.clientName}</div>
                    <div className="text-xs text-slate-400">{r.clientPhone}</div>
                  </td>
                  <td className="px-4 py-3">{r.startDate} → {r.endDate}</td>
                  <td className="px-4 py-3">{r.location}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${REQUEST_STATUS[r.status].cls}`}>
                      {REQUEST_STATUS[r.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            void respondRentalRequest(r.id, true)
                            showToast('Demande acceptée ✔')
                          }}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => {
                            void respondRentalRequest(r.id, false)
                            showToast('Demande refusée.')
                          }}
                          className="rounded-lg border border-red-600 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Refuser
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <Toast message={toast} />
    </div>
  )
}
