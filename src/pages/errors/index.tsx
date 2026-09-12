import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Compass, Lock, RefreshCw, ServerCrash, ShieldAlert, WifiOff } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { HOME_BY_ROLE } from '../../lib/navigation'
import ErrorScreen from './ErrorScreen'

/**
 * Les cinq refus que l'application sait formuler.
 *
 * Avant, une adresse inconnue rendait une page blanche, un mauvais rôle
 * redirigeait sans un mot, une session périmée laissait les listes se vider
 * en silence, et une exception React effaçait tout l'écran. L'utilisateur
 * ne savait jamais ce qui venait de se passer ni s'il pouvait y remédier.
 *
 * Chaque cas a désormais sa page, et chacune propose une issue.
 */

const PRIMARY =
  'inline-flex items-center gap-2 rounded-lg bg-acier-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-acier-800'
const SECONDARY =
  'inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-acier-800 transition hover:bg-slate-50'

/** L'endroit où renvoyer l'utilisateur : son espace s'il en a un, l'accueil sinon. */
function useHome(): { to: string; label: string } {
  const { currentUser } = useStore()
  return currentUser
    ? { to: HOME_BY_ROLE[currentUser.role], label: 'Retour au tableau de bord' }
    : { to: '/', label: 'Retour à l’accueil' }
}

export function NotFound() {
  const home = useHome()
  const location = useLocation()
  return (
    <ErrorScreen
      code="404"
      icon={Compass}
      title="Page introuvable"
      description="L’adresse demandée ne correspond à aucune page de VOLTA. Elle a peut-être été déplacée, ou comporte une faute de frappe."
      detail={<code className="rounded bg-slate-100 px-1.5 py-0.5">{location.pathname}</code>}
      actions={
        <>
          <Link to={home.to} className={PRIMARY}>
            {home.label}
          </Link>
          <Link to="/catalogue" className={SECONDARY}>
            Voir le catalogue
          </Link>
        </>
      }
    />
  )
}

export function Forbidden() {
  const home = useHome()
  return (
    <ErrorScreen
      code="403"
      icon={ShieldAlert}
      title="Accès refusé"
      description="Vous n’avez pas les autorisations nécessaires pour accéder à cette ressource. Si vous pensez qu’il s’agit d’une erreur, rapprochez-vous de l’administration VOLTA."
      actions={
        <Link to={home.to} className={PRIMARY}>
          {home.label}
        </Link>
      }
    />
  )
}

export function SessionExpired() {
  const location = useLocation()
  return (
    <ErrorScreen
      code="401"
      icon={Lock}
      title="Session expirée"
      description="Votre session n’est plus valable. Reconnectez-vous pour reprendre là où vous en étiez."
      actions={
        <Link to="/connexion" state={{ from: location.pathname }} className={PRIMARY}>
          Se reconnecter
        </Link>
      }
    />
  )
}

export function ServerError({ errorId, onRetry }: { errorId?: string; onRetry?: () => void }) {
  const home = useHome()
  return (
    <ErrorScreen
      code="500"
      icon={ServerCrash}
      title="Une erreur est survenue"
      description="Quelque chose s’est mal passé de notre côté. L’équipe VOLTA en a la trace ; vous pouvez réessayer ou revenir à votre tableau de bord."
      detail={
        errorId && (
          <>
            Identifiant technique : <code className="rounded bg-slate-100 px-1.5 py-0.5">{errorId}</code>
          </>
        )
      }
      actions={
        <>
          {onRetry && (
            <button onClick={onRetry} className={PRIMARY}>
              <RefreshCw size={15} />
              Réessayer
            </button>
          )}
          <Link to={home.to} className={onRetry ? SECONDARY : PRIMARY}>
            {home.label}
          </Link>
        </>
      }
    />
  )
}

export function ApiUnavailable({ onRetry, retrying }: { onRetry: () => void; retrying?: boolean }) {
  return (
    <ErrorScreen
      code="Service indisponible"
      icon={WifiOff}
      title="VOLTA n’arrive pas à joindre le serveur"
      description="Le service est momentanément injoignable. Vos données locales n’ont pas été perdues ; l’écran reprendra de lui-même dès que la connexion sera rétablie."
      actions={
        <>
          <button onClick={onRetry} disabled={retrying} className={PRIMARY}>
            <RefreshCw size={15} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Nouvelle tentative…' : 'Réessayer maintenant'}
          </button>
          <Link to="/" className={SECONDARY}>
            Aller à l’accueil
          </Link>
        </>
      }
    />
  )
}

/**
 * Filet de sécurité des routes.
 *
 * Une exception de rendu remontait jusqu'à la racine et React démontait tout :
 * page blanche, sans message. Le filet attrape l'erreur, lui donne un
 * identifiant qu'on retrouve dans la console, et laisse le reste de
 * l'application — barre, navigation — en place.
 */
function newErrorId(): string {
  const stamp = Date.now().toString(36).toUpperCase()
  const salt = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ERR-${stamp}-${salt}`
}

interface BoundaryState {
  errorId: string | null
}

export class RouteErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, BoundaryState> {
  state: BoundaryState = { errorId: null }

  static getDerivedStateFromError(): BoundaryState {
    return { errorId: newErrorId() }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[VOLTA ${this.state.errorId}]`, error, info.componentStack)
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    // Une navigation vers une autre page repart de zéro : l'erreur appartenait
    // à l'écran quitté.
    if (this.state.errorId && prev.resetKey !== this.props.resetKey) {
      this.setState({ errorId: null })
    }
  }

  render() {
    if (this.state.errorId) {
      return <ServerError errorId={this.state.errorId} onRetry={() => this.setState({ errorId: null })} />
    }
    return this.props.children
  }
}

/** Le filet a besoin de la route courante pour se réarmer : ce wrapper la lui passe. */
export function RouteBoundary({ children }: { children: ReactNode }) {
  const location = useLocation()
  return <RouteErrorBoundary resetKey={location.pathname}>{children}</RouteErrorBoundary>
}

/** Bouton « retour » utilisable depuis n'importe quel écran d'erreur. */
export function BackButton() {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(-1)} className={SECONDARY}>
      Page précédente
    </button>
  )
}
