import { ArrowRight, TrendingDown, DollarSign, Shield, Eye } from 'lucide-react'
import { FadeIn, CtaBanner } from '../../components/marketing/Shared'

const caseStudies = [
  {
    icon: TrendingDown,
    label: 'SERVICE FINANCIER',
    title: 'Réduction de 65% des risques critiques en 6 mois',
    description: 'Une banque de premier plan a réduit significativement son exposition aux risques critiques et a renforcé sa conformité.',
    stats: [
      { value: '-65%', label: 'Risques majeurs' },
      { value: '180h', label: 'Gain de temps/trimestre' },
    ],
    bg: 'from-blue-600/20 to-purple-600/20',
  },
  {
    icon: DollarSign,
    label: 'INDUSTRIE',
    title: '50% d\'économies sur les coûts de sécurité',
    description: 'Un groupe industriel international a optimisé ses ressources en amélioration des efficacités.',
    stats: [
      { value: '-50%', label: 'Coûts opérationnels' },
      { value: '3x', label: 'Détection rapide' },
    ],
    bg: 'from-orange-600/20 to-red-600/20',
  },
  {
    icon: Shield,
    label: 'SANTÉ',
    title: 'Conformité HIPAA atteinte 100%',
    description: 'Un établissement de santé sécurisé ses données patients et passe tous les audits externes.',
    stats: [
      { value: '100%', label: 'Conforme' },
      { value: '0', label: 'Non-conformité' },
    ],
    bg: 'from-green-600/20 to-emerald-600/20',
  },
  {
    icon: Eye,
    label: 'GOUVERNEMENT',
    title: 'Visibilité 360° sur l\'ensemble du SI',
    description: 'Une administration centralise sa visibilité sur tous les actifs et menaces potentielles.',
    stats: [
      { value: '360°', label: 'Visibilité complète' },
      { value: '70%', label: 'Temps de réponse ↓' },
    ],
    bg: 'from-slate-600/20 to-blue-600/20',
  },
]

export function CaseStudiesPage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-bg-dark px-4 py-20 sm:px-6">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl text-center">
          <FadeIn>
            <span className="inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand mb-4">
              DES CLIENTS QUI ONT TRANSFORMÉ LEUR SÉCURITÉ
            </span>
            <h1 className="mt-6 text-5xl font-extrabold text-white leading-tight">
              Des succès mesurables dans <span className="text-brand">tous les secteurs</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-text-on-dark-muted">
              Découvrez comment les organisations réduisent leurs risques, améliorent leur conformité et transforment leur posture de sécurité
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2">
            {caseStudies.map((study, i) => (
              <FadeIn key={study.title} delay={i * 0.1}>
                <div className={`group relative overflow-hidden rounded-2xl border border-border-dark bg-gradient-to-br ${study.bg} p-8 transition-all hover:border-brand/50 hover:shadow-2xl hover:shadow-brand/10`}>
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20">
                        <study.icon size={20} className="text-brand" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand">{study.label}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white">{study.title}</h3>
                    <p className="text-text-on-dark-muted">{study.description}</p>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      {study.stats.map((stat) => (
                        <div key={stat.label} className="rounded-lg bg-white/5 border border-border-dark p-3">
                          <div className="text-2xl font-extrabold text-brand">{stat.value}</div>
                          <div className="text-xs text-text-on-dark-muted mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark transition group/btn">
                      Lire l'étude de cas <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="px-4 py-20 sm:px-6 bg-surface-light">
        <div className="mx-auto max-w-7xl">
          <FadeIn className="text-center mb-12">
            <span className="inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand mb-4">
              RESSOURCES
            </span>
            <h2 className="text-4xl font-extrabold text-text-on-light">
              Apprenez, partagez, restez à la pointe
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-text-on-light-muted">
              Accédez à nos guides, webinaires, articles et cas clients pour approfondir votre expertise
            </p>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[
              { title: 'Livre blanc', subtitle: 'L\'IA au service de votre cybersécurité', icon: '📘', color: 'from-red-600 to-pink-600' },
              { title: 'Webinaire', subtitle: 'Détection avancée : quelles bonnes pratiques ?', icon: '🎓', color: 'from-blue-600 to-cyan-600' },
              { title: 'Blog', subtitle: 'Ransomware 2024 : tendances et prévention', icon: '📰', color: 'from-red-600 to-orange-600' },
              { title: 'Cas client', subtitle: 'Comment nous avons aidé un grand groupe à réduire les risques', icon: '📊', color: 'from-slate-600 to-gray-600' },
              { title: 'Guide pratique', subtitle: 'Réaliser un audit de sécurité efficace en 2024', icon: '✓', color: 'from-teal-600 to-green-600' },
            ].map((resource, i) => (
              <FadeIn key={resource.title} delay={i * 0.05}>
                <button className={`group relative h-64 rounded-xl overflow-hidden transition-all hover:shadow-2xl`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${resource.color} opacity-80 group-hover:opacity-100 transition`} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />

                  <div className="relative h-full flex flex-col items-center justify-center text-center px-4 gap-3 group-hover:gap-4 transition-all">
                    <span className="text-5xl">{resource.icon}</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{resource.title}</h3>
                      <p className="text-white/80 text-sm mt-1">{resource.subtitle}</p>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  )
}
