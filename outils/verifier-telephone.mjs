#!/usr/bin/env node
/**
 * Le seul numéro que la plateforme affiche est celui de VOLTA.
 *
 * Le numéro a déjà été unifié deux fois, et deux fois une autre ligne est
 * revenue : la dernière vivait en dur dans le formulaire de parcours, sur
 * l'écran de confirmation que lit chaque demandeur. Une relecture ne la voit
 * pas — il faudrait ouvrir ce fichier précis au moment précis où il change.
 * Ce script le fait à chaque `npm run lint`, donc à chaque intégration.
 *
 * Deux vérifications :
 *
 *  1. Les trois copies du numéro concordent : la constante du site
 *     (src/lib/siteNav.ts), la valeur par défaut du serveur
 *     (application.properties) et celle de la production
 *     (docker-compose.prod.yml). Le serveur s'en sert pour filigraner les
 *     photos : une divergence donnerait deux numéros selon l'image.
 *
 *  2. Aucun autre numéro de téléphone n'apparaît dans ce que la plateforme
 *     sert ou écrit : pages, images vectorielles, textes du serveur. Les
 *     lignes de commentaire sont ignorées — elles ne s'affichent nulle part —
 *     et le jeu de démonstration aussi, qui ne tourne jamais en production
 *     (VOLTA_SEED_DEMO=false).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = fileURLToPath(new URL('..', import.meta.url))

const A_PARCOURIR = [
  'index.html',
  'src',
  'public',
  'nginx',
  'backend/src/main',
  'docker-compose.yml',
  'docker-compose.prod.yml',
  '.env.example',
  '.env.prod.example',
]

const EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.mjs', '.css', '.html', '.json', '.webmanifest', '.svg',
  '.txt', '.java', '.properties', '.yml', '.yaml', '.conf', '.example', '',
])

/** Fichiers dont les numéros ne sont jamais servis en production. */
const EXCLUS = new Set([
  // Comptes de test au mot de passe public : actifs en développement seulement.
  'backend/src/main/java/ci/volta/backend/config/DataSeeder.java',
])

const separateur = '[ .\\-\\u00a0]?'
/**
 * Un numéro ivoirien à dix chiffres (« 05 00 99 13 13 »), précédé ou non de
 * l'indicatif, ou un ancien numéro à huit chiffres derrière l'indicatif
 * (« +225 07 00 00 04 »). Les dates (2026-08-20) et les montants (68_000_000)
 * n'ont pas cette forme.
 */
const NUMERO = new RegExp(
  `(?:(?:\\+|00)225${separateur})?\\b0\\d(?:${separateur}\\d{2}){4}\\b` +
    `|(?:\\+|00)225${separateur}\\d{2}(?:${separateur}\\d{2}){3}\\b` +
    `|tel:\\+?\\d{8,}` +
    `|wa\\.me/\\d{8,}`,
  'g',
)

function chiffres(texte) {
  return texte.replace(/\D/g, '')
}

/** Le numéro réduit à sa forme nationale, indicatif retiré. */
function national(texte) {
  const d = chiffres(texte)
  if (d.startsWith('00225')) return d.slice(5)
  if (d.startsWith('225') && d.length > 10) return d.slice(3)
  return d
}

function lire(chemin) {
  return readFileSync(join(RACINE, chemin), 'utf8')
}

function erreur(message) {
  console.error(`✖ ${message}`)
  process.exitCode = 1
}

// --- 1. Les copies du numéro concordent ------------------------------------

const siteNav = lire('src/lib/siteNav.ts')
const affiche = /affiche:\s*'([^']+)'/.exec(siteNav)?.[1]
const lien = /lien:\s*'([^']+)'/.exec(siteNav)?.[1]
const international = /international:\s*'([^']+)'/.exec(siteNav)?.[1]
if (!affiche || !lien) {
  erreur('Constante TELEPHONE introuvable dans src/lib/siteNav.ts.')
  process.exit()
}
const OFFICIEL = chiffres(affiche)

if (national(lien) !== OFFICIEL) {
  erreur(`siteNav.ts : le lien ${lien} ne compose pas le numéro affiché ${affiche}.`)
}
if (international && national(international) !== OFFICIEL) {
  erreur(`siteNav.ts : la forme internationale ${international} diffère de ${affiche}.`)
}

const proprietes = lire('backend/src/main/resources/application.properties')
const serveur = /^volta\.telephone=\$\{VOLTA_TELEPHONE:([^}]*)\}/m.exec(proprietes)?.[1]
if (!serveur) {
  erreur('application.properties : volta.telephone introuvable.')
} else if (national(serveur) !== OFFICIEL) {
  erreur(`application.properties : volta.telephone vaut « ${serveur} », le site affiche « ${affiche} ».`)
}

const production = /VOLTA_TELEPHONE:\s*"([^"]*)"/.exec(lire('docker-compose.prod.yml'))?.[1]
if (production !== undefined && national(production) !== OFFICIEL) {
  erreur(`docker-compose.prod.yml : VOLTA_TELEPHONE vaut « ${production} », le site affiche « ${affiche} ».`)
}

// --- 2. Aucun autre numéro --------------------------------------------------

function* fichiers(chemin) {
  const absolu = join(RACINE, chemin)
  if (!existsSync(absolu)) return
  const info = statSync(absolu)
  if (info.isFile()) {
    yield chemin
    return
  }
  for (const nom of readdirSync(absolu)) {
    if (nom === 'node_modules' || nom === 'dist' || nom === 'target') continue
    yield* fichiers(join(chemin, nom))
  }
}

/** Une ligne de commentaire ne s'affiche nulle part. */
function estCommentaire(ligne) {
  const t = ligne.trim()
  return (
    t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*') ||
    t.startsWith('#') || t.startsWith('<!--')
  )
}

let examines = 0
for (const racine of A_PARCOURIR) {
  for (const fichier of fichiers(racine)) {
    const relatif = relative(RACINE, join(RACINE, fichier)).split('\\').join('/')
    if (EXCLUS.has(relatif)) continue
    if (!EXTENSIONS.has(extname(relatif))) continue
    examines += 1
    lire(relatif)
      .split('\n')
      .forEach((ligne, index) => {
        if (estCommentaire(ligne)) return
        for (const trouve of ligne.matchAll(NUMERO)) {
          if (national(trouve[0]) !== OFFICIEL) {
            erreur(`${relatif}:${index + 1} — « ${trouve[0]} » n'est pas le numéro de VOLTA (${affiche}).`)
          }
        }
      })
  }
}

if (process.exitCode) {
  console.error(
    `\nLe seul numéro affiché par la plateforme est le ${affiche}. ` +
      'Il se lit dans TELEPHONE (src/lib/siteNav.ts) : importez la constante plutôt que de recopier un numéro.',
  )
} else {
  console.log(`✔ Numéro unique : ${affiche} — ${examines} fichiers examinés.`)
}
