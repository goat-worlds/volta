import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, PageTitle, Toast } from '../../components/ui'

export default function AdminEquipmentSubmissions() {
  const { equipment, users, assignInspection } = useStore()
  const technicians = users.filter((u) => u.role === 'TECHNICAL')
  const [selectedTech, setSelectedTech] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  const pendingEquipment = equipment.filter((e) => e.status === 'EN_INSPECTION')

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <Link to="/admin-dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Retour au tableau de bord
      </Link>
      <div className="mt-2">
        <PageTitle
          title="Soumissions d'équipements"
          subtitle={`${pendingEquipment.length} équipement(s) en attente de validation`}
        />
      </div>

      {pendingEquipment.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-600 font-medium">Aucune soumission en attente</p>
          <p className="text-sm text-slate-500 mt-1">Les fournisseurs peuvent soumettre des équipements pour inspection</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingEquipment.map((eq) => {
            const supplier = users.find((u) => u.id === eq.supplierId)
            const tech = selectedTech[eq.id] ?? technicians[0]?.id ?? ''
            return (
              <Card key={eq.id} className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Infos équipement */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{eq.name}</h3>
                        <p className="text-sm text-slate-600">{eq.brand} {eq.model} • {eq.year}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Heures</p>
                        <p className="font-bold text-slate-900">{eq.hours.toLocaleString('fr-FR')}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Localisation</p>
                        <p className="font-bold text-slate-900">📍 {eq.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">État déclaré</p>
                        <p className="font-bold text-slate-900">{eq.declaredCondition}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Créé le</p>
                        <p className="font-bold text-slate-900">{new Date(eq.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-200">
                      <p className="text-xs font-semibold text-brand-700 mb-1">👤 Fournisseur</p>
                      <p className="text-sm text-slate-900 font-semibold">{supplier?.company}</p>
                      <p className="text-xs text-slate-600">📍 {supplier?.city} • 📞 {supplier?.phone}</p>
                    </div>

                    <div className="p-3 bg-slate-100 rounded-lg">
                      <p className="text-xs font-semibold text-slate-700 mb-1">📝 Description</p>
                      <p className="text-sm text-slate-700">{eq.description || 'Aucune description fournie'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-none w-full lg:w-56">
                    <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                      <p className="text-xs font-bold text-amber-900 mb-4 uppercase">⏳ Étapes</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✓</span>
                          <span className="text-sm text-slate-700">Soumis par fournisseur</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">👉</span>
                          <span className="text-sm font-semibold text-slate-900">Assigner inspection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">→</span>
                          <span className="text-sm text-slate-700">Technicien inspecte</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">→</span>
                          <span className="text-sm text-slate-700">Admin accepte/refuse</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-amber-200">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Assigner à:</label>
                        <select
                          value={tech}
                          onChange={(e) => setSelectedTech((prev) => ({ ...prev, [eq.id]: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs mb-3"
                        >
                          <option value="">-- Sélectionner --</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (!tech) {
                              showToast('⚠️ Sélectionnez un technicien')
                              return
                            }
                            assignInspection(eq.id as any, tech)
                            showToast(`✔ Inspection assignée pour ${eq.name}`)
                          }}
                          disabled={!tech}
                          className="w-full rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition"
                        >
                          🔍 Assigner inspection
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Toast message={toast} />
    </div>
  )
}
