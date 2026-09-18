import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  HardHat,
  Search,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Les engins qui défilent en bandeau : ceux déjà présents dans le dépôt. */
const SHOWCASE = [
  { src: '/engins/pelle-cat-336e.jpeg', label: 'Pelle hydraulique CAT 336E', tag: 'À louer · Gold' },
  { src: '/engins/camion-kamaz.jpeg', label: 'Camion benne Kamaz 65115', tag: 'À vendre · 32 M FCFA' },
  { src: '/engins/grue-mobile.jpeg', label: 'Grue mobile Liebherr', tag: 'À louer · Silver' },
  { src: '/engins/groupe-mobile.jpeg', label: 'Groupe électrogène Atlas Copco', tag: 'À vendre · Neuf' },
]

/** Ce que couvre la plateforme, inscrit dans le décor, hors de la bande du titre. */
const KEYWORDS = [
  { text: 'Location d’engins', top: '14%', left: '58%', delay: '0s', duration: '9s' },
  { text: 'Volta Market · Vente', top: '30%', left: '84%', delay: '1.2s', duration: '11s' },
  { text: 'Inspection 18 points', top: '78%', left: '4%', delay: '2.1s', duration: '10s' },
  { text: 'Techniciens qualifiés', top: '88%', left: '60%', delay: '0.6s', duration: '12s' },
  { text: 'Qualification GOLD', top: '6%', left: '8%', delay: '1.8s', duration: '13s' },
]

const STREAMS = [
  { top: '18%', duration: '14s', delay: '0s' },
  { top: '46%', duration: '19s', delay: '4s' },
  { top: '72%', duration: '16s', delay: '8s' },
]

/** Les quatre gestes les plus fréquents, à un clic du titre. */
const QUICK: { icon: LucideIcon; label: string; to: string }[] = [
  { icon: Truck, label: 'Louer', to: '/catalogue' },
  { icon: ShoppingCart, label: 'Acheter', to: '/market' },
  { icon: Wrench, label: 'Trouver un technicien', to: '/demande/technicien' },
  { icon: HardHat, label: 'Rejoindre l’équipe', to: '/recrutement' },
]

/**
 * Couverture d'accueil.
 *
 * Elle annonce l'ensemble — location, vente, expertise, recrutement — et
 * propose deux premiers gestes : dire ce qu'on veut faire, ou aller voir ce
 * qui est à vendre. Le Market est mis en avant parce qu'ici on vend : c'est
 * l'entrée qui convertit un visiteur en acheteur.
 *
 * Le visuel tourne seul et alterne engins à louer et engins à vendre, avec
 * l'étiquette qui le dit : la plateforme se montre, elle ne se raconte pas.
 */
export default function Hero() {
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const navigate = useNavigate()

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

      {/* Décor : grille, flux, halo, mots-clés. */}
      <div aria-hidden className="volta-grid pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {STREAMS.map((s) => (
          <span
            key={s.top}
            className="volta-stream"
            style={{ top: s.top, animationDuration: s.duration, animationDelay: s.delay }}
          />
        ))}
        {KEYWORDS.map((k) => (
          <span
            key={k.text}
            className="volta-keyword hidden lg:block"
            style={{ top: k.top, left: k.left, animationDuration: k.duration, animationDelay: k.delay }}
          >
            {k.text}
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-btp-500/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 lg:min-h-[calc(100vh-64px)] lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="volta-enter inline-flex items-center gap-2 rounded-full bg-btp-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-btp-300 ring-1 ring-btp-500/30">
              <ShieldCheck size={14} />
              Volta × Génie Sélect · Côte d’Ivoire
            </span>

            <h1 className="volta-display volta-enter volta-delay-1 mt-6 text-5xl text-white md:text-7xl">
              Une pelle pour lundi,
              <br />
              un mécanicien pour
              <br />
              <span className="text-btp-400">la panne de ce matin.</span>
            </h1>

            <p className="volta-enter volta-delay-2 mt-6 max-w-lg text-lg leading-relaxed text-acier-200">
              VOLTA loue, vend et fait vérifier des engins en Côte d’Ivoire. Génie Sélect inspecte
              les machines sur place, sélectionne les techniciens, et répond à votre demande — une
              personne, pas un formulaire perdu.
            </p>

            <form
              onSubmit={handleSearch}
              className="volta-enter volta-delay-3 mt-8 flex max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-white/10"
            >
              <div className="flex flex-1 items-center px-4">
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pelle, camion benne, grue, groupe électrogène…"
                  aria-label="Rechercher sur Volta"
                  className="ml-2 w-full flex-1 py-3.5 text-sm text-acier-900 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 bg-btp-500 px-6 font-bold text-white transition hover:bg-btp-600"
              >
                Chercher
              </button>
            </form>

            <div className="volta-enter volta-delay-3 mt-4 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-acier-100 transition hover:border-btp-400 hover:bg-btp-500 hover:text-white"
                >
                  <q.icon size={13} />
                  {q.label}
                </Link>
              ))}
            </div>

            <div className="volta-enter volta-delay-4 mt-7 flex flex-wrap gap-3">
              <Link
                to="/market"
                className="inline-flex items-center gap-2 rounded-xl bg-btp-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-btp-500/20 transition hover:bg-btp-600"
              >
                <ShoppingCart size={16} />
                Voir Volta Market
              </Link>
              <a
                href="#intentions"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-btp-400 hover:bg-white/10"
              >
                Que recherchez-vous ?
                <ArrowDown size={16} />
              </a>
            </div>

            {/* Trois chiffres alignés sous un slogan, c'est la signature de
                n'importe quelle page d'accueil. Une phrase suffit à dire la
                même chose, et elle se retient. */}
            <p className="volta-enter volta-delay-4 mt-10 max-w-lg border-t border-white/10 pt-6 text-sm leading-relaxed text-acier-300">
              Dix-huit points de contrôle sur chaque machine, avant qu’elle soit proposée. Aucune
              commission prélevée au passage. Un seul interlocuteur du premier appel à la remise
              des clés.
            </p>
          </div>

          <div className="volta-enter volta-delay-2 relative">
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
                    e.currentTarget.src = '/engins/pelle-cat-336e.jpeg'
                  }}
                />
              ))}

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-acier-900/95 via-acier-900/50 to-transparent p-4 pt-16">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-acier-900">
                    <BadgeCheck size={14} className="text-emerald-600" />
                    {SHOWCASE[slide].label}
                  </span>
                  <div className="mt-2 text-sm font-semibold text-btp-300">{SHOWCASE[slide].tag}</div>
                </div>
                <Link
                  to={SHOWCASE[slide].tag.startsWith('À vendre') ? '/market' : '/catalogue'}
                  className="inline-flex items-center gap-1 rounded-lg bg-btp-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-btp-600"
                >
                  Voir
                  <ArrowRight size={13} />
                </Link>
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
