import { useState } from 'react'
import { Search, CheckCircle2, Clock, XCircle, Lock, Calendar, Building2, User } from 'lucide-react'

interface AuditSession {
  id: string
  missionName: string
  organization: string
  auditeur: string
  startDate: string
  status: 'en_cours' | 'fermé' | 'annulé'
  vulnsFound: number
  progress: number
  referentiels: string[]
  score?: number
}

const mockAudits: AuditSession[] = [
  {
    id: '1',
    missionName: 'Audit Sécurité Q3 2026',
    organization: 'TechCorp SA',
    auditeur: 'Jean Dupont',
    startDate: '2026-08-01',
    status: 'en_cours',
    vulnsFound: 12,
    progress: 75,
    referentiels: ['ISO 27001', 'NIST'],
    score: 76,
  },
  {
    id: '2',
    missionName: 'Conformité ISO 27001',
    organization: 'FinanceBank',
    auditeur: 'Marie Renaud',
    startDate: '2026-07-15',
    status: 'en_cours',
    vulnsFound: 5,
    progress: 90,
    referentiels: ['ISO 27001', 'PCI-DSS'],
    score: 88,
  },
  {
    id: '3',
    missionName: 'Audit Infrastructure',
    organization: 'HealthCare Plus',
    auditeur: 'Pierre Martin',
    startDate: '2026-07-01',
    status: 'fermé',
    vulnsFound: 8,
    progress: 100,
    referentiels: ['NIST', 'ISO 27002'],
    score: 82,
  },
  {
    id: '4',
    missionName: 'Audit Réglementaire',
    organization: 'GovAgency',
    auditeur: 'Sophie Laurent',
    startDate: '2026-06-15',
    status: 'fermé',
    vulnsFound: 3,
    progress: 100,
    referentiels: ['ISO 27001'],
    score: 91,
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'en_cours':
      return { label: 'En cours', bg: 'bg-blue-500/20', text: 'text-blue-300', icon: Clock }
    case 'fermé':
      return { label: 'Fermé', bg: 'bg-green-500/20', text: 'text-green-300', icon: CheckCircle2 }
    case 'annulé':
      return { label: 'Annulé', bg: 'bg-red-500/20', text: 'text-red-300', icon: XCircle }
    default:
      return { label: 'Inconnu', bg: 'bg-gray-500/20', text: 'text-gray-300', icon: Clock }
  }
}

const getRiskColor = (vulns: number) => {
  if (vulns > 15) return 'text-red-300 font-bold'
  if (vulns > 8) return 'text-orange-300 font-bold'
  if (vulns > 3) return 'text-yellow-300'
  return 'text-green-300'
}

