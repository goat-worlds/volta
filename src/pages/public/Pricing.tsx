import { useState } from 'react'
import { Card } from '../../components/ui'

type Plan = 'basic' | 'silver' | 'gold'

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [hoveredPlan, setHoveredPlan] = useState<Plan | null>(null)

  const plans = [
    {
      name: 'Basic',
      id: 'basic' as const,
      icon: '🚜',
      description: 'Pour commencer',
      price: { monthly: 0, yearly: 0 },
      badge: 'Gratuit',
      color: '#64748b',
      lightColor: '#f1f5f9',
      features: [
        { text: 'Accès au catalogue', included: true },
        { text: 'Jusqu\'à 3 locations/mois', included: true },
        { text: 'Support par email', included: true },
        { text: 'Garantie 7 jours', included: false },
        { text: 'Priorité support', included: false },
        { text: 'Assurance complète', included: false },
      ],
    },
    {
      name: 'Silver',
      id: 'silver' as const,
      icon: '⭐',
      description: 'Pour les PME',
      price: { monthly: 29999, yearly: 299990 },
      badge: 'Populaire',
      color: '#06b6d4',
      lightColor: '#ecf0f1',
      features: [
        { text: 'Accès au catalogue', included: true },
        { text: 'Locations illimitées', included: true },
        { text: 'Support prioritaire 24/7', included: true },
        { text: 'Garantie 14 jours', included: true },
        { text: 'Réduction 10%', included: true },
        { text: 'Assurance limitée', included: false },
      ],
    },
    {
      name: 'Gold',
      id: 'gold' as const,
      icon: '👑',
      description: 'Pour les grandes entreprises',
      price: { monthly: 79999, yearly: 799990 },
      badge: 'Premium',
      color: '#d4af37',
      lightColor: '#fffbf0',
      features: [
        { text: 'Accès au catalogue', included: true },
        { text: 'Locations illimitées', included: true },
        { text: 'Support VIP 24/7', included: true },
        { text: 'Garantie 30 jours', included: true },
        { text: 'Réduction 20%', included: true },
        { text: 'Assurance complète', included: true },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Tarification simple et transparente
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Choisissez le plan qui correspond à vos besoins. Pas de frais cachés, annulation à tout moment.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                billingCycle === 'yearly'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annuel <span className="text-xs ml-1">(-2 mois)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan) => {
            const isPopular = plan.name === 'Silver'
            const isHovered = hoveredPlan === plan.id

            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative transition-all duration-300 ${
                  isHovered ? 'scale-105' : 'scale-100'
                }`}
              >
                {/* Glow effect for popular plan */}
                {isPopular && (
                  <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20" style={{ backgroundColor: plan.color }} />
                )}

                <Card className={`relative h-full p-8 border transition-all duration-300 ${
                  isPopular
                    ? 'border-slate-300 shadow-xl'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span
                        className="px-4 py-1.5 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: plan.color }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="mb-6">
                    <div className="text-5xl mb-4">{plan.icon}</div>
                    <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-slate-900">
                        {(plan.price[billingCycle] / 1000).toFixed(0)}k
                      </span>
                      <span className="text-slate-600">FCFA/{billingCycle === 'monthly' ? 'mois' : 'an'}</span>
                    </div>
                    {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                      <p className="text-xs text-green-600 mt-2">
                        💰 Économisez {((plan.price.monthly * 12 - plan.price.yearly) / 1000).toFixed(0)}k FCFA/an
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    className="w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 mb-8 group"
                    style={{
                      backgroundColor: isHovered ? plan.color : `${plan.color}15`,
                      color: isHovered ? 'white' : plan.color,
                      border: `2px solid ${plan.color}30`,
                    }}
                  >
                    Commencer
                    <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-slate-200 mb-8" />

                  {/* Features */}
                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {feature.included ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                            style={{ backgroundColor: plan.color }}
                          >
                            ✓
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? 'text-slate-700 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Puis-je changer de plan à tout moment?',
                a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements sont effectués au prorata.',
              },
              {
                q: 'Acceptez-vous les annulations?',
                a: 'Bien sûr! Vous pouvez annuler votre abonnement à tout moment sans pénalité ni frais.',
              },
              {
                q: 'Qu\'est-ce qui est inclus dans l\'assurance?',
                a: 'L\'assurance couvre les dommages accidentels, le vol et les problèmes de maintenance liés à l\'équipement.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
