import { useState } from 'react'
import { Play, Pause, CheckCircle, Clock, AlertCircle, Zap, Shield, Target, Wrench, Cpu, TrendingUp, BarChart3 } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

const agentIcons: Record<string, any> = {
  nmap: Target,
  nessus: Zap,
  openvas: Shield,
  burp: Wrench,
  qualys: AlertCircle,
}

const agentCapabilities: Record<string, string[]> = {
  nmap: ['Découverte réseau', 'Scan ports', 'Détection OS'],
  nessus: ['Vulnérabilités', 'Compliance', 'Configuration'],
  openvas: ['Scan sécurité', 'Rapports détaillés', 'APIs'],
  burp: ['Pentest web', 'Analyse OWASP', 'Proxy'],
  qualys: ['Gestion vulns', 'Conformité', 'Riskmetrics'],
}

// Mock data for RSSI scoring and auditor assets
const mockAuditorScores = {
  'Audit1': { auditor: 'Jean Dupont', score: 82, sector: 'Finance', vulns: 3 },
  'Audit2': { auditor: 'Marie Martin', score: 76, sector: 'Santé', vulns: 5 },
  'Audit3': { auditor: 'Pierre Durand', score: 89, sector: 'Tech', vulns: 1 },
}

const mockAuditorAssets = {
  'Audit1': [
    { name: 'SRV-PROD-01', type: 'server', vulns: 2, sector: 'Finance' },
    { name: 'SRV-DB-01', type: 'server', vulns: 1, sector: 'Finance' },
  ],
  'Audit2': [
    { name: 'WS-HEALTH-01', type: 'workstation', vulns: 3, sector: 'Santé' },
    { name: 'APP-PATIENT-01', type: 'application', vulns: 2, sector: 'Santé' },
  ],
  'Audit3': [
    { name: 'SRV-API-01', type: 'server', vulns: 0, sector: 'Tech' },
    { name: 'APP-WEB-01', type: 'application', vulns: 1, sector: 'Tech' },
  ],
}

