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
  Role,
  User,
  Category,
  Quote,
  QuoteRequest,
} from './types'
import { apiGet, apiPost, apiPut, getToken, setToken, clearToken } from './api'

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
  currentUser: User | null
  reload: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  /** Identifiants des engins mis en favori par l'utilisateur courant. */
  favorites: string[]
  isFavorite: (equipmentId: string) => boolean
  toggleFavorite: (equipmentId: string) => void
  /** Notifications adressées au rôle de l'utilisateur connecté, récentes d'abord. */
  myNotifications: Notification[]
  /** Celles qu'il n'a pas encore ouvertes — c'est le compteur affiché. */
  unreadNotifications: Notification[]
  /** Appelé à l'ouverture de l'onglet : remet le compteur à zéro. */
  markNotificationsRead: () => void
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
  requestCorrection: (equipmentId: string) => Promise<void>
  /** Administration : crée un compte, rôle ADMIN compris. */
  createUser: (input: UserInput) => Promise<User>
  /** Chacun modifie sa fiche ; seule l'administration touche au rôle. */
  updateUser: (id: string, input: UserInput) => Promise<User>
  respondRentalRequest: (requestId: string, accepted: boolean) => Promise<void>
  createQuoteRequest: (data: Omit<QuoteRequest, 'id' | 'status' | 'supplierId' | 'createdAt'>) => Promise<QuoteRequest>
  listQuoteRequestsByClient: (clientId: string) => Promise<QuoteRequest[]>
  listQuoteRequestsBySupplier: (supplierId: string) => Promise<QuoteRequest[]>
  createQuote: (data: Omit<Quote, 'id' | 'createdAt'>) => Promise<Quote>
  listQuotesBySupplier: (supplierId: string) => Promise<Quote[]>
  getQuote: (quoteId: string) => Promise<Quote>
  acceptQuote: (quoteId: string) => Promise<Quote>
  rejectQuote: (quoteId: string) => Promise<Quote>
}

export interface UserInput {
  name?: string
  email?: string
  phone?: string
  role?: Role
  company?: string
  city?: string
  password?: string
}

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
  role: Role
  company?: string
  city?: string
}

/**
 * Favoris.
 *
 * Le menu client proposait « Favoris » sans route ni donnée derrière : la zone
 * de contenu restait vide. La sélection est propre à un utilisateur et n'engage
 * personne d'autre — elle vit donc dans le navigateur, sous une clé portant son
 * identifiant, plutôt que d'imposer une table et un endpoint au serveur.
 */
const favoritesKey = (userId: string) => `volta_favorites_${userId}`

/**
 * Notifications lues.
 *
 * Une notification vise un rôle, pas une personne : trois administrateurs
 * partagent les mêmes. Le drapeau `read` du serveur est donc commun, et aucun
 * endpoint ne permet de le lever — le faire effacerait de toute façon le compteur
 * d'un collègue qui n'a rien lu. La lecture est propre à chacun : elle vit dans
 * son navigateur, comme la sélection de favoris.
 */
const notificationsReadKey = (userId: string) => `volta_notifications_read_${userId}`

/** Liste d'identifiants stockée localement, tolérante à un contenu abîmé. */
function readIdList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    // Stockage indisponible ou contenu corrompu : une liste vide reste une
    // réponse correcte, l'écran s'affiche.
    return []
  }
}

function writeIdList(key: string, ids: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    // Écriture refusée (navigation privée, stockage plein) : la valeur reste
    // valable pour la session en cours.
  }
}