export function AdminAuditActionsPage() {
  const [audits, setAudits] = useState<AuditSession[]>(mockAudits)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'en_cours' | 'fermé' | 'annulé'>('all')
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null)

  const filtered = audits.filter((audit) => {
    const matchesSearch =
      audit.missionName.toLowerCase().includes(search.toLowerCase()) ||
      audit.organization.toLowerCase().includes(search.toLowerCase()) ||
      audit.auditeur.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || audit.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleCloseAudit = (auditId: string) => {
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === auditId ? { ...audit, status: 'fermé' as const, progress: 100 } : audit,
      ),
    )
    setSelectedAudit(null)
    alert('Audit fermé avec succès!')
  }

  const handleCancelAudit = (auditId: string) => {
    setAudits((prev) =>
      prev.map((audit) =>
        audit.id === auditId ? { ...audit, status: 'annulé' as const } : audit,
      ),
    )
    setSelectedAudit(null)
    alert('Audit annulé!')
  }

  const stats = {
    total: audits.length,
    enCours: audits.filter((a) => a.status === 'en_cours').length,
    fermes: audits.filter((a) => a.status === 'fermé').length,
    totalVulns: audits.reduce((sum, a) => sum + a.vulnsFound, 0),
    avgScore: Math.round(audits.reduce((sum, a) => sum + (a.score || 0), 0) / audits.length),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Gestion des Audits</h1>
        <p className="text-sm text-text-on-dark-muted mt-2">Supervisez et cloturez les missions en cours</p>
      </div>

      {/* Stats Simples */}
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="bg-bg-dark border border-border-dark rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-text-on-dark-muted mt-1">Audits total</p>
        </div>
        <div className="bg-bg-dark border border-border-dark rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-300">{stats.enCours}</p>
          <p className="text-xs text-text-on-dark-muted mt-1">En cours</p>
        </div>
        <div className="bg-bg-dark border border-border-dark rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-300">{stats.fermes}</p>
          <p className="text-xs text-text-on-dark-muted mt-1">Fermes</p>
        </div>
        <div className="bg-bg-dark border border-border-dark rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-300">{stats.totalVulns}</p>
          <p className="text-xs text-text-on-dark-muted mt-1">Vulns trouvees</p>
        </div>
        <div className="bg-bg-dark border border-border-dark rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-brand">{stats.avgScore}%</p>
          <p className="text-xs text-text-on-dark-muted mt-1">Score moyen</p>
        </div>
      </div>

      {/* Search et Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
          <input
            type="text"
            placeholder="Chercher par mission, organisation ou auditeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'en_cours', 'fermé', 'annulé'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                selectedStatus === status
                  ? 'bg-brand text-white'
                  : 'border border-border-dark text-text-on-dark-muted hover:text-white'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'en_cours' ? 'En cours' : status === 'fermé' ? 'Fermes' : 'Annules'}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="border border-border-dark rounded-lg overflow-x-auto">
        <table className="w-full text-[10px] sm:text-xs md:text-sm">
          <thead className="bg-bg-dark border-b border-border-dark">
            <tr>
              <th className="px-1.5 sm:px-3 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">Mission</th>
              <th className="hidden sm:table-cell px-1.5 sm:px-3 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">Org</th>
              <th className="hidden md:table-cell px-1.5 sm:px-3 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">Audit</th>
              <th className="hidden lg:table-cell px-1.5 sm:px-3 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">Date</th>
              <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">Prog</th>
              <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">V</th>
              <th className="hidden sm:table-cell px-1.5 sm:px-3 py-2 sm:py-3 text-center text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">Score</th>
              <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">St</th>
              <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-[9px] sm:text-xs font-bold text-text-on-dark-muted uppercase">Actn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-text-on-dark-muted">
                  Aucun audit trouve
                </td>
              </tr>
            ) : (
              filtered.map((audit) => {
                const statusConfig = getStatusBadge(audit.status)
                const StatusIcon = statusConfig.icon

                return (
                  <tr key={audit.id} className="hover:bg-bg-dark/50 transition">
                    <td className="px-1.5 sm:px-3 py-2 sm:py-3">
                      <p className="font-bold text-white text-[9px] sm:text-xs">{audit.missionName}</p>
                    </td>
                    <td className="hidden sm:table-cell px-1.5 sm:px-3 py-2 sm:py-3">
                      <div className="flex items-center gap-1 text-text-on-dark text-[8px] sm:text-xs">
                        <Building2 size={12} className="hidden sm:block" />
                        <span className="truncate">{audit.organization}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-1.5 sm:px-3 py-2 sm:py-3">
                      <div className="flex items-center gap-1 text-text-on-dark text-[8px] sm:text-xs">
                        <User size={12} className="hidden md:block" />
                        <span className="truncate">{audit.auditeur}</span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-1.5 sm:px-3 py-2 sm:py-3">
                      <div className="flex items-center gap-1 text-text-on-dark-muted text-[8px] sm:text-xs">
                        <Calendar size={12} className="hidden lg:block" />
                        {audit.startDate}
                      </div>
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-12 sm:w-16 h-1 rounded-full bg-border-dark overflow-hidden">
                          <div
                            className="h-full bg-brand"
                            style={{ width: `${audit.progress}%` }}
                          />
                        </div>
                        <span className="text-[8px] sm:text-xs font-bold text-brand w-6">{audit.progress}%</span>
                      </div>
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 text-center">
                      <span className={`text-[9px] sm:text-xs font-bold ${getRiskColor(audit.vulnsFound)}`}>
                        {audit.vulnsFound}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-1.5 sm:px-3 py-2 sm:py-3 text-center">
                      {audit.score !== undefined ? (
                        <span className="text-[9px] sm:text-xs font-bold text-brand">{audit.score}%</span>
                      ) : (
                        <span className="text-[8px] sm:text-xs text-text-on-dark-muted">-</span>
                      )}
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 text-center">
                      <div className={`inline-flex items-center gap-0.5 px-1.5 sm:px-3 py-1 rounded-full text-[7px] sm:text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon size={10} className="hidden sm:block" />
                        <span className="hidden sm:inline">{statusConfig.label}</span>
                        <span className="sm:hidden">{statusConfig.label.substring(0, 3)}</span>
                      </div>
                    </td>
                    <td className="px-1 sm:px-3 py-2 sm:py-3 text-center">
                      {audit.status === 'en_cours' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedAudit(audit.id)}
                            className="text-green-400 hover:text-green-300 transition text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-green-500/10"
                            title="Cloturer"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleCancelAudit(audit.id)}
                            className="text-red-400 hover:text-red-300 transition text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-red-500/10"
                            title="Annuler"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-0.5 text-gray-400">
                          <Lock size={10} />
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-lg bg-surface-dark border border-border-dark p-6 max-w-md space-y-4">
            <h2 className="text-xl font-bold text-white">Confirmer la cloture d'audit</h2>
            <p className="text-sm text-text-on-dark-muted">
              Etes-vous sur de vouloir cloturer cet audit? Cette action est irreversible.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleCloseAudit(selectedAudit)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition"
              >
                Confirmer
              </button>
              <button
                onClick={() => setSelectedAudit(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition font-bold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
