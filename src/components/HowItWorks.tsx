import { Reveal, Section, SectionHeader } from './site/SiteKit'

/**
 * Votre besoin, notre accompagnement — quatre temps.
 *
 * <h2>Ce qui a été enlevé</h2>
 *
 * Chaque étape portait une phrase de méthode et trois étiquettes : « confronté
 * au réseau d'engins vérifiés », « vérification sur pièces », « inspection si
 * nécessaire », « anomalies tracées ». Mises bout à bout, ces mentions
 * décrivaient notre chaîne de qualification — ce que le client n'a pas besoin
 * de savoir, et ce qu'un concurrent est content de lire.
 *
 * Le visiteur veut savoir ce qu'on attend de lui et ce qu'il va recevoir. Quatre
 * lignes y suffisent. Comment nous identifions la solution reste notre affaire.
 */

const STEPS: { title: string; text: string }[] = [
  {
    title: 'Vous exprimez votre besoin',
    text: 'Un formulaire court, sans créer de compte. Vous recevez une référence de suivi.',
  },
  {
    title: 'Nous identifions la solution',
    text: 'Votre demande est prise en charge par l’équipe VOLTA.',
  },
  {
    title: 'Nous vous présentons une proposition',
    text: 'Des conditions claires, et un seul interlocuteur.',
  },
  {
    title: 'Nous assurons le suivi',
    text: 'Votre référence vous donne l’avancement jusqu’à la clôture.',
  },
]

export default function HowItWorks() {
  return (
    <Section id="comment" tone="light">
      <SectionHeader
        label="Comment ça marche"
        title="Votre besoin, notre accompagnement."
        text="Le même parcours pour louer, acheter ou trouver un technicien."
      />

      <Reveal className="mt-12">
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              {/* Le numéro porte la progression : une frise de plus serait un
                  trait à entretenir pour ce que quatre chiffres disent déjà. */}
              <span className="volta-display block text-5xl leading-none text-btp-500/35">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="volta-display mt-3 text-xl leading-tight text-acier-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-papier-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  )
}
