import { useState, useEffect } from 'react'
import { Plus, Mail, Trash2, Check, Clock, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { createInvitation, listInvitations } from '../../../services/invitations'

interface AuditorInvite {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'rejected'
  inviteDate: string
  referentiels: string[]
  invitationUrl?: string
  token?: string
}

export function ManageAuditorsPage() {
  const { user } = useAuth()
  const [invites, setInvites] = useState<AuditorInvite[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [selectedReferentiels, setSelectedReferentiels] = useState<string[]>(['ISO 27001'])
  const [showing, setShowing] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const referentiels = ['ISO 27001', 'ISO 27002', 'NIST CSF', 'CIS Controls', 'RGPD', 'PCI-DSS', 'HIPAA', 'ANSSI']

  useEffect(() => {
    if (user?.organization) {
      const invitations = listInvitations(user.organization)
      const formattedInvites = invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        status: inv.status,
        inviteDate: new Date(inv.createdAt).toISOString().split('T')[0],
        referentiels: inv.referentiels,
        token: inv.token,
        invitationUrl: `${window.location.origin}/invitation/auditeur?token=${inv.token}`,
      }))
      setInvites(formattedInvites)
    }
  }, [user])

  const handleAddAuditor = () => {
    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Email invalide')
      return
    }

    if (selectedReferentiels.length === 0) {
      alert('Selectionnez au moins un referentiel')
      return
    }

    const invitation = createInvitation(
      newEmail,
      user?.organization || 'org-default',
      user?.organization || 'Organisation',
      user?.name || 'Responsable',
      selectedReferentiels
    )

    const newInvite: AuditorInvite = {
      id: invitation.id,
      email: invitation.email,
      status: 'pending',
      inviteDate: new Date().toISOString().split('T')[0],
      referentiels: invitation.referentiels,
      token: invitation.token,
      invitationUrl: `${window.location.origin}/invitation/auditeur?token=${invitation.token}`,
    }

    setInvites([...invites, newInvite])
    setNewEmail('')
    setSelectedReferentiels(['ISO 27001'])
    alert(`Invitation creee pour ${newEmail}`)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRemove = (id: string) => {
    setInvites(invites.filter((i) => i.id !== id))
  }

  const availableSlots = 2 - invites.length
  const acceptedCount = invites.filter((i) => i.status === 'accepted').length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Gestion des Auditeurs</h1>
        <p className="text-sm text-text-on-dark-muted mt-2">Invitez jusqu'a 2 auditeurs a rejoindre votre equipe</p>
      </div>

      {/* Quotas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Slots disponibles</p>
          <p className="text-2xl font-bold text-blue-400">{availableSlots}/2</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">Acceptes</p>
          <p className="text-2xl font-bold text-green-400">{acceptedCount}</p>
        </div>
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-4">
          <p className="text-xs text-text-on-dark-muted">En attente</p>
          <p className="text-2xl font-bold text-yellow-400">{invites.filter((i) => i.status === 'pending').length}</p>
        </div>
      </div>

      {/* Add Auditor Form */}
      {showing && (
        <div className="rounded-lg border border-border-dark bg-surface-dark/50 p-6 space-y-4">
          <h2 className="font-bold text-white">Inviter un auditeur a votre equipe</h2>

          <label>
            <span className="text-sm font-medium text-text-on-dark">Email de l'auditeur</span>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="auditeur@example.com"
              className="w-full mt-2 px-4 py-2 rounded-lg border border-border-dark bg-bg-dark text-white placeholder-text-on-dark-muted focus:border-brand focus:outline-none transition"
            />
          </label>

          <label>
            <span className="text-sm font-medium text-text-on-dark">Referentiels (selectionnez au moins un)</span>
            <div className="mt-2 grid gap-2 grid-cols-2 sm:grid-cols-4">
              {referentiels.map((ref) => (
                <button
                  key={ref}
                  onClick={() => {
                    if (selectedReferentiels.includes(ref)) {
                      setSelectedReferentiels(selectedReferentiels.filter((r) => r !== ref))
                    } else {
                      setSelectedReferentiels([...selectedReferentiels, ref])
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                    selectedReferentiels.includes(ref)
                      ? 'bg-brand text-white'
                      : 'border border-border-dark text-text-on-dark hover:border-brand/50'
                  }`}
                >
                  {ref}
                </button>
              ))}
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddAuditor}
              disabled={availableSlots === 0}
              className="flex-1 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold transition"
            >
              Creer invitation
            </button>
            <button
              onClick={() => setShowing(false)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border-dark text-text-on-dark hover:text-white transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {!showing && (
        <button
          onClick={() => setShowing(true)}
          disabled={availableSlots === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold transition"
        >
          <Plus size={16} /> Ajouter un auditeur
        </button>
      )}

      {/* Invites List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Auditeurs invites ({invites.length})</h3>
        {invites.length === 0 ? (
          <p className="text-sm text-text-on-dark-muted">Aucun auditeur invite pour le moment</p>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.id} className="rounded-lg border border-border-dark bg-bg-dark/50 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 mt-1">
                      <Mail size={18} className="text-brand" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{invite.email}</p>
                      <p className="text-xs text-text-on-dark-muted mt-1">
                        Invite le {invite.inviteDate} • {invite.referentiels.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {invite.status === 'accepted' ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                        <Check size={14} className="text-green-400" />
                        <span className="text-xs font-bold text-green-400">Accepte</span>
                      </div>
                    ) : invite.status === 'pending' ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                        <Clock size={14} className="text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400">Attente</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-xs font-bold text-red-400">Refuse</span>
                      </div>
                    )}
                  </div>
                </div>

                {invite.status === 'pending' && invite.invitationUrl && (
                  <div className="bg-bg-dark rounded-lg p-3 border border-border-dark/50 space-y-2">
                    <p className="text-xs text-text-on-dark-muted font-semibold">Lien d'invitation:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={invite.invitationUrl}
                        readOnly
                        className="flex-1 px-2 py-2 text-xs rounded bg-bg-dark border border-border-dark text-text-on-dark-muted font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(invite.invitationUrl!, invite.id)}
                        className="p-2 rounded hover:bg-surface-dark text-text-on-dark-muted hover:text-white transition"
                        title="Copier"
                      >
                        <Copy size={16} />
                      </button>
                      <a
                        href={invite.invitationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded hover:bg-surface-dark text-text-on-dark-muted hover:text-white transition"
                        title="Ouvrir"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                    {copied === invite.id && <p className="text-xs text-green-400">Copie!</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-border-dark bg-bg-dark/50 p-4 space-y-2">
        <p className="text-sm text-text-on-dark-muted">
          <strong>Comment ca fonctionne:</strong>
        </p>
        <ul className="text-sm text-text-on-dark-muted space-y-1 ml-4">
          <li>• Creez une invitation pour chaque auditeur</li>
          <li>• Partagez le lien d'invitation (ou copie) avec l'auditeur</li>
          <li>• L'auditeur accepte l'invitation et rejoint votre equipe</li>
          <li>• L'auditeur peut alors realiser les missions d'audit</li>
        </ul>
      </div>
    </div>
  )
}
