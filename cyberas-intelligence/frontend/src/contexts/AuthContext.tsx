import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface Subscription {
  plan: 'Starter' | 'Pro' | 'Enterprise'
  price: string
  features: string[]
}

interface ScanAgent {
  id: string
  name: string
  type: 'nmap' | 'nessus' | 'openvas' | 'burp' | 'qualys'
  status: 'idle' | 'scanning' | 'completed'
  lastScan?: string
  description: string
}

interface AuthUser {
  email: string
  role: 'rssi' | 'auditeur' | 'admin'
  name: string
  token: string
  subscription?: Subscription
  agents?: ScanAgent[]
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  signup: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const getSubscriptionByRole = (role: string): Subscription => {
    const subscriptions: Record<string, Subscription> = {
      rssi: {
        plan: 'Enterprise',
        price: 'Custom',
        features: ['Audits illimités', 'Utilisateurs illimités', 'Support 24/7', 'Déploiement personnalisé'],
      },
      auditeur: {
        plan: 'Pro',
        price: '149900 FCFA/mois',
        features: ['Audits illimités', 'Jusqu\'à 20 utilisateurs', 'Support prioritaire', 'API Access'],
      },
      admin: {
        plan: 'Enterprise',
        price: 'Custom',
        features: ['Audits illimités', 'Utilisateurs illimités', 'Support 24/7', 'Gestion complète'],
      },
    }
    return subscriptions[role] || subscriptions.auditeur
  }

  const getAgentsByRole = (role: string): ScanAgent[] => {
    const baseAgents: ScanAgent[] = [
      {
        id: 'nmap-001',
        name: 'Nmap Scanner',
        type: 'nmap',
        status: 'idle',
        description: 'Découverte des services réseau et des ports ouverts',
      },
      {
        id: 'nessus-001',
        name: 'Nessus Vulnerability',
        type: 'nessus',
        status: 'idle',
        description: 'Scan complet des vulnérabilités',
      },
      {
        id: 'openvas-001',
        name: 'OpenVAS Scanner',
        type: 'openvas',
        status: 'idle',
        description: 'Scanner de vulnérabilités open-source',
      },
    ]

    if (role === 'rssi' || role === 'admin') {
      return [
        ...baseAgents,
        {
          id: 'burp-001',
          name: 'Burp Suite',
          type: 'burp',
          status: 'idle',
          description: 'Analyse applicative web avancée',
        },
        {
          id: 'qualys-001',
          name: 'Qualys VMDR',
          type: 'qualys',
          status: 'idle',
          description: 'Gestion des vulnérabilités en cloud',
        },
      ]
    }
    return baseAgents
  }

  const login = async (email: string, _password: string, role: string = 'auditeur') => {
    setIsLoading(true)
    try {
      const roleStr = (role as any) || 'auditeur'
      const newUser: AuthUser = {
        email,
        role: roleStr,
        name: email.split('@')[0].toUpperCase(),
        token: `token_${Math.random().toString(36).substring(7)}`,
        subscription: getSubscriptionByRole(roleStr),
        agents: getAgentsByRole(roleStr),
      }

      setUser(newUser)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, _password: string, role: string) => {
    setIsLoading(true)
    try {
      const roleStr = (role as any) || 'auditeur'
      const newUser: AuthUser = {
        email,
        role: roleStr,
        name: email.split('@')[0].toUpperCase(),
        token: `token_${Math.random().toString(36).substring(7)}`,
        subscription: getSubscriptionByRole(roleStr),
        agents: getAgentsByRole(roleStr),
      }

      setUser(newUser)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
