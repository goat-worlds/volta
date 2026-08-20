import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner, SectionLabel } from '../../components/marketing/Shared'
import { sectors } from '../../data/content'

const sectorDetails = [
  {
    name: 'Finance',
    challenges: ['Conformité PCI-DSS', 'Protection des données sensibles', 'Fraude en temps réel'],
    features: ['Détection fraude IA', 'Conformité bancaire', 'Chiffrement renforcé'],
    color: 'from-blue-600 to-blue-400',
  },
  {
    name: 'Santé',
    challenges: ['Conformité HIPAA', 'Protection données patients', 'Disponibilité critique'],
    features: ['Conformité HIPAA', 'Audit trails complets', 'Récupération rapide'],
    color: 'from-green-600 to-emerald-400',
  },
  {
    name: 'Gouvernement',
    challenges: ['Sécurité nationale', 'Conformité réglementaire', 'Audit gouvernemental'],
    features: ['Certifications ANSSI', 'Traçabilité complète', 'Hébergement souverain'],
    color: 'from-slate-600 to-gray-400',
  },
  {
    name: 'Tech',
    challenges: ['Évolution rapide', 'Ressources limitées', 'Scalabilité'],
    features: ['API ouvertes', 'Intégrations agiles', 'DevSecOps'],
    color: 'from-orange-600 to-yellow-400',
  },
]

export function SolutionsPage() {
  return (
    <>
      <PageHero
        label="Solutions par secteur"
        title={
          <>
            Une solution adaptée à <span className="text-brand">votre métier</span>
          </>
        }
        subtitle="Chaque secteur a ses menaces, ses régulations et ses priorités. CYBERAS Intelligence s'adapte à votre contexte réglementaire et opérationnel."
      />

      {/* Sectors Grid */}
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sectors.map((s, i) => (
              <FadeIn key={s.title} delay={(i % 4) * 0.06}>
                <div className="group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-2xl hover:border-brand/50">
                  {/* Gradient background */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br from-brand to-brand-dark" />

                  {/* Content */}
                  <div className="relative p-6 space-y-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-bg-dark/10 to-bg-dark/5 group-hover:from-brand/20 group-hover:to-brand/10 transition-all">
                      <s.icon size={24} className="text-brand transition-transform group-hover:scale-110" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-text-on-light group-hover:text-brand transition">{s.title}</h3>
                      <p className="mt-2 text-sm text-text-on-light-muted">{s.description}</p>
                    </div>

                    <button className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark transition group/btn">
                      En savoir plus <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Solutions */}
      <section className="px-4 py-20 sm:px-6 bg-surface-light">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center mb-16">
            <SectionLabel>Solutions détaillées par secteur</SectionLabel>
            <h2 className="mt-4 text-4xl font-extrabold text-text-on-light">
              Nos réponses aux défis de votre industrie
            </h2>
          </FadeIn>

          <div className="space-y-12">
            {sectorDetails.map((sector, i) => (
              <FadeIn key={sector.name} delay={i * 0.08}>
                <div className="grid gap-8 lg:grid-cols-2 items-center">
                  {i % 2 === 0 ? (
                    <>
                      {/* Left: Content */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-3xl font-bold text-text-on-light">{sector.name}</h3>
                          <div className="mt-4 space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-text-on-light-muted uppercase tracking-wider mb-2">Défis</p>
                              <ul className="space-y-2">
                                {sector.challenges.map((c) => (
                                  <li key={c} className="flex items-center gap-2 text-text-on-light">
                                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-on-light-muted uppercase tracking-wider mb-2">Solutions</p>
                              <ul className="space-y-2">
                                {sector.features.map((f) => (
                                  <li key={f} className="flex items-center gap-2 text-text-on-light">
                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Visual */}
                      <div className={`hidden lg:flex h-96 rounded-xl bg-gradient-to-br ${sector.color} opacity-80 items-center justify-center text-white/80 font-semibold`}>
                        {sector.name}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Left: Visual */}
                      <div className={`hidden lg:flex h-96 rounded-xl bg-gradient-to-br ${sector.color} opacity-80 items-center justify-center text-white/80 font-semibold`}>
                        {sector.name}
                      </div>

                      {/* Right: Content */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-3xl font-bold text-text-on-light">{sector.name}</h3>
                          <div className="mt-4 space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-text-on-light-muted uppercase tracking-wider mb-2">Défis</p>
                              <ul className="space-y-2">
                                {sector.challenges.map((c) => (
                                  <li key={c} className="flex items-center gap-2 text-text-on-light">
                                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-on-light-muted uppercase tracking-wider mb-2">Solutions</p>
                              <ul className="space-y-2">
                                {sector.features.map((f) => (
                                  <li key={f} className="flex items-center gap-2 text-text-on-light">
                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 bg-bg-light">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <h2 className="text-3xl font-extrabold text-text-on-light">
              Votre secteur n'est pas listé ?
            </h2>
            <p className="mt-4 text-text-on-light-muted">
              CYBERAS Intelligence s'adapte à tous les secteurs. Contactez-nous pour discuter de votre cas spécifique.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 transition">
                Nous contacter <ArrowRight size={18} />
              </Link>
              <Link to="/demo" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:border-brand text-text-on-light hover:text-brand font-semibold px-6 py-3 transition">
                Demander une démo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
