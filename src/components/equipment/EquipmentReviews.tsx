import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, MessageSquare, Star } from 'lucide-react'
import { listReviews, mayReview, postReview, type Review } from '../../services/reviews'
import { useToast } from '../feedback/Toaster'
import { useStore } from '../../store/StoreContext'

/**
 * Les avis des clients sur un engin.
 *
 * <h2>Qui écrit</h2>
 *
 * Seul un client dont une location a été conclue sur cette machine. C'est ce
 * qui sépare un avis d'une opinion : celui qui écrit l'a conduite, attendue,
 * vue tenir ou tomber. Le serveur le vérifie dans les réservations ; l'écran
 * se contente de ne pas montrer le formulaire à qui ne peut pas s'en servir —
 * proposer d'écrire puis refuser à l'envoi est la pire des deux options.
 *
 * <h2>Pourquoi aucun nom</h2>
 *
 * Les identités ne circulent pas sur la plateforme, et un avis signé
 * permettrait de remonter au client. Le lecteur voit « Client vérifié », ce qui
 * est la seule chose qui compte : cette personne a loué cet engin, et le
 * serveur l'a vérifié avant d'accepter sa ligne.
 *
 * <h2>Quand il n'y a rien</h2>
 *
 * Le bloc le dit au lieu de disparaître. Une fiche sans section d'avis laisse
 * croire qu'on n'en recueille pas ; une section vide dit qu'on en attend, et
 * invite le premier à écrire.
 */
export default function EquipmentReviews({
  equipmentId,
  equipmentName,
}: {
  equipmentId: string
  equipmentName: string
}) {
  const [avis, setAvis] = useState<Review[] | null>(null)
  const [autorise, setAutorise] = useState(false)
  const [note, setNote] = useState(0)
  const [survol, setSurvol] = useState(0)
  const [texte, setTexte] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const { currentUser } = useStore()
  /*
   * Le droit d'écrire ne se demande qu'avec une session.
   *
   * L'appel partait pour tout le monde, et un visiteur sans compte prenait un
   * 401 à chaque ouverture de fiche — une requête interdite, répétée, qui
   * noircit la console et le journal du serveur pour une réponse connue
   * d'avance : il n'a pas loué cet engin, il n'a pas de compte.
   */
  const estClient = currentUser?.role === 'CLIENT'

  const charger = useCallback(() => {
    void listReviews(equipmentId).then(setAvis).catch(() => setAvis([]))
    if (estClient) {
      void mayReview(equipmentId).then(setAutorise)
    } else {
      setAutorise(false)
    }
  }, [equipmentId, estClient])

  useEffect(charger, [charger])

  const moyenne =
    avis && avis.length > 0 ? avis.reduce((t, a) => t + a.rating, 0) / avis.length : 0

  const envoyer = async () => {
    if (note < 1) return
    setBusy(true)
    try {
      await postReview(equipmentId, note, texte.trim())
      toast.success('Avis publié', `Merci pour votre retour sur ${equipmentName}.`)
      setTexte('')
      setNote(0)
      charger()
    } catch (e) {
      toast.fromError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border border-papier-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Avis des clients
        </h2>
        {avis && avis.length > 0 && (
          <div className="flex items-center gap-2">
            <Etoiles valeur={Math.round(moyenne)} />
            <span className="text-sm font-semibold text-acier-900">{moyenne.toFixed(1)}</span>
            <span className="text-xs text-slate-500">
              ({avis.length} avis)
            </span>
          </div>
        )}
      </div>

      {avis === null ? (
        <p className="mt-4 text-sm text-slate-500">Chargement…</p>
      ) : avis.length === 0 ? (
        <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-slate-600">
          <MessageSquare size={15} className="mt-0.5 shrink-0 text-slate-400" aria-hidden />
          Aucun avis pour le moment. Les clients qui ont loué cet engin peuvent être les premiers à
          le noter.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {avis.map((a) => (
            <li key={a.id} className="rounded-lg bg-papier-50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Etoiles valeur={a.rating} />
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <BadgeCheck size={12} aria-hidden />
                  Client vérifié
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {a.comment && (
                <p className="mt-1.5 text-sm leading-relaxed text-acier-800">{a.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {autorise && (
        <div className="mt-5 border-t border-papier-200 pt-5">
          <p className="text-sm font-semibold text-acier-900">Vous avez loué cet engin</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Votre retour aide les prochains chantiers à choisir.
          </p>

          <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setSurvol(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                aria-pressed={note === n}
                onMouseEnter={() => setSurvol(n)}
                onClick={() => setNote(n)}
                className="rounded p-0.5 text-amber-500 transition hover:scale-110"
              >
                <Star size={22} className={(survol || note) >= n ? 'fill-current' : ''} />
              </button>
            ))}
          </div>

          <label className="sr-only" htmlFor="avis-texte">
            Votre commentaire
          </label>
          <textarea
            id="avis-texte"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Comment s’est passée la location ? État de la machine, ponctualité, puissance réelle…"
            className="mt-3 w-full rounded-lg border border-papier-300 px-3 py-2 text-sm focus:border-btp-400 focus:outline-none focus:ring-2 focus:ring-btp-200"
          />

          <button
            type="button"
            disabled={note < 1 || busy}
            onClick={() => void envoyer()}
            className="mt-2 rounded-lg bg-btp-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-btp-600 disabled:opacity-50"
          >
            {busy ? 'Envoi…' : 'Publier mon avis'}
          </button>
        </div>
      )}
    </section>
  )
}

/** Cinq étoiles, dont `valeur` pleines. Le nombre est dit, la forme ne l'est pas. */
function Etoiles({ valeur }: { valeur: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${valeur} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          aria-hidden
          className={n <= valeur ? 'fill-current text-amber-500' : 'text-slate-300'}
        />
      ))}
    </span>
  )
}
