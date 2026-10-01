import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import GenieSelectCover from '../../components/genieselect/GenieSelectCover'
import ExpertisesGrid from '../../components/genieselect/ExpertisesGrid'
import { Card, CardGrid, CardIcon, Reveal, Section, SectionHeader } from '../../components/site/SiteKit'
import { intentsFor } from '../../lib/intents'

/**
 * Collaborons — la page adressée à ceux qui ont du matériel ou une entreprise.
 *
 * Les parcours propriétaire et entreprise n'existaient que derrière le menu
 * « Parcours » et dans la grille d'intentions de l'accueil : quatre cartes
 * parmi huit, mêlées à celles du client. Celui qui vient proposer son parc ou
 * développer ses ventes n'avait pas de page à ouvrir, ni d'adresse à
 * transmettre.
 *
 * Elle s'ouvre sur la même couverture que l'accueil et les mêmes six
 * expertises : c'est le groupe qu'un partenaire rejoint, pas seulement le
 * catalogue de location.
 */
export default function Collaborons() {
  const proprietaires = intentsFor('OWNER')
  const entreprises = intentsFor('COMPANY')

  return (
    <div>
      {/* Sans l'accroche manuscrite : elle tient à l'accueil, où la couverture
          est la première chose vue ; répétée de page en page, elle devient un
          motif de gabarit. */}
      <GenieSelectCover note={false} />

      <ExpertisesGrid />

      <Section id="proprietaires" tone="muted">
        <SectionHeader
          tone="muted"
          label="Vous avez du matériel"
          title="Votre parc travaille, même quand vous ne l’utilisez pas."
          text="Vous proposez vos engins, un vérificateur se déplace, la fiche est publiée sous votre nom. Vous gardez la main sur les prix, les périodes et les conditions."
        />
        <CardGrid columns={2}>
          {proprietaires.map((intent, i) => (
            <Reveal key={intent.id} delay={(i % 2) * 0.06}>
              <Link to={intent.to} className="group block h-full">
                <Card>
                  <CardIcon icon={intent.icon} />
                  <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900 transition group-hover:text-btp-700">
                    {intent.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">
                    {intent.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-btp-600">
                    Commencer
                    <ArrowRight size={15} aria-hidden />
                  </span>
                </Card>
              </Link>
            </Reveal>
          ))}
        </CardGrid>
      </Section>

      <Section id="entreprises" tone="light">
        <SectionHeader
          label="Vous êtes une entreprise"
          title="Se faire connaître des donneurs d’ordre."
          text="Référencement de votre catalogue, niveau de vérification, accompagnement commercial : VOLTA met en relation et ne prélève aucune commission sur ce qui se conclut."
        />
        <CardGrid columns={2}>
          {entreprises.map((intent, i) => (
            <Reveal key={intent.id} delay={(i % 2) * 0.06}>
              <Link to={intent.to} className="group block h-full">
                <Card>
                  <CardIcon icon={intent.icon} />
                  <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900 transition group-hover:text-btp-700">
                    {intent.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">
                    {intent.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-btp-600">
                    Commencer
                    <ArrowRight size={15} aria-hidden />
                  </span>
                </Card>
              </Link>
            </Reveal>
          ))}
        </CardGrid>
      </Section>
    </div>
  )
}
