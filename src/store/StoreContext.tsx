/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Equipment,
  Inspection,
  Report,
  RentalRequest,
  Notification,
  Level,
  ChecklistItem,
  User,
  Category,
} from './types'
import { apiGet, apiPost, apiPut } from './api'

interface Store {
  users: User[]
  categories: Category[]
  equipment: Equipment[]
  inspections: Inspection[]
  reports: Report[]
  rentalRequests: RentalRequest[]
  notifications: Notification[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  addEquipment: (e: Omit<Equipment, 'id' | 'status' | 'level' | 'createdAt'>) => Promise<Equipment>
  submitEquipment: (equipmentId: string) => Promise<void>
  assignInspection: (equipmentId: string, technicalTeamId: string) => Promise<void>
  startInspection: (inspectionId: string) => Promise<void>
  updateChecklist: (inspectionId: string, checklist: ChecklistItem[]) => Promise<void>
  submitReport: (inspectionId: string, summary: string, checklist: ChecklistItem[]) => Promise<void>
  rejectEquipment: (equipmentId: string) => Promise<void>
  referenceEquipment: (equipmentId: string, level: Level) => Promise<void>
  publishEquipment: (equipmentId: string) => Promise<void>
  unpublishEquipment: (equipmentId: string) => Promise<void>
  createRentalRequest: (
    r: Omit<RentalRequest, 'id' | 'reference' | 'status' | 'createdAt' | 'supplierId'>,
  ) => Promise<RentalRequest>
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [u, c, e, i, rep, req, n] = await Promise.all([
        apiGet<User[]>('/users'),
        apiGet<Category[]>('/categories'),
        apiGet<Equipment[]>('/equipment'),
        apiGet<Inspection[]>('/inspections'),
        apiGet<Report[]>('/reports'),
        apiGet<RentalRequest[]>('/rental-requests'),
        apiGet<Notification[]>('/notifications'),
      ])
      setUsers(u)
      setCategories(c)
      setEquipment(e)
      setInspections(i)
      setReports(rep)
      setRentalRequests(req)
      setNotifications(n)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const store = useMemo<Store>(
    () => ({
      users,
      categories,
      equipment,
      inspections,
      reports,
      rentalRequests,
      notifications,
      loading,
      error,
      reload,

      async addEquipment(data) {
        const eq = await apiPost<Equipment>('/equipment', data)
        await reload()
        return eq
      },

      async submitEquipment(equipmentId) {
        await apiPost(`/equipment/${equipmentId}/submit`)
        await reload()
      },

      async assignInspection(equipmentId, technicalTeamId) {
        await apiPost('/inspections', { equipmentId, technicalTeamId })
        await reload()
      },

      async startInspection(inspectionId) {
        await apiPost(`/inspections/${inspectionId}/start`)
        await reload()
      },

      async updateChecklist(inspectionId, checklist) {
        await apiPut(`/inspections/${inspectionId}/checklist`, checklist)
        await reload()
      },

      async submitReport(inspectionId, summary, checklist) {
        await apiPost(`/inspections/${inspectionId}/report`, { summary, checklist })
        await reload()
      },

      async rejectEquipment(equipmentId) {
        await apiPost(`/equipment/${equipmentId}/reject`)
        await reload()
      },

      async referenceEquipment(equipmentId, level) {
        await apiPost(`/equipment/${equipmentId}/reference`, { level })
        await reload()
      },

      async publishEquipment(equipmentId) {
        await apiPost(`/equipment/${equipmentId}/publish`)
        await reload()
      },

      async unpublishEquipment(equipmentId) {
        await apiPost(`/equipment/${equipmentId}/unpublish`)
        await reload()
      },

      async createRentalRequest(data) {
        const request = await apiPost<RentalRequest>('/rental-requests', data)
        await reload()
        return request
      },
    }),
    [users, categories, equipment, inspections, reports, rentalRequests, notifications, loading, error, reload],
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Chargement des données…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-red-600">Impossible de contacter le serveur VOLTA.</p>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => {
            setLoading(true)
            void reload()
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
