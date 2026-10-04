import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Level } from '../store/types'
import { Reveal, Section, SectionHeader } from './site/SiteKit'

/**
 * La qualification, en trois mentions.
 *
 * <h2>Ce qui a été retiré</h2>
 *
 * Cette section a été une table de huit lignes sur trois colonnes : visite sur
 * site, nombre de points déroulés, machine démarrée, photos des organes,
 * anomalies suivies — avec, pour chaque niveau, la marque exacte de ce qui est
 * fait ou non. C'était notre barème de notation, publié.
 *
 * Deux raisons de ne plus l'afficher. Elle disait à un concurrent où s'arrête
 * chacun de nos contrôles, donc comment nous imiter à moindres frais. Et elle
 * demandait au client de lire huit critères techniques pour comprendre une
 * information qui tient en une ligne : plus la mention est haute, plus le
 * contrôle a été poussé.
 *
 * Reste donc ce qui lui sert : les trois mentions, ce qu'elles signifient, et
 * l'endroit où il la verra — sur la fiche de chaque machine. Le barème continue
 * d'exister là où il est utile, dans l'espace d'administration, pour ceux qui
 * attribuent les niveaux.
 */

const LEVELS: { id: Level; label: string; note: string }[] = [
  { id: 'BASIC', label: 'Basic', note: 'Dossier contrôlé' },
  { id: 'SILVER', label: 'Silver', note: 'Contrôle sur site' },
  { id: 'GOLD', label: 'Gold', note: 'Contrôle complet' },
]

export default function VerificationLevels() {
  return (
    <Section id="niveaux" tone="dark">
      <SectionHeader
        tone="dark"
        label="Qualification VOLTA"
        title="Un niveau adapté au contrôle réalisé."
        text="Chaque équipement porte sa mention, à louer comme à vendre. Elle est attribuée par VOLTA, jamais par le détenteur de la machine."
      />

      <Reveal className="mx-auto mt-12 max-w-4xl">
        <ul className="grid gap-4 sm:grid-cols-3">
          {LEVELS.map((level) => (
            <li
              key={level.id}
              className={`rounded-xl border px-5 py-6 text-center ${
                level.id === 'GOLD'
                  ? 'border-btp-500/60 bg-white/[0.07]'
                  : 'border-white/15 bg-white/[0.03]'
              }`}
            >
              <ShieldCheck
                size={22}
                aria-hidden
                strokeWidth={1.75}
                className={`mx-auto ${level.id === 'GOLD' ? 'text-btp-400' : 'text-acier-300'}`}
              />
              <span
                className={`volta-display mt-3 block text-2xl ${
                  level.id === 'GOLD' ? 'text-btp-400' : 'text-white'
                }`}
              >
                {level.label}
              </span>
              <span className="mt-1 block text-sm text-acier-300">{level.note}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <p className="text-acier-200">Découvrez le niveau associé à chaque équipement.</p>
          <Link
            to="/catalogue"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-btp-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-btp-600"
          >
            Voir les équipements
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </Reveal>
    </Section>
  )
}
