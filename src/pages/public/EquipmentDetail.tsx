import { useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Calendar, CalendarCheck, CheckCircle2, Gauge, HardHat, MapPin, MessageCircle,
  ShieldCheck, Wrench, XCircle,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { createRequest, type RequestReceipt } from '../../services/requests'
import { equipmentRef } from '../../lib/references'
import { Card, EmptyState, LevelBadge, Modal, fmtPrice } from '../../components/ui'
import { useToast } from '../../components/feedback/Toaster'
import TechnicalSpecs from '../../components/equipment/TechnicalSpecs'
import EquipmentReviews from '../../components/equipment/EquipmentReviews'
import LikeButton from '../../components/equipment/LikeButton'
import { lienWhatsapp } from '../../lib/whatsapp'

export default function EquipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { equipment, categories, currentUser } = useStore()
  const eq = equipment.find((e) => e.id === id)
  const [modalOpen, setModalOpen] = useState(false)
  /** La photo montrée en grand ; les vignettes la changent. */
  const [photoActive, setPhotoActive] = useState(0)
  const toast = useToast()
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    quantity: 1,
    message: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactCity: '',
  })
  /** Ce que le déposant garde : sans la référence, il perd son dossier. */
  const [recu, setRecu] = useState<RequestReceipt | null>(null)

  if (!eq || eq.status !== 'PUBLISHED') {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-12">
        <EmptyState title="Engin introuvable ou non publié" subtitle="Seuls les engins publiés sont visibles dans le catalogue." />
        <div className="mt-4 text-center">
          <Link to="/catalogue" className="font-medium text-blue-600 hover:underline">← Retour au catalogue</Link>
        </div>
      </div>
    )
  }

  const cat = categories.find((c) => c.id === eq.categoryId)

  /**
   * Un compte est exigé pour demander un prix.
   *
   * Le formulaire a été ouvert sans compte un temps, par cohérence avec les
   * huit parcours. VOLTA a tranché autrement : un devis engage une machine, une
   * date et un propriétaire, et l'on veut savoir à qui l'on répond avant d'y
   * passer du temps.
   *
   * La destination est mémorisée : après inscription, le visiteur revient sur
   * la fiche qu'il regardait, pas sur une page d'accueil où il devrait
   * retrouver l'engin.
   */
  const handleQuoteClick = () => {
    if (!currentUser) {
      navigate('/inscription', { state: { from: pathname } })
      return
    }
    {
      setForm((f) => ({
        ...f,
        contactName: f.contactName || currentUser.name,
        contactPhone: f.contactPhone || currentUser.phone,
        contactEmail: f.contactEmail || currentUser.email,
        contactCity: f.contactCity || currentUser.city,
      }))
    }
    setModalOpen(true)
  }

  /**
   * La demande rejoint le moteur commun.
   *
   * Elle partait vers « /quote-requests », sa propre table et sa propre console :
   * un devis demandé depuis une fiche n'apparaissait pas dans le centre des
   * demandes, et l'administration devait surveiller deux écrans pour ne rien
   * laisser passer. Elle emprunte désormais le même circuit que les huit
   * parcours — même référence, même suivi, même console.
   *
   * L'engin voyage dans le `payload` : c'est ce qui distingue cette demande
   * d'une location décrite de zéro, et ce que l'administration lit en premier.
   */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const receipt = await createRequest({
        kind: 'RENTAL',
        intent: 'RENT_EQUIPMENT',
        subject: `Devis location — ${eq.name}`,
        location: eq.location,
        contact: {
          name: form.contactName,
          phone: form.contactPhone,
          email: form.contactEmail,
          city: form.contactCity,
        },
        payload: {
          // L'identifiant, et non la seule référence d'affichage : c'est par
          // lui que la réservation née de l'acceptation retrouve la machine.
          equipmentId: eq.id,
          equipmentRef: equipmentRef(eq.id),
          equipmentName: eq.name,
          brandModel: `${eq.brand} ${eq.model}`,
          quantity: String(form.quantity),
          startDate: form.startDate,
          endDate: form.endDate,
          description: form.message,
        },
      })
      setRecu(receipt)
      toast.success(
        'Demande de devis envoyée',
        `Votre référence : ${receipt.reference}. VOLTA qualifie votre demande et revient vers vous.`,
      )
    } catch (err) {
      toast.fromError(err, 'Demande non envoyée')
    } finally {
      setSending(false)
    }
  }

  const input = 'w-full rounded-lg border border-papier-200 p-2 text-sm'

  /* La photo regardée en grand.

     La fiche posait la première photo en grand et les autres en vignettes
     inertes : on voyait qu'il y en avait six, on n'en voyait qu'une. Cliquer
     une vignette la met au-dessus — c'est le geste qu'on fait d'instinct, et
     il ne coûte qu'un index. */
  const photos = eq.photos.length > 0 ? eq.photos : ['/images/placeholders/equipment.svg']
  const grande = photos[Math.min(photoActive, photos.length - 1)]

  /** Aujourd'hui, au format du champ date : on ne loue pas dans le passé. */
  const aujourdHui = new Date().toISOString().slice(0, 10)

  /**
   * L'estimation, à partir de la période saisie.
   *
   * Huit heures par jour : c'est la journée de chantier, et c'est sur elle que
   * se facture une location. Compter vingt-quatre donnerait un chiffre que
   * personne ne facture et qui ferait fuir avant la demande.
   *
   * Nulle tant que la période n'est pas complète ou cohérente — une estimation
   * calculée sur des dates inversées vaudrait moins que pas d'estimation.
   */
  const estimation = (() => {
    const debut = Date.parse(form.startDate)
    const fin = Date.parse(form.endDate)
    if (Number.isNaN(debut) || Number.isNaN(fin) || fin < debut) return null
    const jours = Math.round((fin - debut) / 86_400_000) + 1
    return { jours, total: eq.pricePerDay * 8 * jours * Math.max(1, form.quantity) }
  })()

  const lienWa = lienWhatsapp({
    /* « Komatsu PC210LC-8 — Komatsu PC210LC-8 » : le nom porte déjà la marque
       et le modèle sur la plupart des fiches. On ne les ajoute que s'ils
       manquent, sinon le message s'ouvre sur une répétition. */
    objet: eq.name.includes(eq.model) ? eq.name : `${eq.name} — ${eq.brand} ${eq.model}`,
    reference: equipmentRef(eq.id),
    precision: `Tarif affiché : ${fmtPrice(eq.pricePerDay)} / heure`,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <Link to="/catalogue" className="text-sm font-medium text-blue-600 hover:underline">← Retour au catalogue</Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <img
            loading="eager"
            src={grande}
            alt={eq.name}
            className="h-72 w-full rounded-xl object-cover sm:h-80"
          />
          {photos.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhotoActive(i)}
                  aria-label={`Photo ${i + 1} sur ${photos.length}`}
                  aria-current={i === photoActive ? 'true' : undefined}
                  className={`shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                    i === photoActive ? 'ring-btp-500' : 'ring-transparent hover:ring-papier-300'
                  }`}
                >
                  <img loading="lazy" src={p} alt="" className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{eq.name}</h1>
              <LevelBadge level={eq.level} />
            </div>
            {/* Public, et distinct du favori : celui-ci dit aux autres que la
                machine plaît, l'autre la range dans sa propre liste. */}
            <LikeButton equipmentId={eq.id} />
          </div>
          <div className="mt-1 text-sm text-papier-600">
            {cat?.name} · {eq.brand} {eq.model}
          </div>

          {/* Le tarif, et ce qu'il est.

              Le chiffre seul se lisait comme un prix ferme : un client qui
              trouvait ensuite autre chose sur son devis se sentait trompé.
              C'est la première proposition — le devis part de là. */}
          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-700">
              {fmtPrice(eq.pricePerDay)} <span className="text-base font-semibold">/ heure</span>
            </div>
            <p className="mt-0.5 text-xs text-papier-600">
              Tarif de départ. Votre devis est établi sur la durée et le lieu du chantier.
            </p>
          </div>

          {/* La disponibilité en tête, séparée du reste : c'est la première
              chose qu'on vérifie, et elle décide si l'on lit la suite. */}
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold ${
              eq.available
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                : 'bg-red-50 text-red-800 ring-1 ring-red-200'
            }`}
          >
            {eq.available ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
            {eq.available ? 'Disponible à la location' : 'Indisponible pour le moment'}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Card className="flex items-center gap-2 p-3">
              <MapPin size={15} className="shrink-0 text-papier-600" />
              {eq.location}
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Calendar size={15} className="shrink-0 text-papier-600" />
              Année : {eq.year}
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Gauge size={15} className="shrink-0 text-papier-600" />
              {eq.hours.toLocaleString('fr-FR')} h compteur
            </Card>
            <Card className="flex items-center gap-2 p-3">
              <Wrench size={15} className="shrink-0 text-papier-600" />
              {eq.declaredCondition}
            </Card>
            {eq.withOperator && (
              <Card className="flex items-center gap-2 p-3">
                <HardHat size={15} className="shrink-0 text-papier-600" />
                Opérateur possible
              </Card>
            )}
            {/* La date dit depuis quand la machine est contrôlée. Un parc
                inspecté il y a trois ans et un parc inspecté le mois dernier
                portent le même badge ; seule la date les sépare. */}
            {eq.lastInspectionAt && (
              <Card className="flex items-center gap-2 p-3">
                <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                Inspecté le {new Date(eq.lastInspectionAt).toLocaleDateString('fr-FR')}
              </Card>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-papier-600">{eq.description}</p>

          <Card className="mt-4 flex items-start gap-3 p-4 text-sm">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-btp-500" aria-hidden />
            <span>
              <span className="block font-semibold text-acier-900">Fournisseur vérifié par VOLTA</span>
              {/* L'identité ne sort pas de la plateforme : le client sait qu'il
                  y a un propriétaire contrôlé, et c'est VOLTA qui en répond. */}
              <span className="mt-0.5 block text-papier-600">
                Parc contrôlé avant mise en ligne. VOLTA reste votre interlocuteur du devis à la
                restitution.
              </span>
            </span>
          </Card>

          {/* Deux voies vers la même équipe : le formulaire pour qui veut un
              devis écrit, WhatsApp pour qui est sur un chantier et parle plus
              vite qu'il n'écrit. Le message part déjà rempli de l'objet et de
              la référence — sans quoi il faut trois échanges pour apprendre de
              quelle machine on parle. */}
          <div className="mt-5 grid gap-2">
            <button
              onClick={handleQuoteClick}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <CalendarCheck size={17} aria-hidden />
              Demander un devis — choisir mes dates
            </button>
            <a
              href={lienWa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 font-semibold text-white transition hover:bg-[#1da851]"
            >
              <MessageCircle size={17} aria-hidden />
              Écrire sur WhatsApp
            </a>
            <p className="text-center text-xs text-papier-600">
              Décrivez votre besoin en quelques champs. VOLTA le confronte à son réseau d’engins
              vérifiés.
            </p>
          </div>
        </div>
      </div>

      {/* Sous le pli : ce qui se lit quand on a déjà décidé que la machine
          pourrait convenir — les chiffres, puis l'avis de ceux qui l'ont eue. */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <TechnicalSpecs eq={eq} />
        <EquipmentReviews equipmentId={eq.id} equipmentName={eq.name} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setRecu(null)
        }}
        title={recu ? 'Demande transmise' : `Demande de devis — ${eq.name}`}
      >
        {recu ? (
          /* L'accusé, et pas un simple « c'est envoyé ».
             Le suivi se fait par référence et jeton : les afficher ailleurs
             qu'ici serait les perdre, car le serveur ne les redonne jamais. */
          <div className="grid gap-4 text-center">
            <p className="text-sm text-papier-700">
              VOLTA qualifie votre demande et revient vers vous avec une proposition.
            </p>
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-papier-600">
                Votre référence
              </span>
              <span className="mt-1 block font-mono text-lg font-bold text-acier-900">
                {recu.trackingCode}
              </span>
            </div>
            <p className="text-xs text-papier-600">
              Conservez-la : elle seule ouvre le suivi de votre demande.
            </p>
            <Link
              to={`/suivi?ref=${encodeURIComponent(recu.reference)}&code=${encodeURIComponent(recu.trackingToken)}`}
              className="rounded-lg bg-acier-900 py-2.5 font-semibold text-white transition hover:bg-acier-800"
            >
              Suivre ma demande
            </Link>
          </div>
        ) : (
        <form onSubmit={submit} className="grid gap-3">
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Votre demande est traitée par VOLTA. Pas besoin de compte : vos coordonnées suffisent.
          </p>
          {/* Le calendrier ne propose pas le passé, et la fin ne précède pas
              le début : une période impossible part sinon au serveur, qui la
              refuse — après que le visiteur a tout rempli. */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-papier-600" htmlFor="devis-debut">
                Date de début *
              </label>
              <input
                id="devis-debut"
                required
                type="date"
                min={aujourdHui}
                className={input}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-papier-600" htmlFor="devis-fin">
                Date de fin *
              </label>
              <input
                id="devis-fin"
                required
                type="date"
                min={form.startDate || aujourdHui}
                className={input}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-papier-600" htmlFor="devis-quantite">
              Quantité *
            </label>
            <input
              id="devis-quantite"
              required
              type="number"
              min="1"
              className={input}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          {/* L'estimation, dès que la période est saisie.
              
              Elle répond à la question qu'on se pose avant d'envoyer une
              demande — « est-ce que c'est dans mes moyens ? » — et à laquelle
              il fallait jusqu'ici attendre notre réponse. Elle n'engage
              personne, et le dit : le tarif affiché est un départ, le devis
              tient compte de la durée, du lieu et du transport.
              
              Huit heures par jour, qui est la journée de chantier. Compter
              vingt-quatre donnerait un chiffre que personne ne facture. */}
          {estimation && (
            <div className="rounded-lg border border-btp-200 bg-btp-50 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-papier-600">
                  Estimation indicative
                </span>
                <span className="text-lg font-bold text-btp-700">
                  {fmtPrice(estimation.total)}
                </span>
              </div>
              <p className="mt-1 text-xs text-papier-700">
                {estimation.jours} jour{estimation.jours > 1 ? 's' : ''} × 8 h
                {form.quantity > 1 ? ` × ${form.quantity} engins` : ''} au tarif affiché.
              </p>
              <p className="mt-1 text-xs text-papier-600">
                Ce n’est pas un devis : le prix final tient compte du lieu, du transport et de
                l’opérateur.
              </p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-papier-600">Message ou détails supplémentaires</label>
            <textarea className={input} rows={2} placeholder="Ex: conditions d'accès, contraintes spéciales..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="mt-1 border-t border-papier-200 pt-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-papier-600">
              Vos coordonnées
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-papier-600" htmlFor="devis-nom">
                  Nom complet *
                </label>
                <input id="devis-nom" required className={input} value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-papier-600" htmlFor="devis-tel">
                  Téléphone *
                </label>
                <input id="devis-tel" required type="tel" className={input} value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-papier-600" htmlFor="devis-mail">
                  Email
                </label>
                <input id="devis-mail" type="email" className={input} value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-papier-600" htmlFor="devis-ville">
                  Ville *
                </label>
                <input id="devis-ville" required className={input} value={form.contactCity}
                  onChange={(e) => setForm({ ...form, contactCity: e.target.value })} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-2 rounded-lg bg-btp-500 py-2.5 font-semibold text-white transition hover:bg-btp-600 disabled:opacity-60"
          >
            {sending ? 'Envoi en cours…' : 'Envoyer la demande de devis'}
          </button>
        </form>
        )}
      </Modal>
    </div>
  )
}
