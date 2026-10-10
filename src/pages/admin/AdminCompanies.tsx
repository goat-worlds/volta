import { useState } from 'react'
import { Building2, Download, ShieldCheck, ShieldOff } from 'lucide-react'
import { useLiveResource } from '../../store/useLiveResource'
import { apiPost } from '../../store/api'
import { Card, EmptyState, PageTitle, StatCard } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'
import { apiDownload } from '../../store/api'
import type { User } from '../../store/types'

/**
 * Les dossiers des clients entreprises.
 *
 * <h2>Pourquoi un écran à part</h2>
 *
 * L'annuaire des comptes liste tout le monde et ne juge personne. Ici, on
 * tranche : cette entreprise existe-t-elle, ses pièces tiennent-elles, peut-on
 * lui confier des marchés ? Mêlé à l'annuaire, ce geste se serait perdu dans
 * une colonne de plus — et un dossier non vu est un compte qui reste fermé
 * sans que personne ne sache pourquoi.
 *
 * <h2>L'ordre</h2>
 *
 * Ceux qui attendent d'abord, les plus anciens en tête. C'est la file réelle :
 * une entreprise qui a signé il y a trois jours et attend toujours est le
 * problème le plus urgent de cet écran, et elle serait invisible au bas d'une
 * liste alphabétique.
 */
export default function AdminCompanies() {
  const { data, reload } = useLiveResource<User[]>('/admin/companies')
  const [busy, setBusy] = useState<string | null>(null)
  const toast = useToast()

  const toutes = data ?? []
  const attente = toutes
    .filter((u) => u.contractAcceptedAt && !u.contractValidatedAt)
    .sort((a, b) => (a.contractAcceptedAt ?? '').localeCompare(b.contractAcceptedAt ?? ''))
  const aSigner = toutes.filter((u) => !u.contractAcceptedAt)
  const actives = toutes.filter((u) => u.contractValidatedAt)

  const agir = async (u: User, chemin: 'validate' | 'revoke', message: string) => {
    if (chemin === 'revoke') {
      const motif = window.prompt(
        `Retirer l’accès de ${u.company || u.name} ?\n\nMotif (lu par l’équipe, pas par le client).`,
      )
      if (motif === null) return
      setBusy(u.id)
      try {
        await apiPost(`/admin/companies/${u.id}/revoke`, { motif: motif.trim() })
        toast.info(message, u.company || u.name)
        await reload()
      } catch (e) {
        toast.fromError(e)
      } finally {
        setBusy(null)
      }
      return
    }
    setBusy(u.id)
    try {
      await apiPost(`/admin/companies/${u.id}/validate`)
      toast.success(message, u.company || u.name)
      await reload()
    } catch (e) {
      toast.fromError(e)
    } finally {
      setBusy(null)
    }
  }

  /** La pièce du gérant s'ouvre, elle ne se devine pas depuis un nom de fichier. */
  const telecharger = async (u: User) => {
    setBusy(u.id)
    try {
      const { blob, filename } = await apiDownload(`/admin/companies/${u.id}/piece-gerant`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename ?? 'piece-gerant'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.fromError(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Clients entreprises"
        subtitle="Vérifiez les pièces, puis ouvrez les fonctions opérationnelles."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="À vérifier"
          value={attente.length}
          icon={Building2}
          accent={attente.length > 0 ? 'text-amber-700' : undefined}
        />
        <StatCard label="En attente de signature" value={aSigner.length} icon={Building2} />
        <StatCard label="Comptes actifs" value={actives.length} icon={ShieldCheck} />
      </div>

      {toutes.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun client entreprise"
          subtitle="Les entreprises qui s’inscrivent apparaîtront ici, dossier à vérifier."
        />
      ) : (
        <div className="space-y-8">
          <Section titre="À vérifier — les plus anciennes d’abord" rows={attente}>
            {(u) => (
              <>
                <button
                  type="button"
                  disabled={busy === u.id}
                  onClick={() => void telecharger(u)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-papier-200 px-3 py-2 text-sm font-semibold text-acier-900 transition hover:border-btp-400 disabled:opacity-50"
                >
                  <Download size={14} aria-hidden />
                  Pièce du gérant
                </button>
                <button
                  type="button"
                  disabled={busy === u.id}
                  onClick={() => void agir(u, 'validate', 'Compte entreprise activé')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-btp-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-btp-600 disabled:opacity-50"
                >
                  <ShieldCheck size={14} aria-hidden />
                  Valider
                </button>
              </>
            )}
          </Section>

          <Section titre="En attente de signature" rows={aSigner}>
            {() => (
              <span className="text-xs text-papier-600">
                Le contrat n’a pas encore été signé par l’entreprise.
              </span>
            )}
          </Section>

          <Section titre="Comptes actifs" rows={actives}>
            {(u) => (
              <button
                type="button"
                disabled={busy === u.id}
                onClick={() => void agir(u, 'revoke', 'Accès retiré')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-papier-200 px-4 py-2 text-sm font-semibold text-acier-900 transition hover:border-red-300 hover:text-red-700 disabled:opacity-50"
              >
                <ShieldOff size={14} aria-hidden />
                Retirer l’accès
              </button>
            )}
          </Section>
        </div>
      )}
    </div>
  )
}

/** Un groupe de dossiers, masqué s'il est vide : une liste vide n'informe de rien. */
function Section({
  titre,
  rows,
  children,
}: {
  titre: string
  rows: User[]
  children: (u: User) => React.ReactNode
}) {
  if (rows.length === 0) return null
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">{titre}</h2>
      <div className="grid gap-3">
        {rows.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="font-semibold text-acier-900">{u.company || u.name}</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {u.name} · {u.email} · {u.phone}
              </div>
              {/* Les trois pièces côte à côte : c'est sur elles que porte la
                  décision, et les chercher dans une fiche à part ferait valider
                  de mémoire. */}
              <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                <div>
                  <dt className="inline text-slate-500">RCCM : </dt>
                  <dd className="inline font-medium text-acier-800">{u.rccm || '—'}</dd>
                </div>
                <div>
                  <dt className="inline text-slate-500">DFE : </dt>
                  <dd className="inline font-medium text-acier-800">{u.dfe || '—'}</dd>
                </div>
                <div>
                  <dt className="inline text-slate-500">Responsable : </dt>
                  <dd className="inline font-medium text-acier-800">{u.managerEmail || '—'}</dd>
                </div>
              </dl>
              {u.contractAcceptedAt && (
                <div className="mt-1.5 text-xs text-slate-500">
                  Signé le {new Date(u.contractAcceptedAt).toLocaleDateString('fr-FR')}
                  {u.contractValidatedAt &&
                    ` · validé le ${new Date(u.contractValidatedAt).toLocaleDateString('fr-FR')}`}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">{children(u)}</div>
          </Card>
        ))}
      </div>
    </section>
  )
}
