import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, CategoryBadge, StatusBadge } from '../../components/ui'
import { LikeButton, ProductCard, Reveal, StarRating, TierBadge, onImgError } from '../../components/product'
import Reviews from '../../components/Reviews'
import QuoteRequestForm from '../../components/QuoteRequestForm'
import { IconHeart, IconPhone, IconEnvelope, IconCheck, IconHourglass, IconAttachment, IconClose } from '../../components/Icons'

const SECTIONS = [
  { id: 'presentation', label: 'Présentation' },
  { id: 'caracteristiques', label: 'Caractéristiques' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'avis', label: 'Avis' },
  { id: 'similaires', label: 'Équipements similaires' },
]

export default function EquipmentDetail() {
  const { id } = useParams()
  const { equipment, categories, users, reports, inspections, getRating } = useStore()
  const eq = equipment.find((e) => e.id === id)
  const [modalOpen, setModalOpen] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    setActivePhoto(0)
    window.scrollTo({ top: 0 })
  }, [id])

  if (!eq) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-12">
        <EmptyState title="Équipement introuvable" />
        <div className="mt-4 text-center">
          <Link to="/catalogue" className="font-medium text-brand-600 hover:underline">← Retour au catalogue</Link>
        </div>
      </div>
    )
  }

  const cat = categories.find((c) => c.id === eq.categoryId)
  const supplier = users.find((u) => u.id === eq.supplierId)
  const rating = getRating(eq.id)
  const report = reports.find((r) => r.equipmentId === eq.id)
  const inspection = inspections.find((i) => i.equipmentId === eq.id)

  const supplierOthers = equipment.filter((e) => e.supplierId === eq.supplierId && e.id !== eq.id)
  const similar = equipment.filter(
    (e) => e.categoryId === eq.categoryId && e.supplierId !== eq.supplierId && e.id !== eq.id,
  )

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <Link to="/catalogue" className="text-sm font-medium text-brand-600 hover:underline">← Retour au catalogue</Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="group relative h-96 overflow-hidden rounded-2xl bg-slate-100 shadow-md">
            <img
              src={eq.photos[activePhoto] ?? eq.photos[0]}
              alt={eq.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={onImgError}
            />
            <div className="absolute left-4 top-4">
              <TierBadge tier={eq.tier} size="lg" />
            </div>
            <div className="absolute right-4 top-4">
              <LikeButton equipmentId={eq.id} likes={eq.likes} />
            </div>
          </div>
          {eq.photos.length > 1 && (
            <div className="mt-3 flex gap-2">
              {eq.photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`h-16 w-20 overflow-hidden rounded-lg ring-2 transition ${
                    activePhoto === i ? 'ring-brand-500' : 'ring-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="" className="h-full w-full object-cover" onError={onImgError} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Header info */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">{eq.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {cat?.name} • {eq.brand} {eq.model} • {eq.year}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <TierBadge tier={eq.tier} />
            <StarRating value={rating.average} count={rating.count} />
            <span className="text-sm font-semibold text-rose-500 flex items-center gap-1">
              <IconHeart filled={true} className="w-4 h-4" />
              {eq.likes}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={eq.status} />
            {eq.category && <CategoryBadge category={eq.category} />}
          </div>

          {/* Section nav */}
          <div className="mt-6 flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Supplier Info */}
          <Card className="mt-6 border-brand-200 bg-brand-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-extrabold text-white">
                {supplier?.company.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-500">Fournisseur</div>
                <div className="font-bold text-slate-900">{supplier?.company}</div>
                <div className="mt-1 text-xs text-slate-600 flex flex-col gap-0.5">
                  <span className="flex items-center gap-1">
                    <IconPhone className="w-3 h-3" />
                    {supplier?.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconEnvelope className="w-3 h-3" />
                    {supplier?.email}
                  </span>
                </div>
              </div>
              <Link
                to="/fournisseurs"
                className="shrink-0 text-xs font-semibold text-brand-600 hover:underline"
              >
                Voir le fournisseur →
              </Link>
            </div>
          </Card>

          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 w-full rounded-xl bg-accent-500 py-3.5 font-bold text-white transition hover:bg-accent-600 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <IconEnvelope className="w-5 h-5" />
            Demander un devis
          </button>
        </div>
      </div>

      {/* Présentation */}
      <Reveal className="mt-16">
        <section id="presentation" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Présentation</h2>
          <p className="max-w-3xl leading-relaxed text-slate-700">{eq.description}</p>
        </section>
      </Reveal>

      {/* Caractéristiques */}
      <Reveal className="mt-12">
        <section id="caracteristiques" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Caractéristiques techniques</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Marque', value: eq.brand },
              { label: 'Modèle', value: eq.model },
              { label: 'Année', value: String(eq.year) },
              { label: 'Compteur', value: `${eq.hours.toLocaleString('fr-FR')} h` },
              { label: 'Localisation', value: eq.location },
              { label: 'État déclaré', value: eq.declaredCondition },
              { label: 'Catégorie VOLTA', value: eq.category ? `Catégorie ${eq.category}` : 'En attente' },
              { label: 'Niveau', value: eq.tier },
            ].map((spec) => (
              <Card key={spec.label} className="p-4 transition hover:shadow-md">
                <div className="text-xs text-slate-500">{spec.label}</div>
                <div className="mt-1 font-semibold text-slate-900">{spec.value}</div>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Inspection */}
      <Reveal className="mt-12">
        <section id="inspection" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Dernière inspection</h2>
          {report ? (
            <Card className="p-6">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600 ring-1 ring-emerald-200 flex items-center gap-1">
                  <IconCheck className="w-4 h-4" />
                  Rapport soumis
                </span>
                <span>{report.submittedAt}</span>
              </div>
              <p className="mt-3 text-slate-700">{report.summary}</p>
            </Card>
          ) : inspection ? (
            <Card className="p-6">
              <div className="text-sm text-slate-600 flex items-center gap-1">
                <IconCheck className="w-4 h-4" />
                <span>
                  Inspection {inspection.status === 'TERMINEE' || inspection.status === 'DONE' ? 'terminée' : 'en cours'} par l'équipe technique VOLTA (assignée le {inspection.assignedAt}).
                </span>
              </div>
            </Card>
          ) : eq.category ? (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <CategoryBadge category={eq.category} />
                <span className="text-sm text-slate-600">
                  Équipement inspecté et catégorisé par les équipes techniques VOLTA.
                </span>
              </div>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50 p-6">
              <div className="text-sm text-amber-700 flex items-center gap-1">
                <IconHourglass className="w-4 h-4 animate-pulse" />
                <span>Inspection VOLTA en attente pour cet équipement.</span>
              </div>
            </Card>
          )}

          {eq.documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {eq.documents.map((d, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:bg-slate-50">
                  <IconAttachment className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{d.name}</div>
                    <div className="text-xs text-slate-500">{d.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Avis */}
      <Reveal className="mt-12">
        <section id="avis" className="scroll-mt-24">
          <Reviews equipmentId={eq.id} />
        </section>
      </Reveal>

      {/* Autres équipements du fournisseur */}
      {supplierOthers.length > 0 && (
        <Reveal className="mt-14">
          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Autres équipements de {supplier?.company}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {supplierOthers.slice(0, 3).map((e) => (
                <ProductCard key={e.id} equipment={e} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Équipements similaires */}
      <Reveal className="mt-14">
        <section id="similaires" className="scroll-mt-24">
          <h2 className="mb-1 text-xl font-bold text-slate-900">Équipements similaires</h2>
          <p className="mb-4 text-sm text-slate-500">Même catégorie, proposés par d'autres fournisseurs.</p>
          {similar.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun équipement similaire chez d'autres fournisseurs pour le moment.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.slice(0, 3).map((e) => (
                <ProductCard key={e.id} equipment={e} />
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Quote Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
            <div className="sticky top-0 mb-4 flex items-center justify-between border-b bg-white pb-4">
              <h2 className="text-xl font-bold">Demander un devis</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <IconClose className="w-6 h-6" />
              </button>
            </div>

            <QuoteRequestForm
              equipmentId={eq.id}
              equipmentName={eq.name}
              onSuccess={() => {
                setModalOpen(false)
              }}
              onClose={() => setModalOpen(false)}
              autoClose={true}
            />
          </Card>
        </div>
      )}
    </div>
  )
}
