import { Link } from 'react-router-dom'
import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'
import { modules } from '../../data/content'

export function PlateformePage() {
  return (
    <>
      <PageHero
        label="Plateforme"
        title={
          <>
            Une plateforme modulaire pour une <span className="text-brand">cybersécurité 360°</span>
          </>
        }
        subtitle="Dix modules unifiés, pilotés par l'IA, qui partagent les mêmes données : une information entre une seule fois dans CYBERAS puis elle est réutilisée partout."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <FadeIn key={m.slug} delay={(i % 3) * 0.06}>
              <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <m.icon size={22} className="text-brand" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-text-on-light">{m.title}</h2>
                <p className="mt-2 flex-1 text-sm text-text-on-light-muted">{m.description}</p>
                <Link to="/demo" className="mt-5 text-sm font-semibold text-brand hover:underline">
                  Voir en démo →
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  )
}
