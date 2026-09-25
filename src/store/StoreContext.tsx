/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Equipment,
  Inspection,
  Report,
  RentalRequest,
  RentalAdminAction,
  Notification,
  Level,
  ChecklistItem,
  Role,
  User,
  Category,
  Quote,
  QuoteRequest,
} from './types'
import { API_EVENTS, apiGet, apiPost, apiPut, getToken, setToken, clearToken } from './api'
import { useToast } from '../components/feedback/Toaster'
import { RENTAL_STATUS, STATUS_LABELS } from '../lib/statuses'

interface Store {
  users: User[]
  categories: Category[]
  equipment: Equipment[]
  inspections: Inspection[]
  reports: Report[]
  rentalRequests: RentalRequest[]
  notifications: Notification[]
  loading: boolean
  /**
   * Vrai quand le serveur ne répond plus. Le drapeau se lève à la première
   * requête qui n'aboutit pas et retombe dès qu'une réponse revient — même une
   * erreur : un 403 prouve que le serveur est là.
   */
  apiUnavailable: boolean
  /** Vrai quand le serveur a refusé le jeton d'une session ouverte. */
  sessionExpired: boolean
  /** Instant de la dernière synchronisation réussie, pour l'indicateur « en direct ». */
  lastSyncAt: Date | null
  currentUser: User | null
  reload: () => Promise<void>
  /** Relance une tentative après une panne, sans repasser par l'écran de chargement. */
  retryConnection: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  /** Identifiants des engins mis en favori par l'utilisateur courant. */
  favorites: string[]
  isFavorite: (equipmentId: string) => boolean
  toggleFavorite: (equipmentId: string) => void
  /**
   * Demandes de devis et devis concernant l'utilisateur connecté.
   *
   * Chargés ici et non page par page : les pastilles de la navigation doivent
   * connaître ce qui attend l'utilisateur avant qu'il n'ouvre la rubrique.
   */
  myQuoteRequests: QuoteRequest[]
  myQuotes: Quote[]
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
  updateFindings: (inspectionId: string, findings: InspectionFindings) => Promise<void>
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
  /** Administration : fait avancer une réservation dans le parcours VOLTA. */
  transitionRentalRequest: (requestId: string, action: RentalAdminAction, note?: string) => Promise<RentalRequest>
  createQuoteRequest: (data: Omit<QuoteRequest, 'id' | 'status' | 'supplierId' | 'createdAt'>) => Promise<QuoteRequest>
  listQuoteRequestsByClient: (clientId: string) => Promise<QuoteRequest[]>
  listQuoteRequestsBySupplier: (supplierId: string) => Promise<QuoteRequest[]>
  createQuote: (data: Omit<Quote, 'id' | 'createdAt'>) => Promise<Quote>
  listQuotesBySupplier: (supplierId: string) => Promise<Quote[]>
  getQuote: (quoteId: string) => Promise<Quote>
  acceptQuote: (quoteId: string) => Promise<Quote>
  rejectQuote: (quoteId: string) => Promise<Quote>
}

/**
 * Constats de terrain d'une inspection, enregistrés au fil de la saisie.
 *
 * Champs facultatifs : l'écran n'envoie que ce qui vient de changer, et le
 * serveur laisse le reste en place.
 */
export interface InspectionFindings {
  photos?: string[]
  customsDocuments?: string[]
  anomalies?: string[]
  teamMobility?: string
  availabilityLeadTime?: string
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

/**
 * Ne remplace la valeur que si son contenu a changé.
 *
 * Le rafraîchissement périodique rapporte le plus souvent les mêmes données.
 * Les poser telles quelles ferait re-rendre chaque écran toutes les quinze
 * secondes pour rien — et perdrait, par exemple, un formulaire en cours dans
 * une ligne de tableau. Comparer le JSON coûte moins qu'un rendu.
 */
function keepIfSame<T>(previous: T, next: T): T {
  return JSON.stringify(previous) === JSON.stringify(next) ? previous : next
}

/** Cadence du rafraîchissement silencieux, onglet visible. */
const LIVE_INTERVAL_MS = 15_000

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [apiUnavailable, setApiUnavailable] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([])
  const [myQuoteRequests, setMyQuoteRequests] = useState<QuoteRequest[]>([])
  const [myQuotes, setMyQuotes] = useState<Quote[]>([])

