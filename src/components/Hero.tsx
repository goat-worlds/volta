import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Search, ShieldCheck } from 'lucide-react'

/** Les engins qui défilent en bandeau : ceux déjà présents dans le dépôt. */
const SHOWCASE = [
  { src: '/engins/pelle-cat-336e.jpeg', label: 'Pelle hydraulique CAT 336E' },
  { src: '/engins/grue-mobile.jpeg', label: 'Grue mobile' },
  { src: '/engins/compacteur-cat.jpeg', label: 'Compacteur vibrant' },
  { src: '/engins/camion-kamaz.jpeg', label: 'Camion benne Kamaz' },
]

export default function Hero() {
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const navigate = useNavigate()

  // Le visuel tourne seul : une plateforme d'engins se montre, elle ne se
  // raconte pas. L'intervalle reste long pour ne pas happer le regard pendant
  // la saisie de la recherche.
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return
    const timer = setInterval(() => setSlide((s) => (s + 1) % SHOWCASE.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query ? `/catalogue?q=${encodeURIComponent(query)}` : '/catalogue')
  }

  return (
    <section className="relative overflow-hidden bg-acier-900">
      <div className="btp-hazard-stripe h-2 w-full" aria-hidden />

      {/* Halo ambré : la lumière d'un phare de chantier sur le châssis sombre. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-btp-500/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-btp-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-btp-300 ring-1 ring-btp-500/30">
              <ShieldCheck size={14} />
              Plateforme d’engins vérifiés
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight text-white md:text-5xl">
              Engins de chantier
              <br />
              <span className="text-btp-400">vérifiés.</span>
              <br />
              Trouvez le bon engin,
              <br />
              au bon moment.
            </h1>

            <p className="mt-6 max-w-lg text-lg text-acier-200">
              VOLTA référence, vérifie et publie des engins de chantier fiables. Comparez les
              équipements et trouvez des fournisseurs contrôlés en toute confiance.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-md overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10"
            >
              <div className="flex flex-1 items-center px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un engin, une catégorie…"
                  aria-label="Rechercher un engin"
                  className="ml-2 flex-1 py-3 text-sm text-acier-900 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-btp-500 px-6 font-bold text-white transition hover:bg-btp-600"
              >
                Chercher
              </button>
            </form>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                { value: '100%', label: 'Engins inspectés' },
                { value: '50+', label: 'Fournisseurs' },
                { value: '24/7', label: 'Support' },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-black text-btp-400">{s.value}</dt>
                  <dd className="mt-0.5 text-xs text-acier-300">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              {SHOWCASE.map((item, index) => (
                <img
                  key={item.src}
                  src={item.src}
                  alt={item.label}
                  aria-hidden={index !== slide}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                    index === slide ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={(e) => {
                    // Un visuel manquant ne doit pas laisser un cadre vide au
                    // centre de la page d'accueil.
                    e.currentTarget.src = '/engins/pelle-cat-336e.jpeg'
                  }}
                />
              ))}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-acier-900/90 to-transparent p-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-acier-900">
                  <BadgeCheck size={14} className="text-emerald-600" />
                  {SHOWCASE[slide].label}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-1.5">
              {SHOWCASE.map((item, index) => (
                <button
                  key={item.src}
                  onClick={() => setSlide(index)}
                  aria-label={`Voir ${item.label}`}
                  aria-current={index === slide}
                  className={`h-1.5 rounded-full transition-all ${
                    index === slide ? 'w-8 bg-btp-400' : 'w-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
