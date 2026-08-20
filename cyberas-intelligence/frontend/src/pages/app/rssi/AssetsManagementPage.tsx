import { useState } from 'react'
import { Plus, Search, Trash2, Edit, AlertCircle, CheckCircle, Server, Laptop, HardDrive, Router } from 'lucide-react'

interface Asset {
  id: string
  name: string
  type: 'server' | 'workstation' | 'storage' | 'network' | 'other'
  ip: string
  os: string
  criticality: 'critique' | 'haute' | 'moyenne' | 'basse'
  vulns: number
  lastScan: string
  status: 'actif' | 'inactif' | 'en_maintenance'
  owner: string
  location: string
}

const assetTypeIcons: Record<Asset['type'], any> = {
  server: Server,
  workstation: Laptop,
  storage: HardDrive,
  network: Router,
  other: AlertCircle,
}

const criticalityColors: Record<Asset['criticality'], string> = {
  critique: 'bg-red-500/20 text-red-400 border-red-500/30',
  haute: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  moyenne: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  basse: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const statusColors: Record<Asset['status'], string> = {
  actif: 'text-green-400',
  inactif: 'text-gray-400',
  en_maintenance: 'text-yellow-400',
}

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'SRV-PROD-01',
    type: 'server',
    ip: '192.168.1.10',
    os: 'Ubuntu 22.04 LTS',
    criticality: 'critique',
    vulns: 3,
    lastScan: '2026-08-09',
    status: 'actif',
    owner: 'DevOps Team',
    location: 'Datacenter A',
  },
  {
    id: '2',
    name: 'SRV-DB-01',
    type: 'server',
    ip: '192.168.1.20',
    os: 'Ubuntu 20.04 LTS',
    criticality: 'critique',
    vulns: 1,
    lastScan: '2026-08-09',
    status: 'actif',
    owner: 'DBA Team',
    location: 'Datacenter A',
  },
  {
    id: '3',
    name: 'WS-DEV-001',
    type: 'workstation',
    ip: '192.168.2.45',
    os: 'Windows 11 Pro',
    criticality: 'haute',
    vulns: 5,
    lastScan: '2026-08-08',
    status: 'actif',
    owner: 'Development',
    location: 'Bureau 3',
  },
  {
    id: '4',
    name: 'STORAGE-NAS-01',
    type: 'storage',
    ip: '192.168.1.30',
    os: 'TrueNAS CORE 12.0',
    criticality: 'critique',
    vulns: 2,
    lastScan: '2026-08-10',
    status: 'actif',
    owner: 'Infrastructure',
    location: 'Datacenter A',
  },
  {
    id: '5',
    name: 'FW-MAIN-01',
    type: 'network',
    ip: '10.0.0.1',
    os: 'Palo Alto Networks',
    criticality: 'critique',
    vulns: 0,
    lastScan: '2026-08-10',
    status: 'actif',
    owner: 'Network Team',
    location: 'Datacenter A',
  },
  {
    id: '6',
    name: 'WS-IT-002',
    type: 'workstation',
    ip: '192.168.2.50',
    os: 'Ubuntu 22.04 LTS',
    criticality: 'moyenne',
    vulns: 2,
    lastScan: '2026-08-07',
    status: 'en_maintenance',
    owner: 'IT Support',
    location: 'Bureau 1',
  },
]

