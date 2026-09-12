import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AUDIENCE_LABELS, AUDIENCE_ORDER, intentsFor, type Intent } from '../../lib/intents'

/**
 * « Que souhaitez-vous faire ? »
 *
 * C'est l'entrée unique du site. L'accueil affichait des catégories d'engins :
 * utile à qui sait déjà qu'il veut une pelle, muet pour qui a un besoin à
 * formuler — et sans issue pour l'entreprise venue présenter son catalogue ou
 * le mécanicien venu déposer son CV. Les huit parcours sont désormais offerts
 * ensemble, chacun menant à son formulaire.
 *
 * La carte entière est cliquable : sur un téléphone, viser un lien de trois
 * mots sous un paragraphe est une épreuve. La flèche indique la cible sans être
 * elle-même la seule zone active.
 */

function IntentCard({ intent }: { intent: Intent }) {
  const { icon: Icon } = intent

  return (
    <Link
      to={intent.to}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-btp-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btp-400 focus-visible:ring-offset-2"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-acier-900 text-btp-400 transition group-hover:bg-btp-500 group-hover:text-white">
        <Icon size={22} />
      </span>

      <h3 className="mt-5 text-lg font-bold leading-snug text-acier-900">{intent.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{intent.description}</p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600 transition group-hover:gap-2.5 group-hover:text-btp-700">
        {intent.cta}
        <ArrowRight size={15} />
      </span>
    </Link>
  )
}

export default function IntentGrid() {
  return (
    <section id="intentions" className="scroll-mt-20 bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-acier-900 md:text-4xl">
            Que souhaitez-vous faire ?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Dites-nous votre besoin. Génie Sélect qualifie votre demande, vérifie les solutions et
            revient vers vous avec une proposition.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {AUDIENCE_ORDER.map((audience) => {
            const intents = intentsFor(audience)
            if (intents.length === 0) return null

            return (
              <div key={audience}>
                <h3 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  {AUDIENCE_LABELS[audience]}
                  <span className="h-px flex-1 bg-slate-200" aria-hidden />
                </h3>

                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {intents.map((intent) => (
                    <IntentCard key={intent.id} intent={intent} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
