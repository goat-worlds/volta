import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AUDIENCE_LABELS, AUDIENCE_ORDER, intentsFor } from '../../lib/intents'
import { CardIcon, MoreLink, Reveal, Section, SectionActions, SectionHeader } from '../site/SiteKit'

/**
 * « Qu'est-ce qui vous amène ? »
 *
 * C'est l'entrée du site : huit parcours, chacun menant à son formulaire.
 *
 * Ils ont été présentés en grille de huit cartes, puis en sommaire numéroté
 * sur deux colonnes avec une colonne de gauche collante — une disposition
 * qu'aucune autre section ne partageait, et qui obligeait l'œil à réapprendre
 * la page à cet endroit précis. Ils reprennent la carte commune : le groupe
 * — « vous avez du matériel », jamais « vous êtes fournisseur » — devient
 * l'étiquette de la carte plutôt qu'un intertitre, ce qui supprime quatre
 * niveaux de titre sans rien retirer du classement.
 */
export default function IntentGrid() {
  const ordered = AUDIENCE_ORDER.flatMap((audience) =>
    intentsFor(audience).map((intent) => ({ intent, audience })),
  )

  return (
    <Section id="intentions" tone="light">
      <SectionHeader
        label="Huit portes d’entrée"
        title="Qu’est-ce qui vous amène ?"
        text="On ne vous demande pas qui vous êtes : un chef de chantier qui cherche une pelle pour lundi ne se pense pas comme « client ». Dites ce que vous voulez faire — quelqu’un chez VOLTA lit votre demande, vérifie ce qu’il faut, et vous rappelle."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ordered.map(({ intent, audience }, i) => (
          <Reveal key={intent.id} delay={(i % 4) * 0.06}>
            <Link
              to={intent.to}
              className="group flex h-full flex-col rounded-lg border border-papier-200 bg-white p-6 shadow-xs transition hover:-translate-y-0.5 hover:border-btp-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btp-400"
            >
              <div className="flex items-center gap-3">
                <CardIcon icon={intent.icon} />
                <span className="text-xs font-bold uppercase tracking-wider text-papier-600">
                  {AUDIENCE_LABELS[audience]}
                </span>
              </div>
              <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">
                {intent.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">
                {intent.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-btp-600 transition group-hover:gap-3">
                {intent.cta}
                <ArrowRight size={14} />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <SectionActions>
        <MoreLink to="/suivi">Déjà une référence ? Suivez votre demande</MoreLink>
      </SectionActions>
    </Section>
  )
}
