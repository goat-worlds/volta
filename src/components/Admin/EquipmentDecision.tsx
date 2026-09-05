import { useState } from 'react'
import { AlertTriangle, Award, Check, EyeOff, Send, Undo2, X } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import type { Equipment, Level } from '../../store/types'

/**
 * La décision de l'administration sur un dossier d'engin.
 *
 * Elle se prenait sur la seule page Engins. Le directeur qui venait de lire un
 * rapport d'inspection — c'est-à-dire au moment précis où il a de quoi trancher
 * — se voyait renvoyé vers un autre écran pour y retrouver le même engin. Le
 * bloc est donc partagé : la page Rapports et la page Engins l'affichent l'une
 * comme l'autre.
 *
 * Chaque action est attendue et son échec s'affiche. Les boutons annonçaient
 * auparavant leur succès sans attendre la réponse du serveur : un refus — droits
 * insuffisants, dossier déjà tranché par un collègue — passait inaperçu, et le
 * directeur croyait avoir publié un engin resté invisible.
 */

const LEVELS: { value: Level; label: string; hint: string }[] = [
  { value: 'BASIC', label: 'Basic', hint: 'Conforme, sans distinction particulière' },
  { value: 'SILVER', label: 'Silver', hint: 'Bon état général, entretien suivi' },
  { value: 'GOLD', label: 'Gold', hint: 'État remarquable, dossier complet' },
]

export default function EquipmentDecision({
  equipment,
  onDone,
}: {
  equipment: Equipment
  /** Appelé après une action réussie, avec le message à afficher. */
  onDone?: (message: string) => void
}) {
  const {
    referenceEquipment, rejectEquipment, requestCorrection, publishEquipment, unpublishEquipment,
  } = useStore()

  const [level, setLevel] = useState<Level>('GOLD')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (key: string, action: () => Promise<void>, message: string) => {
    setBusy(key)
    setError(null)
    try {
      await action()
      onDone?.(message)
    } catch (e) {
      setError(
        e instanceof Error
          ? `Opération refusée par le serveur : ${e.message}`
          : "L'opération n'a pas abouti.",
      )
    } finally {
      setBusy(null)
    }
  }

  const banner = error && (
    <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-600" />
      <p className="text-xs font-medium text-red-700">{error}</p>
    </div>
  )

  if (equipment.status === 'PENDING_ADMIN_REVIEW') {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-acier-900">Décision administrative</div>
        {banner}

        <div className="mb-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            <Award size={13} />
            Niveau attribué
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                aria-pressed={level === l.value}
                className={`rounded-lg border-2 p-2.5 text-left transition ${
                  level === l.value
                    ? 'border-btp-500 bg-btp-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`text-sm font-bold ${level === l.value ? 'text-btp-700' : 'text-acier-900'}`}>
                  {l.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-slate-500">{l.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy !== null}
            onClick={() =>
              run('ref', () => referenceEquipment(equipment.id, level), `Engin référencé au niveau ${level}.`)
            }
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check size={15} />
            {busy === 'ref' ? 'Enregistrement…' : `Référencer en ${level}`}
          </button>
          <button
            disabled={busy !== null}
            onClick={() => run('rej', () => rejectEquipment(equipment.id), 'Engin refusé.')}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <X size={15} />
            {busy === 'rej' ? '…' : 'Refuser'}
          </button>
          <button
            disabled={busy !== null}
            onClick={() =>
              run('cor', () => requestCorrection(equipment.id), 'Corrections demandées au fournisseur.')
            }
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-500 py-2 text-sm font-semibold text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
          >
            <Undo2 size={15} />
            {busy === 'cor' ? '…' : 'Corrections'}
          </button>
        </div>
      </div>
    )
  }

  if (equipment.status === 'REFERENCED') {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-1 text-sm font-semibold text-acier-900">
          Référencé{equipment.level ? ` en ${equipment.level}` : ''} — reste à publier
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Tant qu’il n’est pas publié, cet engin n’apparaît pas au catalogue et ne peut
          recevoir aucune demande de devis.
        </p>
        {banner}
        <button
          disabled={busy !== null}
          onClick={() => run('pub', () => publishEquipment(equipment.id), 'Engin publié sur le catalogue.')}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-acier-900 py-2.5 text-sm font-semibold text-white transition hover:bg-acier-800 disabled:opacity-50"
        >
          <Send size={15} />
          {busy === 'pub' ? 'Publication…' : 'Publier sur le catalogue'}
        </button>
      </div>
    )
  }

  if (equipment.status === 'PUBLISHED') {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="mb-1 text-sm font-semibold text-emerald-800">
          Publié au catalogue{equipment.level ? ` — niveau ${equipment.level}` : ''}
        </div>
        <p className="mb-3 text-xs text-emerald-700">
          Visible par les clients, ouvert aux demandes de devis.
        </p>
        {banner}
        <button
          disabled={busy !== null}
          onClick={() => run('unpub', () => unpublishEquipment(equipment.id), 'Engin dépublié du catalogue.')}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          <EyeOff size={15} />
          {busy === 'unpub' ? '…' : 'Dépublier du catalogue'}
        </button>
      </div>
    )
  }

  /** Les autres statuts n'appellent aucune décision : on dit lequel et pourquoi. */
  const waiting: Partial<Record<Equipment['status'], string>> = {
    DRAFT: 'Brouillon non soumis par le fournisseur.',
    SUBMITTED: 'En attente d’assignation à une équipe technique.',
    PENDING_INSPECTION: 'Inspection assignée, en attente de la visite technique.',
    INSPECTION_IN_PROGRESS: 'Inspection en cours sur site.',
    REPORT_SUBMITTED: 'Rapport transmis, en cours d’enregistrement.',
    CORRECTIONS_REQUESTED: 'Corrections demandées : la main est au fournisseur.',
    REJECTED: 'Dossier refusé après vérification.',
    UNPUBLISHED: 'Retiré du catalogue.',
  }

  return (
    <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
      {waiting[equipment.status] ?? 'Aucune décision attendue à ce stade.'}
    </p>
  )
}