export function AgentsIaPage() {
  const { user } = useAuth()
  const [scanningAgent, setScanningAgent] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const isRssi = user?.role === 'rssi'

  const handleStartScan = (agentId: string) => {
    setScanningAgent(agentId)
    setTimeout(() => setScanningAgent(null), 3000)
  }

  // Get scoring data for RSSI view
  const auditScores = isRssi ? Object.values(mockAuditorScores) : []
  const averageScore = isRssi ? Math.round(auditScores.reduce((sum, a) => sum + a.score, 0) / auditScores.length) : 0
  const sectors = [...new Set(auditScores.map(a => a.sector))]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
            {isRssi ? <BarChart3 size={20} className="text-brand" /> : <Cpu size={20} className="text-brand" />}
          </div>
          <h1 className="text-4xl font-extrabold text-white">
            {isRssi ? 'Analyse & Scoring des Audits' : 'Agents IA & Scans'}
          </h1>
        </div>
        <p className="text-text-on-dark-muted mt-2 max-w-2xl">
          {isRssi
            ? 'Vue générale du scoring des audits menés par vos auditeurs avec analyse sectorielle.'
            : 'Déployez et gérez vos outils de scan automatisés pour auditer votre infrastructure en temps réel.'}
        </p>
      </div>

      {/* RSSI Scoring Overview */}
      {isRssi && auditScores.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border-2 border-brand/30 bg-surface-dark p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-text-on-dark-muted">Score Global Moyen</p>
            <p className="text-5xl font-extrabold text-brand mt-3">{averageScore}%</p>
            <p className="text-xs text-text-on-dark-muted mt-2">{auditScores.length} audits en cours</p>
          </div>
          <div className="rounded-xl border-2 border-brand/30 bg-surface-dark p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-text-on-dark-muted">Vulnérabilités Totales</p>
            <p className="text-5xl font-extrabold text-red-400 mt-3">
              {auditScores.reduce((sum, a) => sum + a.vulns, 0)}
            </p>
            <p className="text-xs text-text-on-dark-muted mt-2">À traiter</p>
          </div>
          <div className="rounded-xl border-2 border-brand/30 bg-surface-dark p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-text-on-dark-muted">Secteurs Audités</p>
            <p className="text-5xl font-extrabold text-blue-400 mt-3">{sectors.length}</p>
            <p className="text-xs text-text-on-dark-muted mt-2">Domaines couverts</p>
          </div>
        </div>
      )}

      {/* Sector Filter for RSSI */}
      {isRssi && sectors.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold uppercase tracking-widest text-text-on-dark-muted">Filtrer par secteur</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSector(null)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                selectedSector === null
                  ? 'bg-brand text-white'
                  : 'border-2 border-border-dark text-text-on-dark hover:border-brand'
              }`}
            >
              Vue Générale
            </button>
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  selectedSector === sector
                    ? 'bg-brand text-white'
                    : 'border-2 border-border-dark text-text-on-dark hover:border-brand'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RSSI Auditor Scores Table */}
      {isRssi && auditScores.length > 0 && (
        <div className="rounded-xl border-2 border-border-dark bg-surface-dark overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-dark/50 border-b-2 border-border-dark">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Auditeur</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Secteur</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Score</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Vulnérabilités</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Actifs</th>
              </tr>
            </thead>
            <tbody>
              {auditScores
                .filter(score => !selectedSector || score.sector === selectedSector)
                .map((score, idx) => (
                  <tr key={idx} className="border-b border-border-dark hover:bg-bg-dark/30 transition">
                    <td className="px-6 py-4 font-bold text-white">{score.auditor}</td>
                    <td className="px-6 py-4 text-text-on-dark">{score.sector}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                        score.score >= 80 ? 'bg-green-600 text-white' :
                        score.score >= 70 ? 'bg-blue-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {score.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${score.vulns === 0 ? 'text-green-400' : score.vulns <= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score.vulns}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-text-on-dark font-semibold">
                      {mockAuditorAssets[`Audit${idx + 1}`]?.length || 0}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subscription Info Card */}
      {user?.subscription && (
        <div className="rounded-xl border-2 border-brand/30 bg-surface-dark backdrop-blur-sm p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Plan actuel</p>
              <p className="text-4xl font-extrabold text-white mt-2">{user.subscription.plan}</p>
              <p className="text-lg text-brand font-bold mt-2">{user.subscription.price}/mois</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted">Agents inclus</p>
              <div className="flex flex-wrap gap-2">
                {user.agents?.map((agent) => (
                  <span key={agent.id} className="px-3 py-1.5 rounded-full bg-brand text-white text-xs font-bold">
                    {agent.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted mb-4">Agents disponibles</p>
        <div className="grid gap-6 md:grid-cols-2">
          {user?.agents?.map((agent) => {
            const IconComponent = agentIcons[agent.type] || Shield
            const isScanning = scanningAgent === agent.id
            const capabilities = agentCapabilities[agent.type] || []

            return (
              <div
                key={agent.id}
                className="group rounded-xl border-2 border-border-dark bg-surface-dark hover:border-brand hover:bg-surface-dark/80 transition p-6 space-y-4"
              >
                {/* Header with Icon and Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/20 group-hover:bg-brand/30 transition">
                      <IconComponent size={28} className="text-brand" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                      <p className="text-sm text-text-on-dark mt-0.5">{agent.description}</p>
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 font-bold ${
                      agent.status === 'completed'
                        ? 'bg-green-600 text-white'
                        : agent.status === 'scanning'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-border-dark text-text-on-dark'
                    }`}
                  >
                    {agent.status === 'completed' ? (
                      <CheckCircle size={18} />
                    ) : agent.status === 'scanning' ? (
                      <Zap size={18} className="animate-pulse" />
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((cap, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold">
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Last Scan & Status */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-dark">
                  {agent.lastScan && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-text-on-dark-muted">Dernier scan</p>
                      <p className="text-sm font-bold text-white mt-1">{agent.lastScan}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-text-on-dark-muted">Statut</p>
                    <p className={`text-sm font-bold mt-1 capitalize ${
                      agent.status === 'completed' ? 'text-green-400' :
                      agent.status === 'scanning' ? 'text-yellow-400' :
                      'text-text-on-dark-muted'
                    }`}>
                      {agent.status === 'completed' ? 'Actif' : agent.status === 'scanning' ? 'Scannage' : 'Inactif'}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleStartScan(agent.id)}
                  disabled={isScanning}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${
                    isScanning
                      ? 'bg-yellow-600 text-white cursor-not-allowed opacity-75'
                      : 'bg-brand hover:bg-brand-dark text-white'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <Pause size={16} /> Scan en cours...
                    </>
                  ) : (
                    <>
                      <Play size={16} /> Lancer scan
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border-dark bg-bg-dark/50 p-6">
        <p className="text-sm text-text-on-dark-muted">
          <strong className="text-text-on-dark">💡 Tip:</strong> Utilisez les agents pour automatiser vos scans de sécurité. Les résultats sont intégrés directement dans vos missions d'audit.
        </p>
      </div>
    </div>
  )
}
