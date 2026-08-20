import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, CreditCard, Smartphone, Building2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import { Logo } from '../../components/marketing/Logo'
import { plans } from '../../data/content'

const steps = ['Compte', 'Organisation', 'Offre', 'Paiement', 'Onboarding']

interface FormState {
  fullName: string
  email: string
  password: string
  orgName: string
  sector: string
  size: string
  plan: string
  payMethod: string
}

const sectors = ['Banque / Finance', 'Télécom / IT', 'Administration publique', 'Santé', 'Assurance', 'Industrie', 'Autre']
const sizes = ['1-50', '51-250', '251-1000', '1000+']

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm font-medium text-text-on-dark">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-status-critical">{error}</span>}
    </label>
  )
}

const inputCls =
  'mt-1.5 w-full rounded-md border border-border-dark bg-bg-dark px-3 py-2.5 text-sm text-white focus:border-brand focus:outline-none'

export function InscriptionPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    orgName: '',
    sector: sectors[0],
    size: sizes[1],
    plan: params.get('plan') ?? 'Professional',
    payMethod: 'card',
  })

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const selectedPlan = useMemo(() => plans.find((p) => p.name === form.plan) ?? plans[1], [form.plan])

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (form.fullName.trim().length < 3) e.fullName = 'Nom complet requis (min. 3 caractères).'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse email invalide.'
      if (form.password.length < 8) e.password = 'Mot de passe : 8 caractères minimum.'
    }
    if (step === 1 && form.orgName.trim().length < 2) e.orgName = "Nom de l'organisation requis."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = (e?: FormEvent) => {
    e?.preventDefault()
    if (!validate()) return
    if (step < steps.length - 1) setStep(step + 1)
  }

  return (
    <div className="min-h-screen bg-bg-dark px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <ol className="mt-8 flex items-center justify-center gap-1 text-xs">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold ${
                  i === step ? 'bg-brand text-white' : i < step ? 'bg-emerald-500/15 text-emerald-400' : 'bg-surface-dark text-text-on-dark-muted'
                }`}
              >
                {i < step && <Check size={12} />} {s}
              </span>
              {i < steps.length - 1 && <span className="text-border-dark">—</span>}
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-xl border border-border-dark bg-surface-dark p-8 shadow-xl">
          {step === 0 && (
            <form onSubmit={next} className="space-y-4">
              <h1 className="text-xl font-bold text-white">Créez votre compte</h1>
              <Field label="Nom complet" error={errors.fullName}>
                <input className={inputCls} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Armand Tanoh" />
              </Field>
              <Field label="Email professionnel" error={errors.email}>
                <input className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="vous@entreprise.ci" />
              </Field>
              <Field label="Mot de passe" error={errors.password}>
                <input type="password" className={inputCls} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="8 caractères minimum" />
              </Field>
              <button type="submit" className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                Continuer <ArrowRight size={16} />
              </button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={next} className="space-y-4">
              <h1 className="text-xl font-bold text-white">Votre organisation</h1>
              <Field label="Nom de l'organisation" error={errors.orgName}>
                <input className={inputCls} value={form.orgName} onChange={(e) => set('orgName', e.target.value)} placeholder="Ex. Banque Atlantique" />
              </Field>
              <Field label="Secteur d'activité">
                <select className={inputCls} value={form.sector} onChange={(e) => set('sector', e.target.value)}>
                  {sectors.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Taille (employés)">
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('size', s)}
                      className={`rounded-md border px-2 py-2.5 text-xs font-semibold ${
                        form.size === s ? 'border-brand bg-brand/15 text-white' : 'border-border-dark text-text-on-dark-muted hover:border-border-dark-hover'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <button type="submit" className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                Continuer <ArrowRight size={16} />
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-white">Choisissez votre offre</h1>
              <div className="space-y-3">
                {plans.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => set('plan', p.name)}
                    className={`flex w-full items-center justify-between rounded-md border px-4 py-3.5 text-left ${
                      form.plan === p.name ? 'border-brand bg-brand/10' : 'border-border-dark hover:border-border-dark-hover'
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-bold text-white">{p.name}</span>
                      <span className="block text-xs text-text-on-dark-muted">{p.description}</span>
                    </span>
                    <span className="text-sm font-extrabold text-brand">
                      {p.price} {p.period}
                    </span>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => next()} className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                Continuer vers le paiement <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-white">Paiement sécurisé</h1>
              <p className="rounded-md border border-border-dark bg-bg-dark px-4 py-3 text-sm text-text-on-dark">
                Offre <span className="font-bold text-white">{selectedPlan.name}</span> —{' '}
                <span className="font-bold text-brand">
                  {selectedPlan.price} {selectedPlan.period}
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: 'Carte bancaire', icon: CreditCard },
                  { id: 'mobile', label: 'Mobile Money', icon: Smartphone },
                  { id: 'transfer', label: 'Virement', icon: Building2 },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => set('payMethod', m.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-xs font-semibold ${
                      form.payMethod === m.id ? 'border-brand bg-brand/15 text-white' : 'border-border-dark text-text-on-dark-muted hover:border-border-dark-hover'
                    }`}
                  >
                    <m.icon size={18} className="text-brand" /> {m.label}
                  </button>
                ))}
              </div>
              {form.payMethod === 'card' && (
                <div className="space-y-3">
                  <Field label="Numéro de carte">
                    <input className={inputCls} placeholder="4242 4242 4242 4242" inputMode="numeric" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiration">
                      <input className={inputCls} placeholder="MM/AA" />
                    </Field>
                    <Field label="CVC">
                      <input className={inputCls} placeholder="123" inputMode="numeric" />
                    </Field>
                  </div>
                </div>
              )}
              {form.payMethod === 'mobile' && (
                <Field label="Numéro Mobile Money (Wave / Orange / MTN)">
                  <input className={inputCls} placeholder="+225 07 00 00 00 00" inputMode="tel" />
                </Field>
              )}
              {form.payMethod === 'transfer' && (
                <p className="rounded-md border border-border-dark bg-bg-dark px-4 py-3 text-xs text-text-on-dark-muted">
                  Les coordonnées bancaires vous seront envoyées par email. Votre espace sera activé à réception du virement.
                </p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-text-on-dark-muted">
                <ShieldCheck size={14} className="text-status-compliant" /> Paiement fictif de démonstration — aucun débit réel.
              </p>
              <button type="button" onClick={() => next()} className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                Payer et activer mon espace <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                <Check size={28} className="text-status-compliant" />
              </span>
              <h1 className="text-xl font-bold text-white">Bienvenue{form.fullName ? `, ${form.fullName.split(' ')[0]}` : ''} !</h1>
              <p className="text-sm text-text-on-dark-muted">
                Votre organisation <span className="font-semibold text-white">{form.orgName || 'CYBERAS'}</span> est prête sur l'offre{' '}
                <span className="font-semibold text-brand">{selectedPlan.name}</span>. Prochaines étapes : inviter votre équipe, définir votre périmètre et lancer
                votre premier audit.
              </p>
              <div className="grid gap-2 text-left text-sm">
                {['Inviter les membres de votre équipe', "Définir le périmètre d'audit", 'Lancer votre première mission'].map((s, i) => (
                  <span key={s} className="flex items-center gap-2 rounded-md border border-border-dark px-3 py-2.5 text-text-on-dark">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{i + 1}</span> {s}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Accéder à la solution <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step > 0 && step < 4 && (
            <button type="button" onClick={() => setStep(step - 1)} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-text-on-dark-muted hover:text-white">
              <ArrowLeft size={14} /> Étape précédente
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-text-on-dark-muted">
          Déjà un compte ?{' '}
          <Link to="/app" className="text-brand hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
