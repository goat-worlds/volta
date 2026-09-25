import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Copy, PenLine, Phone, Send, UserX } from 'lucide-react'
import type { Journey, FieldDef } from '../../lib/journeys'
import { createRequest, type RequestAttachmentInput, type RequestReceipt } from '../../services/requests'
import { attachmentPayload, parseAttachment } from '../../services/attachments'
import { contactDefaults, firstName, forgetVisitor, readVisitor, rememberVisitor } from '../../services/profile'
import RequestTimeline from './RequestTimeline'
import {
  CheckboxField,
  FileField,
  SelectField,
  TagsField,
  TextAreaField,
  TextField,
} from './fields'

/**
 * Formulaire progressif d'un parcours.
 *
 * Il rend n'importe quelle définition de `journeys.ts` : les étapes, la
 * validation, la soumission et l'écran de confirmation sont écrits une fois.
 * Un long formulaire d'un seul tenant fait abandonner — les étapes montrent ce
 * qui reste et permettent de revenir en arrière sans rien reperdre.
 *
 * Trois choses le rendent personnel, et elles sont voulues :
 *
 *   - il reconnaît quelqu'un déjà venu et lui repropose ses coordonnées, en le
 *     disant et en laissant les effacer d'un clic ;
 *   - il reprend en tête d'étape ce qui vient d'être saisi, dans les mots de la
 *     personne — « Votre pelle hydraulique à Yopougon » plutôt que « Étape 2 » ;
 *   - il fait relire la demande à la première personne avant l'envoi, comme on
 *     relit une lettre : c'est le dernier moment où une erreur se corrige seule,
 *     et c'est ce qui distingue un dossier lu d'un formulaire avalé.
 */

function renderField(
  field: FieldDef,
  value: string,
  error: string | undefined,
  onChange: (value: string) => void,
) {
  const common = {
    name: field.name,
    label: field.label,
    required: field.required,
    help: field.help,
    error,
    value,
    onChange,
  }

  switch (field.kind) {
    case 'textarea':
      return <TextAreaField {...common} placeholder={field.placeholder} />
    case 'select':
      return <SelectField {...common} options={field.options ?? []} />
    case 'checkbox':
      return <CheckboxField name={field.name} label={field.label} help={field.help} value={value} onChange={onChange} />
    case 'tags':
      return <TagsField {...common} options={field.options ?? []} max={field.max} />
    case 'file':
      return <FileField {...common} accept={field.accept} />
    default:
      return <TextField {...common} type={field.kind} placeholder={field.placeholder} />
  }
}

/**
 * Ce qui manque, dit avec le nom du champ.
 *
 * « Ce champ est nécessaire pour traiter votre demande », répété sous six
 * champs, est le message d'une machine. Nommer ce qu'on attend — « Il nous
 * faut la ville du chantier » — est ce que dirait la personne au téléphone.
 */
function missingMessage(field: FieldDef): string {
  const label = field.label.toLowerCase()
  if (field.kind === 'file') return `Joignez ${label} : c’est la pièce sur laquelle on vous lira.`
  if (field.kind === 'select' || field.kind === 'tags') return `Choisissez ${label}.`
  if (field.kind === 'date') return `Indiquez ${label}, même approximative.`
  return `Il nous faut ${label} pour traiter votre demande.`
}

