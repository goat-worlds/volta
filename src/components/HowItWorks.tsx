import { ClipboardList, FileSearch, HeartHandshake, PackageCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardGrid, CardIcon, Chips, Reveal, Section, SectionHeader } from './site/SiteKit'

/**
 * Comment ça fonctionne — quatre temps, du besoin à la remise.
 *
 * Les quatre étapes sont celles du visiteur, pas le circuit interne d'un
 * engin, et valent pour la location, l'achat et la recherche de technicien.
 *
 * Elles étaient posées sur une frise dont le trait se remplissait au
 * défilement : un observateur d'intersection, une boucle d'animation, un
 * pourcentage recalculé à chaque image, et deux tracés — horizontal au-dessus
 * de `lg`, vertical en dessous — pour dire ce que quatre numéros disent déjà.
 * La mécanique est partie ; les numéros sont restés.
 */

interface Step {
  icon: LucideIcon
  title: string
  /**
   * Ce que VOLTA engage à cette étape — jamais un délai.
   *
   * Annoncer « 24 à 48 h » transforme la mise en relation en service après
   * vente et fait juger VOLTA sur une horloge. Ce qui se vend ici, c'est la
   * méthode : un réseau qualifié, des engins vérifiés, un interlocuteur
   * unique. Comment VOLTA y parvient ne se détaille pas.
   */
  duration: string
  text: string
  outputs: string[]
}

const STEPS: Step[] = [
  {
    icon: ClipboardList,
    title: 'Vous décrivez',
    duration: 'Sans compte',
    text: 'Un formulaire court, sans compte : ce qu’il vous faut, où, quand. Vous recevez une référence.',
    outputs: ['Aucune inscription', 'Référence de suivi', 'Reprise possible'],
  },
  {
    icon: FileSearch,
    title: 'VOLTA qualifie',
    duration: 'Outils et réseau',
    text: 'Votre besoin est confronté au réseau d’engins vérifiés : disponibilité, état et documents contrôlés avant toute proposition.',
    outputs: ['Réseau qualifié', 'Vérification sur pièces', 'Inspection si nécessaire'],
  },
  {
    icon: HeartHandshake,
    title: 'Vous recevez une proposition',
    duration: 'Interlocuteur unique',
    text: 'Devis de location comparés, commande d’achat, profil de technicien : un interlocuteur, des conditions claires.',
    outputs: ['Prix et conditions', 'Engagement écrit', 'Un seul interlocuteur'],
  },
  {
    icon: PackageCheck,
    title: 'Mission et suivi',
    duration: 'Jusqu’à la clôture',
    text: 'Livraison, mise à disposition ou intervention, suivies sur votre référence jusqu’à la clôture.',
    outputs: ['Statut à chaque étape', 'Anomalies tracées', 'Clôture confirmée'],
  },
]

export default function HowItWorks() {
  return (
    <Section id="comment" tone="light">
      <SectionHeader
        label="Comment ça fonctionne"
        title="Du besoin à la remise, en quatre temps."
        text="Le même circuit pour louer, acheter ou trouver un technicien. Vous ne traitez jamais à l’aveugle : chaque étape est visible sur votre référence."
      />

      <CardGrid columns={4}>
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={(i % 4) * 0.06}>
            <Card>
              <div className="flex items-center gap-3">
                <CardIcon icon={step.icon} />
                <span className="text-xs font-bold uppercase tracking-wider text-papier-600">
                  Étape {i + 1}
                </span>
              </div>
              <h3 className="volta-display mt-4 text-xl leading-tight text-acier-900">{step.title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-btp-600">
                {step.duration}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-papier-600">{step.text}</p>
              <Chips items={step.outputs} />
            </Card>
          </Reveal>
        ))}
      </CardGrid>
    </Section>
  )
}
