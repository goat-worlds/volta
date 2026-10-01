import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import { PARCOURS_ACCUEIL, intentById } from '../../lib/intents'
import { Reveal, Section } from '../site/SiteKit'

/**
 * « Que souhaitez-vous faire ? »
 *
 * C'est l'entrée du site : huit parcours, chacun menant à son formulaire ou
 * au catalogue.
 *
 * <h2>Pourquoi une photo par carte</h2>
 *
 * Les huit parcours ont été un sommaire numéroté, puis huit cartes de texte
 * distinguées par un seul pictogramme : il fallait lire les huit titres pour
 * trouver le sien. Une photo se reconnaît avant d'être lue — un chef de
 * chantier repère sa pelle sans déchiffrer « Je veux louer un engin ».
 *
 * <h2>Deux colonnes sur téléphone</h2>
 *
 * Une colonne unique donnait huit cartes pleine largeur : le huitième parcours
 * arrivait après deux écrans et demi de défilement, et personne ne le voyait.
 * À deux par ligne la grille tient en un écran et demi — mais une carte fait
 * alors 160 px, d'où le titre bridé à deux lignes, la phrase masquée et la
 * pastille réduite. Sans ces réglages, deux colonnes donneraient huit cartes
 * déformées plutôt qu'une grille lisible.
 */
export default function IntentGrid() {
  // L'ordre vient de la maquette, pas du classement par public : les quatre
  // parcours partenaires vivent sur « Collaborons », pas sur la premiere page.
  const ordered = PARCOURS_ACCUEIL.map(intentById).filter((x) => x !== undefined)

  return (
    <Section id="intentions" tone="muted">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <span className="volta-eyebrow text-btp-600">
            <span aria-hidden className="mr-2 inline-block h-4 w-1 rounded-sm bg-btp-500 align-middle" />
            Parcours VOLTA
          </span>
          <h2 className="volta-display mt-3 text-4xl text-acier-900 sm:text-5xl">
            Que recherchez-vous ?
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-papier-600">
            Choisissez votre besoin et accédez au bon parcours. Pas besoin de créer un compte.
          </p>
        </Reveal>

        {/* Celui qui a déjà déposé une demande ne vient pas en déposer une
            seconde : il vient voir où en est la sienne. */}
        <Reveal delay={0.08}>
          <Link
            to="/suivi"
            className="inline-flex items-center gap-2 rounded-full border border-papier-200 bg-white px-5 py-3 text-sm font-semibold text-acier-900 shadow-xs transition hover:border-btp-300 hover:text-btp-700"
          >
            <FileText size={15} className="text-btp-500" aria-hidden />
            J’ai déjà un numéro de demande
            <ArrowRight size={15} aria-hidden />
          </Link>
        </Reveal>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {ordered.map((intent, i) => (
          <Reveal key={intent.id} delay={(i % 4) * 0.06}>
            <Link
              to={intent.to}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-papier-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-btp-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btp-400 focus-visible:ring-offset-2"
            >
              <span className="relative block h-24 overflow-hidden bg-papier-200 sm:h-28">
                <img
                  src={intent.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </span>

              <span className="relative flex flex-1 flex-col p-3 pt-6 sm:p-4 sm:pt-7">
                {/* La pastille chevauche la photo, comme sur la maquette :
                    elle rattache le pictogramme à l'image sans lui prendre
                    de hauteur dans le texte. */}
                <span className="absolute -top-5 left-3 grid size-10 place-items-center rounded-xl bg-btp-500 text-white shadow-sm sm:left-4 sm:size-11">
                  <intent.icon size={19} aria-hidden />
                </span>

                <span className="line-clamp-2 text-sm font-bold leading-snug text-acier-900 transition group-hover:text-btp-700">
                  {intent.title}
                </span>

                {/* Masquée à deux colonnes : sous 170 px, trois lignes de gris
                    poussent la flèche hors de vue sans rien apprendre. */}
                <span className="mt-1 hidden flex-1 text-xs leading-relaxed text-papier-600 sm:block">
                  {intent.description}
                </span>

                <span className="mt-3 flex items-center justify-end">
                  <span
                    aria-hidden
                    className="grid size-8 place-items-center rounded-full bg-btp-500 text-white transition group-hover:bg-btp-600"
                  >
                    <ArrowRight size={15} />
                  </span>
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
