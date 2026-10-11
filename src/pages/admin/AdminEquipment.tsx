import { useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, LevelBadge, Modal, PageTitle, StatusBadge, fmtPrice } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'
import InspectionReview from '../../components/Admin/InspectionReview'
import EquipmentDecision from '../../components/Admin/EquipmentDecision'
import type { Equipment } from '../../store/types'

/**
 * Les engins, rangés par qui doit agir.
 *
 * <h2>Pourquoi segmenter</h2>
 *
 * La page listait tout le parc dans un seul tableau, du brouillon d'un
 * fournisseur à l'engin publié depuis un an. Pour trouver ce qui attendait une
 * décision, il fallait lire la colonne « Statut » ligne par ligne, ou choisir
 * le bon filtre dans un menu de dix entrées — c'est-à-dire savoir d'avance ce
 * qu'on cherche.
 *
 * Les quatre segments répondent à la seule question que l'écran doit trancher
 * d'un regard : chez qui est la balle. Ce qui attend VOLTA vient en premier,
 * avec son décompte ; ce qui est déjà en ligne ferme la liste.
 *
 * Le filtre reste, pour qui cherche un statut précis. Il écrase alors les
 * segments : chercher « dépublié » et obtenir quatre sections dont trois vides
 * serait une réponse plus confuse que la question.
 */
const SEGMENTS: { titre: string; aide: string; statuts: string[]; urgent?: boolean }[] = [
  {
    titre: 'À décider',
    aide: 'Le rapport est là. VOLTA attribue la catégorie, publie ou renvoie au fournisseur.',
    statuts: ['REPORT_SUBMITTED', 'PENDING_ADMIN_REVIEW'],
    urgent: true,
  },
  {
    titre: 'En cours de vérification',
    aide: 'Soumis par le fournisseur, assigné ou en cours d’inspection sur le terrain.',
    statuts: ['SUBMITTED', 'PENDING_INSPECTION', 'INSPECTION_IN_PROGRESS'],
  },
  {
    titre: 'Au catalogue',
    aide: 'Référencés et publiés : visibles des clients.',
    statuts: ['REFERENCED', 'PUBLISHED'],
  },
  {
    titre: 'Chez le fournisseur',
    aide: 'Brouillons, corrections demandées, refus et dépublications — la balle n’est pas chez nous.',
    statuts: ['DRAFT', 'CORRECTIONS_REQUESTED', 'REJECTED', 'UNPUBLISHED'],
  },
]

export default function AdminEquipment() {
  const {
    equipment,
    users,
    categories,
    reports,
    inspections,
    assignInspection,
  } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Vide au départ : l'équipe retenue est celle affichée par la liste, calculée
  // plus bas. Un identifiant en dur pointait vers un compte de jeu de test —
  // absent d'une autre base, le menu affichait alors la première équipe tout en
  // assignant à une autre.
  const [teamId, setTeamId] = useState('')
  const toast = useToast()
  const [filter, setFilter] = useState('')

  const selected: Equipment | undefined = equipment.find((e) => e.id === selectedId)
  const technicalTeams = users.filter((u) => u.role === 'TECHNICAL')
  // Ce que le menu montre est ce qui sera assigné, même si l'admin n'y touche pas.
  const effectiveTeamId = technicalTeams.some((t) => t.id === teamId)
    ? teamId
    : (technicalTeams[0]?.id ?? '')
  const report = selected ? reports.find((r) => r.equipmentId === selected.id) : undefined
  const inspection = selected ? inspections.find((i) => i.equipmentId === selected.id) : undefined
  const inspector = inspection ? users.find((u) => u.id === inspection.technicalTeamId) : undefined

  const showToast = (m: string) => toast.success(m)

  const filtered = filter ? equipment.filter((e) => e.status === filter) : equipment

  /**
   * Un segment de la liste.
   *
   * Déclaré ici et non à part : il lit le catalogue, l'annuaire et les
   * catégories du magasin, et les lui passer en paramètres ferait six
   * arguments pour un tableau qui ne sert qu'à cet écran.
   */
  const Tableau = ({ rows }: { rows: Equipment[] }) => (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Engin</th>
            <th className="px-4 py-3">Fournisseur</th>
            <th className="px-4 py-3">Prix / heure</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Niveau</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    loading="lazy"
                    src={e.photos[0] || '/images/placeholders/equipment.svg'}
                    alt=""
                    className="h-10 w-14 rounded object-cover"
                  />
                  <div>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-slate-400">
                      {categories.find((c) => c.id === e.categoryId)?.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">{users.find((u) => u.id === e.supplierId)?.company}</td>
              <td className="px-4 py-3">{fmtPrice(e.pricePerDay)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={e.status} />
              </td>
              <td className="px-4 py-3">
                <LevelBadge level={e.level} />
                {!e.level && <span className="text-xs text-slate-400">—</span>}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => setSelectedId(e.id)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Ouvrir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )

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
      {filter ? (
        filtered.length === 0 ? (
          <EmptyState title="Aucun engin pour ce filtre" />
        ) : (
          <Tableau rows={filtered} />
        )
      ) : (
        <div className="space-y-8">
          {SEGMENTS.map((seg) => {
            const rows = equipment.filter((e) => seg.statuts.includes(e.status))
            if (rows.length === 0) return null
            return (
              <section key={seg.titre}>
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    {seg.titre}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      seg.urgent ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rows.length}
                  </span>
                  <span className="text-xs text-slate-500">{seg.aide}</span>
                </div>
                <Tableau rows={rows} />
              </section>
            )
          })}
          {equipment.length === 0 && <EmptyState title="Aucun engin référencé" />}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelectedId(null)} title={selected?.name ?? ''} size="large">
        {selected && (
          <div className="grid gap-4">
            <div className="flex gap-2">
              {selected.photos.slice(0, 3).map((p, i) => (
                <img loading="lazy" key={i} src={p} alt="" className="h-20 w-28 rounded-lg object-cover" />
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
              <div><span className="text-slate-500">Prix / heure :</span> {fmtPrice(selected.pricePerDay)}</div>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Documents :</span>{' '}
              {selected.documents.length ? selected.documents.map((d) => d.name).join(', ') : 'Aucun'}
            </div>

            {selected.status === 'SUBMITTED' && (
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="mb-2 text-sm font-semibold">Assigner une inspection</div>
                <select
                  value={effectiveTeamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-slate-300 p-2 text-sm"
                >
                  {technicalTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.company || t.name}</option>
                  ))}
                </select>
                <button
                  disabled={!effectiveTeamId}
                  onClick={async () => {
                    const team = technicalTeams.find((t) => t.id === effectiveTeamId)
                    try {
                      await assignInspection(selected.id, effectiveTeamId)
                      setSelectedId(null)
                      toast.success('Inspection assignée', `Confiée à ${team?.company || team?.name}.`)
                    } catch (error) {
                      toast.fromError(error, 'Assignation refusée')
                    }
                  }}
                  className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {technicalTeams.length === 0 ? 'Aucune équipe technique enregistrée' : 'Assigner une inspection'}
                </button>
              </div>
            )}

            {selected.status === 'PENDING_ADMIN_REVIEW' && (
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="mb-3 text-sm font-semibold">Constats d'inspection</div>
                <InspectionReview inspection={inspection} report={report} inspector={inspector} />
              </div>
            )}

            {/* Le même bloc de décision qu'en page Rapports : une seule
                implémentation, donc un seul comportement à corriger. */}
            <EquipmentDecision equipment={selected} onDone={showToast} />
          </div>
        )}
      </Modal>
    </div>
  )
}
