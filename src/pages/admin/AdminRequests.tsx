import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle } from '../../components/ui'

export default function AdminRequests() {
  const { rentalRequests, equipment, users } = useStore()

  return (
    <div>
      <PageTitle title="Demandes de devis" subtitle="Toutes les demandes créées depuis le catalogue public." />
      {rentalRequests.length === 0 ? (
        <EmptyState title="Aucune demande" subtitle="Les demandes de devis apparaîtront ici." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Engin</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3">Options</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentalRequests.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-blue-700">{r.reference}</td>
                  <td className="px-4 py-3">{equipment.find((e) => e.id === r.equipmentId)?.name}</td>
                  <td className="px-4 py-3">{users.find((u) => u.id === r.supplierId)?.company}</td>
                  <td className="px-4 py-3">
                    <div>{r.clientName}</div>
                    <div className="text-xs text-slate-400">{r.clientEmail}</div>
                  </td>
                  <td className="px-4 py-3">{r.startDate} → {r.endDate}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {r.withOperator ? 'Opérateur' : '—'} · {r.transport ? 'Transport' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">En attente</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
