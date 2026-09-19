import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Eye, Plus, Send, ShoppingBag, Star, Tag, Undo2 } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useLiveResource } from '../../store/useLiveResource'
import { useToast } from '../../components/feedback/Toaster'
import { Button, Card, EmptyState, LiveBadge, Modal, PageTitle, StatCard, fmtPrice } from '../../components/ui'
import { SelectField, TextAreaField, TextField, CheckboxField } from '../../components/requests/fields'
import { LISTING_CONDITION, LISTING_STATUS, PURCHASE_STAGE } from '../../lib/statuses'
import {
  createListing,
  submitListing,
  withdrawListing,
} from '../../services/market'
import type { ListingInput, PurchaseRequest, SaleListing } from '../../store/types'

/**
 * Espace fournisseur — Vendre sur Volta Market.
 *
 * Le fournisseur rédige une annonce, éventuellement à partir d'un engin de son
 * parc, la soumet, et suit son examen. Il voit les demandes d'offre reçues sur
 * ses annonces — leur nombre et leur avancement, pas les coordonnées de
 * l'acheteur : c'est Génie Sélect qui traite.
 */

const EMPTY: ListingInput = {
  title: '',
  categoryId: '',
  brand: '',
  model: '',
  year: null,
  hours: null,
  location: '',
  condition: 'OCCASION',
  askingPrice: 0,
  negotiable: true,
  description: '',
  photos: [],
  documents: [],
  equipmentId: null,
}

