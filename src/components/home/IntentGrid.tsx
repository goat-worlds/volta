import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AUDIENCE_LABELS, INTENTS, type Intent } from '../../lib/intents'

/**
 * « Que souhaitez-vous faire ? »
 *
 * C'est l'entrée unique du site : huit parcours, chacun menant à son
 * formulaire. Ils étaient présentés en quatre groupes empilés — un par public —
 * ce qui étirait la section sur deux écrans et repoussait le Market et le
 * catalogue hors de vue. Une seule grille les tient ensemble ; le public que
 * chaque carte vise reste dit, en surtitre, pour que l'entreprise qui loue le
 * matin et cherche l'après-midi se reconnaisse deux fois.
 *
 * La carte entière est cliquable : sur un téléphone, viser un lien de trois
 * mots sous un paragraphe est une épreuve.
 */

function IntentCard({ intent }: { intent: Intent }) {
  const { icon: Icon } = intent

  return (
    <Link
      to={intent.to}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-btp-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btp-400 focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-acier-900 text-btp-400 transition group-hover:bg-btp-500 group-hover:text-white">
          <Icon size={20} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {AUDIENCE_LABELS[intent.audience]}
        </span>
      </div>

      <h3 className="mt-4 font-bold leading-snug text-acier-900">{intent.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{intent.description}</p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600 transition group-hover:gap-2.5 group-hover:text-btp-700">
        {intent.cta}
        <ArrowRight size={15} />
      </span>
    </Link>
  )
}

export default function IntentGrid() {
  return (
    <section id="intentions" className="scroll-mt-16 bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-btp-600">Parcours</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-acier-900 md:text-4xl">
              Que souhaitez-vous faire ?
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Dites-nous votre besoin. Génie Sélect qualifie votre demande, vérifie les solutions et
              revient vers vous avec une proposition — suivie par référence, sans compte.
            </p>
          </div>
          <Link to="/suivi" className="inline-flex items-center gap-1.5 text-sm font-semibold text-acier-700 hover:text-acier-900">
            Déjà une référence ? Suivre ma demande <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTENTS.map((intent) => (
            <IntentCard key={intent.id} intent={intent} />
          ))}
        </div>
      </div>
    </section>
  )
}
