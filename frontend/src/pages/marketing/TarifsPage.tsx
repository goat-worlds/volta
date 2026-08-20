import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'
import { plans } from '../../data/content'

export function TarifsPage() {
  const [annual, setAnnual] = useState(false)

  const displayedPrice = (price: string) => {
    if (annual && /^\d/.test(price.replace(/\s/g, ''))) {
      const n = parseInt(price.replace(/\s/g, ''), 10)
      const discounted = Math.round(n * 0.8)
      return discounted.toLocaleString('fr-FR').replace(/\u202f/g, ' ')
    }
    return price
  }

  return (
    <>
      <PageHero
        label="Offres & Tarifs"
        title={
          <>
            Un plan pour chaque niveau de <span className="text-brand">maturité cyber</span>
          </>
        }
        subtitle="Tarifs en FCFA, TVA 18% en sus. Passez à l'annuel et économisez 20%."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-center">
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`rounded px-4 py-2 text-sm font-semibold ${!annual ? 'bg-brand text-white' : 'text-text-on-light-muted'}`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`rounded px-4 py-2 text-sm font-semibold ${annual ? 'bg-brand text-white' : 'text-text-on-light-muted'}`}
              >
                Annuel −20%
              </button>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col rounded-xl border bg-white p-7 shadow-md ${
                    p.recommended ? 'border-brand ring-1 ring-brand' : 'border-slate-200'
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                      ⭐ Recommandé
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-text-on-light">{p.name}</h2>
                  <p className="mt-1 text-sm text-text-on-light-muted">{p.description}</p>
                  <p className="mt-5">
                    <span className="text-3xl font-extrabold text-text-on-light">{displayedPrice(p.price)}</span>{' '}
                    <span className="text-sm text-text-on-light-muted">{p.period}</span>
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      to={p.name === 'Enterprise' ? '/contact' : `/inscription?plan=${p.name}`}
                      className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                      {p.name === 'Enterprise' ? 'Demander un devis →' : 'Commencer →'}
                    </Link>
                    <Link
                      to="/demo"
                      className="rounded-md border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-text-on-light transition-colors hover:border-slate-400"
                    >
                      Essayer gratuitement
                    </Link>
                  </div>
                  <ul className="mt-7 space-y-3">
                    {p.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-2.5 text-sm">
                        {f.included ? (
                          <Check size={16} className="mt-0.5 shrink-0 text-status-compliant" />
                        ) : (
                          <X size={16} className="mt-0.5 shrink-0 text-slate-300" />
                        )}
                        <span className={f.included ? 'text-text-on-light' : 'text-text-on-light-muted line-through'}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner />
    </>
  )
}