export function AssetsManagementPage() {
  const [assets] = useState<Asset[]>(mockAssets)
  const [search, setSearch] = useState('')
  const [selectedCriticality, setSelectedCriticality] = useState<Asset['criticality'] | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)

  const filtered = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.ip.toLowerCase().includes(search.toLowerCase()) ||
      asset.owner.toLowerCase().includes(search.toLowerCase())
    const matchesCriticality = selectedCriticality === 'all' || asset.criticality === selectedCriticality
    return matchesSearch && matchesCriticality
  })

  const totalVulns = filtered.reduce((sum, a) => sum + a.vulns, 0)
  const criticalAssets = filtered.filter((a) => a.criticality === 'critique').length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Gestion des Actifs</h1>
          <p className="text-sm text-text-on-dark-muted mt-2">Inventaire complet de vos ressources informatiques</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition"
        >
          <Plus size={16} /> Ajouter un actif
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Total d'actifs</p>
          <p className="text-2xl font-bold text-white">{assets.length}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Actifs critiques</p>
          <p className="text-2xl font-bold text-red-400">{criticalAssets}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Vulnérabilités détectées</p>
          <p className="text-2xl font-bold text-orange-400">{totalVulns}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Actifs actifs</p>
          <p className="text-2xl font-bold text-green-400">{assets.filter((a) => a.status === 'actif').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
          <input
            type="text"
            placeholder="Chercher par nom, IP ou propriétaire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none transition"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'critique', 'haute', 'moyenne', 'basse'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedCriticality(level)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedCriticality === level
                  ? 'bg-brand text-white'
                  : 'border border-border-dark text-text-on-dark hover:border-brand/50'
              }`}
            >
              {level === 'all' ? 'Tous' : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-lg border border-border-dark overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-dark bg-bg-dark/50">
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">ACTIF</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">TYPE</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">IP</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">OS</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">CRITICITÉ</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">VULNÉRABILITÉS</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">DERNIER SCAN</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">STATUT</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-on-dark-muted">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => {
              const TypeIcon = assetTypeIcons[asset.type]
              return (
                <tr key={asset.id} className="border-b border-border-dark hover:bg-bg-dark/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                        <TypeIcon size={16} className="text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{asset.name}</p>
                        <p className="text-xs text-text-on-dark-muted">{asset.owner}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-on-dark capitalize">{asset.type}</td>
                  <td className="px-4 py-3 text-sm text-text-on-dark font-mono">{asset.ip}</td>
                  <td className="px-4 py-3 text-sm text-text-on-dark-muted">{asset.os}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${criticalityColors[asset.criticality]}`}>
                      {asset.criticality}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <AlertCircle size={14} className={asset.vulns > 0 ? 'text-orange-400' : 'text-green-400'} />
                      <span className="text-sm font-semibold text-white">{asset.vulns}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-on-dark-muted">{asset.lastScan}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} className={statusColors[asset.status]} />
                      <span className={`text-xs font-medium ${statusColors[asset.status]}`}>
                        {asset.status === 'actif' ? 'Actif' : asset.status === 'inactif' ? 'Inactif' : 'En maintenance'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-brand hover:text-brand-dark transition" aria-label="Modifier">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-400 hover:text-red-600 transition" aria-label="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Asset Form */}
      {showAddForm && (
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Ajouter un nouvel actif</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-text-on-dark">Nom de l'actif</span>
              <input
                type="text"
                placeholder="Ex: SRV-PROD-02"
                className="mt-1 px-3 py-2 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none transition"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium text-text-on-dark">Adresse IP</span>
              <input
                type="text"
                placeholder="192.168.1.x"
                className="mt-1 px-3 py-2 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none transition"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium text-text-on-dark">Système d'exploitation</span>
              <input
                type="text"
                placeholder="Ubuntu 22.04"
                className="mt-1 px-3 py-2 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none transition"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium text-text-on-dark">Type</span>
              <select className="mt-1 px-3 py-2 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition">
                <option>server</option>
                <option>workstation</option>
                <option>storage</option>
                <option>network</option>
                <option>other</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium text-text-on-dark">Criticité</span>
              <select className="mt-1 px-3 py-2 rounded-lg border border-border-dark bg-bg-dark text-white focus:border-brand focus:outline-none transition">
                <option>critique</option>
                <option>haute</option>
                <option>moyenne</option>
                <option>basse</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium text-text-on-dark">Propriétaire</span>
              <input
                type="text"
                placeholder="DevOps Team"
                className="mt-1 px-3 py-2 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none transition"
              />
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button className="flex-1 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition">
              Créer l'actif
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
