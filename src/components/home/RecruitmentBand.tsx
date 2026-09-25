import { FileUp } from 'lucide-react'
import { MoreLink, PrimaryLink, Reveal, Section, SectionActions, SectionHeader } from '../site/SiteKit'

/**
 * Recrutement technique.
 *
 * Le mécanicien venu déposer son CV ne se reconnaît ni dans « louer » ni dans
 * « acheter » : le site lui parlait par une carte parmi huit. Il a maintenant
 * sa section, adressée à lui, avec les métiers cherchés et le geste attendu.
 *
 * Elle prenait la forme d'un bandeau à coins très arrondis, posé hors du
 * rythme des autres sections, avec une photo de pelle en fond à vingt-cinq
 * pour cent, un dégradé par-dessus, une pastille, un titre sur deux lignes et
 * trois actions empilées dans la colonne de droite. Elle rentre dans le rang :
 * même fond, même chapeau, mêmes boutons que le reste de la page.
 */
const TRADES = [
  'Mécanicien',
  'Hydraulicien',
  'Électricien',
  'Vérificateur',
  'Opérateurs d’engins',
  'Soudeur',
]

export default function RecruitmentBand() {
  return (
    <Section id="recrutement" tone="light">
      <SectionHeader
        label="Recrutement · Équipe technique"
        title="Vous réparez, vous conduisez, vous inspectez ?"
        text="Déposez votre CV, passez l’audition technique, recevez des missions chez des clients qualifiés. Votre pratique compte autant que vos diplômes, et votre candidature se suit par référence."
      />

      <Reveal className="mt-8">
        <ul className="flex flex-wrap justify-center gap-2">
          {TRADES.map((t) => (
            <li
              key={t}
              className="rounded-full border border-papier-200 bg-papier-50 px-4 py-1.5 text-sm font-semibold text-acier-900"
            >
              {t}
            </li>
          ))}
        </ul>
      </Reveal>

      <SectionActions>
        <PrimaryLink to="/recrutement/candidature">
          <FileUp size={16} />
          Déposer mon CV
        </PrimaryLink>
        <MoreLink to="/recrutement">Métiers et processus</MoreLink>
      </SectionActions>
    </Section>
  )
}
