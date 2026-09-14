import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react'
import type { Journey, FieldDef } from '../../lib/journeys'
import type { Request } from '../../types/domain'
import { createRequest } from '../../services/requests'
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
      return <TagsField {...common} options={field.options ?? []} />
    case 'file':
      return <FileField {...common} accept={field.accept} />
    default:
      return <TextField {...common} type={field.kind} placeholder={field.placeholder} />
  }
}

export default function JourneyForm({ journey }: { journey: Journey }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<Request | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const step = journey.steps[stepIndex]
  const isLast = stepIndex === journey.steps.length - 1

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

  /** Vérifie l'étape courante et renvoie vrai si elle peut être quittée. */
  const validateStep = (): boolean => {
    const found: Record<string, string> = {}
    for (const field of step.fields) {
      if (field.required && !(values[field.name] ?? '').trim()) {
        found[field.name] = 'Ce champ est nécessaire pour traiter votre demande.'
      }
    }
    setErrors(found)
    return Object.keys(found).length === 0
  }

  const submit = async () => {
    if (!validateStep()) return
    setSubmitting(true)
    setFailure(null)
    try {
      const request = await createRequest({
        kind: journey.kind,
        intent: journey.intent,
        subject: journey.subject(values),
        location: values.siteLocation || values.city || values.contactCity || '',
        contact: {
          name: values.contactName ?? '',
          company: values.contactCompany,
          phone: values.contactPhone ?? '',
          email: values.contactEmail ?? '',
          city: values.contactCity ?? '',
        },
        payload: values,
      })
      setSubmitted(request)
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
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check size={26} />
          </span>
          <h1 className="mt-5 text-2xl font-black text-acier-900">
            Votre demande est enregistrée.
          </h1>
          <p className="mt-3 text-slate-700">{journey.promise}</p>
          {/* Le dépôt est local tant que le service de demandes n'existe pas
              côté serveur : on le dit, plutôt que d'annoncer une transmission
              qui n'a pas eu lieu. */}
          <p className="mx-auto mt-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span className="font-bold uppercase tracking-wide">Backend requis</span> — la demande est
            conservée sur cet appareil. Sa transmission automatique à l’équipe sera activée avec le
            service de demandes côté serveur ; en attendant, citez la référence ci-dessous lors de
            votre prise de contact.
          </p>

          <div className="mx-auto mt-6 inline-flex flex-col items-center rounded-xl border border-emerald-300 bg-white px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Votre référence
            </span>
            <span className="mt-1 font-mono text-xl font-bold text-acier-900">
              {submitted.reference}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Conservez-la : elle identifie votre dossier dans tous nos échanges.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Suite du traitement
          </h2>
          <div className="mt-5">
            <RequestTimeline status={submitted.status} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-acier-900 transition hover:border-slate-400"
          >
            Retour à l’accueil
          </Link>
          <Link
            to={`/suivi?ref=${submitted.reference}`}
            className="rounded-lg bg-acier-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-acier-800"
          >
            Suivre ma demande
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-acier-900 md:text-4xl">
          {journey.title}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{journey.subtitle}</p>
      </header>

      {/* Fil d'étapes : on sait toujours combien il en reste. */}
      <ol className="mt-8 flex flex-wrap gap-2" aria-label="Étapes du formulaire">
        {journey.steps.map((s, index) => (
          <li
            key={s.title}
            aria-current={index === stepIndex ? 'step' : undefined}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              index === stepIndex
                ? 'bg-acier-900 text-white'
                : index < stepIndex
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            {index < stepIndex ? <Check size={13} /> : <span>{index + 1}</span>}
            {s.title}
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-acier-900">{step.title}</h2>
        {step.intro && <p className="mt-1.5 text-sm text-slate-600">{step.intro}</p>}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {step.fields.map((field) => (
            <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
              {renderField(field, values[field.name] ?? '', errors[field.name], (value) =>
                set(field.name, value),
              )}
            </div>
          ))}
        </div>

        {failure && (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {failure}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:invisible"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-btp-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-btp-600 disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? 'Envoi…' : 'Envoyer ma demande'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => validateStep() && setStepIndex((i) => i + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-acier-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-acier-800"
            >
              Continuer
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        Votre demande est adressée à Génie Sélect, qui la qualifie avant toute mise en relation.
      </p>
    </div>
  )
}
