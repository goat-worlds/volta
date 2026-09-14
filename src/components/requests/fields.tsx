/**
 * Champs de formulaire.
 *
 * Les parcours publics posent tous les mêmes types de questions — un texte, une
 * date, un choix, une case à cocher — et chaque page qui redessinait son input
 * produisait une bordure, un focus et un message d'erreur légèrement différents.
 * Ces composants les fixent une fois : un formulaire de candidature et une
 * demande de location se remplissent de la même main.
 */
import { useRef, useState, type ReactNode } from 'react'
import { FileCheck2, Upload, X } from 'lucide-react'
import { formatSize, parseAttachment, removeAttachment, saveAttachment } from '../../services/attachments'

const CONTROL =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-acier-900 ' +
  'transition placeholder:text-slate-400 focus:border-btp-400 focus:outline-none ' +
  'focus:ring-2 focus:ring-btp-400/30 disabled:bg-slate-50'

const CONTROL_INVALID = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

export interface FieldOption {
  value: string
  label: string
}

function Label({
  htmlFor,
  label,
  required,
  help,
  error,
  children,
}: {
  htmlFor: string
  label: string
  required?: boolean
  help?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-acier-900">
        {label}
        {required && (
          <span className="ml-1 text-btp-600" aria-hidden>
            *
          </span>
        )}
      </label>
      {help && <p className="mt-1 text-xs text-slate-500">{help}</p>}
      <div className="mt-1.5">{children}</div>
      {/* Le message occupe la place qu'il prendra : sans cela, la validation
          fait sauter tout le formulaire d'une ligne au premier champ fautif. */}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

interface BaseProps {
  name: string
  label: string
  required?: boolean
  help?: string
  error?: string
  value: string
  onChange: (value: string) => void
}

export function TextField({
  type = 'text',
  placeholder,
  ...props
}: BaseProps & { type?: 'text' | 'email' | 'tel' | 'number' | 'date'; placeholder?: string }) {
  const { name, label, required, help, error, value, onChange } = props
  return (
    <Label htmlFor={name} label={label} required={required} help={help} error={error}>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className={`${CONTROL} ${error ? CONTROL_INVALID : ''}`}
      />
    </Label>
  )
}

export function TextAreaField({
  placeholder,
  rows = 4,
  ...props
}: BaseProps & { placeholder?: string; rows?: number }) {
  const { name, label, required, help, error, value, onChange } = props
  return (
    <Label htmlFor={name} label={label} required={required} help={help} error={error}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className={`${CONTROL} resize-y ${error ? CONTROL_INVALID : ''}`}
      />
    </Label>
  )
}

export function SelectField({
  options,
  placeholder = 'Choisir…',
  ...props
}: BaseProps & { options: FieldOption[]; placeholder?: string }) {
  const { name, label, required, help, error, value, onChange } = props
  return (
    <Label htmlFor={name} label={label} required={required} help={help} error={error}>
      <select
        id={name}
        name={name}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className={`${CONTROL} ${error ? CONTROL_INVALID : ''} ${value ? '' : 'text-slate-400'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-acier-900">
            {option.label}
          </option>
        ))}
      </select>
    </Label>
  )
}

/**
 * Case à cocher.
 *
 * La valeur reste une chaîne — « oui » ou vide — comme tous les autres champs :
 * un formulaire piloté par une définition ne peut pas mélanger les types sans
 * imposer un branchement à chaque lecture.
 */
export function CheckboxField({
  name,
  label,
  help,
  value,
  onChange,
}: Omit<BaseProps, 'required' | 'error'>) {
  const checked = value === 'oui'
  return (
    <label
      htmlFor={name}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-300 bg-white p-3.5 transition hover:border-btp-400 hover:bg-btp-50/40"
    >
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked ? 'oui' : '')}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-btp-500 focus:ring-btp-400"
      />
      <span>
        <span className="block text-sm font-semibold text-acier-900">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-slate-500">{help}</span>}
      </span>
    </label>
  )
}

/**
 * Choix multiple présenté en pastilles.
 *
 * Les compétences d'un technicien ou les zones d'intervention d'une entreprise
 * se cochent par paquets : une liste déroulante multiple est illisible au doigt.
 * Les valeurs sont jointes par « ; » — le point-virgule ne figure dans aucun des
 * libellés proposés, contrairement à la virgule.
 */
export function TagsField({
  options,
  ...props
}: Omit<BaseProps, 'onChange'> & { options: FieldOption[]; onChange: (value: string) => void }) {
  const { name, label, required, help, error, value, onChange } = props
  const selected = value ? value.split(';') : []

  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((v) => v !== option)
      : [...selected, option]
    onChange(next.join(';'))
  }

  return (
    <Label htmlFor={name} label={label} required={required} help={help} error={error}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? 'bg-acier-900 text-white'
                  : 'border border-slate-300 bg-white text-slate-600 hover:border-btp-400 hover:text-acier-900'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </Label>
  )
}

/**
 * Dépôt de fichier — le CV d'une candidature.
 *
 * La valeur reste une chaîne, comme partout : la description du fichier en
 * JSON (voir services/attachments). Le contenu, lui, est rangé à part dès le
 * choix du fichier, si bien que le formulaire n'a rien de plus à faire à
 * l'envoi. Un fichier refusé — trop lourd, illisible — est dit sur place.
 */
export function FileField({
  accept = '.pdf,.doc,.docx',
  ...props
}: BaseProps & { accept?: string }) {
  const { name, label, required, help, error, value, onChange } = props
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const current = parseAttachment(value)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setLocalError(null)
    try {
      if (current) removeAttachment(current.id)
      const meta = await saveAttachment(file)
      onChange(JSON.stringify(meta))
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Le fichier n’a pas pu être ajouté.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clear = () => {
    if (current) removeAttachment(current.id)
    onChange('')
  }

  return (
    <Label htmlFor={name} label={label} required={required} help={help} error={error ?? localError ?? undefined}>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
      {current ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <FileCheck2 size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-acier-900">{current.name}</span>
            <span className="block text-xs text-slate-500">{formatSize(current.size)}</span>
          </span>
          <button
            type="button"
            onClick={clear}
            aria-label="Retirer le fichier"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={name}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            void pick(e.dataTransfer.files?.[0])
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition hover:border-btp-400 hover:bg-btp-50/40 ${
            error ? 'border-red-400' : 'border-slate-300'
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-btp-50 text-btp-600">
            <Upload size={20} />
          </span>
          <span className="text-sm font-semibold text-acier-900">
            {busy ? 'Lecture du fichier…' : 'Déposez votre fichier ici ou cliquez pour choisir'}
          </span>
          <span className="text-xs text-slate-500">PDF ou Word, 3 Mo maximum</span>
        </label>
      )}
    </Label>
  )
}
