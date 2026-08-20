import { useState, type FormEvent } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { PageHero, FadeIn } from '../../components/marketing/Shared'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <PageHero
        label="Contact"
        title={
          <>
            Parlons de votre <span className="text-brand">sécurité</span>
          </>
        }
        subtitle="Une question sur la plateforme, les tarifs ou un besoin spécifique ? Notre équipe vous répond sous 24h ouvrées."
      />
      <section className="bg-bg-light px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <FadeIn>
            <div className="space-y-6">
              {[
                { icon: MapPin, label: 'Adresse', value: "Abidjan, Côte d'Ivoire" },
                { icon: Mail, label: 'Email', value: 'contact@cyberas.ci' },
                { icon: Phone, label: 'Téléphone', value: '+225 XX XX XX XX XX' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                    <c.icon size={20} className="text-brand" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-text-on-light">{c.label}</span>
                    <span className="block text-sm text-text-on-light-muted">{c.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            {sent ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-xs">
                <p className="text-lg font-semibold text-text-on-light">
                  Merci ! Votre message a bien été envoyé. Nous revenons vers vous très vite.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-text-on-light">
                    Nom complet
                    <input
                      required
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                      placeholder="Ex. Armand T."
                    />
                  </label>
                  <label className="text-sm font-medium text-text-on-light">
                    Email professionnel
                    <input
                      required
                      type="email"
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                      placeholder="vous@entreprise.ci"
                    />
                  </label>
                </div>
                <label className="mt-4 block text-sm font-medium text-text-on-light">
                  Entreprise
                  <input
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                    placeholder="Nom de votre organisation"
                  />
                </label>
                <label className="mt-4 block text-sm font-medium text-text-on-light">
                  Message
                  <textarea
                    required
                    rows={5}
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-text-on-light focus:border-brand focus:outline-none"
                    placeholder="Décrivez votre besoin..."
                  />
                </label>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Envoyer le message →
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>
    </>
  )
}