  // La sélection suit l'utilisateur : à la connexion on charge la sienne, à la
  // déconnexion elle disparaît de l'écran sans être effacée du navigateur.
  useEffect(() => {
    setFavorites(readFavorites(currentUser?.id))
    setReadNotificationIds(
      currentUser?.id ? readIdList(notificationsReadKey(currentUser.id)) : [],
    )
  }, [currentUser?.id])

  /**
   * La couche HTTP signale, le magasin décide.
   *
   * Panne : le drapeau se lève et la première réponse — quelle qu'elle soit —
   * le baisse. Jeton refusé : la session est fermée ici, une seule fois, et
   * l'écran « session expirée » prend le relais ; chaque page n'a pas à
   * interpréter un 401.
   */
  useEffect(() => {
    const onUnavailable = () => setApiUnavailable(true)
    const onReachable = () => setApiUnavailable(false)
    const onUnauthorized = () => {
      clearToken()
      setCurrentUser((user) => {
        if (user) setSessionExpired(true)
        return null
      })
    }
    window.addEventListener(API_EVENTS.unavailable, onUnavailable)
    window.addEventListener(API_EVENTS.reachable, onReachable)
    window.addEventListener(API_EVENTS.unauthorized, onUnauthorized)
    return () => {
      window.removeEventListener(API_EVENTS.unavailable, onUnavailable)
      window.removeEventListener(API_EVENTS.reachable, onReachable)
      window.removeEventListener(API_EVENTS.unauthorized, onUnauthorized)
    }
  }, [])

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

