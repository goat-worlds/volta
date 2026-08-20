import { Bot } from 'lucide-react'
import { PageHero, FadeIn, CtaBanner } from '../../components/marketing/Shared'
import { agents } from '../../data/content'

export function AgentsIaPage() {
  return (
    <>
      <PageHero
        label="Agents IA"
        title={
          <>
            Des agents IA spécialisés qui travaillent <span className="text-brand">pour vous</span>
          </>
        }
        subtitle="Chaque agent est expert d'une phase de l'audit. Ensemble, ils automatisent la collecte, l'analyse, la conformité et la remédiation — sous validation humaine systématique."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a, i) => (
            <FadeIn key={a.title} delay={(i % 3) * 0.06}>
              <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <Bot size={22} className="text-brand" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-text-on-light">{a.title}</h2>
                <p className="mt-2 text-sm text-text-on-light-muted">{a.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="mx-auto mt-12 max-w-3xl">
          <p className="rounded-lg border border-slate-200 bg-surface-light p-5 text-center text-sm text-text-on-light-muted">
            Chaque suggestion d'un agent IA cite sa source et n'est jamais appliquée sans validation explicite d'un
            auditeur humain — la traçabilité est au cœur de la plateforme.
          </p>
        </FadeIn>
      </section>
      <CtaBanner />
    </>
  )
}