export default function JourneyForm({ journey }: { journey: Journey }) {
  // Le carnet local est lu une fois : relire à chaque rendu ferait réapparaître
  // des coordonnées que la personne vient justement de faire oublier.
  const [visitor, setVisitor] = useState(() => readVisitor())
  const known = firstName(visitor)

  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>(() => contactDefaults(visitor))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<RequestReceipt | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const step = journey.steps[stepIndex]
  const isLast = stepIndex === journey.steps.length - 1

  // Ce que la personne a déjà dit, relu dans ses mots. Recalculé à la volée :
  // revenir en arrière pour corriger doit changer le récapitulatif aussitôt.
  const recap = useMemo(
    () => journey.recap(values).filter((line): line is string => Boolean(line && line.trim())),
    [journey, values],
  )

  const set = (name: string, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }))
    // L'erreur disparaît dès la correction : la laisser jusqu'à la validation
    // suivante fait douter d'une saisie pourtant devenue correcte.
    setErrors((previous) => {
      if (!previous[name]) return previous
      const { [name]: _removed, ...rest } = previous
      return rest
    })
  }

  /** Oublie le carnet et vide les coordonnées préremplies — pas le reste. */
  const forget = () => {
    const filled = Object.keys(contactDefaults(visitor))
    forgetVisitor()
    setVisitor(null)
    setValues((previous) => {
      const cleared = { ...previous }
      for (const key of filled) cleared[key] = ''
      return cleared
    })
  }

  /** Les champs réellement à l'écran : un champ conditionnel masqué n'existe pas. */
  const visibleFields = step.fields.filter((f) => !f.showIf || f.showIf(values))

  /** Vérifie l'étape courante et renvoie vrai si elle peut être quittée. */
  const validateStep = (): boolean => {
    const found: Record<string, string> = {}
    for (const field of visibleFields) {
      if (field.required && !(values[field.name] ?? '').trim()) {
        found[field.name] = missingMessage(field)
      }
    }
    setErrors(found)
    return Object.keys(found).length === 0
  }

  /** Pièces jointes du parcours : leur contenu voyage avec la demande, pas avant. */
  const collectAttachments = (): RequestAttachmentInput[] => {
    const fileFields = journey.steps.flatMap((s) => s.fields).filter((f) => f.kind === 'file')
    return fileFields.flatMap((field) => {
      const meta = parseAttachment(values[field.name] ?? '')
      if (!meta) return []
      const content = attachmentPayload(meta.id)
      if (!content) {
        throw new Error(
          `Le fichier « ${meta.name} » n’est plus disponible : resélectionnez-le avant d’envoyer.`,
        )
      }
      return [{ field: field.name, name: meta.name, size: meta.size, type: content.type, contentBase64: content.contentBase64 }]
    })
  }

  const submit = async () => {
    if (!validateStep()) return
    setSubmitting(true)
    setFailure(null)
    try {
      const contact = {
        name: values.contactName ?? '',
        company: values.contactCompany,
        phone: values.contactPhone ?? '',
        email: values.contactEmail ?? '',
        city: values.contactCity ?? '',
      }
      const receipt = await createRequest({
        kind: journey.kind,
        intent: journey.intent,
        subject: journey.subject(values),
        location: values.siteLocation || values.city || values.contactCity || '',
        contact,
        payload: values,
        attachments: collectAttachments(),
      })
      // Retenu seulement maintenant : garder les coordonnées d'un formulaire
      // abandonné reviendrait à ficher quelqu'un qui n'a rien envoyé.
      rememberVisitor(contact, receipt.reference)
      setSubmitted(receipt)
    } catch (err) {
      // La demande n'est pas partie : le dire, plutôt que d'afficher une
      // confirmation pour un dossier qui n'existe pas.
      setFailure(
        err instanceof Error ? err.message : 'Votre demande n’a pas pu être enregistrée.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    const sender = firstName({ name: values.contactName ?? '', references: [] } as never)
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        {/* Confirmation. Le vert dit que c'est fait, et rien d'autre sur
            l'écran ne le conteste : une seule idée par écran. */}
        <div className="rounded-2xl border border-papier-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
            <Check size={32} strokeWidth={3} />
          </span>
          <h1 className="volta-display mt-6 text-3xl text-acier-900 sm:text-4xl">
            {sender ? `C’est parti, ${sender}.` : 'Votre demande est partie.'}
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-papier-700">{journey.promise}</p>

          <div className="mt-6 rounded-xl bg-papier-100 px-5 py-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-papier-600">
              Votre référence
            </span>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              <span className="volta-display text-2xl text-acier-900">{submitted.reference}</span>
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(submitted.reference)}
                className="inline-flex items-center gap-1 rounded-md border border-papier-300 bg-white px-2 py-1 text-xs font-semibold text-acier-800 transition hover:bg-papier-50"
              >
                <Copy size={12} />
                Copier
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-900">
            <span className="flex-1">
              <span className="font-bold uppercase tracking-wide">Code de suivi</span> — à saisir avec
              votre référence sur la page de suivi. Il n’est montré qu’une fois : notez-le maintenant.
              <span className="mt-1 block break-all font-mono text-sm font-bold">
                {submitted.trackingCode}
              </span>
            </span>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(submitted.trackingCode)}
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-1 font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              <Copy size={12} />
              Copier
            </button>
          </div>
        </div>

        {/* Prochaines étapes, en clair. La frise dit où en est le dossier ;
            ces trois lignes disent ce que la personne doit attendre, et de qui. */}
        <div className="mt-6 rounded-2xl border border-papier-200 bg-white p-6 shadow-sm">
          <h2 className="volta-display text-lg text-acier-900">Prochaines étapes</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {[
              'VOLTA lit votre demande et vérifie ce qu’il faut vérifier.',
              values.contactPhone
                ? `Un conseiller vous rappelle au ${values.contactPhone} pour préciser le besoin.`
                : 'Un conseiller vous rappelle pour préciser le besoin.',
              'Vous recevez une proposition chiffrée, que vous êtes libre de refuser.',
            ].map((line, index) => (
              <li key={line} className="flex gap-3">
                <span className="volta-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-acier-900 text-xs text-white">
                  {index + 1}
                </span>
                <span className="leading-relaxed text-papier-700">{line}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-center gap-2 border-t border-papier-200 pt-4 text-sm text-papier-600">
            <Phone size={14} className="shrink-0 text-btp-600" />
            Une urgence ? Appelez le{' '}
            <a href="tel:+2250748634853" className="font-semibold text-acier-900 hover:text-btp-700">
              07 48 63 48 53
            </a>{' '}
            en citant votre référence.
          </div>
        </div>

        {/* Ce qui a été envoyé, relu une dernière fois : la personne repart en
            sachant exactement ce que l'équipe va lire. */}
        {recap.length > 0 && (
          <div className="mt-6 rounded-2xl border border-papier-200 bg-white p-6 shadow-sm">
            <h2 className="volta-display text-lg text-acier-900">Ce que nous avons reçu</h2>
            <ul className="mt-3 space-y-1.5 leading-relaxed text-papier-700">
              {recap.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-papier-200 bg-white p-6 shadow-sm">
          <h2 className="volta-display text-lg text-acier-900">Avancement du dossier</h2>
          <div className="mt-5">
            <RequestTimeline status={submitted.status} intent={journey.intent} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            to={`/suivi?ref=${submitted.reference}&token=${submitted.trackingToken}`}
            className="rounded-xl bg-btp-500 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-btp-600"
          >
            Suivre ma demande
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-papier-300 bg-white px-5 py-3 text-center text-sm font-semibold text-acier-900 transition hover:border-papier-600"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    )
  }

  const echo = step.echo?.(values) ?? null

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header>
        {known && <p className="volta-display text-xl text-btp-600">Bonjour {known}.</p>}
        <h1 className="volta-display mt-1 text-4xl text-acier-900 md:text-5xl">{journey.title}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-papier-700">{journey.subtitle}</p>
      </header>

      {/* Frise d'étapes : numéro, titre, et le lien qui les relie. On sait où
          l'on est et combien il en reste, sans avoir à compter. */}
      <ol className="mt-8 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Étapes du formulaire">
        {journey.steps.map((s, index) => {
          const done = index < stepIndex
          const current = index === stepIndex
          return (
            <li key={s.title} className="flex shrink-0 items-center gap-2">
              {index > 0 && <span className="h-px w-6 bg-papier-200" aria-hidden />}
              <span
                aria-current={current ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition ${
                  current
                    ? 'bg-acier-900 text-white'
                    : done
                      ? 'text-emerald-700'
                      : 'text-papier-300'
                }`}
              >
                <span
                  className={`volta-display flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    current
                      ? 'bg-btp-500 text-white'
                      : done
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-papier-100 text-papier-600'
                  }`}
                >
                  {done ? <Check size={13} strokeWidth={3} /> : index + 1}
                </span>
                <span className={current ? 'font-semibold' : 'hidden sm:inline'}>{s.title}</span>
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-5 rounded-2xl border border-papier-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Ce qui a été dit à l'étape d'avant, repris tel quel. */}
        {echo && (
          <p className="mb-4 border-l-4 border-btp-400 pl-3 text-sm font-semibold uppercase tracking-wider text-btp-700">
            {echo}
          </p>
        )}

        <h2 className="volta-display text-2xl text-acier-900">{step.title}</h2>
        {step.intro && <p className="mt-1.5 leading-relaxed text-papier-600">{step.intro}</p>}

        {/* Coordonnées reconnues : dit franchement, et défaisable. Préremplir en
            silence donnerait l'impression d'être suivi. */}
        {isLast && visitor && known && (
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-papier-100 px-4 py-3 text-sm text-papier-700">
            <span>On a repris vos coordonnées de la dernière fois — relisez-les, elles sont modifiables.</span>
            <button
              type="button"
              onClick={forget}
              className="inline-flex items-center gap-1 font-semibold text-acier-900 underline underline-offset-2 hover:text-btp-700"
            >
              <UserX size={13} />
              Ce n’est pas moi
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {visibleFields.map((field) => (
            <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
              {renderField(field, values[field.name] ?? '', errors[field.name], (value) =>
                set(field.name, value),
              )}
            </div>
          ))}
        </div>

        {/* Dernière étape : la demande relue à la première personne. C'est le
            moment où l'on se dit « ah non, c'est 3 semaines, pas 3 jours ». */}
        {isLast && recap.length > 0 && (
          <div className="mt-8 rounded-xl border border-papier-200 bg-papier-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="volta-display text-lg text-acier-900">Vérifiez avant d’envoyer</h3>
              <button
                type="button"
                onClick={() => setStepIndex(0)}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-btp-700 hover:text-btp-800"
              >
                <PenLine size={13} />
                Corriger
              </button>
            </div>
            <ul className="mt-3 space-y-1.5 leading-relaxed text-papier-700">
              {recap.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {failure && (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {failure}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-papier-200 pt-6">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-papier-600 transition hover:bg-papier-100 disabled:invisible"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-btp-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-btp-600 disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? 'Envoi…' : 'Envoyer ma demande'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => validateStep() && setStepIndex((i) => i + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-acier-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-acier-800"
            >
              Continuer
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm text-papier-600">
        Votre demande arrive chez VOLTA, qui la lit et la qualifie avant toute mise en
        relation. Personne d’autre n’y a accès.
      </p>
    </div>
  )
}
