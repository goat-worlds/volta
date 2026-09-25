/**
 * Coquillage hors ligne.
 *
 * VOLTA se consulte sur un chantier, où le réseau tombe. Ce travailleur de
 * fond garde une copie de ce qui a déjà été chargé : la page revient, les
 * photos d'engins aussi, et l'écran d'attente remplace la page d'erreur du
 * navigateur quand la connexion manque.
 *
 * Trois règles, et aucune bibliothèque :
 *
 *   - l'API n'est jamais mise en cache. Un devis, une demande ou un statut
 *     servis depuis hier seraient faux, et un faux statut est pire qu'une
 *     absence de statut ;
 *   - les fichiers de l'application — noms versionnés par le constructeur —
 *     sont servis depuis le cache, puis complétés depuis le réseau ;
 *   - une navigation part d'abord sur le réseau : la version en ligne prime
 *     toujours, le cache ne sert qu'en secours.
 *
 * Le numéro ci-dessous ouvre un cache neuf : le changer met au rebut tout ce
 * qui a été gardé par la version précédente.
 */
const VERSION = 'volta-v1'
const SHELL = `${VERSION}-shell`
const RUNTIME = `${VERSION}-runtime`

/** Ce qu'il faut pour afficher quelque chose sans réseau dès la première fois. */
const PRECACHE = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/volta-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      // Une ressource absente ne doit pas faire échouer l'installation
      // entière : chacune est demandée pour son compte.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api')) return

  // Navigation : le réseau d'abord, le coquillage en secours.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL).then((cache) => cache.put('/', copy))
          return response
        })
        .catch(() => caches.match('/').then((cached) => cached || Response.error())),
    )
    return
  }

  // Fichiers et images : le cache d'abord, le réseau pour ce qui manque.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone()
          caches.open(RUNTIME).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
