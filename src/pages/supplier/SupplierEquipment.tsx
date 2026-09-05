import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, FileText, Plus, Send, Truck } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  Card,
  EmptyState,
  LevelBadge,
  PageTitle,
  ProgressBar,
  StatusBadge,
  Toast,
  fmtPrice,
} from '../../components/ui'
import WorkflowTimeline, { SupplierNextAction } from '../../components/WorkflowTimeline'
import { equipmentRef } from '../../lib/references'
import type { EquipmentStatus } from '../../store/types'

const PROGRESS: Record<EquipmentStatus, number> = {
  DRAFT: 10,
  SUBMITTED: 25,
  PENDING_INSPECTION: 40,
  INSPECTION_IN_PROGRESS: 55,
  REPORT_SUBMITTED: 70,
  PENDING_ADMIN_REVIEW: 80,
  REFERENCED: 90,
  PUBLISHED: 100,
  REJECTED: 100,
  CORRECTIONS_REQUESTED: 55,
  UNPUBLISHED: 100,
}

export default function SupplierEquipment() {
  const { equipment, inspections, reports, users, submitEquipment, currentUser } = useStore()
  const [toast, setToast] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)

  // Le parc du compte connecté, et lui seul.
  const mine = equipment.filter((e) => e.supplierId === currentUser?.id)

  const submit = async (id: string, name: string) => {
    setSending(id)
    try {
      await submitEquipment(id)
      // Le dossier vient de changer de main : on ouvre le suivi pour que le
      // fournisseur voie immédiatement l'étape suivante plutôt qu'un simple
      // message qui disparaît.
      setOpenId(id)
      setToast(`${name} soumis à VOLTA. L’inspection va être assignée.`)
      setTimeout(() => setToast(null), 4000)
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'La soumission a échoué.')
      setTimeout(() => setToast(null), 5000)
    } finally {
      setSending(null)
    }
  }

  return (
    <div>
      <PageTitle
        title="Mes engins"
        subtitle="Suivez chaque dossier étape par étape, de la soumission à la publication."
        actions={
          <Link
            to="/supplier/equipment/new"
            className="inline-flex items-center gap-2 rounded-lg bg-btp-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-btp-600"
          >
            <Plus size={16} />
            Ajouter un engin
          </Link>
        }
      />

      {mine.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Aucun engin"
          subtitle="Ajoutez votre premier engin : VOLTA le fera vérifier puis le publiera au catalogue."
          action={
            <Link
              to="/supplier/equipment/new"
              className="inline-flex items-center gap-2 rounded-lg bg-btp-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-btp-600"
            >
              <Plus size={16} />
              Ajouter un engin
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {mine.map((e) => {
            const open = openId === e.id
            const inspection = inspections.find((i) => i.equipmentId === e.id)
            const inspector = inspection
              ? users.find((u) => u.id === inspection.technicalTeamId)
              : undefined
            const report = reports.find((r) => r.equipmentId === e.id)
            const progress = PROGRESS[e.status]

            return (
              <Card key={e.id} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <img
                    src={e.photos[0]}
                    alt={e.name}
                    className="h-20 w-32 shrink-0 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-acier-900">{e.name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                        {equipmentRef(e.id)}
                      </span>
                      <StatusBadge status={e.status} />
                      <LevelBadge level={e.level} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {e.brand} {e.model} · {e.year} · {fmtPrice(e.pricePerDay)} / jour
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-full max-w-xs">
                        <ProgressBar value={progress} />
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">Dossier : {progress}%</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                    {(e.status === 'DRAFT' || e.status === 'CORRECTIONS_REQUESTED') && (
                      <button
                        onClick={() => submit(e.id, e.name)}
                        disabled={sending === e.id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Send size={15} />
                        {sending === e.id ? 'Envoi…' : 'Soumettre'}
                      </button>
                    )}
                    <button
                      onClick={() => setOpenId(open ? null : e.id)}
                      aria-expanded={open}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-acier-800 transition hover:border-btp-400 hover:text-btp-600"
                    >
                      {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      {open ? 'Masquer le suivi' : 'Suivre le dossier'}
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-5">
                    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                      <div>
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                          Parcours du dossier
                        </h3>
                        <WorkflowTimeline
                          status={e.status}
                          createdAt={e.createdAt}
                          inspection={inspection}
                          inspector={inspector}
                          report={report}
                        />
                      </div>

                      <div className="space-y-4">
                        <SupplierNextAction status={e.status} />

                        {report && (
                          <div className="rounded-lg border border-slate-200 bg-white p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <FileText size={15} className="text-acier-600" />
                              <span className="text-sm font-semibold text-acier-900">
                                Conclusion de l’inspection
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-600">{report.summary}</p>
                          </div>
                        )}

                        {inspection && inspection.anomalies.length > 0 && (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <span className="text-sm font-semibold text-red-800">
                              Anomalies relevées
                            </span>
                            <ul className="mt-2 space-y-1 text-xs text-red-700">
                              {inspection.anomalies.map((a, i) => (
                                <li key={i}>· {a}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {e.status === 'PUBLISHED' && (
                          <Link
                            to={`/equipment/${e.id}`}
                            className="block rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
                          >
                            Cet engin est visible au catalogue public. Voir sa fiche →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
      <Toast message={toast} />
    </div>
  )
}
