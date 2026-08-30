import { useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, LevelBadge, Modal, PageTitle, StatusBadge, Toast, fmtPrice } from '../../components/ui'
import type { Equipment, Level } from '../../store/types'

export default function AdminEquipment() {
  const {
    equipment,
    users,
    categories,
    reports,
    assignInspection,
    rejectEquipment,
    referenceEquipment,
    publishEquipment,
    unpublishEquipment,
    requestCorrection,
  } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [teamId, setTeamId] = useState('u-tech-1')
  const [level, setLevel] = useState<Level>('GOLD')
  const [toast, setToast] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const selected: Equipment | undefined = equipment.find((e) => e.id === selectedId)
  const technicalTeams = users.filter((u) => u.role === 'TECHNICAL')
  const report = selected ? reports.find((r) => r.equipmentId === selected.id) : undefined

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 4000)
  }

  const filtered = filter ? equipment.filter((e) => e.status === filter) : equipment

  return (
    <div>
      <PageTitle
        title="Engins"
        subtitle="Tous les engins référencés ou en cours de traitement."
        actions={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-300 p-2 text-sm">
            <option value="">Tous les statuts</option>
            <option value="SUBMITTED">Soumis</option>
            <option value="PENDING_INSPECTION">À vérifier</option>
            <option value="INSPECTION_IN_PROGRESS">Vérification en cours</option>
            <option value="PENDING_ADMIN_REVIEW">En attente de décision</option>
            <option value="REFERENCED">Référencé</option>
            <option value="PUBLISHED">Publié</option>
            <option value="REJECTED">Refusé</option>
            <option value="CORRECTIONS_REQUESTED">Corrections demandées</option>
            <option value="UNPUBLISHED">Dépublié</option>
            <option value="DRAFT">Brouillon</option>
          </select>
        }
      />
      {filtered.length === 0 ? (
        <EmptyState title="Aucun engin pour ce filtre" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Engin</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Prix / jour</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={e.photos[0]} alt="" className="h-10 w-14 rounded object-cover" />
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-slate-400">{categories.find((c) => c.id === e.categoryId)?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{users.find((u) => u.id === e.supplierId)?.company}</td>
                  <td className="px-4 py-3">{fmtPrice(e.pricePerDay)}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3"><LevelBadge level={e.level} />{!e.level && <span className="text-xs text-slate-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedId(e.id)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                      Ouvrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!selected} onClose={() => setSelectedId(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="grid gap-4">
            <div className="flex gap-2">
              {selected.photos.slice(0, 3).map((p, i) => (
                <img key={i} src={p} alt="" className="h-20 w-28 rounded-lg object-cover" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div><span className="text-slate-500">Statut :</span> <StatusBadge status={selected.status} /></div>
              <div><span className="text-slate-500">Niveau :</span> <LevelBadge level={selected.level} />{!selected.level && '—'}</div>
              <div><span className="text-slate-500">Propriétaire :</span> {users.find((u) => u.id === selected.supplierId)?.company}</div>
              <div><span className="text-slate-500">Localisation :</span> {selected.location}</div>
              <div><span className="text-slate-500">Marque / modèle :</span> {selected.brand} {selected.model}</div>
              <div><span className="text-slate-500">Année :</span> {selected.year}</div>
              <div><span className="text-slate-500">État déclaré :</span> {selected.declaredCondition}</div>
              <div><span className="text-slate-500">Prix / jour :</span> {fmtPrice(selected.pricePerDay)}</div>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Documents :</span>{' '}
              {selected.documents.length ? selected.documents.map((d) => d.name).join(', ') : 'Aucun'}
            </div>

            {selected.status === 'SUBMITTED' && (
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="mb-2 text-sm font-semibold">Assigner une inspection</div>
                <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 p-2 text-sm">
                  {technicalTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.company}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    assignInspection(selected.id, teamId)
                    setSelectedId(null)
                    showToast('Inspection assignée ✔ L\'équipe technique a été notifiée.')
                  }}
                  className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Assigner une inspection
                </button>
              </div>
            )}

            {selected.status === 'PENDING_ADMIN_REVIEW' && (
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="mb-2 text-sm font-semibold">Décision après rapport</div>
                {report ? (
                  <p className="mb-3 text-xs text-slate-600">Rapport du {report.submittedAt} : {report.summary}</p>
                ) : (
                  <p className="mb-3 text-xs text-slate-500">Rapport disponible dans l'onglet Rapports.</p>
                )}
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Niveau :</span>
                  {(['BASIC', 'SILVER', 'GOLD'] as Level[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${level === l ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      referenceEquipment(selected.id, level)
                      showToast(`Engin référencé ${level} ✔`)
                    }}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Référencer ({level})
                  </button>
                  <button
                    onClick={() => {
                      rejectEquipment(selected.id)
                      setSelectedId(null)
                      showToast('Engin refusé.')
                    }}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => {
                      requestCorrection(selected.id)
                      setSelectedId(null)
                      showToast('Corrections demandées au fournisseur.')
                    }}
                    className="flex-1 rounded-lg border border-amber-500 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50"
                  >
                    Corrections
                  </button>
                </div>
              </div>
            )}

            {selected.status === 'REFERENCED' && (
              <button
                onClick={() => {
                  publishEquipment(selected.id)
                  setSelectedId(null)
                  showToast('Engin publié sur le catalogue ✔')
                }}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Publier sur le catalogue
              </button>
            )}

            {selected.status === 'PUBLISHED' && (
              <button
                onClick={() => {
                  unpublishEquipment(selected.id)
                  setSelectedId(null)
                  showToast('Engin dépublié du catalogue.')
                }}
                className="w-full rounded-lg border border-red-600 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Dépublier du catalogue
              </button>
            )}

            {['PENDING_INSPECTION', 'INSPECTION_IN_PROGRESS'].includes(selected.status) && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                Inspection en cours par l'équipe technique. Le rapport apparaîtra automatiquement à sa soumission.
              </p>
            )}
            {selected.status === 'DRAFT' && (
              <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Brouillon non soumis par le fournisseur.</p>
            )}
            {selected.status === 'CORRECTIONS_REQUESTED' && (
              <p className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-700">Corrections demandées au fournisseur.</p>
            )}
            {selected.status === 'REJECTED' && (
              <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">Engin refusé après vérification.</p>
            )}
          </div>
        )}
      </Modal>
      <Toast message={toast} />
    </div>
  )
}
