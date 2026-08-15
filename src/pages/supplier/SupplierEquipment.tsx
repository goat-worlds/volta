import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, LevelBadge, PageTitle, ProgressBar, StatusBadge, Toast, fmtPrice } from '../../components/ui'
import type { EquipmentStatus } from '../../store/types'

const SUPPLIER_ID = 'u-sup-1'

const PROGRESS: Partial<Record<EquipmentStatus, number>> = {
  DRAFT: 10,
  SUBMITTED: 25,
  PENDING_INSPECTION: 40,
  INSPECTION_IN_PROGRESS: 55,
  REPORT_SUBMITTED: 70,
  PENDING_ADMIN_REVIEW: 80,
  REFERENCED: 90,
  PUBLISHED: 100,
  REJECTED: 100,
  UNPUBLISHED: 100,
}

export default function SupplierEquipment() {
  const { equipment, submitEquipment } = useStore()
  const [toast, setToast] = useState<string | null>(null)
  const mine = equipment.filter((e) => e.supplierId === SUPPLIER_ID)

  const submit = (id: string, name: string) => {
    submitEquipment(id)
    setToast(`${name} soumis pour vérification VOLTA ✔`)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div>
      <PageTitle
        title="Mes engins"
        subtitle="Suivez la progression du dossier de chaque engin."
        actions={
          <Link to="/supplier/equipment/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            + Ajouter un engin
          </Link>
        }
      />
      {mine.length === 0 ? (
        <EmptyState title="Aucun engin" subtitle="Ajoutez votre premier engin pour commencer." />
      ) : (
        <div className="grid gap-4">
          {mine.map((e) => (
            <Card key={e.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <img src={e.photos[0]} alt={e.name} className="h-20 w-32 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{e.name}</span>
                  <StatusBadge status={e.status} />
                  <LevelBadge level={e.level} />
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {e.brand} {e.model} · {e.year} · {fmtPrice(e.pricePerDay)} / jour
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-full max-w-xs">
                    <ProgressBar value={PROGRESS[e.status] ?? 0} />
                  </div>
                  <span className="text-xs text-slate-500">Dossier : {PROGRESS[e.status] ?? 0}%</span>
                </div>
              </div>
              <div>
                {e.status === 'DRAFT' ? (
                  <button
                    onClick={() => submit(e.id, e.name)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Soumettre
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">
                    {e.status === 'PUBLISHED' ? 'Visible au catalogue' : 'En traitement par VOLTA'}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Toast message={toast} />
    </div>
  )
}
