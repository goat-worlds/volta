import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * Le travailleur de fond, en production seulement.
 *
 * Il garde une copie de l'application pour les chantiers sans reseau, et c'est
 * sa presence qui autorise le navigateur a proposer l'installation. En
 * developpement il servirait des fichiers perimes a chaque rechargement et
 * masquerait les modifications en cours : Vite recharge deja lui-meme.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Navigation privee, permission refusee, service indisponible : le site
      // fonctionne sans, seule l'installation devient impossible.
    })
  })
}
