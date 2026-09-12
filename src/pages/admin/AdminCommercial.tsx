import { useMemo, useState, type FormEvent } from 'react'
import { Plus, TrendingUp, Trophy, Wallet } from 'lucide-react'
import { apiPost } from '../../store/api'
import { useStore } from '../../store/StoreContext'
import { useLiveResource } from '../../store/useLiveResource'
import { useToast } from '../../components/feedback/Toaster'
import { Button, EmptyState, Modal, OpportunityStageBadge, PageTitle, StatCard, fmtPrice } from '../../components/ui'
import { OPPORTUNITY_NEXT, OPPORTUNITY_ORDER, OPPORTUNITY_STAGE } from '../../lib/statuses'
import type { Opportunity, OpportunityInput, OpportunityStage } from '../../store/types'

/**
 * Pipeline commercial.
 *
 * Le serveur tient les opportunités et leurs étapes ; cet écran les montre en
 * colonnes, une par étape, et propose sur chaque carte les seules transitions
 * que le serveur acceptera. Le montant est une estimation déclarée — il est
 * affiché comme tel, jamais additionné en « chiffre d'affaires ».
 *
 * Réservé à l'administration : le serveur refuse les autres rôles, la
 * navigation ne leur montre pas l'entrée.
 */
const INPUT =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-acier-500 focus:outline-none focus:ring-2 focus:ring-acier-200'

const EMPTY: OpportunityInput = { title: '', prospectName: '', prospectCompany: '', prospectContact: '', amount: null, notes: '' }

