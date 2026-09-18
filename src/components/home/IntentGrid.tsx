import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AUDIENCE_LABELS, AUDIENCE_ORDER, intentsFor, type Intent } from '../../lib/intents'

/**
 * « Qu'est-ce qui vous amène ? »
 *
 * C'est l'entrée du site : huit parcours, chacun menant à son formulaire.
 *
 * Ils ont été présentés en grille de huit cartes identiques — icône dans une
 * pastille, titre, deux lignes, flèche — répétée à l'écran comme partout
 * ailleurs sur la page. Huit fois le même bloc ne dit rien de ce qui distingue
 * une candidature de mécanicien d'une demande de pelle : la forme aplatit le
 * propos et donne à la page son air de catalogue fabriqué à la chaîne.
 *
 * C'est devenu un sommaire : un numéro, une phrase à la première personne, un
 * filet. On le parcourt comme l'index d'un classeur — du regard, de haut en
 * bas — et chaque ligne garde sa propre longueur au lieu d'être calée sur la
 * hauteur de sa voisine.
 */

function IntentRow({ intent, number }: { intent: Intent; number: number }) {
  const { icon: Icon } = intent

  return (
    <Link
      to={intent.to}
      className="group flex items-baseline gap-4 border-t border-papier-200 py-5 transition first:border-t-0 hover:border-btp-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btp-400 sm:gap-6"
    >
      {/* Le numéro tient lieu de puce : il ordonne sans imiter une icône
          décorative de plus. */}
      <span className="volta-display w-8 shrink-0 text-2xl text-papier-300 transition group-hover:text-btp-500">
        {String(number).padStart(2, '0')}
      </span>

      <span className="min-w-0 flex-1">
        <span className="volta-display block text-xl leading-tight text-acier-900 transition group-hover:text-btp-700 sm:text-2xl">
          {intent.title}
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-papier-600">
          {intent.description}
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600 transition group-hover:gap-3">
          {intent.cta}
          <ArrowRight size={14} />
        </span>
      </span>

      {/* L'icône reste, mais en bout de ligne et en gris : elle identifie le
          parcours d'un coup d'œil sans occuper la place du titre. */}
      <Icon
        size={22}
        className="hidden shrink-0 self-center text-papier-300 transition group-hover:text-btp-400 sm:block"
        aria-hidden
      />
    </Link>
  )
}

export default function IntentGrid() {
  let counter = 0

  return (
    <section id="intentions" className="scroll-mt-16 border-y border-papier-200 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-16">
          {/* Colonne de gauche, fixe : la question posée une fois, qui reste
              sous les yeux pendant qu'on parcourt les réponses. */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="volta-eyebrow text-btp-600">Huit portes d’entrée</span>
            <h2 className="volta-display mt-4 text-4xl text-acier-900 md:text-5xl">
              Qu’est-ce qui vous amène ?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-papier-700">
              On ne vous demande pas qui vous êtes. Un chef de chantier qui cherche une pelle pour
              lundi ne se pense pas comme « client », et l’entreprise qui loue son matériel le
              matin en cherche l’après-midi.
            </p>
            <p className="mt-3 leading-relaxed text-papier-600">
              Dites ce que vous voulez faire : quelqu’un chez Génie Sélect lit votre demande,
              vérifie ce qu’il faut, et vous rappelle.
            </p>
            <Link
              to="/suivi"
              className="mt-6 inline-flex items-center gap-1.5 border-b-2 border-btp-400 pb-0.5 text-sm font-semibold text-acier-900 transition hover:border-btp-600 hover:text-btp-700"
            >
              Déjà une référence ? Suivez votre demande
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Les parcours, par situation. L'intitulé du groupe décrit ce qu'on
              a en main — « vous avez du matériel » — jamais une qualité. */}
          <div className="space-y-10">
            {AUDIENCE_ORDER.map((audience) => {
              const intents = intentsFor(audience)
              if (intents.length === 0) return null

              return (
                <div key={audience}>
                  <h3 className="volta-display flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-papier-600">
                    {AUDIENCE_LABELS[audience]}
                    <span className="h-px flex-1 bg-papier-200" aria-hidden />
                  </h3>

                  <div className="mt-1">
                    {intents.map((intent) => {
                      counter += 1
                      return <IntentRow key={intent.id} intent={intent} number={counter} />
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