  /**
   * Demandes de devis et devis de l'utilisateur, rechargés à chaque changement
   * de jeu de données. Un échec laisse les listes vides : une pastille absente
   * vaut mieux qu'un écran en erreur.
   */
  useEffect(() => {
    if (!currentUser) {
      setMyQuoteRequests([])
      setMyQuotes([])
      return
    }
    let cancelled = false

    const load = async () => {
      // L'administration voit tout, en deux appels : c'est ce qui alimente la
      // file de validation et son compteur dans la barre latérale. Avant,
      // le rôle n'avait aucun chemin ici et la console ignorait les devis.
      if (currentUser.role === 'ADMIN') {
        const [requests, quotes] = await Promise.all([
          apiGet<QuoteRequest[]>('/quote-requests').catch(() => [] as QuoteRequest[]),
          apiGet<Quote[]>('/quotes').catch(() => [] as Quote[]),
        ])
        if (cancelled) return
        setMyQuoteRequests((prev) => keepIfSame(prev, requests ?? []))
        setMyQuotes((prev) => keepIfSame(prev, quotes ?? []))
        return
      }

      const path =
        currentUser.role === 'SUPPLIER'
          ? `/quote-requests/supplier/${currentUser.id}`
          : currentUser.role === 'CLIENT'
            ? `/quote-requests/client/${currentUser.id}`
            : null
      if (!path) {
        setMyQuoteRequests([])
        setMyQuotes([])
        return
      }

      const requests = await apiGet<QuoteRequest[]>(path).catch(() => [])
      if (cancelled) return
      setMyQuoteRequests((prev) => keepIfSame(prev, requests ?? []))

      // Le serveur expose les devis par demande : c'est ce qui empêche de voir
      // les offres d'autrui. On agrège donc côté client.
      const results = await Promise.allSettled(
        (requests ?? []).map((r) => apiGet<Quote[]>(`/quotes/request/${r.id}`)),
      )
      if (cancelled) return
      setMyQuotes((prev) =>
        keepIfSame(prev, results.flatMap((r) => (r.status === 'fulfilled' ? (r.value ?? []) : []))),
      )
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [currentUser, equipment, rentalRequests])

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

  /**
   * Synchronisation avec le serveur.
   *
   * Un seul chemin, appelé au démarrage, après chaque action et à intervalle
   * régulier. Chaque collection est posée seulement si elle a changé, si bien
   * que le passage périodique est invisible tant que rien ne bouge — et qu'un
   * statut modifié par un autre utilisateur apparaît dans les quinze secondes
   * sans que personne ne recharge la page.
   *
   * Le catalogue est chargé en premier : c'est lui qui dit si le serveur
   * répond. Les collections réservées suivent, uniquement avec un jeton.
   */
  const sync = useCallback(async () => {
    const [c, e] = await Promise.all([
      apiGet<Category[]>('/categories'),
      apiGet<Equipment[]>('/equipment'),
    ])
    setCategories((prev) => keepIfSame(prev, c ?? []))
    setEquipment((prev) => keepIfSame(prev, e ?? []))

    if (getToken()) {
      const [u, i, rep, req, n] = await Promise.all([
        apiGet<User[]>('/users').catch(() => null),
        apiGet<Inspection[]>('/inspections').catch(() => null),
        apiGet<Report[]>('/reports').catch(() => null),
        apiGet<RentalRequest[]>('/rental-requests').catch(() => null),
        apiGet<Notification[]>('/notifications').catch(() => null),
      ])
      // Un refus sur une collection (droits, jeton périmé) garde la valeur
      // précédente plutôt que de vider l'écran.
      if (u) setUsers((prev) => keepIfSame(prev, u))
      if (i) setInspections((prev) => keepIfSame(prev, i))
      if (rep) setReports((prev) => keepIfSame(prev, rep))
      if (req) setRentalRequests((prev) => keepIfSame(prev, req))
      if (n) setNotifications((prev) => keepIfSame(prev, n))
    }
    setLastSyncAt(new Date())
  }, [])

  const reload = useCallback(async () => {
    try {
      await sync()
    } catch {
      // La panne est déjà signalée par l'événement de la couche HTTP ; ici on
      // ne fait que laisser l'écran s'afficher avec ce qu'il a.
    } finally {
      setLoading(false)
    }
  }, [sync])

  const retryConnection = useCallback(async () => {
    try {
      await sync()
    } catch {
      // Toujours en panne : le drapeau reste levé, l'écran le dit.
    }
  }, [sync])

  useEffect(() => {
    void reload()
    if (getToken()) {
      apiGet<User>('/auth/me')
        .then(setCurrentUser)
        .catch(() => clearToken())
    }
  }, [reload])

  /**
   * Le site bouge seul.
   *
   * Tant que l'onglet est visible, les données sont resynchronisées toutes les
   * quinze secondes ; le retour sur l'onglet déclenche une passe immédiate. Ce
   * n'est pas un rechargement de page : seules les collections qui ont changé
   * sont reposées, et l'écran ne bouge que là où quelque chose a bougé.
   *
   * Uniquement avec une session : le visiteur du catalogue n'attend rien.
   */
  useEffect(() => {
    if (!currentUser) return
    let timer: number | null = null

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      void sync().catch(() => {})
    }
    const start = () => {
      if (timer !== null) return
      timer = window.setInterval(tick, LIVE_INTERVAL_MS)
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', tick)
    return () => {
      if (timer !== null) window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', tick)
    }
  }, [currentUser, sync])

  /**
   * Signaler ce qui a changé sans qu'on l'ait demandé.
   *
   * Quand le rafraîchissement rapporte une réservation ou un engin dont le
   * statut diffère de celui affiché, l'utilisateur concerné en est averti par
   * une notification brève. Seuls ses propres objets comptent : le fournisseur
   * pour ses engins et ses réservations, le client pour ses réservations.
   * L'administration voit tout bouger, elle n'a pas à être prévenue de tout.
   */
  const seenRentals = useRef<Map<string, string> | null>(null)
  const seenEquipment = useRef<Map<string, string> | null>(null)

  useEffect(() => {
    const me = currentUser
    const next = new Map(rentalRequests.map((r) => [r.id, r.status]))
    const previous = seenRentals.current
    seenRentals.current = next
    if (!previous || !me || me.role === 'ADMIN') return
    for (const r of rentalRequests) {
      const before = previous.get(r.id)
      if (!before || before === r.status) continue
      const mine =
        (me.role === 'SUPPLIER' && r.supplierId === me.id) ||
        (me.role === 'CLIENT' && (r.clientId === me.id || r.clientEmail === me.email))
      if (!mine) continue
      toast.info(
        `Réservation ${r.reference}`,
        `Le statut est passé à « ${RENTAL_STATUS[r.status]?.label ?? r.status} ».`,
      )
    }
  }, [rentalRequests, currentUser, toast])

  useEffect(() => {
    const me = currentUser
    const next = new Map(equipment.map((e) => [e.id, e.status]))
    const previous = seenEquipment.current
    seenEquipment.current = next
    if (!previous || !me || me.role !== 'SUPPLIER') return
    for (const e of equipment) {
      const before = previous.get(e.id)
      if (!before || before === e.status || e.supplierId !== me.id) continue
      toast.info(`${e.name}`, `L’engin est maintenant « ${STATUS_LABELS[e.status] ?? e.status} ».`)
    }
  }, [equipment, currentUser, toast])

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
      apiUnavailable,
      sessionExpired,
      lastSyncAt,
      currentUser,
      reload,
      retryConnection,

      async login(email, password) {
        const res = await apiPost<{ token: string; user: User }>('/auth/login', { email, password })
        setToken(res.token)
        setSessionExpired(false)
        setCurrentUser(res.user)
        // Les données réservées aux comptes identifiés — missions, rapports,
        // demandes, notifications — ne sont chargées que si un jeton existe.
        // À l'ouverture de la page il n'y en avait pas : sans ce rechargement,
        // l'utilisateur arrivait dans un espace vide, tous compteurs à zéro, et
        // seule une actualisation manuelle le remplissait. L'inscription le
        // faisait déjà ; la connexion l'avait oublié.
        await reload()
        return res.user
      },

      favorites,
      isFavorite: (equipmentId: string) => favorites.includes(equipmentId),
      toggleFavorite,

      myQuoteRequests,
      myQuotes,
      myNotifications,
      unreadNotifications,
      markNotificationsRead,

      async register(input) {
        const res = await apiPost<{ token: string; user: User }>('/auth/register', input)
        setToken(res.token)
        setSessionExpired(false)
        setCurrentUser(res.user)
        await reload()
        return res.user
      },

      async logout() {
        try {
          await apiPost('/auth/logout')
        } catch {
          // Le serveur peut être injoignable ou le jeton déjà périmé : la
          // session locale se ferme quand même.
        } finally {
          clearToken()
          setCurrentUser(null)
          setSessionExpired(false)
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

      async updateFindings(inspectionId, findings) {
        await apiPut(`/inspections/${inspectionId}/findings`, findings)
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

      async transitionRentalRequest(requestId, action, note) {
        // L'annulation exige un motif ; les autres l'acceptent en option.
        const body = note !== undefined || action === 'cancel' ? { note: note ?? '' } : undefined
        const updated = await apiPost<RentalRequest>(`/rental-requests/${requestId}/${action}`, body)
        // La ligne est reposée tout de suite : le badge change sous le clic,
        // sans attendre le tour de synchronisation.
        setRentalRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
        void reload()
        return updated
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
        if (!quote) throw new Error('Devis introuvable')
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
    [
      users, categories, equipment, inspections, reports, rentalRequests, notifications, loading,
      apiUnavailable, sessionExpired, lastSyncAt, currentUser, favorites, toggleFavorite,
      myQuoteRequests, myQuotes, myNotifications, unreadNotifications, markNotificationsRead,
      reload, retryConnection,
    ],
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Chargement des données…
      </div>
    )
  }

  /**
   * Un serveur injoignable ne condamne plus la totalité du site.
   *
   * Le catalogue, les devis et les espaces connectés ont besoin du serveur ;
   * l'accueil, le choix d'intention et les formulaires de demande, non. La
   * panne est donc signalée en bandeau sur le site public — les espaces
   * connectés, eux, affichent l'écran dédié — et chaque écran montre l'état de
   * ce qu'il a.
   */
  return (
    <StoreContext.Provider value={store}>
      {apiUnavailable && !currentUser && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-center gap-3 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900"
        >
          <span>
            Le catalogue et les espaces connectés sont momentanément indisponibles. Vous pouvez
            déposer une demande normalement.
          </span>
          <button
            onClick={() => void retryConnection()}
            className="rounded-md bg-amber-200 px-2.5 py-1 font-semibold text-amber-900 transition hover:bg-amber-300"
          >
            Réessayer
          </button>
        </div>
      )}
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
