import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card } from '../../components/ui'
import { ProductCard, Reveal, TierBadge, TIER_ORDER } from '../../components/product'
import { IconDisplay } from '../../components/IconDisplay'
import { IconMapPin, IconEnvelope, IconCheck, IconHeart } from '../../components/Icons'

interface CounterStats {
  users: number
  equipment: number
  transactions: number
}

function SectionHeader({
  title,
  subtitle,
  link,
}: {
  title: string
  subtitle?: string
  link?: { to: string; label: string }
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
      </div>
      {link && (
        <Link
          to={link.to}
          className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:inline-flex"
        >
          {link.label}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const { equipment, categories, users, getRating } = useStore()
  const navigate = useNavigate()
  const [counters, setCounters] = useState<CounterStats>({ users: 0, equipment: 0, transactions: 0 })
  const [showModal, setShowModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    const finalStats = { users: 1200, equipment: 489, transactions: 5430 }
    const duration = 2000
    const frameRate = 30
    const steps = duration / (1000 / frameRate)
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      const progress = Math.min(currentStep / steps, 1)
      setCounters({
        users: Math.floor(finalStats.users * progress),
        equipment: Math.floor(finalStats.equipment * progress),
        transactions: Math.floor(finalStats.transactions * progress),
      })
      if (currentStep >= steps) clearInterval(interval)
    }, 1000 / frameRate)

    return () => clearInterval(interval)
  }, [])

  const published = useMemo(() => equipment.filter((e) => e.status !== 'INDISPONIBLE'), [equipment])

  const searchResults = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return []
    return published.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.brand.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q),
    )
  }, [searchInput, published])

  const goldSelection = published.filter((e) => e.tier === 'GOLD')
  const mostLiked = [...published].sort((a, b) => b.likes - a.likes).slice(0, 3)
  const newest = [...published].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)
  const recommended = [...published]
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || getRating(b.id).average - getRating(a.id).average)
    .slice(0, 3)
  const suppliers = users.filter((u) => u.role === 'SUPPLIER')

  return (
    <div>
      {/* Immersive Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          src="https://picsum.photos/seed/volta-hero/1600/800"
          alt="Engins de chantier"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-100 ring-1 ring-white/20 backdrop-blur">
            Marketplace d'équipements industriels • Côte d'Ivoire
          </div>
          <h1 className="animate-fade-up mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl" style={{ animationDelay: '100ms' }}>
            Trouvez le bon équipement.
            <span className="block bg-gradient-to-r from-accent-500 to-amber-300 bg-clip-text text-transparent">
              Au bon moment.
            </span>
          </h1>
          <p className="animate-fade-up mt-5 max-w-2xl text-lg text-slate-300" style={{ animationDelay: '200ms' }}>
            Des engins inspectés, certifiés et notés. VOLTA connecte les chantiers de Côte d'Ivoire
            aux fournisseurs vérifiés.
          </p>

          {/* Central search */}
          <div className="animate-fade-up relative mt-10 max-w-2xl" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/30">
              <IconCheck className="h-5 w-5 ml-2 text-slate-400" />
              <input
                type="text"
                placeholder="Pelle hydraulique, bulldozer, grue…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/catalogue')
                }}
                className="w-full bg-transparent py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <Link
                to="/catalogue"
                className="shrink-0 rounded-xl bg-accent-500 px-5 py-2.5 font-bold text-white transition hover:bg-accent-600 active:scale-95"
              >
                Rechercher
              </Link>
            </div>
            {searchInput && (
              <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {searchResults.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-slate-500">Aucun équipement trouvé.</div>
                ) : (
                  searchResults.slice(0, 6).map((e) => (
                    <Link
                      key={e.id}
                      to={`/equipment/${e.id}`}
                      className="flex items-center gap-3 border-b px-4 py-3 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <img src={e.photos[0]} alt="" className="h-12 w-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{e.name}</div>
                        <div className="text-xs text-slate-500">
                          {e.brand} • {e.location}
                        </div>
                      </div>
                      <TierBadge tier={e.tier} />
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Animated stats */}
          <div className="animate-fade-up mt-12 grid max-w-2xl grid-cols-3 gap-6" style={{ animationDelay: '400ms' }}>
            {[
              { icon: '/assets/users.svg', value: counters.users, label: 'Utilisateurs' },
              { icon: '/IMAGE1.jpg', value: counters.equipment, label: 'Équipements' },
              { icon: '/assets/award.svg', value: counters.transactions, label: 'Locations réussies' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-start">
                <img src={s.icon} alt={s.label} className="mb-2 h-6 w-6 text-white opacity-80" />
                <div className="text-3xl font-extrabold text-white md:text-4xl">
                  {s.value.toLocaleString('fr-FR')}+
                </div>
                <div className="mt-1 text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Features Section */}
        <section className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-4">
          {[
            { icon: 'check', title: 'Vérifiés', desc: 'Tous les équipements inspectés' },
            { icon: '/assets/star.svg', title: 'Notés', desc: 'Catégories A à E pour chaque équipement' },
            { icon: '/assets/heart.svg', title: 'Testés', desc: 'Par une communauté de clients vérifiés' },
            { icon: '/assets/warning.svg', title: 'Certifiés', desc: 'Avec rapports d\'inspection détaillés' },
          ].map((f, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 text-center shadow-sm transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                  <img src={f.icon} alt={f.title} className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </section>

        {/* Interactive categories */}
        <section className="mt-16">
          <Reveal>
            <SectionHeader
              title="Catégories"
              subtitle="Explorez les familles d'équipements disponibles en location."
              link={{ to: '/catalogue', label: 'Tout le catalogue' }}
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((c, idx) => (
              <Reveal key={c.id} delay={idx * 60}>
                <Link to={`/catalogue?categorie=${c.id}`} className="group block h-full">
                  <Card className="flex h-full flex-col items-center justify-center p-5 text-center transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-300 group-hover:shadow-lg">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-100 transition-transform duration-300 group-hover:scale-110">
                      <IconDisplay icon={c.icon} alt={c.name} className="h-14 w-14" />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-slate-800 transition group-hover:text-brand-600">
                      {c.name}
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Gold Selection */}
        <section className="mt-20">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <TierBadge tier="GOLD" size="lg" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Gold Selection</h2>
                <p className="mt-1 text-slate-500">Le meilleur de VOLTA : équipements premium, inspectés et plébiscités.</p>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {goldSelection.map((e, idx) => (
              <Reveal key={e.id} delay={idx * 80}>
                <ProductCard equipment={e} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Most liked */}
        <section className="mt-20">
          <Reveal>
            <SectionHeader
              title="Les plus appréciés"
              subtitle="Classement en temps réel par nombre de likes."
              link={{ to: '/catalogue', label: 'Voir tout' }}
            />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mostLiked.map((e, idx) => (
              <Reveal key={e.id} delay={idx * 80}>
                <div className="relative h-full">
                  <div className="absolute -left-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-extrabold text-white shadow-lg">
                    #{idx + 1}
                  </div>
                  <ProductCard equipment={e} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Popular suppliers */}
        <section className="mt-20">
          <Reveal>
            <SectionHeader
              title="Fournisseurs populaires"
              subtitle="Des partenaires certifiés VOLTA, vérifiés par nos équipes techniques."
              link={{ to: '/fournisseurs', label: 'Tous les fournisseurs' }}
            />
          </Reveal>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-4">
              {suppliers.map((s, idx) => {
                const supplierEquipment = published.filter((e) => e.supplierId === s.id)
                const totalLikes = supplierEquipment.reduce((sum, e) => sum + e.likes, 0)
                return (
                  <Reveal key={s.id} delay={idx * 80}>
                    <Link to="/fournisseurs" className="group block flex-shrink-0 w-80">
                      <Card className="flex h-full items-center gap-5 p-6 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-3xl font-extrabold text-white shadow-md">
                          {s.company.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 transition group-hover:text-brand-600 text-lg">{s.company}</div>
                          <div className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                            <IconMapPin className="w-4 h-4" />
                            {s.city}
                          </div>
                          <div className="mt-3 flex flex-col gap-2 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded">
                              <IconCheck className="w-4 h-4 text-slate-400" />
                              {supplierEquipment.length} équipements
                            </span>
                            <span className="text-rose-500 flex items-center gap-2 bg-rose-50 px-2 py-1 rounded">
                              <IconHeart filled={true} className="w-4 h-4" />
                              {totalLikes} j'aimes
                            </span>
                            <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-600 ring-1 ring-emerald-200 flex items-center gap-2">
                              <IconCheck className="w-3 h-3" />
                              Vérifié VOLTA
                            </span>
                          </div>
                        </div>
                        <span className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500 text-xl">→</span>
                      </Card>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* Newest */}
        <section className="mt-20">
          <Reveal>
            <SectionHeader
              title="Nouveautés"
              subtitle="Les équipements récemment ajoutés à la plateforme."
              link={{ to: '/catalogue', label: 'Voir tout' }}
            />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newest.map((e, idx) => (
              <Reveal key={e.id} delay={idx * 80}>
                <ProductCard equipment={e} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Recommended */}
        <section className="mt-20">
          <Reveal>
            <SectionHeader
              title="Recommandés pour vous"
              subtitle="Sélection basée sur les niveaux Gold et les meilleures notes."
            />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((e, idx) => (
              <Reveal key={e.id} delay={idx * 80}>
                <ProductCard equipment={e} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20 mt-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 p-10 text-white md:p-14">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
              <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold md:text-3xl">Prêt à équiper votre chantier ?</h3>
                  <p className="mt-2 max-w-xl text-brand-100">
                    Parcourez le catalogue, comparez les niveaux Gold, Silver et Basic, et demandez un
                    devis directement au fournisseur. Zéro commission.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link
                    to="/catalogue"
                    className="rounded-xl bg-white px-6 py-3 text-center font-bold text-brand-700 transition hover:bg-brand-50 active:scale-95"
                  >
                    Parcourir le catalogue
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-xl bg-accent-500 px-6 py-3 font-bold text-white transition hover:bg-accent-600 active:scale-95"
                  >
                    Nous contacter
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      {/* Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <Card className="w-full max-w-md p-8" >
            <div onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Nous contacter</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-3xl text-slate-400 hover:text-slate-600"
                >
                  <img src="/assets/close.svg" alt="✕" className="w-6 h-6" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Merci! Nous vous recontacterons bientôt.')
                  setShowModal(false)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-accent-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    placeholder="votre@email.ci"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-accent-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
                  <textarea
                    placeholder="Votre message..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-accent-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-accent-500 py-2.5 font-bold text-white transition hover:bg-accent-600 active:scale-95 flex items-center justify-center gap-2"
                >
                  <IconEnvelope className="w-4 h-4" />
                  Envoyer
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
