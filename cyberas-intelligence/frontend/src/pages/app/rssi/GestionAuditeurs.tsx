import { useState } from 'react'
import { Plus, Mail, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Auditor {
  id: number
  name: string
  email: string
  status: 'actif' | 'en_attente' | 'suspendu'
  dateAjout: string
  lastAccess?: string
}

export function GestionAuditeurs() {
  const [auditors, setAuditors] = useState<Auditor[]>([
    {
      id: 1,
      name: 'Marie Martin',
      email: 'marie@acmecorp.ci',
      status: 'actif',
      dateAjout: '2026-08-01',
      lastAccess: '2026-08-10 14:30',
    },
    {
      id: 2,
      name: 'Jean Dupont',
      email: 'jean@acmecorp.ci',
      status: 'en_attente',
      dateAjout: '2026-08-10',
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [newAuditorEmail, setNewAuditorEmail] = useState('')
  const [newAuditorName, setNewAuditorName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAddAuditor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/rssi/auditors/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: newAuditorEmail, name: newAuditorName }),
      })

      if (!response.ok) throw new Error('Erreur lors de l\'invitation')

      const data = await response.json()
      setAuditors([...auditors, data])
      setNewAuditorEmail('')
      setNewAuditorName('')
      setShowForm(false)
      setMessage('Auditeur invité avec succès ! Un email de vérification a été envoyé.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAuditor = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet auditeur ?')) return

    try {
      const response = await fetch(`/api/rssi/auditors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      setAuditors(auditors.filter(a => a.id !== id))
      setMessage('Auditeur supprimé avec succès.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage((err as Error).message)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'actif':
        return <CheckCircle size={16} className="text-green-500" />
      case 'en_attente':
        return <Clock size={16} className="text-yellow-500" />
      case 'suspendu':
        return <AlertCircle size={16} className="text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Gestion des auditeurs</h1>
          <p className="text-sm text-text-on-dark-muted">Invitez et gérez les auditeurs de votre organisation</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold px-4 py-2.5 transition"
        >
          <Plus size={18} /> Inviter un auditeur
        </button>
      </div>

      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.includes('succès') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Inviter un nouvel auditeur</h2>
          <form onSubmit={handleAddAuditor} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Nom complet</span>
              <input
                type="text"
                required
                value={newAuditorName}
                onChange={(e) => setNewAuditorName(e.target.value)}
                placeholder="Ex. Marie Martin"
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-on-dark">Email professionnel</span>
              <div className="relative mt-2">
                <Mail size={18} className="absolute left-3 top-3 text-text-on-dark-muted" />
                <input
                  type="email"
                  required
                  value={newAuditorEmail}
                  onChange={(e) => setNewAuditorEmail(e.target.value)}
                  placeholder="auditeur@entreprise.ci"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-dark bg-bg-dark text-white placeholder:text-text-on-dark-muted focus:border-brand focus:outline-none"
                />
              </div>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold py-2.5 transition"
              >
                {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-border-dark text-text-on-dark hover:text-white font-semibold py-2.5 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border-dark bg-surface-dark shadow-xs">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border-dark text-left text-xs uppercase tracking-wide text-text-on-dark-muted">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date d'ajout</th>
              <th className="px-4 py-3">Dernier accès</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {auditors.map((auditor) => (
              <tr key={auditor.id} className="border-b border-border-dark last:border-0 hover:bg-bg-dark">
                <td className="px-4 py-3 font-semibold text-white">{auditor.name}</td>
                <td className="px-4 py-3 text-text-on-dark">{auditor.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(auditor.status)}
                    <span className="capitalize">{auditor.status === 'en_attente' ? 'En attente' : auditor.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-on-dark-muted">{auditor.dateAjout}</td>
                <td className="px-4 py-3 text-text-on-dark-muted">{auditor.lastAccess || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRemoveAuditor(auditor.id)}
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {auditors.length === 0 && (
        <div className="rounded-lg border border-border-dark bg-surface-dark p-8 text-center">
          <p className="text-text-on-dark-muted">Aucun auditeur encore. Invitez-en un pour démarrer.</p>
        </div>
      )}
    </div>
  )
}
