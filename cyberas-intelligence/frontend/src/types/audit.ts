export interface AuditControl {
  id: string
  code: string
  title_fr: string
  description_fr?: string
  maturity_level?: number
  risk_score?: number
  evidence?: string
  status?: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable'
  comments?: string
  evaluated_by?: string
  evaluation_date?: string
}

export interface AuditSection {
  id: string
  code: string
  title_fr: string
  description_fr?: string
  controls: AuditControl[]
}

export interface AuditSession {
  id: string
  organization: string
  audit_date: string
  auditor: string
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed'
  sections: AuditSection[]
  overall_maturity?: number
  overall_risk_score?: number
  compliance_percentage?: number
}

export interface ISO27001Meta {
  name: string
  version: string
  generated_at: string
  language: string
  controls_count: number
}