export default function SupplierListings() {
  const { equipment, categories, currentUser } = useStore()
  const toast = useToast()
  const listings = useLiveResource<SaleListing[]>('/market/listings/mine')
  const requests = useLiveResource<PurchaseRequest[]>('/market/requests')

  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<ListingInput>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const rows = listings.data ?? []
  const offers = requests.data ?? []
  const myEquipment = equipment.filter((e) => e.supplierId === currentUser?.id)

  const set = <K extends keyof ListingInput>(key: K, value: ListingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  /** Préremplit depuis un engin du parc : le vendeur ne ressaisit pas sa fiche. */
  const pickEquipment = (id: string) => {
    const eq = myEquipment.find((e) => e.id === id)
    if (!eq) {
      set('equipmentId', null)
      return
    }
    setForm((f) => ({
      ...f,
      equipmentId: eq.id,
      title: eq.name,
      categoryId: eq.categoryId,
      brand: eq.brand,
      model: eq.model,
      year: eq.year,
      hours: eq.hours,
      location: eq.location,
      description: eq.description,
      photos: eq.photos,
      documents: eq.documents,
      condition: 'OCCASION',
    }))
  }

  const create = async () => {
    setSaving(true)
    try {
      const created = await createListing(form)
      listings.patch((current) => [created, ...(current ?? [])])
      setCreating(false)
      setForm(EMPTY)
      toast.success('Annonce enregistrée', 'Elle est en brouillon : soumettez-la quand elle est prête.')
    } catch (err) {
      toast.fromError(err, 'Annonce non enregistrée')
    } finally {
      setSaving(false)
    }
  }

  const act = async (id: string, action: (id: string) => Promise<SaleListing>, ok: string) => {
    setBusy(id)
    try {
      const updated = await action(id)
      listings.patch((current) => (current ?? []).map((l) => (l.id === id ? updated : l)))
      toast.success(ok)
    } catch (err) {
      toast.fromError(err, 'Action refusée')
    } finally {
      setBusy(null)
    }
  }

  const online = rows.filter((l) => l.status === 'PUBLISHED').length
  const openOffers = offers.filter((o) => o.status !== 'CLOSED').length

  return (
    <div>
      <PageTitle
        title="Vendre sur Volta Market"
        subtitle="Vos annonces sont examinées par l’équipe VOLTA avant publication. Les acheteurs passent par Génie Sélect."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} />
            Nouvelle annonce
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Annonces en ligne" value={online} icon={Tag} />
        <StatCard label="Demandes d’offre en cours" value={openOffers} icon={ShoppingBag} />
        <StatCard
          label="Mises en avant"
          value={rows.filter((l) => l.featured).length}
          icon={Star}
          accent="text-btp-600"
        />
      </div>

      {listings.error ? (
        <EmptyState icon={AlertCircle} title="Vos annonces n’ont pas pu être chargées." />
      ) : rows.length === 0 && !listings.loading ? (
        <EmptyState
          icon={Tag}
          title="Aucune annonce"
          subtitle="Mettez un engin en vente : l’équipe VOLTA l’examine, le publie et peut le mettre en avant."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} />
              Créer ma première annonce
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {rows.map((l) => {
            const status = LISTING_STATUS[l.status] ?? { label: l.status, className: 'bg-slate-100 text-slate-700' }
            const mine = offers.filter((o) => o.listingId === l.id)
            return (
              <Card key={l.id} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  <img loading="lazy"
                    src={l.photos[0] || '/images/placeholders/equipment.svg'}
                    alt=""
                    className="h-32 w-full shrink-0 rounded-lg object-cover sm:w-44"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{l.reference}</span>
                      <LiveBadge value={l.status} className={status.className}>
                        {status.label}
                      </LiveBadge>
                      {l.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-btp-100 px-2.5 py-0.5 text-xs font-bold text-btp-800">
                          <Star size={11} fill="currentColor" /> Mise en avant
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-acier-900">{l.title}</h3>
                    <p className="text-sm text-slate-500">
                      {LISTING_CONDITION[l.condition]} · {l.location} ·{' '}
                      <span className="font-semibold text-acier-900">{fmtPrice(l.askingPrice)}</span>
                      {l.negotiable && ' (à négocier)'}
                    </p>
                    {l.status === 'REJECTED' && l.reviewNote && (
                      <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                        <span className="font-semibold">À corriger :</span> {l.reviewNote}
                      </p>
                    )}
                    {mine.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {mine.map((o) => (
                          <span
                            key={o.id}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PURCHASE_STAGE[o.status]?.className ?? 'bg-slate-100'}`}
                          >
                            {o.reference} · {PURCHASE_STAGE[o.status]?.label ?? o.status}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                    {(l.status === 'DRAFT' || l.status === 'WITHDRAWN') && (
                      <Button size="sm" disabled={busy === l.id} onClick={() => act(l.id, submitListing, 'Annonce soumise à l’équipe VOLTA')}>
                        <Send size={14} /> Soumettre
                      </Button>
                    )}
                    {l.status === 'PUBLISHED' && (
                      <>
                        <Link
                          to={`/market/${l.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-acier-800 hover:bg-slate-50"
                        >
                          <Eye size={14} /> Voir en ligne
                        </Link>
                        <Button size="sm" tone="secondary" disabled={busy === l.id} onClick={() => act(l.id, withdrawListing, 'Annonce retirée')}>
                          <Undo2 size={14} /> Retirer
                        </Button>
                      </>
                    )}
                    {l.status === 'REJECTED' && (
                      <Button size="sm" disabled={busy === l.id} onClick={() => act(l.id, submitListing, 'Annonce resoumise')}>
                        <Send size={14} /> Resoumettre
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Nouvelle annonce">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void create()
          }}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          {myEquipment.length > 0 && (
            <SelectField
              name="equipmentId"
              label="Partir d’un engin de mon parc"
              help="Ses caractéristiques et photos préremplissent l’annonce."
              placeholder="Saisie libre"
              value={form.equipmentId ?? ''}
              onChange={pickEquipment}
              options={myEquipment.map((e) => ({ value: e.id, label: e.name }))}
            />
          )}
          <TextField name="title" label="Intitulé" required value={form.title} onChange={(v) => set('title', v)} placeholder="Pelle hydraulique Komatsu PC210" />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField name="categoryId" label="Catégorie" required value={form.categoryId} onChange={(v) => set('categoryId', v)} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
            <SelectField name="condition" label="État" required value={form.condition} onChange={(v) => set('condition', v as ListingInput['condition'])} options={[{ value: 'OCCASION', label: 'Occasion' }, { value: 'NEUF', label: 'Neuf' }]} />
            <TextField name="brand" label="Marque" value={form.brand} onChange={(v) => set('brand', v)} />
            <TextField name="model" label="Modèle" value={form.model} onChange={(v) => set('model', v)} />
            <TextField name="year" label="Année" type="number" value={form.year?.toString() ?? ''} onChange={(v) => set('year', v ? Number(v) : null)} />
            <TextField name="hours" label="Heures" type="number" value={form.hours?.toString() ?? ''} onChange={(v) => set('hours', v ? Number(v) : null)} />
          </div>
          <TextField name="location" label="Localisation" required value={form.location} onChange={(v) => set('location', v)} placeholder="Abidjan, Côte d'Ivoire" />
          <TextField name="askingPrice" label="Prix demandé (FCFA)" type="number" required value={form.askingPrice ? String(form.askingPrice) : ''} onChange={(v) => set('askingPrice', Number(v) || 0)} />
          <CheckboxField name="negotiable" label="Prix négociable" value={form.negotiable ? 'oui' : ''} onChange={(v) => set('negotiable', v === 'oui')} />
          <TextAreaField name="description" label="Description" value={form.description} onChange={(v) => set('description', v)} help="État, entretien, équipements, ce qui est inclus." />
          <TextField name="photo" label="Photo principale (adresse)" value={form.photos[0] ?? ''} onChange={(v) => set('photos', v ? [v] : [])} help="Le dépôt de fichiers arrive avec le service de stockage ; en attendant, une adresse d’image." />
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" tone="secondary" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer le brouillon'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
