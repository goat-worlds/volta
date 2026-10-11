import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronDown, MapPin } from 'lucide-react'
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
  const [level, setLevel] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  /* Fermé d'emblée : on ouvre un catalogue pour voir des engins, pas des
     champs. Ignoré au-delà de `lg`, où la colonne ne gêne personne. */
  const [filtresOuverts, setFiltresOuverts] = useState(false)

  /* Le nombre de filtres posés, montré sur le bouton replié : sans lui, on ne
     sait pas pourquoi la liste est courte. */
  const actifs = [query, category, level, maxPrice].filter(Boolean).length + (availableOnly ? 1 : 0)

  const published = equipment.filter((e) => e.status === 'PUBLISHED')

  const q = query.trim().toLowerCase()
  const filtered = published.filter(
    (e) =>
      (!q ||
        e.name.toLowerCase().includes(q) ||
        e.brand.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)) &&
      (!category || e.categoryId === category) &&
      (!level || e.level === level) &&
      (!maxPrice || e.pricePerDay <= Number(maxPrice)) &&
      (!availableOnly || e.available),
  )

  return (
    <>
      {/* Un bandeau réduit à ce qu'il annonce.
          
          Il portait la marche à suivre en trois étapes et un paragraphe sur ce
          que VOLTA fait ensuite. Utile, mais posé avant le premier engin : on
          arrivait sur un catalogue et l'on lisait un mode d'emploi. Celui qui
          vient ici cherche une machine — elle doit être à l'écran tout de
          suite. Les explications ont été descendues sous la liste, où elles
          répondent à qui a regardé et hésite encore. */}
      <PageHero
        compact
        label="À louer"
        title="Des équipements disponibles."
        subtitle={`${filtered.length} équipement${filtered.length > 1 ? 's' : ''} en ligne.`}
      />

      <Section tone="light" className="pt-12">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Les filtres se replient sur téléphone.
              
              Le panneau faisait 400 px de haut, empilé au-dessus de la grille :
              la première vignette arrivait à 704 px sur un écran de 844, c'est
              à dire que l'on ouvrait un catalogue sans voir un engin. Or on
              vient d'abord regarder, et l'on filtre ensuite — rarement, et
              seulement quand il y a trop à voir.
              
              Replié par défaut sous `lg`, toujours ouvert au-dessus : sur un
              grand écran la colonne ne prend la place de personne. */}
          <aside className="h-fit w-full shrink-0 rounded-lg border border-papier-200 bg-papier-50 lg:w-64">
            <button
              type="button"
              onClick={() => setFiltresOuverts((v) => !v)}
              aria-expanded={filtresOuverts}
              aria-controls="cat-filtres"
              className="flex w-full items-center justify-between gap-2 p-4 text-left lg:hidden"
            >
              <span className="volta-display text-lg text-acier-900">
                Filtres
                {actifs > 0 && (
                  <span className="ml-2 rounded-full bg-btp-500 px-2 py-0.5 text-xs font-bold text-white">
                    {actifs}
                  </span>
                )}
              </span>
              <ChevronDown
                size={18}
                aria-hidden
                className={`shrink-0 text-papier-600 transition ${filtresOuverts ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              id="cat-filtres"
              className={`px-5 pb-5 lg:block lg:pt-5 ${filtresOuverts ? 'block' : 'hidden'}`}
            >
            <div className="volta-display mb-4 hidden text-xl text-acier-900 lg:block">Filtres</div>

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
              <option value="BASIC">Basique</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
            </select>

            <label className={LABEL} htmlFor="cat-price">
              Prix max / heure (FCFA)
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
            </div>
          </aside>

          <div className="flex-1">
            {filtered.length === 0 ? (
              <EmptyState
                title="Aucun engin ne correspond aux filtres"
                subtitle="Essayez d'élargir vos critères de recherche."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
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
                          src={e.photos[0] || '/images/placeholders/equipment.svg'}
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
                              {fmtPrice(e.pricePerDay)} / heure
                            </span>
                            <span
                              className={`text-xs font-medium ${e.available ? 'text-emerald-600' : 'text-red-500'}`}
                            >
                              {e.available ? 'Disponible' : 'Indisponible'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-papier-600">
                            Avec opérateur
                          </div>

                          {/* L'action, écrite noir sur blanc sur chaque carte :
                              une vignette cliquable ne dit pas d'elle-même
                              qu'elle est cliquable, ni ce qu'elle ouvre. */}
                          <div className="mt-3 flex items-center justify-between border-t border-papier-100 pt-3">
                            <span className="text-sm font-bold text-btp-600">
                              Sélectionner cet engin
                            </span>
                            <span
                              aria-hidden
                              className="grid size-7 place-items-center rounded-full bg-btp-500 text-white"
                            >
                              <ArrowRight size={14} />
                            </span>
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

      {/* Le mot de confiance, après le matériel. Il ouvrait la page en pleine
          hauteur : on arrivait sur un catalogue et le premier écran d'un
          téléphone ne montrait pas un seul engin. Celui qui descend jusqu'ici a
          vu le parc — c'est le moment où savoir qui le qualifie l'intéresse. */}
      <Section tone="muted">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="volta-display text-3xl text-acier-900 sm:text-4xl">
            Des équipements qualifiés.
          </h2>
          {/* La marche à suivre, dite en une phrase.
            
            La page listait des engins sans dire quoi en faire : on cliquait une
            carte pour découvrir qu'elle menait à une fiche, et la fiche pour
            découvrir qu'on pouvait y demander un prix. Ceux qui viennent ici
            conduisent des engins, ils ne devinent pas une interface. */}
        <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-papier-700">
          {['Choisissez un engin dans la liste', 'Ouvrez sa fiche', 'Demandez votre devis'].map(
            (etape, i) => (
              <li key={etape} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden className="text-papier-300">
                    →
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-papier-200">
                  <span className="grid size-4 place-items-center rounded-full bg-btp-500 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  {etape}
                </span>
              </li>
            ),
          )}
        </ol>
        <p className="mt-3 text-sm text-papier-600">
          VOLTA s’occupe du reste : nous contactons le propriétaire et revenons vers vous. Pas
          besoin de compte.
        </p>

          <p className="mt-4 text-lg leading-relaxed text-papier-700">
            VOLTA s’appuie sur des contrôles techniques et documentaires avant de présenter un
            équipement. La mention portée par chaque fiche — Basique, Silver ou Gold — indique
            jusqu’où ce contrôle a été mené.
          </p>
          <p className="mt-4 text-papier-700">
            Vous ne trouvez pas ce qu’il vous faut ? Décrivez votre besoin, nous le cherchons pour
            vous.
          </p>
          <Link
            to="/demande/location"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-btp-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-btp-600"
          >
            Décrire mon besoin
            <ArrowRight size={15} aria-hidden />
          </Link>
        </Reveal>
      </Section>
    </>
  )
}
