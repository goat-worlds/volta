import { useEffect, useRef, useState } from 'react'
import { Download, X } from 'lucide-react'

/**
 * Télécharger l'application.
 *
 * VOLTA est une application installable : le navigateur la pose sur l'écran
 * d'accueil du téléphone, elle s'ouvre en plein écran sans barre d'adresse et
 * son coquillage reste disponible hors réseau — ce qui compte sur un chantier
 * où la couverture tombe.
 *
 * Le navigateur décide seul du moment où l'installation est possible : il
 * annonce `beforeinstallprompt`, que l'on retient pour le rejouer au clic.
 * Tant que rien n'est annoncé — iOS, Firefox, ou application déjà posée — le
 * bouton n'invente pas une action qu'il ne peut pas tenir : il explique le
 * geste à faire à la main, et disparaît si l'application tourne déjà installée.
 */

/** L'événement n'est pas dans la bibliothèque de types standard. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS, qui ne connaît pas display-mode.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isApple() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export default function InstallAppButton({
  tone = 'light',
  className = '',
}: {
  tone?: 'light' | 'dark'
  className?: string
}) {
  const prompt = useRef<InstallPromptEvent | null>(null)
  const [ready, setReady] = useState(false)
  const [installed, setInstalled] = useState(isStandalone)
  const [help, setHelp] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Sans cela, Chrome affiche sa propre bannière : l'invitation
      // apparaîtrait deux fois, à deux endroits, pour la même action.
      e.preventDefault()
      prompt.current = e as InstallPromptEvent
      setReady(true)
    }
    const onInstalled = () => {
      prompt.current = null
      setReady(false)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // Déjà installée : proposer de l'installer encore n'aurait aucun sens.
  if (installed) return null

  const handleClick = async () => {
    const event = prompt.current
    if (!event) {
      setHelp((open) => !open)
      return
    }
    await event.prompt()
    const { outcome } = await event.userChoice
    // Un événement ne se rejoue pas : le navigateur en émettra un nouveau s'il
    // juge l'installation encore pertinente.
    prompt.current = null
    setReady(false)
    if (outcome === 'accepted') setInstalled(true)
  }

  const skin =
    tone === 'dark'
      ? 'border-white/20 text-white hover:border-btp-400'
      : 'border-papier-300 text-acier-900 hover:border-btp-400'

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={help || undefined}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-bold transition ${skin}`}
      >
        <Download size={16} />
        Télécharger l’application
      </button>

      {/* Ni Safari ni Firefox n'offrent d'installation automatique : à défaut
          de la déclencher, on dit où se trouve le geste. */}
      {!ready && help && (
        <div
          role="dialog"
          aria-label="Installer l’application VOLTA"
          className="absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 rounded-lg border border-papier-200 bg-white p-4 text-left shadow-lg"
        >
          <button
            type="button"
            onClick={() => setHelp(false)}
            aria-label="Fermer"
            className="absolute right-2 top-2 rounded p-1 text-papier-600 transition hover:text-acier-900"
          >
            <X size={14} />
          </button>
          <p className="pr-5 text-sm font-bold text-acier-900">Installer VOLTA sur cet appareil</p>
          <p className="mt-2 text-sm leading-relaxed text-papier-700">
            {isApple() ? (
              <>
                Sur iPhone et iPad : touchez <strong>Partager</strong> dans la barre de Safari, puis{' '}
                <strong>Sur l’écran d’accueil</strong>.
              </>
            ) : (
              <>
                Ouvrez le menu de votre navigateur, puis <strong>Installer l’application</strong> —
                ou <strong>Ajouter à l’écran d’accueil</strong> sur téléphone.
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-papier-600">
            L’application pèse quelques centaines de kilo-octets et fonctionne sans réseau pour ce
            que vous avez déjà consulté.
          </p>
        </div>
      )}
    </div>
  )
}
