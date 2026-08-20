import { useState } from 'react'
import { Save, ArrowRight, ChevronLeft } from 'lucide-react'

interface Mission {
  name: string
  organization: string
  referentiel: string
  perimeter: string
  auditors: string[]
  deadline: string
}

const referentiels: Record<string, { title: string; questions: string[] }> = {
  'ISO 27001': {
    title: 'ISO 27001:2022',
    questions: [
      'Politique de securite informatique',
      'Gestion des risques',
      'Gestion des incidents',
      'Controle d\'acces',
      'Chiffrement',
    ],
  },
  'NIST CSF': {
    title: 'NIST Cybersecurity Framework',
    questions: [
      'Identify - Asset Management',
      'Protect - Access Control',
      'Detect - Anomalies',
      'Respond - Incident Response',
      'Recover - Recovery Planning',
    ],
  },
  'PCI-DSS': {
    title: 'Payment Card Industry Data Security Standard',
    questions: [
      'Network Security',
      'Cardholder Data Protection',
      'Vulnerability Management',
      'Access Control',
      'Testing & Monitoring',
    ],
  },
}

export function MissionCreationPage() {
  const [step, setStep] = useState<'info' | 'referentiel' | 'confirm'>('info')
  const [mission, setMission] = useState<Mission>({
    name: '',
    organization: '',
    referentiel: '',
    perimeter: '',
    auditors: [''],
    deadline: '',
  })
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (step === 'info') {
      if (!mission.name || !mission.organization || !mission.perimeter) return
      setStep('referentiel')
    } else if (step === 'referentiel') {
      if (!mission.referentiel) return
      setStep('confirm')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert('Mission creee avec succes!')
    } finally {
      setLoading(false)
    }
  }

  const currentReferentiel = referentiels[mission.referentiel]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setStep('info')} className="text-text-on-dark-muted hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">Creer une Mission</h1>
      </div>

      {/* Progress */}
      <div className="flex gap-3 mb-6">
        {['info', 'referentiel', 'confirm'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full ${
              step === s ? 'bg-brand' : i < ['info', 'referentiel', 'confirm'].indexOf(step) ? 'bg-green-400' : 'bg-border-dark'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Info */}
      {step === 'info' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-4">
          <label>
            <span className="text-sm font-medium text-text-on-dark">Nom mission</span>
            <input
              type="text"
              value={mission.name}
              onChange={(e) => setMission({ ...mission, name: e.target.value })}
              placeholder="Audit Securite Q4 2026"
              className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-text-on-dark">Organisation</span>
            <input
              type="text"
              value={mission.organization}
              onChange={(e) => setMission({ ...mission, organization: e.target.value })}
              className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-text-on-dark">Perimetre</span>
            <textarea
              value={mission.perimeter}
              onChange={(e) => setMission({ ...mission, perimeter: e.target.value })}
              placeholder="Decrivez le perimetre d'audit..."
              rows={3}
              className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-text-on-dark">Date limite</span>
            <input
              type="date"
              value={mission.deadline}
              onChange={(e) => setMission({ ...mission, deadline: e.target.value })}
              className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none"
            />
          </label>
        </div>
      )}

      {/* Step 2: Referentiel */}
      {step === 'referentiel' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-4">
          <h2 className="text-lg font-bold text-white">Selectionnez referentiel</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(referentiels).map(([key, ref]) => (
              <button
                key={key}
                onClick={() => setMission({ ...mission, referentiel: key })}
                className={`p-4 rounded-lg border-2 text-center transition ${
                  mission.referentiel === key
                    ? 'border-brand bg-brand/10'
                    : 'border-border-dark bg-bg-dark hover:border-brand/50'
                }`}
              >
                <p className="font-bold text-white text-sm">{ref.title}</p>
              </button>
            ))}
          </div>

          {currentReferentiel && (
            <div className="mt-6 p-4 rounded-lg bg-bg-dark border border-border-dark">
              <h3 className="font-semibold text-white mb-3">Questions du questionnaire:</h3>
              <ul className="space-y-2">
                {currentReferentiel.questions.map((q, i) => (
                  <li key={i} className="text-sm text-text-on-dark-muted flex gap-2">
                    <span className="text-brand">•</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="bg-surface-dark/50 border border-border-dark rounded-xl p-8 space-y-4">
          <h2 className="text-lg font-bold text-white">Resume mission</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-on-dark-muted">Mission</span>
              <span className="text-white">{mission.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-on-dark-muted">Referentiel</span>
              <span className="text-brand font-semibold">{mission.referentiel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-on-dark-muted">Date limite</span>
              <span className="text-white">{mission.deadline}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (step === 'info') return
            if (step === 'referentiel') setStep('info')
            if (step === 'confirm') setStep('referentiel')
          }}
          disabled={step === 'info'}
          className="px-6 py-3 rounded-lg border border-border-dark text-text-on-dark hover:text-white disabled:opacity-50 font-semibold transition"
        >
          Retour
        </button>
        <div className="flex-1" />
        {step < 'confirm' ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition"
          >
            Continuer <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold transition"
          >
            <Save size={16} /> {loading ? 'Creation...' : 'Creer mission'}
          </button>
        )}
      </div>
    </div>
  )
}
