/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type {
  Equipment,
  EquipmentStatus,
  Inspection,
  Report,
  RentalRequest,
  Notification,
  Level,
  ChecklistItem,
  User,
  Category,
} from './types'
import * as seed from './mockData'
import { CHECKLIST_TEMPLATE } from './mockData'

interface Store {
  users: User[]
  categories: Category[]
  equipment: Equipment[]
  inspections: Inspection[]
  reports: Report[]
  rentalRequests: RentalRequest[]
  notifications: Notification[]
  addEquipment: (e: Omit<Equipment, 'id' | 'status' | 'level' | 'createdAt'>) => Equipment
  submitEquipment: (equipmentId: string) => void
  assignInspection: (equipmentId: string, technicalTeamId: string) => void
  startInspection: (inspectionId: string) => void
  updateChecklist: (inspectionId: string, checklist: ChecklistItem[]) => void
  submitReport: (inspectionId: string, summary: string, checklist: ChecklistItem[]) => void
  rejectEquipment: (equipmentId: string) => void
  referenceEquipment: (equipmentId: string, level: Level) => void
  publishEquipment: (equipmentId: string) => void
  unpublishEquipment: (equipmentId: string) => void
  createRentalRequest: (
    r: Omit<RentalRequest, 'id' | 'reference' | 'status' | 'createdAt' | 'supplierId'>,
  ) => RentalRequest
}

const StoreContext = createContext<Store | null>(null)

const today = () => new Date().toISOString().slice(0, 10)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>(seed.equipment)
  const [inspections, setInspections] = useState<Inspection[]>(seed.inspections)
  const [reports, setReports] = useState<Report[]>(seed.reports)
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(seed.rentalRequests)
  const [notifications, setNotifications] = useState<Notification[]>(seed.notifications)

  const store = useMemo<Store>(() => {
    const setStatus = (equipmentId: string, status: EquipmentStatus) =>
      setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? { ...e, status } : e)))

    const notify = (role: Notification['role'], message: string) =>
      setNotifications((prev) => [
        { id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, role, message, date: today(), read: false },
        ...prev,
      ])

    return {
      users: seed.users,
      categories: seed.categories,
      equipment,
      inspections,
      reports,
      rentalRequests,
      notifications,

      addEquipment(data) {
        const eq: Equipment = {
          ...data,
          id: `eq-${Date.now()}`,
          status: 'DRAFT',
          level: null,
          createdAt: today(),
        }
        setEquipment((prev) => [eq, ...prev])
        return eq
      },

      submitEquipment(equipmentId) {
        setStatus(equipmentId, 'SUBMITTED')
        const eq = equipment.find((e) => e.id === equipmentId)
        notify('ADMIN', `${eq?.name ?? 'Un engin'} soumis pour vérification`)
      },

      assignInspection(equipmentId, technicalTeamId) {
        const insp: Inspection = {
          id: `insp-${Date.now()}`,
          equipmentId,
          technicalTeamId,
          assignedAt: today(),
          status: 'ASSIGNED',
          checklist: CHECKLIST_TEMPLATE.map((c) => ({ ...c })),
          photos: [],
          anomalies: [],
        }
        setInspections((prev) => [insp, ...prev])
        setStatus(equipmentId, 'PENDING_INSPECTION')
        const eq = equipment.find((e) => e.id === equipmentId)
        notify('TECHNICAL', `Nouvelle mission assignée : ${eq?.name ?? equipmentId}`)
        notify('SUPPLIER', `${eq?.name ?? 'Votre engin'} est en attente d'inspection`)
      },

      startInspection(inspectionId) {
        setInspections((prev) =>
          prev.map((i) => (i.id === inspectionId ? { ...i, status: 'IN_PROGRESS' } : i)),
        )
        const insp = inspections.find((i) => i.id === inspectionId)
        if (insp) setStatus(insp.equipmentId, 'INSPECTION_IN_PROGRESS')
      },

      updateChecklist(inspectionId, checklist) {
        setInspections((prev) =>
          prev.map((i) => (i.id === inspectionId ? { ...i, checklist } : i)),
        )
      },

      submitReport(inspectionId, summary, checklist) {
        const insp = inspections.find((i) => i.id === inspectionId)
        if (!insp) return
        const report: Report = {
          id: `rep-${Date.now()}`,
          inspectionId,
          equipmentId: insp.equipmentId,
          submittedAt: today(),
          summary,
          checklist,
        }
        setReports((prev) => [report, ...prev])
        setInspections((prev) =>
          prev.map((i) => (i.id === inspectionId ? { ...i, status: 'DONE', checklist } : i)),
        )
        setStatus(insp.equipmentId, 'PENDING_ADMIN_REVIEW')
        const eq = equipment.find((e) => e.id === insp.equipmentId)
        notify('ADMIN', `Rapport d'inspection transmis pour ${eq?.name ?? insp.equipmentId}`)
      },

      rejectEquipment(equipmentId) {
        setStatus(equipmentId, 'REJECTED')
        const eq = equipment.find((e) => e.id === equipmentId)
        notify('SUPPLIER', `${eq?.name ?? 'Votre engin'} a été refusé après vérification`)
      },

      referenceEquipment(equipmentId, level) {
        setEquipment((prev) =>
          prev.map((e) => (e.id === equipmentId ? { ...e, status: 'REFERENCED', level } : e)),
        )
        const eq = equipment.find((e) => e.id === equipmentId)
        notify('SUPPLIER', `${eq?.name ?? 'Votre engin'} a été référencé ${level}`)
      },

      publishEquipment(equipmentId) {
        setStatus(equipmentId, 'PUBLISHED')
        const eq = equipment.find((e) => e.id === equipmentId)
        notify('SUPPLIER', `${eq?.name ?? 'Votre engin'} est publié sur le catalogue`)
      },

      unpublishEquipment(equipmentId) {
        setStatus(equipmentId, 'UNPUBLISHED')
        const eq = equipment.find((e) => e.id === equipmentId)
        notify('SUPPLIER', `${eq?.name ?? 'Votre engin'} a été dépublié du catalogue`)
      },

      createRentalRequest(data) {
        const eq = equipment.find((e) => e.id === data.equipmentId)
        const num = 124 + rentalRequests.length
        const request: RentalRequest = {
          ...data,
          supplierId: eq?.supplierId ?? '',
          id: `req-${Date.now()}`,
          reference: `VOL-2026-${String(num).padStart(5, '0')}`,
          status: 'PENDING',
          createdAt: today(),
        }
        setRentalRequests((prev) => [request, ...prev])
        notify('ADMIN', `Nouvelle demande de location ${request.reference} — ${eq?.name ?? ''}`)
        notify('SUPPLIER', `Nouvelle demande de location ${request.reference} — ${eq?.name ?? ''}`)
        return request
      },
    }
  }, [equipment, inspections, reports, rentalRequests, notifications])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
