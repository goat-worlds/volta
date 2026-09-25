import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, Search, ShoppingCart } from 'lucide-react'
import { Eyebrow, PrimaryLink, Reveal } from './site/SiteKit'
import InstallAppButton from './site/InstallAppButton'

/**
 * Couverture d'accueil.
 *
 * Elle portait dix dispositifs à la fois : une grille de plan qui s'efface en
 * fondu, trois flux lumineux qui traversaient l'écran, cinq mots-clés qui
 * respiraient dans les marges, un halo ambré flouté, un filet de sécurité, une
 * pastille, un titre en trois lignes, une recherche, quatre pastilles de
 * raccourci, deux boutons, un paragraphe de preuve — et, à droite, un
 * carrousel de quatre photos qui tournait tout seul avec son étiquette, son
 * bouton et ses points. Le visiteur ne savait pas où regarder, et les quatre
 * raccourcis répétaient mot pour mot les parcours de la section suivante.
 *
 * Il reste ce qu'une couverture doit faire : dire où l'on est, ce qu'on y
 * trouve, et offrir les deux premiers gestes — chercher un engin, ou voir ce
 * qui est à vendre. Une photo tient le fond, immobile ; tout le mouvement de
 * la page est passé au composant Reveal, le même pour toutes les sections.
 */
export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query ? `/catalogue?q=${encodeURIComponent(query)}` : '/catalogue')
  }

  return (
    <section className="relative isolate overflow-hidden bg-acier-900 px-4 py-24 text-center sm:px-6 sm:py-32">
      {/* Une seule image, fixe, derrière un aplat : le métier se voit, le
          titre reste lisible et rien ne bouge derrière le texte. */}
      <img
        src="/engins/pelle-cat-336e.jpeg"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-acier-900/70 via-acier-900/85 to-acier-900" />

      <Reveal className="mx-auto max-w-3xl">
        <Eyebrow tone="dark">Engins de chantier · Côte d’Ivoire</Eyebrow>

        <h1 className="volta-display mt-4 text-5xl text-white sm:text-6xl">
          Louez, achetez et faites vérifier <span className="text-btp-400">votre engin</span>.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-acier-200">
          Location, vente et expertise d’engins de chantier. Chaque machine est inspectée sur place
          avant d’être proposée, et un interlocuteur unique suit votre demande — une personne, pas
          un formulaire perdu.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-lg bg-white shadow-lg"
        >
          <div className="flex flex-1 items-center px-4">
            <Search className="h-5 w-5 shrink-0 text-papier-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pelle, camion benne, grue, groupe électrogène…"
              aria-label="Rechercher sur Volta"
              className="ml-2 w-full flex-1 py-3.5 text-sm text-acier-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 bg-btp-500 px-6 text-sm font-bold text-white transition hover:bg-btp-600"
          >
            Chercher
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <PrimaryLink to="/market">
            <ShoppingCart size={16} />
            Voir Volta Market
          </PrimaryLink>
          <a
            href="#intentions"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-btp-400"
          >
            Que recherchez-vous ?
            <ArrowDown size={16} />
          </a>
          <InstallAppButton tone="dark" />
        </div>

        {/* Trois chiffres alignés sous un slogan, c'est la signature de
            n'importe quelle page d'accueil. Une phrase dit la même chose, et
            elle se retient. */}
        <p className="mx-auto mt-10 max-w-2xl border-t border-white/10 pt-6 text-sm leading-relaxed text-acier-300">
          Dix-huit points de contrôle sur chaque machine, avant qu’elle soit proposée. Aucune
          commission prélevée au passage. Un seul interlocuteur du premier appel à la remise des
          clés.
        </p>
      </Reveal>
    </section>
  )
}
