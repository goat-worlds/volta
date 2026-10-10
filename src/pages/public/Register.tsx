import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Check,
  CalendarCheck,
  Eye,
  EyeOff,
  FileText,
  HardHat,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { HOME_BY_ROLE } from '../../components/RequireRole'
import type { ClientType, Role } from '../../store/types'

/**
 * Création de compte.
 *
 * L'inscription ne créait que des clients : un loueur d'engins ou un bureau de
 * vérification n'avait aucun moyen d'entrer sur la plateforme, alors que les
 * deux espaces existaient. Le rôle se choisit donc en premier — c'est lui qui
 * décide des champs demandés et de l'espace où l'on atterrit.
 *
 * ADMIN n'y figure pas : arbitrer entre fournisseur et client ne s'obtient pas
 * en cochant une case. Le serveur refuse ce rôle même si on le lui envoie.
 *
 * <h2>Deux colonnes</h2>
 *
 * La page tenait dans une carte étroite au milieu d'un fond gris : on y créait
 * un compte sans savoir pour quoi faire. La colonne de gauche dit ce qu'est
 * VOLTA pendant que la droite recueille les informations — c'est le moment où
 * l'on demande un effort au visiteur, donc celui où il faut lui rappeler ce
 * qu'il y gagne. Elle disparaît sous `lg` : sur un téléphone, une photo
 * pleine hauteur repousse le formulaire sous la ligne de flottaison.
 */

const ROLES: { value: Role; label: string; pitch: string; icon: LucideIcon }[] = [
  {
    value: 'CLIENT',
    label: 'Je cherche un engin',
    pitch: 'Pour louer ou acheter un équipement.',
    icon: Search,
  },
  {
    value: 'SUPPLIER',
    label: 'Je possède des engins',
    pitch: 'Pour référencer mon parc et recevoir des demandes.',
    icon: Building2,
  },
  {
    value: 'TECHNICAL',
    label: 'Je suis technicien',
    pitch: 'Pour réaliser des inspections et accéder aux missions.',
    icon: HardHat,
  },
]

/**
 * Les deux profils de client.
 *
 * Le libellé dit ce qu'on est, pas ce qu'on obtient : un dirigeant se
 * reconnaît dans « au nom d'une entreprise » sans avoir à deviner ce qu'un
 * « compte professionnel » lui donnerait de plus.
 */
const TYPES_CLIENT: { value: ClientType; label: string; pitch: string }[] = [
  {
    value: 'PARTICULIER',
    label: 'À titre personnel',
    pitch: 'Votre nom et votre numéro suffisent.',
  },
  {
    value: 'ENTREPRISE',
    label: 'Au nom d’une entreprise',
    pitch: 'Pour recevoir les marchés que VOLTA apporte.',
  },
]

/** Ce que la colonne de gauche promet, sous la photo. */
const PROMESSES: { icon: LucideIcon; texte: string }[] = [
  { icon: Search, texte: 'Accédez à un large choix d’engins' },
  { icon: CalendarCheck, texte: 'Gérez vos locations en toute simplicité' },
  { icon: ShieldCheck, texte: 'Des équipements vérifiés et conformes' },
]

/**
 * Exigences du mot de passe, montrées pendant la frappe.
 *
 * Annoncées d'avance et cochées au fur et à mesure, elles évitent le refus
 * après envoi — le moment où l'on a déjà tout rempli et où l'on recommence.
 */
const EXIGENCES: { texte: string; verifie: (v: string) => boolean }[] = [
  { texte: 'Au moins 8 caractères', verifie: (v) => v.length >= 8 },
  { texte: '1 lettre majuscule', verifie: (v) => /[A-ZÀ-Þ]/.test(v) },
  { texte: '1 chiffre', verifie: (v) => /\d/.test(v) },
  { texte: '1 caractère spécial', verifie: (v) => /[^\w\s]/.test(v) },
]

