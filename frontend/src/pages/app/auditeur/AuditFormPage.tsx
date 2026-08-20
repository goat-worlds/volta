import { useState } from 'react'
import { ArrowRight, ChevronLeft, CheckCircle2, TrendingUp, Shield } from 'lucide-react'
import { ProgressBar } from '../../../components/app/Shared'

interface AuditForm {
  missionName: string
  organization: string
  sector: string
  auditType: string
  scope: string
  startDate: string
  endDate: string
  auditors: number
  selectedDimensions: string[]
  selectedReferentiels: string[]
  questionnaireAnswers: Record<string, number>
}

interface ReferentielQuestions {
  [key: string]: { question: string; details: string; maxScore: number }[]
}

const sectors = ['Finance', 'Sante', 'Gouvernement', 'Tech', 'Industrie', 'Autre']

const auditDimensions = [
  { id: 'governance', label: 'Gouvernance SSI', icon: '🎯', description: 'Policies, SMSI, gestion des risques' },
  { id: 'compliance', label: 'Conformite', icon: '✓', description: 'RGPD, ISO 27001, reglementations' },
  { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️', description: 'Serveurs, systemes, configs' },
  { id: 'network', label: 'Reseau', icon: '🌐', description: 'Segmentation, firewalls, VPN' },
  { id: 'iam', label: 'IAM & Access', icon: '🔐', description: 'Identites, acces, privileges' },
  { id: 'applications', label: 'Applications', icon: '💻', description: 'Code, OWASP, vulnerabilites' },
  { id: 'physical', label: 'Securite Physique', icon: '🚪', description: 'Acces physiques, locaux' },
  { id: 'awareness', label: 'Sensibilisation', icon: '👥', description: 'Formations, phishing, risques' },
]

const referentiels = ['ISO 27001', 'ISO 27002', 'NIST', 'CIS Controls', 'PCI-DSS', 'HIPAA', 'ANSSI', 'COBIT']

const referentielQuestions: ReferentielQuestions = {
  'ISO 27001': [
    { question: 'Disposez-vous d\'une politique de securite informatique documentee?', details: 'A.5 - Politiques pour la securite de l\'information', maxScore: 10 },
    { question: 'Avez-vous une gestion formelle des risques?', details: 'A.12 - Gestion des operations', maxScore: 10 },
    { question: 'Quel est votre score d\'incident?', details: 'A.16 - Gestion des incidents', maxScore: 10 },
  ],
  'NIST': [
    { question: 'Avez-vous une fonction de gouvernance cybersecurite?', details: 'Gouvernance - Oversee & lead', maxScore: 10 },
    { question: 'Matiere identifiee et categorie?', details: 'Identify (ID)', maxScore: 10 },
    { question: 'Capacites de detection des menaces?', details: 'Detect (DE)', maxScore: 10 },
  ],
  'PCI-DSS': [
    { question: 'Avez-vous construit et maintenu un reseau securise?', details: 'Requirement 1 & 2', maxScore: 10 },
    { question: 'Protegez-vous les donnees des titulaires de cartes?', details: 'Requirement 3 & 4', maxScore: 10 },
    { question: 'Testez-vous regularement votre securite?', details: 'Requirement 11', maxScore: 10 },
  ],
}

export function AuditFormPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<AuditForm>({
    missionName: '',
    organization: '',
    sector: '',
    auditType: 'complet',
    scope: '',
    startDate: '',
    endDate: '',
    auditors: 1,
    selectedDimensions: [],
    selectedReferentiels: [],
    questionnaireAnswers: {},
  })

  const totalSteps = 6
  const progress = (step / totalSteps) * 100

  const toggleDimension = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedDimensions: prev.selectedDimensions.includes(id)
        ? prev.selectedDimensions.filter((d) => d !== id)
        : [...prev.selectedDimensions, id],
    }))
  }

  const toggleReferentiel = (ref: string) => {
    setForm((prev) => ({
      ...prev,
      selectedReferentiels: prev.selectedReferentiels.includes(ref)
        ? prev.selectedReferentiels.filter((r) => r !== ref)
        : [...prev.selectedReferentiels, ref],
    }))
  }

  const handleQuestionAnswer = (questionKey: string, score: number) => {
    setForm((prev) => ({
      ...prev,
      questionnaireAnswers: { ...prev.questionnaireAnswers, [questionKey]: score },
    }))
  }

  const calculateReferentielScore = (referentiel: string): number => {
    const questions = referentielQuestions[referentiel] || []
    if (questions.length === 0) return 0
    const totalPossible = questions.reduce((sum, q) => sum + q.maxScore, 0)
    const actualScore = questions.reduce((sum, _q, idx) => {
      const key = `${referentiel}-${idx}`
      return sum + (form.questionnaireAnswers[key] || 0)
    }, 0)
    return Math.round((actualScore / totalPossible) * 100)
  }

  const canProceed = () => {
    if (step === 1) return form.missionName && form.organization && form.sector
    if (step === 2) return form.startDate && form.endDate && form.auditors > 0
    if (step === 3) return form.selectedDimensions.length > 0
    if (step === 4) return form.selectedReferentiels.length > 0
    if (step === 5) return form.selectedReferentiels.every((ref) => {
      const questions = referentielQuestions[ref] || []
      return questions.every((_, idx) => form.questionnaireAnswers[`${ref}-${idx}`] !== undefined)
    })
    return true
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white">Nouvelle Mission d'Audit</h1>
            <p className="text-sm text-text-on-dark-muted mt-2">Étape <span className="text-white font-bold">{step}</span> sur <span className="text-white font-bold">{totalSteps}</span></p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold text-brand">{progress.toFixed(0)}%</div>
            <p className="text-xs text-text-on-dark-muted mt-1">Progression</p>
          </div>
        </div>
        <ProgressBar value={progress} dark />
      </div>

      {/* Main Form */}
      <div className="rounded-xl border border-border-dark bg-surface-dark/50 backdrop-blur-sm p-8 space-y-8 min-h-[500px]">
        {/* Step 1: General Info */}
        {step === 1 && (
          <div className="space-y-6 fade-in-up">
            <div>
              <label className="block">
                <span className="text-sm font-semibold text-white mb-3 block">Nom de la Mission</span>
                <input
                  type="text"
                  value={form.missionName}
                  onChange={(e) => setForm({ ...form, missionName: e.target.value })}
                  placeholder="ex: Audit Securite Q4 2026"
                  className="w-full px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-white mb-3 block">Organisation</span>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="Acme Corp SA"
                  className="w-full px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-white mb-3 block">Secteur</span>
                <select
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
                >
                  <option value="">Selectionnez un secteur</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span className="text-sm font-semibold text-white mb-3 block">Type d'Audit</span>
              <select
                value={form.auditType}
                onChange={(e) => setForm({ ...form, auditType: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
              >
                <option value="complet">Audit Complet (tous les domaines)</option>
                <option value="conformite">Audit de Conformite (referentiels)</option>
                <option value="technique">Audit Technique (infrastructure)</option>
                <option value="gouvernance">Audit de Gouvernance (policies)</option>
              </select>
            </label>
          </div>
        )}

        {/* Step 2: Dates & Scope */}
        {step === 2 && (
          <div className="space-y-6 fade-in-up">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-white mb-3 block">Date de Debut</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
                />
              </label>

              <label>
                <span className="text-sm font-semibold text-white mb-3 block">Date de Fin</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
                />
              </label>
            </div>

            <label>
              <span className="text-sm font-semibold text-white mb-3 block">Nombre d'Auditeurs</span>
              <input
                type="number"
                min="1"
                max="5"
                value={form.auditors}
                onChange={(e) => setForm({ ...form, auditors: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
              />
            </label>

            <label>
              <span className="text-sm font-semibold text-white mb-3 block">Perimetre d'Audit</span>
              <textarea
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
                placeholder="Infrastructure complete, 5 bureaux, 200 utilisateurs, 50 serveurs, etc..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition"
              />
            </label>
          </div>
        )}

        {/* Step 3: Dimensions */}
        {step === 3 && (
          <div className="space-y-4 fade-in-up">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Dimensions a Auditer</h3>
              <p className="text-sm text-text-on-dark-muted mb-6">Selectionnez tous les domaines a evaluer</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {auditDimensions.map((dim) => (
                <button
                  key={dim.id}
                  onClick={() => toggleDimension(dim.id)}
                  className={`text-left p-4 rounded-lg border-2 transition ${
                    form.selectedDimensions.includes(dim.id)
                      ? 'border-brand bg-brand/10'
                      : 'border-border-dark bg-bg-dark hover:border-brand/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{dim.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{dim.label}</p>
                      <p className="text-xs text-text-on-dark-muted mt-1">{dim.description}</p>
                    </div>
                    {form.selectedDimensions.includes(dim.id) && (
                      <CheckCircle2 size={20} className="text-brand shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Referentiels */}
        {step === 4 && (
          <div className="space-y-4 fade-in-up">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Referentiels de Conformite</h3>
              <p className="text-sm text-text-on-dark-muted mb-6">Selectionnez les normes a evaluer</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {referentiels.map((ref) => (
                <button
                  key={ref}
                  onClick={() => toggleReferentiel(ref)}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    form.selectedReferentiels.includes(ref)
                      ? 'border-brand bg-brand/10'
                      : 'border-border-dark bg-bg-dark hover:border-brand/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{ref}</span>
                    {form.selectedReferentiels.includes(ref) && (
                      <CheckCircle2 size={20} className="text-brand" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Questionnaire */}
        {step === 5 && (
          <div className="space-y-8 fade-in-up">
            {form.selectedReferentiels.map((ref) => (
              <div key={ref} className="space-y-4 pb-6 border-b border-border-dark last:border-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield size={20} className="text-brand" />
                    {ref}
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand">{calculateReferentielScore(ref)}%</div>
                    <p className="text-xs text-text-on-dark-muted">Score</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(referentielQuestions[ref] || []).map((q, idx) => (
                    <div key={idx} className="bg-bg-dark/50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="font-medium text-white">{q.question}</p>
                        <p className="text-xs text-text-on-dark-muted mt-1">{q.details}</p>
                      </div>

                      <div className="flex gap-2">
                        {[0, 3, 5, 7, 10].map((score) => (
                          <button
                            key={score}
                            onClick={() => handleQuestionAnswer(`${ref}-${idx}`, score)}
                            className={`px-3 py-2 rounded text-sm font-semibold transition ${
                              form.questionnaireAnswers[`${ref}-${idx}`] === score
                                ? 'bg-brand text-white'
                                : 'bg-border-dark text-text-on-dark-muted hover:bg-brand/20'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Summary */}
        {step === 6 && (
          <div className="space-y-6 fade-in-up">
            <div className="bg-bg-dark/50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-brand" />
                Recapitulatif de la Mission
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-on-dark-muted">Mission</p>
                  <p className="text-sm font-semibold text-white">{form.missionName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-on-dark-muted">Organisation</p>
                  <p className="text-sm font-semibold text-white">{form.organization}</p>
                </div>
                <div>
                  <p className="text-xs text-text-on-dark-muted">Dimensions</p>
                  <p className="text-sm font-semibold text-white">{form.selectedDimensions.length} selectionnees</p>
                </div>
                <div>
                  <p className="text-xs text-text-on-dark-muted">Referentiels</p>
                  <p className="text-sm font-semibold text-white">{form.selectedReferentiels.length} normes</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-white">Scores par Referentiel</h4>
              {form.selectedReferentiels.map((ref) => (
                <div key={ref} className="flex items-center justify-between bg-bg-dark/50 rounded-lg p-4">
                  <span className="text-white font-medium">{ref}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full bg-border-dark overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand to-brand-light"
                        style={{ width: `${calculateReferentielScore(ref)}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-brand w-12 text-right">{calculateReferentielScore(ref)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3">
              <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Pret a creer la mission</p>
                <p className="text-sm text-text-on-dark-muted">Tous les parametres sont configures</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-text-on-dark-muted bg-transparent text-text-on-dark-muted hover:border-brand hover:text-brand hover:bg-brand/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-text-on-dark-muted/30 font-semibold transition"
        >
          <ChevronLeft size={16} /> Retour
        </button>

        <div className="flex-1" />

        {step < totalSteps ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
          >
            Continuer <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => alert('Mission creee avec succes!')}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            <CheckCircle2 size={16} /> Creer la Mission
          </button>
        )}
      </div>
    </div>
  )
}