export default function AdminCommercial() {
  const { users } = useStore()
  const toast = useToast()
  const { data, loading, error, patch } = useLiveResource<Opportunity[]>('/opportunities')
  const opportunities = useMemo(() => data ?? [], [data])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<OpportunityInput>(EMPTY)
  const [busy, setBusy] = useState<string | null>(null)

  const byStage = useMemo(() => {
    const map = new Map<OpportunityStage, Opportunity[]>()
    for (const s of OPPORTUNITY_ORDER) map.set(s, [])
    for (const o of opportunities) {
      const column = map.get(o.stage)
      if (column) column.push(o)
      // Une étape inconnue du client garde sa colonne plutôt que de disparaître.
      else map.set(o.stage, [o])
    }
    return map
  }, [opportunities])

  const open = opportunities.filter((o) => !OPPORTUNITY_STAGE[o.stage]?.terminal)
  const won = opportunities.filter((o) => o.stage === 'WON')
  const pipelineAmount = open.reduce((sum, o) => sum + (o.amount ?? 0), 0)

  const move = async (o: Opportunity, stage: OpportunityStage) => {
    setBusy(o.id)
    try {
      const updated = await apiPost<Opportunity>(`/opportunities/${o.id}/stage`, { stage })
      patch((current) => (current ?? []).map((x) => (x.id === updated.id ? updated : x)))
      toast.success(
        stage === 'WON' ? 'Opportunité gagnée' : stage === 'LOST' ? 'Opportunité perdue' : 'Étape mise à jour',
        `${updated.reference} est maintenant « ${OPPORTUNITY_STAGE[updated.stage].label} ».`,
      )
    } catch (err) {
      toast.fromError(err)
    } finally {
      setBusy(null)
    }
  }

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) {
      toast.warning('Titre requis', 'Donnez un nom à l’opportunité.')
      return
    }
    if (!form.clientId && !form.prospectName?.trim()) {
      toast.warning('Contact requis', 'Rattachez un client existant ou nommez le prospect.')
      return
    }
    setBusy('new')
    try {
      const created = await apiPost<Opportunity>('/opportunities', {
        ...form,
        clientId: form.clientId || null,
        amount: form.amount ?? null,
      })
      patch((current) => [created, ...(current ?? [])])
      toast.success('Opportunité créée', `${created.reference} entre dans le pipeline.`)
      setCreating(false)
      setForm(EMPTY)
    } catch (err) {
      toast.fromError(err)
    } finally {
      setBusy(null)
    }
  }

  const clients = users.filter((u) => u.role === 'CLIENT')

  return (
    <div>
      <PageTitle
        title="Pipeline commercial"
        subtitle="Prospects et clients suivis par l’équipe VOLTA, de la prise de contact à la signature."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={15} />
            Nouvelle opportunité
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Opportunités ouvertes" value={open.length} icon={TrendingUp} />
        <StatCard label="Montant estimé en cours" value={fmtPrice(pipelineAmount)} icon={Wallet} />
        <StatCard label="Gagnées" value={won.length} icon={Trophy} accent="text-emerald-700" />
      </div>

      {error && !loading && opportunities.length === 0 ? (
        <EmptyState title="Pipeline indisponible" subtitle="Le serveur a refusé la lecture des opportunités." />
      ) : opportunities.length === 0 && !loading ? (
        <EmptyState
          title="Aucune opportunité"
          subtitle="Créez la première depuis un prospect ou un client existant."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus size={15} />
              Nouvelle opportunité
            </Button>
          }
        />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 lg:-mx-8 lg:px-8">
          <div className="flex min-w-max gap-3">
            {OPPORTUNITY_ORDER.map((stage) => {
              const items = byStage.get(stage) ?? []
              const style = OPPORTUNITY_STAGE[stage]
              return (
                <div key={stage} className="w-64 shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${style.className}`}>
                      {style.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{items.length}</span>
                  </div>
                  <div className="flex min-h-24 flex-col gap-2 rounded-xl bg-slate-100/70 p-2">
                    {items.map((o) => (
                      <OpportunityCard
                        key={o.id}
                        o={o}
                        owner={users.find((u) => u.id === o.ownerId)?.name}
                        client={users.find((u) => u.id === o.clientId)?.company}
                        busy={busy === o.id}
                        onMove={(s) => void move(o, s)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Nouvelle opportunité">
        <form onSubmit={(e) => void create(e)} className="space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Titre</span>
            <input className={`mt-1 ${INPUT}`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Client existant</span>
            <select
              className={`mt-1 ${INPUT}`}
              value={form.clientId ?? ''}
              onChange={(e) => setForm({ ...form, clientId: e.target.value || null })}
            >
              <option value="">— Prospect sans compte —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name}
                </option>
              ))}
            </select>
          </label>
          {!form.clientId && (
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Prospect</span>
                <input className={`mt-1 ${INPUT}`} value={form.prospectName ?? ''} onChange={(e) => setForm({ ...form, prospectName: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Société</span>
                <input className={`mt-1 ${INPUT}`} value={form.prospectCompany ?? ''} onChange={(e) => setForm({ ...form, prospectCompany: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Contact</span>
                <input className={`mt-1 ${INPUT}`} value={form.prospectContact ?? ''} onChange={(e) => setForm({ ...form, prospectContact: e.target.value })} />
              </label>
            </div>
          )}
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Montant estimé (FCFA)</span>
            <input
              type="number"
              min={0}
              className={`mt-1 ${INPUT}`}
              value={form.amount ?? ''}
              onChange={(e) => setForm({ ...form, amount: e.target.value ? Number(e.target.value) : null })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Notes</span>
            <textarea rows={2} className={`mt-1 ${INPUT}`} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" tone="secondary" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={busy === 'new'}>
              {busy === 'new' ? 'Création…' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function OpportunityCard({
  o,
  owner,
  client,
  busy,
  onMove,
}: {
  o: Opportunity
  owner?: string
  client?: string
  busy: boolean
  onMove: (stage: OpportunityStage) => void
}) {
  const next = OPPORTUNITY_NEXT[o.stage] ?? []
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="font-mono text-[11px] font-semibold text-slate-400">{o.reference}</div>
      <div className="mt-0.5 text-sm font-semibold text-acier-900">{o.title}</div>
      <div className="mt-1 text-xs text-slate-600">
        {client ?? o.prospectCompany ?? o.prospectName ?? '—'}
        {owner && <span className="text-slate-400"> · {owner}</span>}
      </div>
      {o.amount != null && <div className="mt-2 text-sm font-semibold text-acier-800">{fmtPrice(o.amount)}</div>}
      <div className="mt-2">
        <OpportunityStageBadge stage={o.stage} />
      </div>
      {next.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {next.map((s) => (
            <button
              key={s}
              disabled={busy}
              onClick={() => onMove(s)}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
                s === 'LOST'
                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                  : s === 'WON'
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-acier-50 text-acier-800 hover:bg-acier-100'
              }`}
            >
              → {OPPORTUNITY_STAGE[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
