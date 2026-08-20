import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MonitorPlay, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHero, FadeIn, SectionLabel } from '../../components/marketing/Shared'
import { demoTourSteps, modules } from '../../data/content'

function InteractiveTour() {
  const [step, setStep] = useState(0)
  const current = demoTourSteps[step]

  return (
    <div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <SectionLabel>Démo interactive</SectionLabel>
        <span className="text-xs text-text-on-dark-muted">
          Étape {step + 1} / {demoTourSteps.length}
        </span>
      </div>
      <div className="mt-4 flex h-56 items-center justify-center rounded-lg border border-border-dark bg-bg-dark">
        <div className="text-center">
          <MonitorPlay size={40} className="mx-auto text-brand" />
          <h3 className="mt-4 text-xl font-bold text-white">{current.title}</h3>
        </div>
      </div>
      <p className="mt-4 min-h-12 text-sm text-text-on-dark-muted">{current.description}</p>
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 rounded-md border border-border-dark px-4 py-2 text-sm font-semibold text-text-on-dark disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Précédent
        </button>
        <div className="flex gap-1.5">
          {demoTourSteps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Aller à l'étape ${i + 1}`}
              className={`h-2 w-2 rounded-full ${i === step ? 'bg-brand' : 'bg-border-dark-hover'}`}
            />
          ))}
        </div>
        {step < demoTourSteps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(demoTourSteps.length - 1, s + 1))}
            className="flex items-center gap-1 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Suivant <ChevronRight size={16} />
          </button>
        ) : (
          <Link
            to="/app"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Accéder à la solution →
          </Link>
        )}
      </div>
    </div>
  )
}

function ExpertForm() {
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border-dark bg-surface-dark p-8 text-center shadow-xl">
        <CalendarClock size={40} className="text-brand" />
        <h3 className="mt-4 text-xl font-bold text-white">Demande envoyée !</h3>
        <p className="mt-3 max-w-sm text-sm text-text-on-dark-muted">
          Un expert CYBERAS vous recontacte sous 24h ouvrées pour planifier votre démonstration personnalisée.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-xl">
      <SectionLabel>Démo avec un expert</SectionLabel>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-text-on-dark">
          Nom complet
          <input
            required
            className="mt-1.5 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="Ex. Armand T."
          />
        </label>
        <label className="text-sm font-medium text-text-on-dark">
          Email professionnel
          <input
            required
            type="email"
            className="mt-1.5 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="vous@entreprise.ci"
          />
        </label>
        <label className="text-sm font-medium text-text-on-dark">
          Entreprise
          <input
            required
            className="mt-1.5 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="Votre organisation"
          />
        </label>
        <label className="text-sm font-medium text-text-on-dark">
          Secteur
          <select className="mt-1.5 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white focus:border-brand focus:outline-none">
            <option>Banque / Finance</option>
            <option>Télécoms / IT</option>
            <option>Énergie / Utilities</option>
            <option>Industrie</option>
            <option>Administration</option>
            <option>Santé</option>
            <option>Éducation</option>
            <option>Autre</option>
          </select>
        </label>
      </div>
      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-text-on-dark">Modules qui vous intéressent</legend>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {modules.slice(0, 6).map((m) => (
            <label key={m.slug} className="flex items-center gap-2 text-xs text-text-on-dark-muted">
              <input type="checkbox" className="accent-brand" /> {m.title}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        className="mt-6 w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Planifier ma démo →
      </button>
    </form>
  )
}

export function DemoPage() {
  return (
    <>
      <PageHero
        label="Démonstration"
        title={
          <>
            Découvrez CYBERAS Intelligence <span className="text-brand">en action</span>
          </>
        }
        subtitle="Explorez la plateforme immédiatement avec le tour guidé, ou planifiez une démonstration personnalisée avec un expert."
      />
      <section className="bg-bg-dark px-4 pb-24 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <FadeIn>
            <InteractiveTour />
          </FadeIn>
          <FadeIn delay={0.1}>
            <ExpertForm />
          </FadeIn>
        </div>
        <FadeIn className="mt-10 text-center">
          <Link to="/app" className="text-sm font-semibold text-brand hover:underline">
            Déjà client ? Accéder directement à la solution →
          </Link>
        </FadeIn>
      </section>
    </>
  )
}
