interface AuditorInvitation {
  id: string
  email: string
  orgId: string
  orgName: string
  rssiName: string
  referentiels: string[]
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: number
  expiresAt: number
  token: string
}

const invitationStore = new Map<string, AuditorInvitation>()
const INVITATION_VALIDITY = 7 * 24 * 60 * 60 * 1000 // 7 days

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function createInvitation(
  email: string,
  orgId: string,
  orgName: string,
  rssiName: string,
  referentiels: string[]
): AuditorInvitation {
  const token = generateToken()
  const invitation: AuditorInvitation = {
    id: `inv_${Date.now()}`,
    email,
    orgId,
    orgName,
    rssiName,
    referentiels,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + INVITATION_VALIDITY,
    token,
  }

  invitationStore.set(token, invitation)
  const invitationUrl = `${window.location.origin}/invitation/auditeur?token=${token}`
  console.log(`[INVITATION] Sent to ${email} for ${orgName}`)
  console.log(`[INVITATION] Acceptance URL: ${invitationUrl}`)
  return invitation
}

export function getInvitation(token: string): AuditorInvitation | null {
  const invitation = invitationStore.get(token)

  if (!invitation) {
    console.log(`[INVITATION] Token not found: ${token}`)
    return null
  }

  if (Date.now() > invitation.expiresAt) {
    invitationStore.delete(token)
    console.log(`[INVITATION] Token expired: ${token}`)
    return null
  }

  if (invitation.status !== 'pending') {
    console.log(`[INVITATION] Token already ${invitation.status}: ${token}`)
    return null
  }

  return invitation
}

export function acceptInvitation(token: string): boolean {
  const invitation = getInvitation(token)
  if (!invitation) return false

  invitation.status = 'accepted'
  console.log(`[INVITATION] Accepted by ${invitation.email} for ${invitation.orgName}`)
  return true
}

export function rejectInvitation(token: string): boolean {
  const invitation = invitationStore.get(token)
  if (!invitation) return false

  invitation.status = 'rejected'
  console.log(`[INVITATION] Rejected by ${invitation.email}`)
  return true
}

export function listInvitations(orgId: string): AuditorInvitation[] {
  return Array.from(invitationStore.values()).filter((inv) => inv.orgId === orgId)
}
