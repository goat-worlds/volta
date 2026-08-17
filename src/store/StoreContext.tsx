/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type {
  Equipment,
  EquipmentStatus,
  EquipmentCategory,
  Inspection,
  InspectionStatus,
  Report,
  QuoteRequest,
  QuoteRequestStatus,
  Notification,
  ChecklistItem,
  User,
  Category,
  Review,
} from './types'
import * as seed from './mockData'
import { CHECKLIST_TEMPLATE } from './mockData'

interface Store {
  users: User[]
  categories: Category[]
  equipment: Equipment[]
  inspections: Inspection[]
  reports: Report[]
  quoteRequests: QuoteRequest[]
  notifications: Notification[]
  reviews: Review[]
  likedIds: string[]
  toggleLike: (equipmentId: string) => void
  getReviews: (equipmentId: string) => Review[]
  getRating: (equipmentId: string) => { average: number; count: number }
  createQuoteRequest: (data: Omit<QuoteRequest, 'id' | 'reference' | 'status' | 'createdAt'>) => QuoteRequest
  getQuoteRequestsBySupplier: (supplierId: string) => QuoteRequest[]
  getQuoteRequestsByEquipment: (equipmentId: string) => QuoteRequest[]
  updateQuoteRequestStatus: (quoteRequestId: string, status: QuoteRequestStatus) => void
  assignInspection: (quoteRequestId: string, technicalTeamId: string) => Inspection
  startInspection: (inspectionId: string) => void
  updateChecklist: (inspectionId: string, checklist: ChecklistItem[]) => void
  submitReport: (inspectionId: string, summary: string, checklist: ChecklistItem[]) => void
  categorizeEquipment: (equipmentId: string, category: EquipmentCategory) => void
}

const StoreContext = createContext<Store | null>(null)

const today = () => new Date().toISOString().slice(0, 10)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>(seed.equipment)
  const [inspections, setInspections] = useState<Inspection[]>(seed.inspections)
  const [reports, setReports] = useState<Report[]>(seed.reports)
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(seed.quoteRequests)
  const [notifications, setNotifications] = useState<Notification[]>(seed.notifications)
  const [reviews] = useState<Review[]>(seed.reviews)
  const [likedIds, setLikedIds] = useState<string[]>([])

  const store = useMemo<Store>(() => {
    const setEquipmentStatus = (equipmentId: string, status: EquipmentStatus) =>
      setEquipment((prev) => prev.map((e) => (e.id === equipmentId ? { ...e, status } : e)))

    const setInspectionStatus = (inspectionId: string, status: InspectionStatus) =>
      setInspections((prev) => prev.map((i) => (i.id === inspectionId ? { ...i, status } : i)))

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
      quoteRequests,
      notifications,
      reviews,
      likedIds,

      toggleLike(equipmentId: string) {
        const liked = likedIds.includes(equipmentId)
        setLikedIds((prev) =>
          liked ? prev.filter((id) => id !== equipmentId) : [...prev, equipmentId],
        )
        setEquipment((prev) =>
          prev.map((e) =>
            e.id === equipmentId ? { ...e, likes: e.likes + (liked ? -1 : 1) } : e,
          ),
        )
      },

      getReviews(equipmentId: string) {
        return reviews.filter((r) => r.equipmentId === equipmentId)
      },

      getRating(equipmentId: string) {
        const list = reviews.filter((r) => r.equipmentId === equipmentId)
        if (list.length === 0) return { average: 0, count: 0 }
        const average = list.reduce((sum, r) => sum + r.rating, 0) / list.length
        return { average: Math.round(average * 10) / 10, count: list.length }
      },

      createQuoteRequest(data) {
        const num = 1 + quoteRequests.length
        const request: QuoteRequest = {
          ...data,
          id: `dv-${Date.now()}`,
          reference: `DV-2026-${String(num).padStart(3, '0')}`,
          status: 'NOUVELLE',
          createdAt: today(),
        }
        setQuoteRequests((prev) => [request, ...prev])
        notify('SUPPLIER', `Nouvelle demande de devis ${request.reference}`)
        notify('ADMIN', `Demande de devis ${request.reference} de ${data.clientName}`)
        return request
      },

      getQuoteRequestsBySupplier(supplierId: string) {
        return quoteRequests.filter((r) => r.supplierId === supplierId)
      },

      getQuoteRequestsByEquipment(equipmentId: string) {
        return quoteRequests.filter((r) => r.equipmentId === equipmentId)
      },

      updateQuoteRequestStatus(quoteRequestId: string, status: QuoteRequestStatus) {
        setQuoteRequests((prev) =>
          prev.map((r) => (r.id === quoteRequestId ? { ...r, status } : r)),
        )
      },

      assignInspection(quoteRequestId: string, technicalTeamId: string) {
        const quote = quoteRequests.find((r) => r.id === quoteRequestId)
        if (!quote) throw new Error('Quote not found')

        const insp: Inspection = {
          id: `insp-${Date.now()}`,
          quoteRequestId,
          equipmentId: quote.equipmentId,
          technicalTeamId,
          assignedAt: today(),
          status: 'ASSIGNEE',
          checklist: CHECKLIST_TEMPLATE.map((c) => ({ ...c })),
          photos: [],
          anomalies: [],
        }
        setInspections((prev) => [insp, ...prev])
        setEquipmentStatus(quote.equipmentId, 'EN_INSPECTION')
        this.updateQuoteRequestStatus(quoteRequestId, 'EN_INSPECTION')
        const tech = seed.users.find((u) => u.id === technicalTeamId)
        notify('TECHNICAL', `Nouvelle mission d'inspection assignée: ${quote.reference}`)
        notify('ADMIN', `Inspection assignée à ${tech?.name} pour ${quote.reference}`)
        return insp
      },

      startInspection(inspectionId: string) {
        setInspectionStatus(inspectionId, 'EN_COURS')
      },

      updateChecklist(inspectionId: string, checklist: ChecklistItem[]) {
        setInspections((prev) =>
          prev.map((i) => (i.id === inspectionId ? { ...i, checklist } : i)),
        )
      },

      submitReport(inspectionId: string, summary: string, checklist: ChecklistItem[]) {
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
        setInspectionStatus(inspectionId, 'TERMINEE')
        const quote = quoteRequests.find((r) => r.id === insp.quoteRequestId)
        if (quote) this.updateQuoteRequestStatus(quote.id, 'RAPPORT_REÇU')
        notify('ADMIN', `Rapport d'inspection reçu pour ${quote?.reference}`)
      },

      categorizeEquipment(equipmentId: string, category: EquipmentCategory) {
        setEquipment((prev) =>
          prev.map((e) => (e.id === equipmentId ? { ...e, status: 'CATEGORISE', category } : e)),
        )
        const eq = equipment.find((e) => e.id === equipmentId)
        const quote = quoteRequests.find((r) => r.equipmentId === equipmentId)
        if (quote) this.updateQuoteRequestStatus(quote.id, 'CATEGORISEE')
        notify('ADMIN', `${eq?.name} catégorisé en ${category}`)
      },
    }
  }, [equipment, inspections, reports, quoteRequests, notifications, reviews, likedIds])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
