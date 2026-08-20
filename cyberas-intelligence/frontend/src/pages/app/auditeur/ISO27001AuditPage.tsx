import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, XCircle, Clock, Download, Save } from 'lucide-react'
import auditService from '../../../services/auditService'
import type { AuditControl } from '../../../types/audit'

interface ControlAnswer {
  [controlId: string]: {
    status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable'
    evidence?: string
    comments?: string
  }
}

export function ISO27001AuditPage() {
  const [framework, setFramework] = useState<any>(null)
  const [answers, setAnswers] = useState<ControlAnswer>({})
  const [currentSection, setCurrentSection] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [complianceStats, setComplianceStats] = useState({ compliant: 0, total: 0 })

  useEffect(() => {
    loadAuditFramework()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [answers])

  const loadAuditFramework = async () => {
    try {
      const data = await auditService.loadISO27001Framework()
      setFramework(data)
      if (data.sections && data.sections.length > 0) {
        setCurrentSection(data.sections[0].id)
      }
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const compliant = Object.values(answers).filter(a => a.status === 'compliant').length
    const total = Object.keys(answers).length
    setComplianceStats({ compliant, total })
  }

  const handleAnswerChange = (controlId: string, field: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [controlId]: {
        ...prev[controlId],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // À implémenter avec le backend
      console.log('Sauvegarde des réponses:', answers)
      setSaving(false)
    } catch (error) {
      console.error('Erreur de sauvegarde:', error)
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-50 border-green-200'
      case 'non_compliant':
        return 'bg-red-50 border-red-200'
      case 'partial':
        return 'bg-yellow-50 border-yellow-200'
      case 'not_applicable':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'non_compliant':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'not_applicable':
        return <Clock className="w-5 h-5 text-gray-600" />
      default:
        return null
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement du framework ISO 27001...</div>
  }

  if (!framework) {
    return <div className="p-8 text-center text-red-600">Erreur: Framework non chargé</div>
  }

  const currentSectionData = framework.sections?.find((s: any) => s.id === currentSection)
  const filteredControls = currentSectionData?.controls?.filter((c: AuditControl) =>
    searchQuery === '' ||
    c.code.includes(searchQuery) ||
    c.title_fr.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🔒 Audit ISO/IEC 27001:2022</h1>
        <p className="text-indigo-100">
          Framework complet avec {framework.meta?.controls_count} contrôles de sécurité
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{complianceStats.compliant}</div>
          <div className="text-sm text-gray-600">Conformes</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{complianceStats.total}</div>
          <div className="text-sm text-gray-600">Évalués</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-indigo-600">
            {complianceStats.total > 0
              ? Math.round((complianceStats.compliant / complianceStats.total) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Conformité</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar Sections */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Sections</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {framework.sections?.map((section: any) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`w-full text-left px-4 py-3 transition ${
                    currentSection === section.id
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{section.code}</div>
                  <div className="text-xs text-gray-600 truncate">{section.title_fr}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-3 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <input
              type="text"
              placeholder="Rechercher un contrôle (code ou titre)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {filteredControls.map((control: AuditControl) => (
              <div
                key={control.id}
                className={`bg-white rounded-lg border-l-4 border p-6 ${getStatusColor(
                  answers[control.id]?.status || ''
                )}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded text-sm">
                        {control.code}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{control.title_fr}</h3>
                    </div>
                    {control.description_fr && (
                      <p className="text-sm text-gray-600 mt-2">{control.description_fr}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    {answers[control.id]?.status && getStatusIcon(answers[control.id].status)}
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'compliant', label: '✅ Conforme' },
                        { value: 'non_compliant', label: '❌ Non conforme' },
                        { value: 'partial', label: '⚠️ Partiel' },
                        { value: 'not_applicable', label: '⏭️ N/A' },
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleAnswerChange(control.id, 'status', option.value)}
                          className={`px-3 py-2 rounded text-sm font-medium transition ${
                            answers[control.id]?.status === option.value
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evidence */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Éléments de preuve
                    </label>
                    <textarea
                      value={answers[control.id]?.evidence || ''}
                      onChange={(e) => handleAnswerChange(control.id, 'evidence', e.target.value)}
                      placeholder="Décrire les éléments de preuve..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                    />
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observations
                    </label>
                    <textarea
                      value={answers[control.id]?.comments || ''}
                      onChange={(e) => handleAnswerChange(control.id, 'comments', e.target.value)}
                      placeholder="Ajouter des observations..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>
    </div>
  )
}
