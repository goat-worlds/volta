import { useState } from 'react'
import { Check, Smartphone, CreditCard } from 'lucide-react'

export function SubscriptionPage() {
  const [selected, setSelected] = useState<'starter' | 'pro' | 'enterprise'>('pro')
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'card'>('card')

  const plans = [
    {
      id: 'starter' as const,
      name: 'Starter',
      price: '49,900',
      currency: 'FCFA',
      period: '/mois',
      description: 'Parfait pour commencer',
      features: [
        '1 RSSI',
        '1 Auditeur',
        'Jusqu\'a 10 actifs',
        'ISO 27001 audit basic',
        'Rapports simples',
        'Support email',
      ],
      cta: 'Commencer',
    },
    {
      id: 'pro' as const,
      name: 'Professional',
      price: '149,900',
      currency: 'FCFA',
      period: '/mois',
      description: 'Pour les equipes actives',
      features: [
        '1 RSSI',
        'Jusqu\'a 5 Auditeurs',
        'Actifs illimites',
        'Tous les referentiels',
        'Rapports avances',
        'Agents IA complets',
        'Dashboard analytics',
        'Support prioritaire',
        'Scan agents: Nmap, Nessus, OpenVAS, Burp',
      ],
      cta: 'S\'abonner',
      popular: true,
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: 'Sur devis',
      currency: '',
      period: '',
      description: 'Solution personnalisee',
      features: [
        'Utilisateurs illimites',
        'Auditeurs illimites',
        'Tous les agents IA',
        'Integrations custom',
        'Support 24/7 dedié',
        'SLA garanti',
        'Deploiement prive',
        'Formation incluse',
      ],
      cta: 'Contacter',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Votre plan actuel: Professional</h1>
        <p className="text-text-on-dark-muted">Facturé 149,900 FCFA par mois</p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border-2 p-8 space-y-6 transition ${
              selected === plan.id
                ? 'border-brand bg-surface-dark/50'
                : 'border-border-dark bg-bg-dark/50 hover:border-brand/50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                  PLUS POPULAIRE
                </span>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-text-on-dark-muted mt-1">{plan.description}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.currency && <span className="text-text-on-dark-muted">{plan.currency}</span>}
              </div>
              {plan.period && <p className="text-sm text-text-on-dark-muted">{plan.period}</p>}
            </div>

            <button
              onClick={() => setSelected(plan.id)}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                selected === plan.id
                  ? 'bg-brand text-white'
                  : 'border border-border-dark text-text-on-dark hover:text-white'
              }`}
            >
              {plan.cta}
            </button>

            <div className="space-y-3 pt-4 border-t border-border-dark">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check size={16} className="shrink-0 text-brand mt-0.5" />
                  <span className="text-sm text-text-on-dark-muted">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Methods */}
      {selected !== 'enterprise' && (
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-8 space-y-6">
          <h2 className="text-xl font-bold text-white">Methode de paiement</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                paymentMethod === 'card'
                  ? 'border-brand bg-bg-dark/50'
                  : 'border-border-dark hover:border-brand/50'
              }`}
            >
              <CreditCard size={32} className={paymentMethod === 'card' ? 'text-brand' : 'text-text-on-dark-muted'} />
              <div className="text-left">
                <p className="font-semibold text-white">Carte Bancaire</p>
                <p className="text-xs text-text-on-dark-muted">VISA, Mastercard, etc.</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('wave')}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                paymentMethod === 'wave'
                  ? 'border-brand bg-bg-dark/50'
                  : 'border-border-dark hover:border-brand/50'
              }`}
            >
              <Smartphone size={32} className={paymentMethod === 'wave' ? 'text-brand' : 'text-text-on-dark-muted'} />
              <div className="text-left">
                <p className="font-semibold text-white">Wave</p>
                <p className="text-xs text-text-on-dark-muted">Mobile money secure</p>
              </div>
            </button>
          </div>

          {/* Payment Summary */}
          <div className="space-y-3 pt-6 border-t border-border-dark">
            <div className="flex justify-between text-sm">
              <span className="text-text-on-dark-muted">Abonnement {selected === 'pro' ? 'Professional' : 'Starter'}</span>
              <span className="text-white font-semibold">
                {selected === 'pro' ? '149,900' : '49,900'} FCFA
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-on-dark-muted">Periode</span>
              <span className="text-white">1 mois</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border-dark">
              <span className="font-bold text-white">Total</span>
              <span className="text-xl font-bold text-brand">
                {selected === 'pro' ? '149,900' : '49,900'} FCFA
              </span>
            </div>
          </div>

          <button className="w-full py-3 px-4 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-lg transition">
            Proceder au paiement via {paymentMethod === 'wave' ? 'Wave' : 'Carte Bancaire'}
          </button>

          <p className="text-xs text-text-on-dark-muted text-center">
            Apres paiement, vous pourrez ajouter jusqu\'a 2 auditeurs dans l\'espace "Gestion des Auditeurs"
          </p>
        </div>
      )}

      {/* Enterprise Contact */}
      {selected === 'enterprise' && (
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Parlons de votre solution personnalisee</h3>
          <p className="text-text-on-dark-muted">
            Notre equipe vous aidera a concevoir une solution Enterprise adaptee a vos besoins
          </p>
          <button className="px-8 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition">
            Demander une démo Enterprise
          </button>
        </div>
      )}
    </div>
  )
}
