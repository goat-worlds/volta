import { Check } from 'lucide-react'
import { PARCOURS_DEMANDE, type Parcours } from '../../lib/etapes'

/**
 * Frise de suivi d'un dossier.
 *
 * <h2>Cinq étapes, jamais plus</h2>
 *
 * Elle montrait les dix états du serveur — qualification, recherche, devis en
 * préparation, proposition, validée, appariée, mission, terminée. Ce sont des
 * rouages : ils disent où en est le traitement, pas où en est le dossier. Le
 * client y lisait des étapes dont il n'avait rien à faire, et attendait devant
 * une frise qui n'avançait pas pendant que trois d'entre elles se succédaient.
 *
 * Les états se replient sur cinq étapes, portées par {@link Parcours} — une
 * table par nature de dossier, puisqu'une demande de prestation, un achat et
 * un engin ne traversent pas les mêmes temps.
 *
 * <h2>Un dossier arrêté s'arrête</h2>
 *
 * Un refus, une annulation, une clôture n'allongent pas le parcours : ils
 * l'interrompent. La frise reste grise à partir de là plutôt que d'inventer
 * une sixième étape « annulée » — ce qui laisserait croire qu'on y arrive
 * normalement.
 *
 * Les étapes à venir restent visibles en gris : les masquer donnerait
 * l'impression d'un parcours plus court qu'il n'est, et chaque étape franchie
 * ressemblerait à un retard.
 */
export default function RequestTimeline({
  status,
  compact = false,
  /**
   * La nature du dossier. Par défaut une demande de prestation, qui est le cas
   * de loin le plus fréquent.
   */
  parcours = PARCOURS_DEMANDE,
}: {
  status: string
  /** Version en ligne pour les tableaux ; sinon, liste verticale détaillée. */
  compact?: boolean
  parcours?: Parcours
}) {
  const etapes = parcours.etapes
  // 0 quand le dossier s'est arrêté : aucune étape n'est alors « courante ».
  const courante = parcours.etape(status)
  const arrete = courante === 0

  if (compact) {
    return (
      <ol className="flex flex-wrap items-center gap-1.5" aria-label="Avancement du dossier">
        {etapes.map((etape, index) => {
          const rang = index + 1
          return (
            <li
              key={etape}
              title={etape}
              aria-current={rang === courante ? 'step' : undefined}
              className={`h-1.5 w-6 rounded-full ${
                rang === courante
                  ? 'bg-btp-500'
                  : rang < courante
                    ? 'bg-acier-700'
                    : 'bg-slate-200'
              }`}
            />
          )
        })}
        <li className="ml-2 text-xs font-semibold text-acier-800">
          {arrete ? 'Dossier clos' : etapes[courante - 1]}
        </li>
      </ol>
    )
  }

  return (
    <ol className="space-y-0" aria-label="Avancement du dossier">
      {etapes.map((etape, index) => {
        const rang = index + 1
        const faite = rang < courante
        const active = rang === courante
        const derniere = index === etapes.length - 1

        return (
          <li key={etape} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  active
                    ? 'bg-btp-500 text-white ring-4 ring-btp-100'
                    : faite
                      ? 'bg-acier-900 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {faite ? <Check size={14} /> : rang}
              </span>
              {!derniere && (
                <span
                  className={`w-px flex-1 ${faite ? 'bg-acier-900' : 'bg-slate-200'}`}
                  aria-hidden
                />
              )}
            </div>

            <span
              className={`pb-5 pt-1 text-sm ${
                active
                  ? 'font-bold text-acier-900'
                  : faite
                    ? 'font-medium text-slate-700'
                    : 'text-slate-400'
              }`}
            >
              {etape}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
