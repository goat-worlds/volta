import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState } from '../../components/ui'
import { ProductCard, Reveal, TierBadge } from '../../components/product'
import QuoteRequestForm from '../../components/QuoteRequestForm'
import type { EquipmentTier } from '../../store/types'

const TIER_PRIORITY: Record<EquipmentTier, number> = { GOLD: 0, SILVER: 1, BASIC: 2 }

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="skeleton h-44 w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default function Catalogue() {
  const { equipment, categories } = useStore()
  const [searchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categorie') ?? '')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedTier, setSelectedTier] = useState<EquipmentTier | ''>('')
  const [search, setSearch] = useState('')
  const [quoteFormOpen, setQuoteFormOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const locations = [...new Set(equipment.map((e) => e.location))]

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return equipment
      .filter(
        (e) =>
          (!selectedCategory || e.categoryId === selectedCategory) &&
          (!selectedLocation || e.location === selectedLocation) &&
          (!selectedTier || e.tier === selectedTier) &&
          (!q ||
            e.name.toLowerCase().includes(q) ||
            e.brand.toLowerCase().includes(q) ||
            e.model.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q)),
      )
      .sort((a, b) => TIER_PRIORITY[a.tier] - TIER_PRIORITY[b.tier] || b.likes - a.likes)
  }, [equipment, selectedCategory, selectedLocation, selectedTier, search])

  const tierCounts = useMemo(() => {
    const counts: Record<EquipmentTier, number> = { GOLD: 0, SILVER: 0, BASIC: 0 }
    for (const e of equipment) counts[e.tier]++
    return counts
  }, [equipment])

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Catalogue d'équipements</h1>
        <p className="mt-2 text-slate-500">
          {filtered.length} équipement(s) • Inspectés et catégorisés par VOLTA • Priorité aux références Gold
        </p>
      </div>

      {/* Instant search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
          <span className="pl-2 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Recherche instantanée : nom, marque, modèle, ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="pr-2 text-slate-400 transition hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        {/* Tier pills */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setSelectedTier('')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              selectedTier === '' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tous niveaux
          </button>
          {(['GOLD', 'SILVER', 'BASIC'] as EquipmentTier[]).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTier(selectedTier === t ? '' : t)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedTier === t ? 'bg-white shadow' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <TierBadge tier={t} />
              <span className="text-slate-500">{tierCounts[t]}</span>
            </button>
          ))}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Toutes les localisations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              📍 {l}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun équipement ne correspond aux filtres"
          subtitle="Essayez d'élargir vos critères de recherche."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e, idx) => (
            <Reveal key={e.id} delay={(idx % 3) * 70}>
              <ProductCard equipment={e} onQuote={setQuoteFormOpen} />
            </Reveal>
          ))}
        </div>
      )}

      {/* Model Explanation Section */}
      <Reveal className="mb-12 mt-16">
        <div className="rounded-2xl border-l-4 border-l-accent-500 bg-gradient-to-r from-slate-50 to-blue-50 p-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">💡 Le modèle VOLTA expliqué</h2>
          <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
            <div>
              <div className="mb-2 font-bold text-slate-900">🔍 VOLTA = Inspecteur</div>
              <p className="text-slate-700">Nous inspectons chaque équipement et assignons une catégorie (A/B/C/D/E)</p>
            </div>
            <div>
              <div className="mb-2 font-bold text-slate-900">🤝 Vous négociez directement</div>
              <p className="text-slate-700">Vous contactez le fournisseur. Les prix et conditions sont entre vous</p>
            </div>
            <div>
              <div className="mb-2 font-bold text-slate-900">💰 Zéro commission</div>
              <p className="text-slate-700">VOLTA ne prend aucun fonds. Aucune commission sur les transactions</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-slate-900">{equipment.length}</div>
          <p className="mt-1 text-sm text-slate-600">Équipements disponibles</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-accent-600">
            {new Set(equipment.map((e) => e.supplierId)).size}
          </div>
          <p className="mt-1 text-sm text-slate-600">Fournisseurs vérifiés</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-emerald-600">
            {equipment.filter((e) => e.category).length}
          </div>
          <p className="mt-1 text-sm text-slate-600">Équipements catégorisés</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-brand-600">100%</div>
          <p className="mt-1 text-sm text-slate-600">Inspection technique</p>
        </Card>
      </div>

      {/* Quote Request Modal */}
      {quoteFormOpen && (() => {
        const selectedEquipment = equipment.find((e) => e.id === quoteFormOpen)
        if (!selectedEquipment) return null

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
              <div className="sticky top-0 mb-4 flex items-center justify-between border-b bg-white pb-4">
                <h2 className="text-xl font-bold">Demander un devis</h2>
                <button
                  onClick={() => setQuoteFormOpen(null)}
                  className="text-2xl text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 p-3">
                <p className="text-sm text-slate-600">Équipement sélectionné</p>
                <p className="font-semibold text-slate-900">{selectedEquipment.name}</p>
                <Link
                  to={`/equipment/${selectedEquipment.id}`}
                  className="mt-2 inline-block text-xs text-brand-600 hover:underline"
                >
                  Voir le produit →
                </Link>
              </div>

              <QuoteRequestForm
                equipmentId={quoteFormOpen}
                equipmentName={selectedEquipment.name}
                onSuccess={() => {
                  setQuoteFormOpen(null)
                }}
                onClose={() => setQuoteFormOpen(null)}
                autoClose={true}
              />
            </Card>
          </div>
        )
      })()}
    </div>
  )
}
