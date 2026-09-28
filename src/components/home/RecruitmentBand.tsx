import { ArrowRight, FileUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PrimaryLink, Reveal, Section, SectionCover } from '../site/SiteKit'

/**
 * Recrutement technique.
 *
 * Le mécanicien venu déposer son CV ne se reconnaît ni dans « louer » ni dans
 * « acheter » : le site lui parlait par une carte parmi huit. Il a maintenant
 * sa section, adressée à lui, avec les métiers cherchés et le geste attendu.
 *
 * Elle était l'avant-dernière section de l'accueil : « Déposer mon CV » ne se
 * voyait qu'après sept sections de location et de vente. Elle remonte, et son
 * bouton est désormais dans le premier tiers de la section plutôt qu'en pied.
 * Une photo l'ouvre, comme les autres sections qui ouvrent un sujet.
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
      <SectionCover
        label="Recrutement · Équipe technique"
        title="Vous réparez, vous conduisez, vous inspectez ?"
        text="Déposez votre CV, passez l’audition technique, recevez des missions chez des clients qualifiés. Votre pratique compte autant que vos diplômes, et votre candidature se suit par référence."
        image="/engins/pelle-cat-6015b.jpeg"
        imageAlt="Pelle hydraulique Caterpillar 6015B à l’arrêt sur un terrain détrempé, en fin de journée"
        reverse
      >
        {/* Le geste attendu, tout de suite sous la phrase qui l'annonce —
            plus en pied de section, après la liste des métiers. */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <PrimaryLink to="/recrutement/candidature">
            <FileUp size={16} />
            Déposer mon CV
          </PrimaryLink>
          <Link
            to="/recrutement"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-acier-900 underline-offset-4 transition hover:text-btp-600 hover:underline"
          >
            Métiers et processus
            <ArrowRight size={15} />
          </Link>
        </div>

        <ul className="mt-7 flex flex-wrap gap-2">
          {TRADES.map((t) => (
            <li
              key={t}
              className="rounded-full border border-papier-200 bg-papier-50 px-3.5 py-1.5 text-sm font-semibold text-acier-900"
            >
              {t}
            </li>
          ))}
        </ul>
      </SectionCover>

      <Reveal className="mt-8 text-center text-sm text-papier-600">
        Aucun compte à créer : vous recevez une référence et suivez votre candidature avec elle.
      </Reveal>
    </Section>
  )
}
