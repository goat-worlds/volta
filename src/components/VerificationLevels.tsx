import { Check, Minus } from 'lucide-react'
import type { Level } from '../store/types'

/**
 * Les trois niveaux de vérification.
 *
 * Présentés en trois cartes, ils se lisaient comme une grille tarifaire — avec
 * un « recommandé » au milieu, comme on vend un abonnement. Or ce n'est pas une
 * offre à choisir : c'est le classement qu'une machine reçoit après contrôle,
 * et le client veut savoir ce que chaque niveau lui garantit exactement.
 *
 * Une table répond à cette question-là : une ligne par contrôle, une colonne
 * par niveau, et l'on voit d'un coup où s'arrête Basic et ce qu'ajoute Gold.
 * C'est aussi la forme la moins décorative de la page, donc la plus crédible.
 */

const LEVELS: { id: Level; label: string; note: string }[] = [
  { id: 'BASIC', label: 'Basic', note: 'Dossier contrôlé' },
  { id: 'SILVER', label: 'Silver', note: 'Passage sur site' },
  { id: 'GOLD', label: 'Gold', note: 'Contrôle complet' },
]

/** Une ligne de la table : le contrôle, et jusqu'où il est mené par niveau. */
const CHECKS: { label: string; by: Record<Level, string | boolean> }[] = [
  {
    label: 'Identité du détenteur vérifiée',
    by: { BASIC: true, SILVER: true, GOLD: true },
  },
  {
    label: 'Documents de la machine contrôlés',
    by: { BASIC: true, SILVER: true, GOLD: true },
  },
  {
    label: 'Visite sur le lieu de stationnement',
    by: { BASIC: false, SILVER: true, GOLD: true },
  },
  {
    label: 'Points de contrôle déroulés',
    by: { BASIC: false, SILVER: 'Partiels', GOLD: 'Les 18' },
  },
  {
    label: 'Machine démarrée et manœuvrée',
    by: { BASIC: false, SILVER: false, GOLD: true },
  },
  {
    label: 'Photos des organes sensibles au dossier',
    by: { BASIC: false, SILVER: 'Sur demande', GOLD: true },
  },
  {
    label: 'Anomalies relevées et suivies jusqu’à correction',
    by: { BASIC: false, SILVER: false, GOLD: true },
  },
  {
    label: 'Traitement prioritaire des demandes',
    by: { BASIC: false, SILVER: false, GOLD: true },
  },
]

function Mark({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <>
        <Check size={17} className="mx-auto text-emerald-600" aria-hidden />
        <span className="sr-only">oui</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <Minus size={17} className="mx-auto text-papier-300" aria-hidden />
        <span className="sr-only">non</span>
      </>
    )
  }
  return <span className="text-sm font-semibold text-acier-800">{value}</span>
}

export default function VerificationLevels() {
  return (
    <section id="niveaux" className="scroll-mt-16 bg-papier-100 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <span className="volta-eyebrow text-btp-600">Ce que vaut chaque mention</span>
        <h2 className="volta-display mt-4 max-w-2xl text-4xl text-acier-900 md:text-5xl">
          Basic, Silver, Gold : qui a vu quoi.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-papier-700">
          Le niveau se lit sur chaque fiche, à louer comme à vendre. Il n’est pas acheté par le
          propriétaire : il est décidé par l’administration après lecture du rapport.
        </p>

        {/* La table déborde sur téléphone plutôt que d'écraser ses colonnes :
            réduire la police jusqu'à faire tenir trois colonnes rendrait les
            marques illisibles là où elles comptent le plus. */}
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">
              Contrôles effectués pour chaque niveau de vérification VOLTA
            </caption>
            <thead>
              <tr className="border-b-2 border-acier-900">
                <th scope="col" className="py-3 pr-4 text-sm font-semibold text-papier-600">
                  Contrôle
                </th>
                {LEVELS.map((level) => (
                  <th key={level.id} scope="col" className="w-28 px-2 py-3 text-center align-bottom">
                    <span
                      className={`volta-display block text-xl ${
                        level.id === 'GOLD' ? 'text-btp-600' : 'text-acier-900'
                      }`}
                    >
                      {level.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-papier-600">
                      {level.note}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHECKS.map((check) => (
                <tr key={check.label} className="border-b border-papier-200">
                  <th scope="row" className="py-3.5 pr-4 text-sm font-normal text-acier-900">
                    {check.label}
                  </th>
                  {LEVELS.map((level) => (
                    <td
                      key={level.id}
                      className={`px-2 py-3.5 text-center ${
                        level.id === 'GOLD' ? 'bg-btp-50/60' : ''
                      }`}
                    >
                      <Mark value={check.by[level.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-sm text-papier-600">
          Une machine peut monter de niveau : elle repasse au contrôle quand son détenteur a repris
          ce qui avait été relevé.
        </p>
      </div>
    </section>
  )
}
