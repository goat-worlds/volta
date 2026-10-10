/**
 * Le contrat de collaboration des clients entreprises.
 *
 * <h2>Pourquoi il est écrit ici</h2>
 *
 * C'est un texte que l'on signe : il doit être lu avant de l'être, et relu
 * après. Le mettre en dur dans l'écran qui le présente le rendrait invisible à
 * l'écran qui le rappelle, et deux copies d'un contrat finissent toujours par
 * diverger — ce qui, pour un document qui engage, n'est pas un détail de mise
 * en page.
 *
 * <h2>La version</h2>
 *
 * Elle est enregistrée avec la signature, côté serveur. Sans elle on saurait
 * qu'une entreprise a signé, jamais ce qu'elle a signé : le jour où une clause
 * change, c'est la seule chose qui permette de dire qui est tenu par
 * l'ancienne et qui doit relire. Changer le texte ci-dessous sans changer ce
 * numéro, c'est faire signer rétroactivement.
 */
export const CONTRAT_VERSION = '2026-10'

export interface ClauseContrat {
  titre: string
  texte: string
}

/** Ce que VOLTA apporte, en tête : un engagement se lit dans les deux sens. */
export const CONTRAT_PREAMBULE =
  'VOLTA vous apporte des marchés et vous accompagne pour y réaliser des ' +
  'prestations excellentes. En retour, les engagements ci-dessous vous lient. ' +
  'Ils protègent autant votre réputation que la nôtre : c’est sur eux que ' +
  'repose la confiance des clients que nous vous confions.'

export const CONTRAT_CLAUSES: ClauseContrat[] = [
  {
    titre: 'Disponibilité annoncée, disponibilité réelle',
    texte:
      'Vous êtes tenu d’honorer la disponibilité affichée sur VOLTA pour vos ' +
      'engins. Un matériel indisponible doit être retiré du catalogue sans ' +
      'délai. Une disponibilité annoncée et non tenue engage votre ' +
      'responsabilité auprès du client comme auprès de VOLTA.',
  },
  {
    titre: 'Confidentialité et intégrité des marchés',
    texte:
      'La confidentialité et l’intégrité des marchés sont sans concession. ' +
      'Les informations du client, du chantier et des conditions négociées ne ' +
      'sortent pas de la plateforme.',
  },
  {
    titre: 'Les marchés apportés par VOLTA passent par VOLTA',
    texte:
      'Pour chaque marché que VOLTA vous apporte, seuls les engins réservés ' +
      'via la plateforme peuvent y figurer. Aucune autre diligence, entente ou ' +
      'arrangement ne doit être conclu hors de la plateforme avec un client ' +
      'que VOLTA vous a présenté.',
  },
  {
    titre: 'Les techniciens formés par Génie Select Academy',
    texte:
      'Les techniciens que VOLTA met à votre disposition sont pluridisciplinaires ' +
      'et formés par Génie Select Academy. Si vous souhaitez en embaucher un, ' +
      'vous êtes tenu d’écrire à VOLTA afin que la société procède officiellement ' +
      'à son débauchage. Tout débauchage sans notre accord écrit expose à des ' +
      'poursuites.',
  },
  {
    titre: 'VOLTA est l’intermédiaire, et s’en porte garant',
    texte:
      'Les identités des sociétés ne sont pas affichées sur la plateforme et ' +
      'les prestataires sont tenus de les garder confidentielles. VOLTA est ' +
      'l’intermédiaire et se porte garant de la satisfaction, de la bonne ' +
      'évolution du chantier et de la disponibilité des machines.',
  },
  {
    titre: 'Hors de la plateforme, sans nous',
    texte:
      'Si une transaction passe outre nos barrières applicatives, VOLTA cesse ' +
      'd’en être responsable et se désengage totalement — de la garantie comme ' +
      'du recours.',
  },
]