function readFavorites(userId: string | undefined): string[] {
  return userId ? readIdList(favoritesKey(userId)) : []
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
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([])

  // La sélection suit l'utilisateur : à la connexion on charge la sienne, à la
  // déconnexion elle disparaît de l'écran sans être effacée du navigateur.
  useEffect(() => {
    setFavorites(readFavorites(currentUser?.id))
    setReadNotificationIds(
      currentUser?.id ? readIdList(notificationsReadKey(currentUser.id)) : [],
    )
  }, [currentUser?.id])

  const toggleFavorite = useCallback(
    (equipmentId: string) => {
      const userId = currentUser?.id
      if (!userId) return
      setFavorites((previous) => {
        const next = previous.includes(equipmentId)
          ? previous.filter((id) => id !== equipmentId)
          : [...previous, equipmentId]
        writeIdList(favoritesKey(userId), next)
        return next
      })
    },
    [currentUser?.id],
  )

  /** Les notifications adressées au rôle de l'utilisateur connecté. */
  const myNotifications = useMemo(
    () => (currentUser ? notifications.filter((n) => n.role === currentUser.role) : []),
    [notifications, currentUser],
  )

  /**
   * Non lues : ni marquées côté serveur, ni ouvertes par cet utilisateur.
   * Le drapeau du serveur reste respecté — il sert au jeu de données initial.
   */
  const unreadNotifications = useMemo(
    () => myNotifications.filter((n) => !n.read && !readNotificationIds.includes(n.id)),
    [myNotifications, readNotificationIds],
  )

  const markNotificationsRead = useCallback(() => {
    const userId = currentUser?.id
    if (!userId) return
    setReadNotificationIds((previous) => {
      const fresh = myNotifications.map((n) => n.id).filter((id) => !previous.includes(id))
      if (fresh.length === 0) return previous
      const next = [...previous, ...fresh]
      writeIdList(notificationsReadKey(userId), next)
      return next
    })
  }, [currentUser?.id, myNotifications])

  const reload = useCallback(async () => {
    try {
      const [c, e] = await Promise.all([
        apiGet<Category[]>('/categories').catch(() => []),
        apiGet<Equipment[]>('/equipment').catch(() => []),
      ])
      setCategories(c)
      setEquipment(e)

      // Load authenticated data only if user is logged in
      if (getToken()) {
        Promise.all([
          apiGet<User[]>('/users').catch(() => []),
          apiGet<Inspection[]>('/inspections').catch(() => []),
          apiGet<Report[]>('/reports').catch(() => []),
          apiGet<RentalRequest[]>('/rental-requests').catch(() => []),
          apiGet<Notification[]>('/notifications').catch(() => []),
        ]).then(([u, i, rep, req, n]) => {
          setUsers(u)
          setInspections(i)
          setReports(rep)
          setRentalRequests(req)
          setNotifications(n)
        })
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
    if (getToken()) {
      apiGet<User>('/auth/me')
        .then(setCurrentUser)
        .catch(() => clearToken())
    }
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
      currentUser,
      reload,

      async login(email, password) {
        const res = await apiPost<{ token: string; user: User }>('/auth/login', { email, password })
        setToken(res.token)
        setCurrentUser(res.user)
        return res.user
      },

      favorites,
      isFavorite: (equipmentId: string) => favorites.includes(equipmentId),
      toggleFavorite,

      myNotifications,
      unreadNotifications,
      markNotificationsRead,

      async register(input) {
        const res = await apiPost<{ token: string; user: User }>('/auth/register', input)
        setToken(res.token)
        setCurrentUser(res.user)
        await reload()
        return res.user
      },

      async logout() {
        try {
          await apiPost('/auth/logout')
        } finally {
          clearToken()
          setCurrentUser(null)
        }
      },

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

      async createUser(input) {
        const user = await apiPost<User>('/users', input)
        await reload()
        return user
      },

      async updateUser(id, input) {
        const user = await apiPut<User>(`/users/${id}`, input)
        await reload()
        return user
      },

      async requestCorrection(equipmentId) {
        await apiPost(`/equipment/${equipmentId}/request-correction`)
        await reload()
      },

      async respondRentalRequest(requestId, accepted) {
        await apiPost(`/rental-requests/${requestId}/${accepted ? 'accept' : 'decline'}`)
        await reload()
      },

      async createQuoteRequest(data) {
        const req = await apiPost<QuoteRequest>('/quote-requests', data)
        await reload()
        return req
      },

      async listQuoteRequestsByClient(clientId) {
        const requests = await apiGet<QuoteRequest[]>(`/quote-requests/client/${clientId}`)
        return requests || []
      },

      async listQuoteRequestsBySupplier(supplierId) {
        const requests = await apiGet<QuoteRequest[]>(`/quote-requests/supplier/${supplierId}`)
        return requests || []
      },

      async createQuote(data) {
        const quote = await apiPost<Quote>('/quotes', data)
        await reload()
        return quote
      },

      async listQuotesBySupplier(supplierId) {
        const quotes = await apiGet<Quote[]>(`/quotes/supplier/${supplierId}`)
        return quotes || []
      },

      async getQuote(quoteId) {
        const quote = await apiGet<Quote>(`/quotes/${quoteId}`)
        if (!quote) throw new Error('Quote not found')
        return quote
      },

      async acceptQuote(quoteId) {
        const quote = await apiPost<Quote>(`/quotes/${quoteId}/accept`)
        await reload()
        return quote
      },

      async rejectQuote(quoteId) {
        const quote = await apiPost<Quote>(`/quotes/${quoteId}/reject`)
        await reload()
        return quote
      },
    }),
    [users, categories, equipment, inspections, reports, rentalRequests, notifications, loading, error, currentUser, favorites, toggleFavorite, myNotifications, unreadNotifications, markNotificationsRead, reload],
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
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500"
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
