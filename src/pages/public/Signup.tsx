import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '../../components/ui'
import { IconCheck, IconHourglass, IconWarning } from '../../components/Icons'

type UserRole = 'CLIENT' | 'SUPPLIER' | 'TECHNICAL'

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<UserRole | ''>('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateStep1 = () => {
    if (!role) {
      setError('Veuillez sélectionner un type de compte')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tous les champs sont obligatoires')
      return false
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!formData.firstName || !formData.lastName || !formData.company || !formData.phone) {
      setError('Tous les champs sont obligatoires')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    } else if (step === 3 && validateStep3()) {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Store user info and redirect to login
    localStorage.setItem('volta_signup', JSON.stringify({
      ...formData,
      role,
      signupDate: new Date().toISOString(),
    }))

    setIsLoading(false)
    navigate('/login', { state: { email: formData.email, message: 'Inscription réussie! Veuillez vous connecter.' } })
  }

  const roleOptions = [
    { value: 'CLIENT' as UserRole, label: 'Client', desc: 'Cherche à louer des équipements' },
    { value: 'SUPPLIER' as UserRole, label: 'Fournisseur', desc: 'Propose des équipements en location' },
    { value: 'TECHNICAL' as UserRole, label: 'Équipe Technique', desc: 'Inspection et certification' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-lg">
              <img src="/volta-logo.svg" alt="VOLTA" className="h-8 w-8" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">VOLTA</div>
              <div className="text-xs text-brand-100">Rejoindre la plateforme</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <Card className="p-8 mb-6">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">
                Quel est votre rôle?
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                Choisissez le type de compte qui correspond à votre besoin
              </p>

              <div className="space-y-3">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setRole(option.value)
                      setError('')
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition ${
                      role === option.value
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-slate-200 bg-white hover:border-brand-300'
                    }`}
                  >
                    <div className="font-bold text-left text-slate-900">{option.label}</div>
                    <div className="text-sm text-slate-600 text-left">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Email & Password */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">
                Créer votre compte
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                Entrez vos identifiants de connexion
              </p>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="exemple@volta.ci"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mot de passe (min. 8 caractères)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    disabled={isLoading}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Personal Info */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">
                Informations personnelles
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                Complétez votre profil
              </p>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Jean"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Dupont"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Entreprise/Raison sociale
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Acme Construction"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+225 07 12 34 56 78"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    disabled={isLoading}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <IconWarning className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => {
                  setStep(step - 1)
                  setError('')
                }}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg border-2 border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition disabled:opacity-50"
              >
                Précédent
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`flex-1 py-2.5 rounded-lg text-white font-semibold transition flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-brand-400'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {isLoading ? (
                <>
                  <IconHourglass className="w-4 h-4 animate-spin" />
                  {step === 3 ? 'Inscription...' : 'Suivant...'}
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  {step === 3 ? 'Terminer' : 'Suivant'}
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-white text-sm">
            Vous avez déjà un compte?{' '}
            <Link to="/login" className="font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
