import { useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { useToast } from '../../components/feedback/Toaster'
import { Button, Card, EmptyState, PageTitle, RentalStatusBadge } from '../../components/ui'

/**
 * Réservations reçues par le fournisseur.
 *
 * Le fournisseur se prononce tant que VOLTA ne l'a pas fait pour lui : sur
 * une demande nouvelle ou qualifiée, il accepte ou refuse. Ensuite, c'est
 * l'administration qui confirme, démarre et clôture ; lui suit l'avancement,
 * et le statut change ici sans qu'il ait à recharger.
 */
const AWAITING_SUPPLIER = new Set(['PENDING', 'QUALIFIED'])

export default function SupplierRequests() {
  const { rentalRequests, equipment, respondRentalRequest, currentUser } = useStore()
  const toast = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  const mine = rentalRequests
    .filter((r) => r.supplierId === currentUser?.id)
    .sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt))

  const respond = async (id: string, reference: string, accepted: boolean) => {
    setBusy(id)
    try {
      await respondRentalRequest(id, accepted)
      if (accepted) toast.success('Réservation acceptée', `${reference} — VOLTA va confirmer la mise en relation.`)
      else toast.info('Réservation refusée', `${reference} a été refusée.`)
    } catch (err) {
      toast.fromError(err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <PageTitle title="Réservations" subtitle="Les demandes de location qui concernent vos engins, et où elles en sont." />
      {mine.length === 0 ? (
        <EmptyState title="Aucune réservation" subtitle="Les demandes de location de vos engins apparaîtront ici." />
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
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-btp-700">{r.reference}</td>
                  <td className="px-4 py-3">{equipment.find((e) => e.id === r.equipmentId)?.name}</td>
                  <td className="px-4 py-3">
                    <div>{r.clientName}</div>
                    <div className="text-xs text-slate-400">{r.clientPhone}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{r.startDate} → {r.endDate}</td>
                  <td className="px-4 py-3">{r.location}</td>
                  <td className="px-4 py-3">
                    <RentalStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {AWAITING_SUPPLIER.has(r.status) ? (
                      <div className="flex gap-2">
                        <Button size="sm" tone="success" disabled={busy === r.id} onClick={() => void respond(r.id, r.reference, true)}>
                          Accepter
                        </Button>
                        <Button size="sm" tone="secondary" disabled={busy === r.id} onClick={() => void respond(r.id, r.reference, false)}>
                          Refuser
                        </Button>
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
    </div>
  )
}
