import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  FileText,
  MapPin,
  Send,
  ShieldCheck,
  Star,
  Tag,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { errorMessage, ApiError } from '../../store/api'
import type { PublicListing, PurchaseRequest } from '../../store/types'
import { getListing, requestOffer } from '../../services/market'
import { LISTING_CONDITION } from '../../lib/statuses'
import { TextAreaField, TextField } from '../../components/requests/fields'
import PurchaseTimeline from '../../components/market/PurchaseTimeline'
import { fmtPrice } from '../../components/ui'
import { NotFound } from '../errors'

/**
 * Fiche d'une annonce Volta Market et demande d'offre.
 *
 * La fiche montre tout ce que le vendeur a déclaré et que l'équipe VOLTA a
 * examiné — jamais qui vend. Le formulaire est sur la même page, à droite :
 * l'acheteur qui vient de lire la fiche n'a pas à retrouver l'annonce dans un
 * autre écran pour se manifester. Sans compte, ses coordonnées suffisent ; un
 * client connecté les trouve préremplies.
 */
export default function MarketListing() {
  const { id = '' } = useParams()
  const { pathname } = useLocation()
  const { currentUser } = useStore()

  const [listing, setListing] = useState<PublicListing | null>(null)
  const [missing, setMissing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [photo, setPhoto] = useState(0)

  const [values, setValues] = useState({
    contactName: '',
    contactCompany: '',
    contactPhone: '',
    contactEmail: '',
    contactCity: '',
    quantity: '1',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [done, setDone] = useState<PurchaseRequest | null>(null)

  useEffect(() => {
    let cancelled = false
    setListing(null)
    setMissing(false)
    setLoadError(null)
    getListing(id)
      .then((l) => {
        if (!cancelled) setListing(l)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) setMissing(true)
        else setLoadError(errorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Un client connecté n'a pas à retaper ce que la plateforme sait déjà.
  useEffect(() => {
    if (!currentUser) return
    setValues((v) => ({
      ...v,
      contactName: v.contactName || currentUser.name,
      contactCompany: v.contactCompany || currentUser.company,
      contactPhone: v.contactPhone || currentUser.phone,
      contactEmail: v.contactEmail || currentUser.email,
      contactCity: v.contactCity || currentUser.city,
    }))
  }, [currentUser])

  const backPath = pathname.startsWith('/client') ? '/client/market' : '/market'
  const set = (name: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [name]: value }))
    setErrors((e) => {
      if (!e[name]) return e
      const { [name]: _removed, ...rest } = e
      return rest
    })
  }

  const submit = async () => {
    const found: Record<string, string> = {}
    for (const field of ['contactName', 'contactPhone', 'contactEmail'] as const) {
      if (!values[field].trim()) found[field] = 'Nécessaire pour vous répondre.'
    }
    if (Number(values.quantity) < 1) found.quantity = 'Au moins 1.'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSending(true)
    setFailure(null)
    try {
      const request = await requestOffer(id, {
        contactName: values.contactName,
        contactCompany: values.contactCompany,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        contactCity: values.contactCity,
        quantity: Number(values.quantity),
        message: values.message,
      })
      setDone(request)
    } catch (err) {
      setFailure(errorMessage(err, 'Votre demande n’a pas pu être envoyée.'))
    } finally {
      setSending(false)
    }
  }

  if (missing) return <NotFound />

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-semibold text-acier-900">La fiche n’a pas pu être chargée.</p>
        <p className="mt-1 text-sm text-slate-500">{loadError}</p>
        <Link to={backPath} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-btp-600">
          <ArrowLeft size={15} /> Retour au Market
        </Link>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  const photos = listing.photos.length ? listing.photos : ['/images/placeholders/equipment.svg']

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <Link
        to={backPath}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-acier-900"
      >
        <ArrowLeft size={15} />
        Volta Market
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        {/* Fiche */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-papier-200 bg-slate-100">
            <div className="relative aspect-[4/3]">
              <img src={photos[photo]} alt={listing.title} className="h-full w-full object-cover" />
              <div className="absolute left-4 top-4 flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    listing.condition === 'NEUF' ? 'bg-emerald-500 text-white' : 'bg-white/95 text-acier-900'
                  }`}
                >
                  {LISTING_CONDITION[listing.condition]}
                </span>
                {listing.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-btp-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    <Star size={11} fill="currentColor" /> Sélection VOLTA
                  </span>
                )}
              </div>
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto bg-white p-3">
                {photos.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setPhoto(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                      i === photo ? 'ring-btp-500' : 'ring-transparent hover:ring-slate-300'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <span className="font-mono text-xs font-bold text-slate-400">{listing.reference}</span>
            <h1 className="volta-display mt-1 text-4xl text-acier-900">{listing.title}</h1>
            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-slate-500">
              {listing.brand} {listing.model}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Spec icon={MapPin} label="Localisation" value={listing.location} />
              <Spec icon={Calendar} label="Année" value={listing.year ? String(listing.year) : '—'} />
              <Spec
                icon={Clock}
                label="Heures"
                value={listing.hours != null && listing.hours > 0 ? `${listing.hours.toLocaleString('fr-FR')} h` : '—'}
              />
              <Spec icon={Tag} label="État" value={LISTING_CONDITION[listing.condition]} />
            </dl>

            {listing.description && (
              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Description</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{listing.description}</p>
              </div>
            )}

            {listing.documents.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Documents déclarés
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {listing.documents.map((d) => (
                    <li
                      key={d.name}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-papier-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                    >
                      <FileText size={14} className="text-slate-400" />
                      {d.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  Déclarés par le vendeur ; Génie Sélect les contrôle avant toute offre.
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-3 rounded-2xl bg-papier-100 p-5 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, text: 'Annonce examinée par l’équipe VOLTA' },
                { icon: BadgeCheck, text: 'État et disponibilité vérifiés avant l’offre' },
                { icon: Send, text: 'Un interlocuteur unique : Génie Sélect' },
              ].map((g) => (
                <div key={g.text} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <g.icon size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                  {g.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demande d'offre */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-papier-200 bg-white p-6 shadow-lg">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Prix demandé
                </span>
                <div className="volta-display text-4xl text-acier-900">{fmtPrice(listing.askingPrice)}</div>
              </div>
              {listing.negotiable && (
                <span className="rounded-full bg-btp-50 px-3 py-1 text-xs font-bold text-btp-700 ring-1 ring-btp-200">
                  À négocier
                </span>
              )}
            </div>

            {done ? (
              <div className="mt-6">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check size={22} />
                  </span>
                  <h2 className="volta-display mt-3 text-2xl text-acier-900">Demande transmise.</h2>
                  <p className="mt-1 text-sm text-slate-700">
                    Génie Sélect vérifie la disponibilité et l’état, puis vous adresse une offre.
                  </p>
                  <div className="mx-auto mt-4 inline-flex flex-col items-center rounded-lg border border-emerald-300 bg-white px-5 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      Votre référence
                    </span>
                    <span className="mt-0.5 font-mono text-lg font-bold text-acier-900">{done.reference}</span>
                  </div>
                </div>
                <div className="mt-5">
                  <PurchaseTimeline status={done.status} />
                </div>
                <Link
                  to={`/suivi?ref=${done.reference}`}
                  className="mt-2 block rounded-lg bg-acier-900 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-acier-800"
                >
                  Suivre ma demande
                </Link>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void submit()
                }}
                className="mt-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-acier-900">Demander une offre</h2>
                <TextField name="contactName" label="Nom et prénom" required value={values.contactName} onChange={set('contactName')} error={errors.contactName} />
                <TextField name="contactCompany" label="Entreprise" value={values.contactCompany} onChange={set('contactCompany')} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField name="contactPhone" label="Téléphone" type="tel" required placeholder="+225 07 00 00 00 00" value={values.contactPhone} onChange={set('contactPhone')} error={errors.contactPhone} />
                  <TextField name="contactEmail" label="Email" type="email" required value={values.contactEmail} onChange={set('contactEmail')} error={errors.contactEmail} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField name="contactCity" label="Ville" value={values.contactCity} onChange={set('contactCity')} />
                  <TextField name="quantity" label="Quantité" type="number" required value={values.quantity} onChange={set('quantity')} error={errors.quantity} />
                </div>
                <TextAreaField name="message" label="Votre besoin" rows={3} placeholder="Délai, livraison, financement, questions sur l’état…" value={values.message} onChange={set('message')} />

                {failure && (
                  <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {failure}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-btp-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-btp-600 disabled:opacity-60"
                >
                  <Send size={16} />
                  {sending ? 'Envoi…' : 'Demander une offre'}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Sans engagement. Génie Sélect vous répond avec une offre vérifiée.
                </p>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-papier-200 bg-white p-3">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <Icon size={13} />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-acier-900">{value}</dd>
    </div>
  )
}
