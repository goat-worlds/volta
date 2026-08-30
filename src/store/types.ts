export type EquipmentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_INSPECTION'
  | 'INSPECTION_IN_PROGRESS'
  | 'REPORT_SUBMITTED'
  | 'PENDING_ADMIN_REVIEW'
  | 'REJECTED'
  | 'CORRECTIONS_REQUESTED'
  | 'REFERENCED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'

export type Level = 'BASIC' | 'SILVER' | 'GOLD'

export type Role = 'ADMIN' | 'SUPPLIER' | 'TECHNICAL' | 'CLIENT'

export interface User {
  id: string
  name: string
  role: Role
  company: string
  email: string
  phone: string
  city: string
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Equipment {
  id: string
  name: string
  categoryId: string
  brand: string
  model: string
  year: number
  hours: number
  location: string
  pricePerDay: number
  available: boolean
  withOperator: boolean
  description: string
  photos: string[]
  documents: { name: string; type: string }[]
  supplierId: string
  status: EquipmentStatus
  level: Level | null
  declaredCondition: string
  createdAt: string
}

export type CheckResult = 'CONFORME' | 'A_SURVEILLER' | 'NON_CONFORME' | null

export interface ChecklistItem {
  section: string
  label: string
  result: CheckResult
  observation: string
}

export interface Inspection {
  id: string
  equipmentId: string
  technicalTeamId: string
  assignedAt: string
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'DONE'
  checklist: ChecklistItem[]
  photos: string[]
  anomalies: string[]
}

export interface Report {
  id: string
  inspectionId: string
  equipmentId: string
  submittedAt: string
  summary: string
  checklist: ChecklistItem[]
}

export interface RentalRequest {
  id: string
  reference: string
  equipmentId: string
  supplierId: string
  startDate: string
  endDate: string
  location: string
  withOperator: boolean
  transport: boolean
  comment: string
  clientName: string
  clientPhone: string
  clientEmail: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
}

export interface AuthUser {
  id: string
  name: string
  role: Role
  company: string
  email: string
  phone: string
  city: string
}

export interface Notification {
  id: string
  role: Role
  message: string
  date: string
  read: boolean
}
