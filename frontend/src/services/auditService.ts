import type { AuditSession } from '../types/audit'

class AuditService {
  private baseUrl = '/api/audits'

  async loadISO27001Framework() {
    try {
      const response = await fetch('/audit-iso27001.json')
      if (!response.ok) throw new Error('Échec du chargement du framework ISO 27001')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement ISO 27001:', error)
      throw error
    }
  }

  async createAuditSession(data: Partial<AuditSession>) {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Échec de la création de la session')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la création de session:', error)
      throw error
    }
  }

  async saveAuditProgress(sessionId: string, data: Partial<AuditSession>) {
    try {
      const response = await fetch(`${this.baseUrl}/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Échec de la sauvegarde')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      throw error
    }
  }

  async getAuditSession(sessionId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${sessionId}`)
      if (!response.ok) throw new Error('Session non trouvée')
      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la récupération:', error)
      throw error
    }
  }

  calculateCompliancePercentage(answers: Record<string, string>) {
    const compliant = Object.values(answers).filter(status => status === 'compliant').length
    const total = Object.keys(answers).length
    return total > 0 ? Math.round((compliant / total) * 100) : 0
  }
}

export default new AuditService()
