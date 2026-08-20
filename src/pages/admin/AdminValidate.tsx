import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, CategoryBadge, EmptyState, PageTitle, QuoteStatusBadge, Toast } from '../../components/ui'
import { IconCheck, IconStar, IconClose, IconWarning } from '../../components/Icons'
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
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | null>(null)
  const [selectedTier, setSelectedTier] = useState<'GOLD' | 'SILVER' | 'BASIC' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

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

  const handleAccept = () => {
    if (!selectedCategory || !selectedTier) {
      setToast('Veuillez sélectionner une catégorie et un tier')
      return
    }
    categorizeEquipment(eq.id, selectedCategory)
    rateEquipment(eq.id, selectedTier)
    updateQuoteRequestStatus(quote.id, 'TERMINEE')
    setToast(`✓ ${eq.name} accepté - Catégorie ${selectedCategory} - Tier ${selectedTier}`)
    setTimeout(() => navigate('/admin/inspections'), 2000)
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setToast('Veuillez indiquer une raison du rejet')
      return
    }
    updateQuoteRequestStatus(quote.id, 'TERMINEE')
    setToast(`✗ Équipement rejeté - Raison: ${rejectionReason}`)
    setTimeout(() => navigate('/admin/inspections'), 2000)
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
          <Card className="mb-6 p-6 border-l-4 border-blue-500">
            <h3 className="mb-4 font-bold text-slate-900 flex items-center gap-2">
              <IconCheck className="w-5 h-5 text-blue-600" />
              Rapport d'inspection
            </h3>
            <p className="mb-4 text-sm font-semibold text-slate-700 text-center bg-blue-50 p-3 rounded">{report.summary}</p>
            <p className="text-xs text-slate-500 mb-4">Rapporté le: {report.submittedAt}</p>
            <div className="space-y-2">
              {report.checklist.map((c) => (
                <div key={`${c.section}-${c.label}`} className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded">
                  <span className="text-sm">
                    <span className="text-xs font-semibold text-slate-500">{c.section} · </span>
                    <span className="text-slate-800 font-medium">{c.label}</span>
                  </span>
                  {c.result && <span className={`text-xs font-bold px-2 py-1 rounded ${RESULT_LABEL[c.result].cls} bg-opacity-10`}>{RESULT_LABEL[c.result].label}</span>}
                </div>
              ))}
            </div>
          </Card>

          {quote.status === 'RAPPORT_REÇU' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Option Accepter */}
              <Card className="p-6 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white">
                <h3 className="mb-4 font-bold text-emerald-900 flex items-center gap-2">
                  <IconCheck className="w-6 h-6 text-emerald-600" />
                  ACCEPTER & RÉFÉRENCER
                </h3>
                <p className="text-sm text-slate-600 mb-6">Approuver cet équipement pour affichage sur la plateforme</p>

                <div className="space-y-4">
                  {/* Catégories */}
                  <div>
                    <label className="text-sm font-bold text-slate-900 mb-3 block">Catégorie VOLTA (A-E)</label>
                    <div className="grid grid-cols-5 gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedCategory(c)}
                          className={`p-2 rounded-lg font-bold transition ${
                            selectedCategory === c
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                              : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">A = Excellent | B = Très bon | C = Bon | D = Maintenance | E = Non recommandé</p>
                  </div>

                  {/* Tiers */}
                  <div className="border-t border-slate-200 pt-4">
                    <label className="text-sm font-bold text-slate-900 mb-3 block">Tier de Qualité</label>
                    <div className="space-y-2">
                      {(['GOLD', 'SILVER', 'BASIC'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setSelectedTier(tier)}
                          className={`w-full p-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                            selectedTier === tier
                              ? 'ring-2 text-white' + (
                                tier === 'GOLD' ? ' bg-yellow-600 ring-yellow-400' :
                                tier === 'SILVER' ? ' bg-slate-500 ring-slate-400' :
                                ' bg-emerald-600 ring-emerald-400'
                              )
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {tier === 'GOLD' && <IconStar filled className="w-4 h-4" />}
                          {tier === 'SILVER' && <IconCheck className="w-4 h-4" />}
                          {tier === 'BASIC' && <IconCheck className="w-4 h-4" />}
                          {tier === 'GOLD' ? 'GOLD - Premium' : tier === 'SILVER' ? 'SILVER - Qualité' : 'BASIC - Standard'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAccept}
                    disabled={!selectedCategory || !selectedTier}
                    className="w-full mt-4 px-6 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <IconCheck className="w-5 h-5" />
                    Accepter & Référencer
                  </button>
                </div>
              </Card>

              {/* Option Rejeter */}
              <Card className="p-6 border-l-4 border-red-500 bg-gradient-to-br from-red-50 to-white">
                <h3 className="mb-4 font-bold text-red-900 flex items-center gap-2">
                  <IconClose className="w-6 h-6 text-red-600" />
                  REJETER
                </h3>
                <p className="text-sm text-slate-600 mb-6">Refuser cet équipement pour ne pas l'afficher sur la plateforme</p>

                <div className="space-y-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Indiquez la raison du rejet (ex: défaut critique, dimensions non conformes, etc.)"
                    rows={4}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-red-500"
                  />

                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                      <IconWarning className="w-4 h-4" />
                      ATTENTION
                    </p>
                    <p className="text-xs text-red-700">L'équipement NE sera PAS affiché sur la plateforme VOLTA</p>
                  </div>

                  <button
                    onClick={() => setIsRejecting(!isRejecting)}
                    className="w-full px-6 py-2 rounded-lg border-2 border-red-600 text-red-600 font-bold hover:bg-red-50 transition"
                  >
                    {isRejecting ? '↓ Confirmer le rejet' : '✗ Rejeter cet équipement'}
                  </button>

                  {isRejecting && (
                    <button
                      onClick={handleReject}
                      className="w-full px-6 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <IconClose className="w-5 h-5" />
                      Confirmer le rejet définitif
                    </button>
                  )}
                </div>
              </Card>
            </div>
          )}

          {quote.status === 'TERMINEE' && (
            <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-l-4 border-emerald-500">
              <div className="font-semibold text-emerald-700 flex items-center gap-2 mb-3">
                <IconCheck className="w-6 h-6" />
                Demande terminée
              </div>
              <p className="text-sm text-slate-600">
                {eq.category ? (
                  <>
                    Équipement accepté • Catégorie <span className="font-bold">{eq.category}</span> • Tier <span className="font-bold">{eq.tier}</span>
                  </>
                ) : (
                  'Équipement rejeté'
                )}
              </p>
            </Card>
          )}
        </>
      )}
      <Toast message={toast} />
    </div>
  )
}
