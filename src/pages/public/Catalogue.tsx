import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { EmptyState, LevelBadge, fmtPrice } from '../../components/ui'
import { PageHero, Reveal, Section } from '../../components/site/SiteKit'

/**
 * Le catalogue de location.
 *
 * C'est un écran de travail : on y filtre, on y compare, on y clique. Il garde
 * donc sa colonne de filtres et sa grille dense — ce que les sections de
 * présentation n'ont pas — mais reprend le chapeau, les fonds et les couleurs
 * du reste du site. Il ouvrait sur un titre d'application collé en haut de
 * page, des filtres en gris ardoise et un prix en bleu, seule trace de bleu
 * générique sur un site qui n'en a pas.
 */
const FIELD =
  'w-full rounded-lg border border-papier-200 bg-white p-2 text-sm text-acier-900 focus:border-btp-400 focus:outline-none focus:ring-2 focus:ring-btp-400/30'
const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-papier-600'

export default function Catalogue() {
  const { equipment, categories, users } = useStore()
  const [params] = useSearchParams()
  const [category, setCategory] = useState(params.get('categorie') ?? '')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [location, setLocation] = useState('')
  const [level, setLevel] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [operatorOnly, setOperatorOnly] = useState(false)

  const published = equipment.filter((e) => e.status === 'PUBLISHED')
  const locations = [...new Set(published.map((e) => e.location))]

  const q = query.trim().toLowerCase()
  const filtered = published.filter(
    (e) =>
      (!q ||
        e.name.toLowerCase().includes(q) ||
        e.brand.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)) &&
      (!category || e.categoryId === category) &&
      (!location || e.location === location) &&
      (!level || e.level === level) &&
      (!maxPrice || e.pricePerDay <= Number(maxPrice)) &&
      (!availableOnly || e.available) &&
      (!operatorOnly || e.withOperator),
  )

  return (
    <>
      <PageHero
        label="À louer"
        title="Des engins inspectés, disponibles."
        subtitle={`${filtered.length} engin${filtered.length > 1 ? 's' : ''} vérifié${filtered.length > 1 ? 's' : ''} et publié${filtered.length > 1 ? 's' : ''}. Chaque machine a été contrôlée sur place avant d’entrer au catalogue.`}
      />

      <Section tone="light" className="pt-12">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="h-fit w-full shrink-0 rounded-lg border border-papier-200 bg-papier-50 p-5 lg:w-64">
            <div className="volta-display mb-4 text-xl text-acier-900">Filtres</div>

            <label className={LABEL} htmlFor="cat-q">
              Recherche
            </label>
            <input
              id="cat-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pelle, grue, camion…"
              className={`${FIELD} mb-4`}
            />

            <label className={LABEL} htmlFor="cat-cat">
              Catégorie
            </label>
            <select
              id="cat-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${FIELD} mb-4`}
            >
              <option value="">Toutes</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className={LABEL} htmlFor="cat-loc">
              Localisation
            </label>
            <select
              id="cat-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${FIELD} mb-4`}
            >
              <option value="">Toutes</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <label className={LABEL} htmlFor="cat-level">
              Niveau de vérification
            </label>
            <select
              id="cat-level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={`${FIELD} mb-4`}
            >
              <option value="">Tous</option>
              <option value="BASIC">Basic</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
            </select>

            <label className={LABEL} htmlFor="cat-price">
              Prix max / jour (FCFA)
            </label>
            <input
              id="cat-price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="ex : 300000"
              className={`${FIELD} mb-4`}
            />

            <label className="mb-2 flex items-center gap-2 text-sm text-acier-900">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="accent-btp-500"
              />
              Disponible uniquement
            </label>
            <label className="flex items-center gap-2 text-sm text-acier-900">
              <input
                type="checkbox"
                checked={operatorOnly}
                onChange={(e) => setOperatorOnly(e.target.checked)}
                className="accent-btp-500"
              />
              Avec opérateur
            </label>
          </aside>

          <div className="flex-1">
            {filtered.length === 0 ? (
              <EmptyState
                title="Aucun engin ne correspond aux filtres"
                subtitle="Essayez d'élargir vos critères de recherche."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((e, i) => {
                  const cat = categories.find((c) => c.id === e.categoryId)
                  const supplier = users.find((u) => u.id === e.supplierId)
                  return (
                    <Reveal key={e.id} delay={(i % 3) * 0.06}>
                      <Link
                        to={`/equipment/${e.id}`}
                        className="block h-full overflow-hidden rounded-lg border border-papier-200 bg-white shadow-xs transition hover:border-btp-300 hover:shadow-md"
                      >
                        <img
                          loading="lazy"
                          src={e.photos[0]}
                          alt={e.name}
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-acier-900">{e.name}</div>
                            <LevelBadge level={e.level} />
                          </div>
                          <div className="mt-1 text-xs text-papier-600">
                            {cat?.name} · {e.brand} {e.model} · {e.year}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-papier-600">
                            <MapPin size={12} className="shrink-0 text-papier-300" />
                            {e.location} · {supplier?.company}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-bold text-btp-600">
                              {fmtPrice(e.pricePerDay)} / jour
                            </span>
                            <span
                              className={`text-xs font-medium ${e.available ? 'text-emerald-600' : 'text-red-500'}`}
                            >
                              {e.available ? 'Disponible' : 'Indisponible'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-papier-600">
                            {e.withOperator ? 'Avec opérateur' : 'Sans opérateur'}
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
