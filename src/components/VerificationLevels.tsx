import { Check, Star } from 'lucide-react'

/**
 * Niveaux de vérification.
 *
 * Trois cartes en jaune générique, sans lien avec la palette acier/ambre du
 * reste de l'accueil. Le niveau est ce que le client lit sur chaque fiche :
 * il mérite la même signature visuelle que le badge du catalogue, et le Gold
 * — celui qui rassure — porte la carte sombre.
 */
const LEVELS = [
  {
    name: 'BASIC',
    title: 'Basic',
    description: 'Référencement contrôlé',
    features: ['Identité du fournisseur vérifiée', 'Documents validés'],
    featured: false,
  },
  {
    name: 'SILVER',
    title: 'Silver',
    description: 'Documents et inspection partielle',
    features: ['Identité du fournisseur vérifiée', 'Documents validés', 'Inspection partielle sur site'],
    featured: false,
  },
  {
    name: 'GOLD',
    title: 'Gold',
    description: 'Vérification renforcée',
    features: [
      'Identité du fournisseur vérifiée',
      'Documents validés',
      'Inspection complète, 18 points',
      'Support prioritaire',
    ],
    featured: true,
  },
]

const BADGE: Record<string, string> = {
  BASIC: 'bg-slate-100 text-slate-700',
  SILVER: 'bg-slate-200 text-slate-800',
  GOLD: 'bg-btp-500/20 text-btp-300',
}

export default function VerificationLevels() {
  return (
    <section id="niveaux" className="scroll-mt-16 bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-btp-600">
            Niveaux de vérification
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-acier-900 md:text-4xl">
            Un classement attribué, jamais déclaré.
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Le niveau est décidé par l’administration après lecture du rapport d’inspection. Il se
            lit sur chaque fiche, à louer comme à vendre.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {LEVELS.map((level) => (
            <div
              key={level.name}
              className={`relative rounded-2xl p-7 transition ${
                level.featured
                  ? 'bg-acier-900 text-white shadow-xl ring-1 ring-btp-500/40'
                  : 'border border-slate-200 bg-white hover:border-btp-300 hover:shadow-lg'
              }`}
            >
              {level.featured && (
                <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-btp-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Star size={11} fill="currentColor" />
                  Recommandé
                </span>
              )}
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${BADGE[level.name]}`}>
                {level.title}
              </span>
              <h3 className={`mt-4 text-xl font-bold ${level.featured ? 'text-white' : 'text-acier-900'}`}>
                {level.description}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {level.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        level.featured ? 'bg-btp-500 text-white' : 'bg-btp-50 text-btp-600'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className={level.featured ? 'text-acier-100' : 'text-slate-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
