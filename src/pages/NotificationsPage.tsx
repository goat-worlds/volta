import { useEffect, useRef } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { Card, EmptyState, PageTitle } from '../components/ui'

/**
 * Le journal des notifications, commun aux quatre espaces.
 *
 * Ouvrir l'onglet vaut lecture : le compteur retombe à zéro. Les notifications
 * qui étaient non lues à l'arrivée restent pourtant signalées le temps de la
 * visite — sans cela, l'utilisateur verrait le badge disparaître sans jamais
 * savoir lesquelles étaient nouvelles.
 */
export default function NotificationsPage() {
  const { myNotifications, unreadNotifications, markNotificationsRead } = useStore()

  // Figé à la première image : marquer comme lu vide `unreadNotifications`, et
  // la surbrillance disparaîtrait avant d'avoir été vue.
  const wasUnread = useRef<Set<string> | null>(null)
  if (wasUnread.current === null) {
    wasUnread.current = new Set(unreadNotifications.map((n) => n.id))
  }
  const newCount = wasUnread.current.size

  useEffect(() => {
    markNotificationsRead()
  }, [markNotificationsRead])

  /** Les plus récentes d'abord : c'est ce qu'on vient lire. */
  const ordered = [...myNotifications].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

  return (
    <div>
      <PageTitle
        title="Notifications"
        subtitle={
          newCount === 0
            ? 'Tout est à jour.'
            : `${newCount} nouvelle${newCount > 1 ? 's' : ''} depuis votre dernière visite.`
        }
      />

      {ordered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          subtitle="Les événements qui vous concernent apparaîtront ici."
        />
      ) : (
        <Card className="divide-y divide-slate-100">
          {ordered.map((n) => {
            const isNew = wasUnread.current?.has(n.id) ?? false
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 ${isNew ? 'bg-btp-50/60' : ''}`}
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isNew ? 'bg-btp-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isNew ? <BellRing size={15} /> : <Bell size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${isNew ? 'font-medium text-acier-900' : 'text-slate-700'}`}>
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{n.date}</p>
                </div>
                {isNew && (
                  <span className="shrink-0 rounded-full bg-btp-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Nouveau
                  </span>
                )}
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