export default function Register() {
  const { register } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * D'où vient le visiteur, s'il a été renvoyé ici.
   *
   * Une fiche d'engin et une annonce du Market exigent un compte avant de
   * laisser demander un prix. Elles passent leur adresse ; sans cette reprise,
   * l'inscription déposerait le nouveau venu sur son tableau de bord et il
   * devrait retrouver seul la machine qu'il regardait une minute plus tôt.
   */
  const retour = (location.state as { from?: string } | null)?.from ?? null

  const [role, setRole] = useState<Role>('CLIENT')
  const [clientType, setClientType] = useState<ClientType>('PARTICULIER')
  const [rccm, setRccm] = useState('')
  const [dfe, setDfe] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [piece, setPiece] = useState<{ name: string; type: string; contentBase64: string } | null>(null)
  const [pieceErreur, setPieceErreur] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  /**
   * Ce qu'on demande au client, et rien de plus.
   *
   * Il vient dire un besoin de chantier, pas ouvrir un dossier : son nom et son
   * numéro suffisent, et c'est le numéro qui l'identifiera à la reconnexion.
   * L'adresse et la ville restent exigées du fournisseur et de l'équipe
   * technique, qui reçoivent des notifications écrites et signent des rapports.
   */
  const estClient = role === 'CLIENT'
  /**
   * L'entreprise cliente est un client, mais pas le même.
   *
   * Elle reçoit les marchés que VOLTA lui apporte et signe un contrat qui
   * l'engage : la plateforme lui demande de quoi l'identifier avant de lui
   * ouvrir quoi que ce soit. Le particulier, lui, garde son inscription en
   * trois champs — c'est lui le cas courant, et c'est lui qu'un formulaire
   * long ferait renoncer.
   */
  const estEntreprise = estClient && clientType === 'ENTREPRISE'
  const besoinStructure = !estClient || estEntreprise

  /**
   * La pièce du gérant, lue en base64.
   *
   * Le fichier part dans le corps de l'inscription, comme les pièces jointes
   * des parcours : le compte n'existe pas encore, il n'y a donc pas de session
   * sous laquelle téléverser à part.
   */
  const lirePiece = (fichier: File | null) => {
    setPieceErreur(null)
    if (!fichier) {
      setPiece(null)
      return
    }
    if (fichier.size > 5 * 1024 * 1024) {
      setPieceErreur('La pièce ne doit pas dépasser 5 Mo.')
      setPiece(null)
      return
    }
    const lecteur = new FileReader()
    lecteur.onerror = () => setPieceErreur('Fichier illisible. Réessayez.')
    lecteur.onload = () => {
      // `readAsDataURL` rend « data:<type>;base64,<contenu> » : le serveur
      // n'attend que le contenu.
      const brut = String(lecteur.result ?? '')
      const contenu = brut.slice(brut.indexOf(',') + 1)
      setPiece({ name: fichier.name, type: fichier.type || 'application/octet-stream', contentBase64: contenu })
    }
    lecteur.readAsDataURL(fichier)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const user = await register(
        estEntreprise
          ? {
              name, email, phone, password, role, company, city,
              clientType, rccm, dfe, managerEmail,
              managerIdDocument: piece ?? undefined,
            }
          : estClient
            ? { name, phone, password, role, clientType: 'PARTICULIER' }
            : { name, email, phone, password, role, company, city },
      )
      navigate(retour ?? HOME_BY_ROLE[user.role] ?? '/')
    } catch {
      setError(
        estClient
          ? 'Inscription impossible. Ce numéro est peut-être déjà enregistré.'
          : "Inscription impossible. Vérifiez vos informations — l'email est peut-être déjà utilisé.",
      )
    } finally {
      setBusy(false)
    }
  }

  const champ =
    'w-full rounded-lg border border-papier-200 bg-white py-2.5 pl-10 pr-3 text-sm text-acier-900 ' +
    'transition placeholder:text-papier-400 focus:border-btp-400 focus:outline-none focus:ring-2 focus:ring-btp-400/25'
  const etiquette = 'mb-1.5 block text-sm font-medium text-papier-700'
  const picto = 'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-papier-400'

  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      {/* Colonne de gauche : ce qu'est VOLTA, pendant qu'on remplit à droite. */}
      <aside className="relative hidden overflow-hidden bg-acier-900 lg:block">
        <img
          src="/engins/parc-chargeuses.jpeg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Le voile part du bas : sans lui, le texte blanc passe sur un ciel
            surexposé et devient illisible selon la photo. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-acier-900 via-acier-900/75 to-acier-900/25"
        />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div>
            <span className="volta-eyebrow text-btp-400">
              <span aria-hidden className="mr-2 inline-block h-4 w-1 rounded-sm bg-btp-500 align-middle" />
              Louez. Valorisez. Inspectez.
            </span>
            <p className="volta-display mt-5 text-4xl leading-[1.12] text-white xl:text-5xl">
              La plateforme des engins de chantier en Côte d’Ivoire.
            </p>
            <p className="mt-5 max-w-md leading-relaxed text-acier-200">
              Mettez en relation les entreprises, les propriétaires d’engins et les techniciens
              qualifiés.
            </p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-3">
            {PROMESSES.map(({ icon: Icon, texte }) => (
              <li key={texte}>
                <span className="flex size-11 items-center justify-center rounded-full bg-white text-acier-900">
                  <Icon size={19} aria-hidden />
                </span>
                <span className="mt-3 block text-sm font-semibold leading-snug text-white">
                  {texte}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Colonne de droite : le formulaire. */}
      <div className="flex items-center justify-center bg-papier-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-xl rounded-2xl border border-papier-200 bg-white p-6 shadow-sm sm:p-9">
          <span className="volta-eyebrow text-btp-600">Créer un compte</span>
          <h1 className="volta-display mt-2 text-3xl text-acier-900 sm:text-4xl">
            Rejoignez VOLTA
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-papier-600">
            Choisissez votre profil pour accéder aux services adaptés à votre activité.
          </p>

          <fieldset className="mt-7">
            <legend className="sr-only">Votre profil</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {ROLES.map((r) => {
                const Icon = r.icon
                const actif = role === r.value
                return (
                  <label
                    key={r.value}
                    className={`relative cursor-pointer rounded-xl border p-4 transition ${
                      actif
                        ? 'border-btp-400 bg-btp-50/60 ring-1 ring-btp-400'
                        : 'border-papier-200 bg-white hover:border-papier-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="profil"
                      value={r.value}
                      checked={actif}
                      onChange={() => setRole(r.value)}
                      className="sr-only"
                    />
                    {actif && (
                      <span
                        aria-hidden
                        className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-btp-500 text-white"
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <span
                      className={`flex size-10 items-center justify-center rounded-lg ${
                        actif ? 'bg-btp-100 text-btp-600' : 'bg-papier-100 text-papier-500'
                      }`}
                    >
                      <Icon size={19} aria-hidden />
                    </span>
                    <span className="mt-3 block text-sm font-bold leading-snug text-acier-900">
                      {r.label}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-papier-600">
                      {r.pitch}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Particulier ou entreprise.

              Posé juste sous le choix de profil, et seulement pour un client :
              la question ne se pose qu'à lui, et elle commande tout le reste du
              formulaire. La poser plus bas aurait fait apparaître quatre champs
              au milieu d'une saisie déjà commencée. */}
          {estClient && (
            <fieldset className="mt-4">
              <legend className="sr-only">Vous êtes</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPES_CLIENT.map((t) => {
                  const actif = clientType === t.value
                  return (
                    <label
                      key={t.value}
                      className={`relative cursor-pointer rounded-xl border p-4 transition ${
                        actif
                          ? 'border-btp-400 bg-btp-50/60 ring-1 ring-btp-400'
                          : 'border-papier-200 bg-white hover:border-papier-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type-client"
                        value={t.value}
                        checked={actif}
                        onChange={() => setClientType(t.value)}
                        className="sr-only"
                      />
                      {actif && (
                        <span
                          aria-hidden
                          className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-btp-500 text-white"
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                      <span className="block text-sm font-bold leading-snug text-acier-900">
                        {t.label}
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-papier-600">
                        {t.pitch}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )}

          <form onSubmit={submit} className="mt-8">
            <p className="text-sm font-bold text-acier-900">Vos informations</p>

            <div className="mt-4 grid gap-4">
              <div>
                <label className={etiquette} htmlFor="inscription-nom">
                  Nom complet <span className="text-btp-600">*</span>
                </label>
                <div className="relative">
                  <User className={picto} aria-hidden />
                  <input
                    id="inscription-nom"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Konan"
                    className={champ}
                  />
                </div>
              </div>

              {besoinStructure && (
                <div>
                  <label className={etiquette} htmlFor="inscription-structure">
                    {role === 'TECHNICAL' ? 'Nom du bureau de vérification' : 'Raison sociale'}{' '}
                    <span className="text-btp-600">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className={picto} aria-hidden />
                    <input
                      id="inscription-structure"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={role === 'TECHNICAL' ? 'Société Technique ABC' : 'BTP CI SARL'}
                      className={champ}
                    />
                  </div>
                </div>
              )}

              <div className={besoinStructure ? 'grid gap-4 sm:grid-cols-2' : ''}>
                {besoinStructure && (
                  <div>
                    <label className={etiquette} htmlFor="inscription-email">
                      Email professionnel <span className="text-btp-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className={picto} aria-hidden />
                      <input
                        id="inscription-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@entreprise.ci"
                        className={champ}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className={etiquette} htmlFor="inscription-tel">
                    Téléphone <span className="text-btp-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={picto} aria-hidden />
                    <input
                      id="inscription-tel"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05 00 00 00 00"
                      className={champ}
                    />
                  </div>
                  {/* Dit au seul particulier : c'est le seul à n'avoir que son
                      numéro pour se reconnecter. L'entreprise donne une adresse,
                      et lui annoncer le numéro la ferait douter de laquelle
                      employer. */}
                  {estClient && !estEntreprise && (
                    <p className="mt-1.5 text-xs text-papier-600">
                      C’est avec ce numéro que vous vous connecterez.
                    </p>
                  )}
                </div>
              </div>

              {/* Les pièces de l'entreprise.

                  Groupées et annoncées, pas semées entre le nom et la ville :
                  on demande là un effort réel — aller chercher deux numéros et
                  scanner une pièce — et un dirigeant doit savoir d'avance ce
                  qu'on attend de lui plutôt que de le découvrir champ après
                  champ. La phrase dit aussi pourquoi, parce que c'est la seule
                  chose qui rend l'effort acceptable. */}
              {estEntreprise && (
                <div className="rounded-xl border border-papier-200 bg-papier-50/60 p-4">
                  <p className="text-sm font-bold text-acier-900">Pièces de l’entreprise</p>
                  <p className="mt-1 text-xs leading-relaxed text-papier-600">
                    VOLTA vous apporte des marchés. Ces pièces nous permettent de vérifier votre
                    entreprise avant de vous les confier — elles ne sont lues que par notre équipe.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={etiquette} htmlFor="inscription-rccm">
                        RCCM <span className="text-btp-600">*</span>
                      </label>
                      <div className="relative">
                        <FileText className={picto} aria-hidden />
                        <input
                          id="inscription-rccm"
                          required
                          value={rccm}
                          onChange={(e) => setRccm(e.target.value)}
                          placeholder="CI-ABJ-2024-B-12345"
                          className={champ}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={etiquette} htmlFor="inscription-dfe">
                        DFE <span className="text-btp-600">*</span>
                      </label>
                      <div className="relative">
                        <FileText className={picto} aria-hidden />
                        <input
                          id="inscription-dfe"
                          required
                          value={dfe}
                          onChange={(e) => setDfe(e.target.value)}
                          placeholder="Déclaration fiscale d’existence"
                          className={champ}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className={etiquette} htmlFor="inscription-responsable">
                      Email du responsable <span className="text-btp-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className={picto} aria-hidden />
                      <input
                        id="inscription-responsable"
                        type="email"
                        required
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="direction@entreprise.ci"
                        className={champ}
                      />
                    </div>
                    {/* Le compte est souvent tenu par un chargé d'affaires ; le
                        contrat, lui, lie celui qui dirige. */}
                    <p className="mt-1.5 text-xs text-papier-600">
                      Celui qui engage l’entreprise, s’il est différent de vous.
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className={etiquette} htmlFor="inscription-piece">
                      Pièce d’identité du gérant <span className="text-btp-600">*</span>
                    </label>
                    <input
                      id="inscription-piece"
                      type="file"
                      required={!piece}
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => lirePiece(e.target.files?.[0] ?? null)}
                      className="block w-full cursor-pointer rounded-lg border border-papier-300 bg-white px-3 py-2 text-sm text-papier-700 file:mr-3 file:rounded-md file:border-0 file:bg-acier-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-acier-800"
                    />
                    <p className="mt-1.5 text-xs text-papier-600">
                      Photo ou PDF, 5 Mo maximum.
                      {piece && <span className="ml-1 font-semibold text-btp-700">{piece.name}</span>}
                    </p>
                    {pieceErreur && (
                      <p role="alert" className="mt-1.5 text-xs font-semibold text-red-700">
                        {pieceErreur}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {besoinStructure && (
                <div>
                  <label className={etiquette} htmlFor="inscription-ville">
                    Ville <span className="text-btp-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className={picto} aria-hidden />
                    <input
                      id="inscription-ville"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Abidjan"
                      className={champ}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={etiquette} htmlFor="inscription-motdepasse">
                  Mot de passe <span className="text-btp-600">*</span>
                </label>
                <div className="relative">
                  <Lock className={picto} aria-hidden />
                  <input
                    id="inscription-motdepasse"
                    type={motDePasseVisible ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${champ} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setMotDePasseVisible((v) => !v)}
                    aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-papier-400 transition hover:text-acier-700"
                  >
                    {motDePasseVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                  {EXIGENCES.map((e) => {
                    const ok = e.verifie(password)
                    return (
                      <li
                        key={e.texte}
                        className={`inline-flex items-center gap-1.5 text-xs ${
                          ok ? 'text-emerald-600' : 'text-papier-500'
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`grid size-3.5 place-items-center rounded-full ${
                            ok ? 'bg-emerald-500 text-white' : 'bg-papier-200 text-transparent'
                          }`}
                        >
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                        {e.texte}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-btp-500 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-btp-600 disabled:opacity-60"
            >
              {busy ? 'Création…' : 'Créer mon compte'}
              {!busy && <ArrowRight size={16} aria-hidden />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-papier-400">
            <span className="h-px flex-1 bg-papier-200" />
            ou
            <span className="h-px flex-1 bg-papier-200" />
          </div>

          <p className="text-center text-sm text-papier-600">
            Vous avez déjà un compte ?{' '}
            <Link to="/connexion" className="font-semibold text-btp-600 hover:text-btp-700">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
