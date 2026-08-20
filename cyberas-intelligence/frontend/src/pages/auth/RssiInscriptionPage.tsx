import { useState } from 'react'
import { ArrowRight, ChevronLeft, CheckCircle2, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { generateOTP, verifyOTP } from '../../services/otp'

interface RssiSignupForm {
  email: string
  password: string
  orgName: string
  sector: string
  country: string
  orgSize: string
  plan: 'starter' | 'pro' | 'enterprise'
  auditors: { email: string }[]
  referentiels: string[]
  otp: string
}

const sectors = ['Finance', 'Santé', 'Gouvernement', 'Tech', 'Industrie', 'Autre']
const countries = ['Côte d\'Ivoire', 'Senegal', 'Cameroun', 'Mali', 'Burkina Faso', 'Autre']
const orgSizes = ['< 50', '50-200', '200-1000', '1000+']
const referentiels = ['ISO 27001', 'ISO 27002', 'NIST CSF', 'PCI-DSS', 'ISO 27701', 'RGPD', 'HIPAA', 'ANSSI']

export function RssiInscriptionPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<RssiSignupForm>({
    email: '',
    password: '',
    orgName: '',
    sector: '',
    country: '',
    orgSize: '',
    plan: 'pro',
    auditors: [{ email: '' }, { email: '' }],
    referentiels: [],
    otp: '',
  })
  const [otpSent, setOtpSent] = useState(false)

  const handleNext = async () => {
    if (!validateStep()) return

    if (step === 6) {
      setLoading(true)
      try {
        generateOTP(form.email)
        await new Promise((resolve) => setTimeout(resolve, 500))
        setOtpSent(true)
        setError('')
        setStep(step + 1)
      } finally {
        setLoading(false)
      }
      return
    }

    setStep(step + 1)
    setError('')
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!form.email || !form.password) {
          setError('Email et mot de passe requis')
          return false
        }
        return true
      case 2:
        if (!form.orgName || !form.sector || !form.country || !form.orgSize) {
          setError('Tous les champs organisationnels sont requis')
          return false
        }
        return true
      case 3:
        return true
      case 4:
        if (form.auditors.filter((a) => a.email).length === 0) {
          setError('Au moins un email auditeur requis')
          return false
        }
        return true
      case 5:
        if (form.referentiels.length === 0) {
          setError('Au moins un referentiel requis')
          return false
        }
        return true
      case 6:
        return true
      case 7:
        if (!form.otp || form.otp.length !== 6) {
          setError('Code OTP doit avoir 6 chiffres')
          return false
        }
        if (!verifyOTP(form.email, form.otp)) {
          setError('Code OTP incorrect ou expiré')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleSignup = async () => {
    setLoading(true)
    try {
      await signup(form.email, form.password, 'rssi')
      navigate('/app/rssi')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inscription')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 7) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark px-4 py-12">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-on-dark-muted hover:text-white transition mb-8"
      >
        <ChevronLeft size={20} />
        Retour
      </button>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={32} className="text-brand" />
            <span className="text-2xl font-bold text-white">CYBERAS</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Inscription RSSI</h1>
          <p className="text-text-on-dark-muted mt-2">Etape {step} / 8</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 h-2 rounded-full bg-border-dark overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500 p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-6 mb-8">
          {/* Step 1: Credentials */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Identifiants</h2>
              <label>
                <span className="text-sm font-medium text-text-on-dark">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-text-on-dark">Mot de passe</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                />
              </label>
            </div>
          )}

          {/* Step 2: Organization */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Organisation</h2>
              <label>
                <span className="text-sm font-medium text-text-on-dark">Nom organisation</span>
                <input
                  type="text"
                  value={form.orgName}
                  onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-text-on-dark">Secteur</span>
                  <select
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                  >
                    <option value="">Selectionnez</option>
                    {sectors.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-medium text-text-on-dark">Pays</span>
                  <select
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                  >
                    <option value="">Selectionnez</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span className="text-sm font-medium text-text-on-dark">Taille</span>
                <select
                  value={form.orgSize}
                  onChange={(e) => setForm({ ...form, orgSize: e.target.value })}
                  className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                >
                  <option value="">Selectionnez</option>
                  {orgSizes.map((s) => (
                    <option key={s} value={s}>
                      {s} employes
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Step 3: Plan */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Choisir votre offre</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {(['starter', 'pro', 'enterprise'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, plan: p })}
                    className={`p-4 rounded-lg border-2 text-center transition ${
                      form.plan === p
                        ? 'border-brand bg-brand/10'
                        : 'border-border-dark bg-bg-dark hover:border-brand/50'
                    }`}
                  >
                    <p className="font-bold text-white capitalize mb-2">{p}</p>
                    <p className="text-xs text-text-on-dark-muted">
                      {p === 'starter' ? '49,900 FCFA' : p === 'pro' ? '149,900 FCFA' : 'Sur devis'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Auditors */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Ajouter auditeurs (max 2)</h2>
              {form.auditors.map((auditor, idx) => (
                <label key={idx}>
                  <span className="text-sm font-medium text-text-on-dark">Email auditeur {idx + 1}</span>
                  <input
                    type="email"
                    value={auditor.email}
                    onChange={(e) => {
                      const newAuditors = [...form.auditors]
                      newAuditors[idx].email = e.target.value
                      setForm({ ...form, auditors: newAuditors })
                    }}
                    placeholder="auditeur@example.com"
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
                  />
                </label>
              ))}
            </div>
          )}

          {/* Step 5: Referentiels */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Selectionnez referentiels</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {referentiels.map((ref) => (
                  <button
                    key={ref}
                    onClick={() => {
                      if (form.referentiels.includes(ref)) {
                        setForm({
                          ...form,
                          referentiels: form.referentiels.filter((r) => r !== ref),
                        })
                      } else {
                        setForm({
                          ...form,
                          referentiels: [...form.referentiels, ref],
                        })
                      }
                    }}
                    className={`p-3 rounded-lg border-2 text-sm font-semibold transition ${
                      form.referentiels.includes(ref)
                        ? 'border-brand bg-brand/10 text-white'
                        : 'border-border-dark bg-bg-dark text-text-on-dark hover:border-brand/50'
                    }`}
                  >
                    {form.referentiels.includes(ref) && <CheckCircle2 size={14} className="inline mr-2" />}
                    {ref}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Resume */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Resume configuration</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-on-dark-muted">Organisation</span>
                  <span className="text-white">{form.orgName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-muted">Secteur</span>
                  <span className="text-white">{form.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-muted">Offre</span>
                  <span className="text-brand font-bold capitalize">{form.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-muted">Auditeurs</span>
                  <span className="text-white">{form.auditors.filter((a) => a.email).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-muted">Referentiels</span>
                  <span className="text-white">{form.referentiels.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: OTP Verification */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Verification 2FA</h2>
              <p className="text-sm text-text-on-dark-muted">
                {otpSent
                  ? `Code OTP envoye a ${form.email}. Entrez le code ci-dessous.`
                  : 'Cliquez sur Continuer pour recevoir un code OTP par email.'}
              </p>
              {otpSent && (
                <label>
                  <span className="text-sm font-medium text-text-on-dark">Code OTP (6 chiffres)</span>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white text-center text-2xl tracking-widest focus:border-brand focus:outline-none"
                  />
                </label>
              )}
            </div>
          )}

          {/* Step 8: Confirmation */}
          {step === 8 && (
            <div className="text-center space-y-4">
              <CheckCircle2 size={48} className="text-green-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Pret a commencer</h2>
              <p className="text-text-on-dark-muted">
                Configuration complete. Cliquez confirmer pour acceder au dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-dark text-text-on-dark hover:text-white disabled:opacity-50 font-semibold transition"
          >
            <ChevronLeft size={16} /> Retour
          </button>

          <div className="flex-1" />

          {step < 8 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition disabled:opacity-50"
            >
              Continuer <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSignup}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold transition"
            >
              <CheckCircle2 size={16} /> {loading ? 'Creation...' : 'Confirmer'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
