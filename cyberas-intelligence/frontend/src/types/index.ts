// Admin types
export interface AdminStats {
  users: number
  organizations: number
  subscriptions: number
  revenue: string
  auditors: number
  missions: number
  compliance: number
}

export interface SystemStatusItem {
  name: string
  ok: boolean
}

export interface Activity {
  id?: number
  user?: string
  title: string
  detail: string
  time: string
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  org?: string
  status?: string
  lastLogin?: string
}

export interface Organization {
  id: number
  name: string
  users: number
  audits: number
  sector?: string
  country?: string
  plan?: string
  expires?: string
  status?: string
}

export interface Subscription {
  id?: number
  org: string
  plan: string
  status: string
  expires?: string
  amount?: string
  cycle?: string
  nextBilling?: string
}

export interface AuditLog {
  id?: number
  action: string
  user: string
  time: string
  target?: string
  ip?: string
}

// Auditeur types
export interface Mission {
  id: number
  name?: string
  title?: string
  organization?: string
  type?: string
  perimeter?: string
  status: string
  progress: number
  deadline?: string
  currentStep?: number
}

export interface Vulnerability {
  id: number
  title?: string
  name?: string
  cve?: string
  cvss?: number
  severity: string
  status: string
  asset?: string
  date?: string
}

export interface WizardStep {
  step: number
  title: string
  completed: boolean
  slug?: string
  label?: string
}

// RSSI types
export interface Risk {
  id: number
  title?: string
  label?: string
  domain?: string
  severity?: string
  impact?: number
  likelihood?: string
  probability?: number
  level?: string
}

export type RiskMatrix = number[][]

export interface Asset {
  id: number
  type: string
  name: string
  ip?: string
  status: string
  os?: string
  criticality?: string
  vulns?: number
  lastScan?: string
}

export interface Report {
  id: number
  title: string
  name?: string
  date: string
  status: string
  mission?: string
  type?: string
  pages?: number
}

// Marketing types
export interface Plan {
  id: number
  name: string
  price: string
  features: string[]
  highlighted?: boolean
}

export interface Module {
  id: number
  title: string
  icon?: any
  description: string
  slug?: string
}

export interface Agent {
  id: number
  name: string
  description: string
  capabilities: string[]
}

export interface Sector {
  id: number
  name: string
  description: string
  icon?: any
}

export interface PlanFeature {
  label: string
  included: boolean
}

export interface PlanInfo {
  id: number
  name: string
  price: string
  period: string
  description: string
  recommended: boolean
  features: PlanFeature[]
}

export interface DemoStep {
  step: number
  title: string
  description: string
}

export interface ComplianceItem {
  name: string
  value: number
}

export type ComplianceByReferential = ComplianceItem[]
