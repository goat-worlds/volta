import { Heart, Check } from 'lucide-react'

const LEVELS = [
  {
    name: 'BASIC',
    title: 'Basique',
    description: 'Référencement contrôlé',
    features: ['Vérification identité', 'Documents validés'],
  },
  {
    name: 'SILVER',
    title: 'Premium',
    description: 'Documents + inspection',
    features: ['Vérification identité', 'Documents validés', 'Inspection partielle'],
    featured: false,
  },
  {
    name: 'GOLD',
    title: 'Prestige',
    description: 'Vérification renforcée',
    features: ['Vérification identité', 'Documents validés', 'Inspection complète', 'Support prioritaire'],
    featured: true,
  },
]

export default function VerificationLevels() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Niveaux de vérification VOLTA</h2>
        <p className="mt-4 text-lg text-slate-600">Trois niveaux de certification pour garantir la fiabilité des engins.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {LEVELS.map((level) => (
          <div
            key={level.name}
            className={`rounded-xl border-2 p-6 transition ${
              level.featured
                ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-white shadow-lg'
                : 'border-slate-200 bg-white hover:border-yellow-200'
            }`}
          >
            {level.featured && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                <Heart className="h-3 w-3" />
                RECOMMANDÉ
              </div>
            )}

            <h3 className="text-xl font-bold text-slate-900">{level.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{level.description}</p>

            <div className="mt-6 space-y-3">
              {level.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
