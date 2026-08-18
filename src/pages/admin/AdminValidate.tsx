import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, CategoryBadge, EmptyState, PageTitle, QuoteStatusBadge, Toast } from '../../components/ui'
import { IconCheck, IconStar } from '../../components/Icons'
import type { EquipmentCategory } from '../../store/types'

const RESULT_LABEL = {
  CONFORME: { label: 'Conforme', cls: 'text-emerald-600' },
  A_SURVEILLER: { label: 'À surveiller', cls: 'text-amber-600' },
  NON_CONFORME: { label: 'Non conforme', cls: 'text-red-600' },
} as const

const CATEGORIES: EquipmentCategory[] = ['A', 'B', 'C', 'D', 'E']

export default function AdminValidate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { quoteRequests, inspections, reports, equipment, categorizeEquipment, updateQuoteRequestStatus, rateEquipment } = useStore()
  const [toast, setToast] = useState<string | null>(null)

  const quote = quoteRequests.find((q) => q.id === id)
  const inspection = inspections.find((i) => i.quoteRequestId === id)
  const report = inspection ? reports.find((r) => r.inspectionId === inspection.id) : undefined
  const eq = quote ? equipment.find((e) => e.id === quote.equipmentId) : undefined

  if (!quote || !eq) {
    return (
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        <EmptyState title="Demande introuvable" />
        <div className="mt-4">
          <Link to="/admin/quotes" className="font-medium text-brand-600 hover:underline">← Retour aux demandes</Link>
        </div>
      </div>
    )
  }

  const categorize = (category: EquipmentCategory) => {
    categorizeEquipment(eq.id, category)
    setToast(`${eq.name} catégorisé ${category}`)
    setTimeout(() => navigate('/admin/inspections'), 1500)
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <Link to="/admin/inspections" className="text-sm font-medium text-brand-600 hover:underline">← Retour aux inspections</Link>
      <div className="mt-2">
        <PageTitle
          title={`Validation — ${quote.reference}`}
          subtitle={`${eq.brand} ${eq.model} · ${eq.year} · ${eq.location}`}
          actions={<QuoteStatusBadge status={quote.status} />}
        />
      </div>

      <Card className="mb-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">
              <Link to={`/equipment/${eq.id}`} className="text-brand-600 hover:underline">{eq.name} →</Link>
            </h3>
            <p className="mt-1 text-sm text-slate-600">Client : {quote.clientName} · Durée : {quote.duration}</p>
          </div>
          {eq.category && <CategoryBadge category={eq.category} />}
        </div>
      </Card>

      {!report ? (
        <EmptyState
          title="Rapport non encore reçu"
          subtitle="Le service technique n'a pas encore transmis son rapport pour cette demande."
        />
      ) : (
        <>
          <Card className="mb-4 p-6">
            <h3 className="mb-2 font-bold text-slate-900">Rapport d'inspection ({report.submittedAt})</h3>
            <p className="mb-4 text-sm text-slate-600">{report.summary}</p>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {report.checklist.map((c) => (
                <div key={`${c.section}-${c.label}`} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>
                    <span className="text-xs text-slate-600">{c.section} · </span>
                    {c.label}
                  </span>
                  {c.result && <span className={`text-xs font-semibold ${RESULT_LABEL[c.result].cls}`}>{RESULT_LABEL[c.result].label}</span>}
                </div>
              ))}
            </div>
          </Card>

          {quote.status === 'RAPPORT_REÇU' ? (
            <Card className="p-6">
              <h3 className="mb-3 font-bold text-slate-900">Attribuer une catégorie VOLTA</h3>
              <p className="mb-4 text-sm text-slate-600">
                La catégorie sera visible dans le catalogue client. A = Excellent · E = Non recommandé.
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => categorize(c)}
                    className="rounded-lg bg-brand-600 px-5 py-2.5 font-bold text-white hover:bg-brand-700"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Card>
          ) : quote.status === 'CATEGORISEE' ? (
            <Card className="p-6">
              <div className="mb-6">
                <div className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                  <IconCheck className="w-5 h-5" />
                  Équipement catégorisé.
                </div>
                <div className="text-sm text-slate-600">Catégorie assignée : <span className="font-bold">{eq.category}</span></div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="mb-3 font-bold text-slate-900">Assigner un tier de qualité</h3>
                <p className="mb-4 text-sm text-slate-600">
                  Sélectionnez le tier de qualité pour cet équipement dans le catalogue.
                </p>
                <div className="flex flex-wrap gap-3">
                  {(['GOLD', 'SILVER', 'BASIC'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        rateEquipment(eq.id, tier)
                        setToast(`Tier ${tier} assigné`)
                      }}
                      className={`rounded-lg px-6 py-3 font-semibold text-white transition hover:opacity-90 flex items-center gap-2 ${
                        tier === 'GOLD' ? 'bg-yellow-600 hover:bg-yellow-700' :
                        tier === 'SILVER' ? 'bg-slate-500 hover:bg-slate-600' :
                        'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {tier === 'GOLD' && (
                        <>
                          <IconStar filled className="w-4 h-4" />
                          Gold Premium
                        </>
                      )}
                      {tier === 'SILVER' && (
                        <>
                          <IconCheck className="w-4 h-4" />
                          Silver Qualité
                        </>
                      )}
                      {tier === 'BASIC' && (
                        <>
                          Standard
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  updateQuoteRequestStatus(quote.id, 'TERMINEE')
                  setToast('Demande clôturée')
                }}
                className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <IconCheck className="w-4 h-4" />
                Clôturer la demande
              </button>
            </Card>
          ) : quote.status === 'TERMINEE' ? (
            <Card className="p-6">
              <div className="font-semibold text-emerald-700 flex items-center gap-2">
                <IconCheck className="w-5 h-5" />
                Demande terminée.
              </div>
            </Card>
          ) : null}
        </>
      )}
      <Toast message={toast} />
    </div>
  )
}
