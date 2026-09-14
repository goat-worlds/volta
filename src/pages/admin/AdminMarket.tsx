import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeDollarSign, CheckCircle2, Eye, ShoppingBag, Star, Tag, XCircle } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useLiveResource } from '../../store/useLiveResource'
import { useToast } from '../../components/feedback/Toaster'
import { Button, Card, EmptyState, LiveBadge, Modal, PageTitle, StatCard, fmtPrice } from '../../components/ui'
import PurchaseTimeline from '../../components/market/PurchaseTimeline'
import { LISTING_CONDITION, LISTING_STATUS, PURCHASE_FLOW, PURCHASE_STAGE } from '../../lib/statuses'
import {
  featureListing,
  markListingSold,
  movePurchaseStage,
  publishListing,
  rejectListing,
} from '../../services/market'
import type { PurchaseRequest, PurchaseStage, SaleListing } from '../../store/types'

/**
 * Administration — Volta Market.
 *
 * Deux files : les annonces à examiner (publier, renvoyer, mettre en avant,
 * marquer vendu) et les demandes d'offre à faire avancer, une étape à la fois,
 * comme le serveur l'impose. L'offre exige un montant : le bouton le demande
 * avant d'appeler.
 */
export default function AdminMarket() {
  const { users } = useStore()
  const toast = useToast()
  const listings = useLiveResource<SaleListing[]>('/market/listings/mine')
  const requests = useLiveResource<PurchaseRequest[]>('/market/requests')
  const [tab, setTab] = useState<'listings' | 'requests'>('listings')
  const [busy, setBusy] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<SaleListing | null>(null)
  const [note, setNote] = useState('')
  const [offering, setOffering] = useState<PurchaseRequest | null>(null)
  const [amount, setAmount] = useState('')
  const [detail, setDetail] = useState<PurchaseRequest | null>(null)

  const rows = useMemo(() => data(listings.data), [listings.data])
  const offers = useMemo(() => data(requests.data), [requests.data])
  const sellerName = (id: string) => users.find((u) => u.id === id)?.company || users.find((u) => u.id === id)?.name || id
  const listingTitle = (id: string) => rows.find((l) => l.id === id)?.title ?? id

  const toReview = rows.filter((l) => l.status === 'SUBMITTED')
  const online = rows.filter((l) => l.status === 'PUBLISHED')
  const openOffers = offers.filter((o) => o.status !== 'CLOSED')

  const actListing = async (id: string, action: () => Promise<SaleListing>, ok: string) => {
    setBusy(id)
    try {
      const updated = await action()
      listings.patch((c) => (c ?? []).map((l) => (l.id === id ? updated : l)))
      toast.success(ok)
    } catch (err) {
      toast.fromError(err, 'Action refusée')
    } finally {
      setBusy(null)
    }
  }

  const move = async (r: PurchaseRequest, stage: PurchaseStage, offerAmount?: number) => {
    setBusy(r.id)
    try {
      const updated = await movePurchaseStage(r.id, stage, undefined, offerAmount)
      requests.patch((c) => (c ?? []).map((x) => (x.id === r.id ? updated : x)))
      if (detail?.id === r.id) setDetail(updated)
      toast.success('Étape mise à jour', `${updated.reference} : ${PURCHASE_STAGE[updated.status].label}.`)
    } catch (err) {
      toast.fromError(err, 'Transition refusée')
    } finally {
      setBusy(null)
    }
  }

  const nextStage = (r: PurchaseRequest): PurchaseStage | null => {
    const i = PURCHASE_FLOW.indexOf(r.status)
    return i >= 0 && i < PURCHASE_FLOW.length - 1 ? PURCHASE_FLOW[i + 1] : null
  }

  return (
    <div>
      <PageTitle
        title="Volta Market"
        subtitle="Examinez les annonces, mettez en avant la sélection, faites avancer les demandes d’offre."
        actions={
          <Link to="/market" className="inline-flex items-center gap-1.5 text-sm font-semibold text-acier-700 hover:text-acier-900">
            <Eye size={15} /> Voir la vitrine
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="À examiner" value={toReview.length} icon={Tag} accent={toReview.length ? 'text-btp-600' : undefined} />
        <StatCard label="En ligne" value={online.length} icon={CheckCircle2} />
        <StatCard label="Mises en avant" value={online.filter((l) => l.featured).length} icon={Star} />
        <StatCard label="Demandes en cours" value={openOffers.length} icon={ShoppingBag} />
      </div>

      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
        {(
          [
            ['listings', `Annonces (${rows.length})`],
            ['requests', `Demandes d’offre (${offers.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-md px-3 py-2 transition ${tab === key ? 'bg-white text-acier-900 shadow-sm' : 'text-slate-500 hover:text-acier-900'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'listings' &&
        (rows.length === 0 ? (
          <EmptyState icon={Tag} title="Aucune annonce" subtitle="Les annonces déposées par les fournisseurs apparaîtront ici." />
        ) : (
          <div className="space-y-3">
            {[...rows]
              .sort((a, b) => Number(b.status === 'SUBMITTED') - Number(a.status === 'SUBMITTED'))
              .map((l) => {
                const status = LISTING_STATUS[l.status] ?? { label: l.status, className: 'bg-slate-100 text-slate-700' }
                return (
                  <Card key={l.id} className="flex flex-col gap-4 p-4 sm:flex-row">
                    <img src={l.photos[0] || '/images/placeholders/equipment.svg'} alt="" className="h-28 w-full shrink-0 rounded-lg object-cover sm:w-40" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{l.reference}</span>
                        <LiveBadge value={l.status} className={status.className}>{status.label}</LiveBadge>
                        {l.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-btp-100 px-2.5 py-0.5 text-xs font-bold text-btp-800">
                            <Star size={11} fill="currentColor" /> Sélection
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-bold text-acier-900">{l.title}</h3>
                      <p className="text-sm text-slate-500">
                        {sellerName(l.sellerId)} · {LISTING_CONDITION[l.condition]} · {l.location} ·{' '}
                        <span className="font-semibold text-acier-900">{fmtPrice(l.askingPrice)}</span>
                      </p>
                      {l.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{l.description}</p>}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                      {l.status === 'SUBMITTED' && (
                        <>
                          <Button size="sm" tone="success" disabled={busy === l.id} onClick={() => actListing(l.id, () => publishListing(l.id), 'Annonce publiée')}>
                            <CheckCircle2 size={14} /> Publier
                          </Button>
                          <Button size="sm" tone="danger" disabled={busy === l.id} onClick={() => { setRejecting(l); setNote('') }}>
                            <XCircle size={14} /> Renvoyer
                          </Button>
                        </>
                      )}
                      {l.status === 'PUBLISHED' && (
                        <>
                          <Button size="sm" tone={l.featured ? 'secondary' : 'primary'} disabled={busy === l.id} onClick={() => actListing(l.id, () => featureListing(l.id, !l.featured), l.featured ? 'Retirée de la sélection' : 'Mise en avant')}>
                            <Star size={14} /> {l.featured ? 'Retirer de la sélection' : 'Mettre en avant'}
                          </Button>
                          <Button size="sm" tone="secondary" disabled={busy === l.id} onClick={() => actListing(l.id, () => markListingSold(l.id), 'Annonce marquée vendue')}>
                            <BadgeDollarSign size={14} /> Marquer vendue
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                )
              })}
          </div>
        ))}

      {tab === 'requests' &&
        (offers.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Aucune demande d’offre" subtitle="Les demandes déposées sur la vitrine apparaîtront ici." />
        ) : (
          <div className="space-y-3">
            {offers.map((r) => {
              const stage = PURCHASE_STAGE[r.status] ?? { label: r.status, className: 'bg-slate-100 text-slate-700' }
              const next = nextStage(r)
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{r.reference}</span>
                        <LiveBadge value={r.status} className={stage.className}>{stage.label}</LiveBadge>
                        {r.offerAmount != null && (
                          <span className="rounded-full bg-btp-50 px-2.5 py-0.5 text-xs font-bold text-btp-800 ring-1 ring-btp-200">
                            Offre : {fmtPrice(r.offerAmount)}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-bold text-acier-900">{listingTitle(r.listingId)}</h3>
                      <p className="text-sm text-slate-600">
                        {r.contactName}
                        {r.contactCompany && ` · ${r.contactCompany}`} · {r.contactPhone} · {r.contactEmail}
                        {r.contactCity && ` · ${r.contactCity}`} · qté {r.quantity}
                      </p>
                      {r.message && <p className="mt-1 text-sm italic text-slate-500">« {r.message} »</p>}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button size="sm" tone="secondary" onClick={() => setDetail(r)}>Suivi</Button>
                      {next && next !== 'CLOSED' && (
                        <Button
                          size="sm"
                          disabled={busy === r.id}
                          onClick={() => (next === 'OFFER' ? (setOffering(r), setAmount(r.offerAmount?.toString() ?? '')) : move(r, next))}
                        >
                          {PURCHASE_STAGE[next].label} <ArrowRight size={14} />
                        </Button>
                      )}
                      {r.status !== 'CLOSED' && (
                        <Button size="sm" tone="ghost" disabled={busy === r.id} onClick={() => move(r, 'CLOSED')}>Clôturer</Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ))}

      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Renvoyer l’annonce au vendeur">
        <p className="text-sm text-slate-600">Dites-lui ce qui doit être corrigé : il lira ce message sur son annonce.</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Photos insuffisantes, prix incohérent avec l’état déclaré…" />
        <div className="mt-4 flex justify-end gap-2">
          <Button tone="secondary" onClick={() => setRejecting(null)}>Annuler</Button>
          <Button
            tone="danger"
            disabled={!note.trim() || !rejecting}
            onClick={() => rejecting && actListing(rejecting.id, () => rejectListing(rejecting.id, note), 'Annonce renvoyée').then(() => setRejecting(null))}
          >
            Renvoyer
          </Button>
        </div>
      </Modal>

      <Modal open={Boolean(offering)} onClose={() => setOffering(null)} title="Transmettre une offre">
        <p className="text-sm text-slate-600">Montant de l’offre faite à l’acheteur, en FCFA.</p>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="48000000" />
        <div className="mt-4 flex justify-end gap-2">
          <Button tone="secondary" onClick={() => setOffering(null)}>Annuler</Button>
          <Button
            disabled={!offering || Number(amount) <= 0}
            onClick={() => offering && move(offering, 'OFFER', Number(amount)).then(() => setOffering(null))}
          >
            Transmettre l’offre
          </Button>
        </div>
      </Modal>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail ? `Suivi ${detail.reference}` : ''}>
        {detail && (
          <div>
            <PurchaseTimeline status={detail.status} />
            {detail.notes && (
              <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-xs text-slate-600">{detail.notes}</pre>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function data<T>(rows: T[] | null): T[] {
  return rows ?? []
}
