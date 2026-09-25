import { useLiveResource } from '../../store/useLiveResource'
import type { PublicListing } from '../../store/types'
import ListingCard from '../market/ListingCard'
import { MoreLink, Reveal, Section, SectionActions, SectionHeader } from '../site/SiteKit'

/**
 * Volta Market sur l'accueil.
 *
 * Ici on vend : la sélection de l'équipe VOLTA est montrée avant le catalogue
 * de location. Les annonces viennent du serveur — ce sont celles que
 * l'administration a publiées et mises en avant, pas un visuel figé.
 *
 * Sans annonce (serveur injoignable, vitrine vide), la section disparaît :
 * l'accueil ne montre pas un rayon vide.
 *
 * Le chapeau était aligné à gauche avec le bouton « toutes les annonces »
 * poussé dans l'angle droit, et la mention de la sélection traînait sous la
 * grille en note de bas de page. Chapeau centré, une seule action sous les
 * annonces, la note dans le chapeau où elle est lue.
 */
export default function MarketShowcase() {
  const { data } = useLiveResource<PublicListing[]>('/market/listings')
  const listings = data ?? []
  if (listings.length === 0) return null

  const featured = listings.filter((l) => l.featured)
  const shown = (featured.length >= 2 ? featured : listings).slice(0, 4)

  return (
    <Section id="market" tone="dark">
      <SectionHeader
        tone="dark"
        label="Volta Market"
        title={
          featured.length >= 2 ? 'La sélection VOLTA à vendre.' : 'Des engins à vendre, vérifiés avant l’offre.'
        }
        text="Annonces examinées par l’équipe VOLTA. Vous demandez une offre, VOLTA vérifie l’état et la disponibilité, puis vous répond — sans commission. Une mise en avant se décide en interne, elle ne s’achète pas."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((l, i) => (
          <Reveal key={l.id} delay={(i % 4) * 0.06}>
            <ListingCard listing={l} compact />
          </Reveal>
        ))}
      </div>

      <SectionActions>
        <MoreLink to="/market" tone="dark">
          Toutes les annonces ({listings.length})
        </MoreLink>
      </SectionActions>
    </Section>
  )
}
