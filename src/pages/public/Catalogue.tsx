import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, LevelBadge, PageTitle, fmtPrice } from '../../components/ui'

export default function Catalogue() {
  const { equipment, categories, users } = useStore()
  const [params] = useSearchParams()
  const [category, setCategory] = useState(params.get('categorie') ?? '')
  const [location, setLocation] = useState('')
  const [level, setLevel] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [operatorOnly, setOperatorOnly] = useState(false)

  const published = equipment.filter((e) => e.status === 'PUBLISHED')
  const locations = [...new Set(published.map((e) => e.location))]

  const filtered = published.filter(
    (e) =>
      (!category || e.categoryId === category) &&
      (!location || e.location === location) &&
      (!level || e.level === level) &&
      (!maxPrice || e.pricePerDay <= Number(maxPrice)) &&
      (!availableOnly || e.available) &&
      (!operatorOnly || e.withOperator),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <PageTitle title="Catalogue" subtitle={`${filtered.length} engin(s) vérifié(s) et publié(s)`} />
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="h-fit w-full shrink-0 p-4 lg:w-64">
          <div className="mb-3 font-semibold">Filtres</div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 p-2 text-sm">
            <option value="">Toutes</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="mb-1 block text-xs font-medium text-slate-700">Localisation</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 p-2 text-sm">
            <option value="">Toutes</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <label className="mb-1 block text-xs font-medium text-slate-700">Niveau</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 p-2 text-sm">
            <option value="">Tous</option>
            <option value="BASIC">Basic</option>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
          </select>
          <label className="mb-1 block text-xs font-medium text-slate-700">Prix max / jour (FCFA)</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="ex : 300000" className="mb-3 w-full rounded-lg border border-slate-300 p-2 text-sm" />
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
            Disponible uniquement
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={operatorOnly} onChange={(e) => setOperatorOnly(e.target.checked)} />
            Avec opérateur
          </label>
        </Card>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <EmptyState title="Aucun engin ne correspond aux filtres" subtitle="Essayez d'élargir vos critères de recherche." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((e) => {
                const cat = categories.find((c) => c.id === e.categoryId)
                const supplier = users.find((u) => u.id === e.supplierId)
                return (
                  <Link key={e.id} to={`/equipment/${e.id}`}>
                    <Card className="overflow-hidden transition hover:shadow-md">
                      <img src={e.photos[0]} alt={e.name} className="h-40 w-full object-cover" />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold">{e.name}</div>
                          <LevelBadge level={e.level} />
                        </div>
                        <div className="mt-1 text-xs text-slate-700">
                          {cat?.name} · {e.brand} {e.model} · {e.year}
                        </div>
                        <div className="text-xs text-slate-700">📍 {e.location} · {supplier?.company}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-bold text-blue-700">{fmtPrice(e.pricePerDay)} / jour</span>
                          <span className={`text-xs font-medium ${e.available ? 'text-emerald-600' : 'text-red-500'}`}>
                            {e.available ? 'Disponible' : 'Indisponible'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-700">
                          {e.withOperator ? 'Avec opérateur' : 'Sans opérateur'}
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
