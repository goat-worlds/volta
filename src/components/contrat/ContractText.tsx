import { useMemo } from 'react'

/**
 * Le texte du contrat, rendu depuis sa source.
 *
 * <h2>Pourquoi un rendu minimal plutôt qu'une bibliothèque</h2>
 *
 * Le contrat n'emploie que cinq formes : des titres de deux ou trois niveaux,
 * des paragraphes, des listes à puces, des listes numérotées et du gras. Une
 * bibliothèque de rendu Markdown apporterait les tableaux, le code, les images
 * et les liens — c'est-à-dire la possibilité d'insérer dans un document
 * contractuel des éléments que personne n'a prévus, et une dépendance de plus
 * à suivre pour afficher six balises.
 *
 * Ce qui n'est pas reconnu est rendu tel quel, en paragraphe. Un document
 * juridique ne doit jamais perdre une ligne parce qu'une syntaxe n'a pas été
 * comprise.
 */

type Bloc =
  | { type: 'titre'; niveau: 1 | 2 | 3; texte: string }
  | { type: 'paragraphe'; texte: string }
  | { type: 'puces'; items: string[] }
  | { type: 'numeros'; items: string[] }

/** Découpe le texte en blocs, dans l'ordre. */
function analyser(source: string): Bloc[] {
  const blocs: Bloc[] = []
  let puces: string[] = []
  let numeros: string[] = []

  const viderListes = () => {
    if (puces.length) {
      blocs.push({ type: 'puces', items: puces })
      puces = []
    }
    if (numeros.length) {
      blocs.push({ type: 'numeros', items: numeros })
      numeros = []
    }
  }

  for (const ligne of source.split('\n')) {
    const l = ligne.trim()
    if (!l) {
      viderListes()
      continue
    }
    if (l.startsWith('### ')) {
      viderListes()
      blocs.push({ type: 'titre', niveau: 3, texte: l.slice(4) })
    } else if (l.startsWith('## ')) {
      viderListes()
      blocs.push({ type: 'titre', niveau: 2, texte: l.slice(3) })
    } else if (l.startsWith('# ')) {
      viderListes()
      blocs.push({ type: 'titre', niveau: 1, texte: l.slice(2) })
    } else if (l.startsWith('- ')) {
      if (numeros.length) viderListes()
      puces.push(l.slice(2))
    } else if (/^\d+\.\s/.test(l)) {
      if (puces.length) viderListes()
      numeros.push(l.replace(/^\d+\.\s/, ''))
    } else {
      viderListes()
      blocs.push({ type: 'paragraphe', texte: l })
    }
  }
  viderListes()
  return blocs
}

/** Le gras du document, seul balisage en ligne employé. */
function enLigne(texte: string) {
  return texte.split(/(\*\*[^*]+\*\*)/g).map((morceau, i) =>
    morceau.startsWith('**') && morceau.endsWith('**') ? (
      <strong key={i} className="font-semibold text-acier-900">
        {morceau.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{morceau}</span>
    ),
  )
}

export default function ContractText({ source }: { source: string }) {
  const blocs = useMemo(() => analyser(source), [source])

  return (
    <div className="text-sm leading-relaxed text-papier-700">
      {blocs.map((bloc, i) => {
        if (bloc.type === 'titre') {
          if (bloc.niveau === 1) {
            return (
              <h2
                key={i}
                className="volta-display mt-8 border-b border-papier-200 pb-2 text-2xl text-acier-900 first:mt-0"
              >
                {bloc.texte}
              </h2>
            )
          }
          if (bloc.niveau === 2) {
            return (
              <h3 key={i} className="mt-7 text-base font-bold text-acier-900 first:mt-0">
                {bloc.texte}
              </h3>
            )
          }
          return (
            <h4 key={i} className="mt-5 text-sm font-bold text-acier-800">
              {bloc.texte}
            </h4>
          )
        }
        if (bloc.type === 'puces') {
          return (
            <ul key={i} className="mt-2 list-disc space-y-1 pl-5">
              {bloc.items.map((item, j) => (
                <li key={j}>{enLigne(item)}</li>
              ))}
            </ul>
          )
        }
        if (bloc.type === 'numeros') {
          return (
            <ol key={i} className="mt-2 list-decimal space-y-1 pl-5">
              {bloc.items.map((item, j) => (
                <li key={j}>{enLigne(item)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i} className="mt-3">
            {enLigne(bloc.texte)}
          </p>
        )
      })}
    </div>
  )
}
