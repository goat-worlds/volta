import { useCallback, useEffect, useRef, useState } from 'react'
import { apiGet } from './api'
import { useStore } from './StoreContext'

/**
 * Ressource chargée par une page, tenue à jour par la synchronisation.
 *
 * Le magasin ne porte que ce que plusieurs écrans partagent. Les opportunités,
 * les anomalies ou le journal d'audit n'intéressent qu'une page : elle les
 * charge elle-même. Mais elle doit bouger au même rythme que le reste — le
 * badge d'une anomalie qu'un fournisseur vient de soumettre doit changer sous
 * les yeux de l'administrateur sans rechargement.
 *
 * Le crochet se réabonne donc au tour de synchronisation du magasin
 * (`lastSyncAt`) : à chaque passage, il recharge sa ressource et ne repose la
 * valeur que si elle a changé.
 */
export function useLiveResource<T>(path: string | null) {
  const { lastSyncAt } = useStore()
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(Boolean(path))
  const lastJson = useRef<string | null>(null)

  const load = useCallback(async () => {
    if (!path) return
    try {
      const next = await apiGet<T>(path)
      const json = JSON.stringify(next)
      if (json !== lastJson.current) {
        lastJson.current = json
        setData(next)
      }
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    void load()
  }, [load, lastSyncAt])

  /** Repose une valeur obtenue par une action, sans attendre le prochain tour. */
  const patch = useCallback((updater: (current: T | null) => T | null) => {
    setData((current) => {
      const next = updater(current)
      lastJson.current = JSON.stringify(next)
      return next
    })
  }, [])

  return { data, error, loading, reload: load, patch }
}
