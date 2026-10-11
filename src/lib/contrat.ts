/**
 * Le contrat-cadre de collaboration fournisseur.
 *
 * <h2>Pourquoi le texte entier, et non un résumé</h2>
 *
 * Il tenait en six clauses écrites pour l'écran : la disponibilité, la
 * confidentialité, les marchés, le débauchage, le rôle de VOLTA, le
 * désengagement hors plateforme. C'était l'esprit du contrat, pas le contrat.
 * Un document qu'on signe se lit en entier ou ne vaut rien : on ne peut pas
 * opposer à un fournisseur une obligation qu'il n'a pas eue sous les yeux.
 *
 * <h2>Pourquoi du Markdown et non une structure</h2>
 *
 * Découper vingt articles en objets — titre, paragraphes, listes, sous-titres —
 * obligerait à re-saisir le texte à chaque révision, et toute erreur de
 * transcription deviendrait une clause fausse. Ici le texte est celui du
 * document juridique, caractère pour caractère, et le rendu comme le
 * téléchargement partent de la même source. Ils ne peuvent pas diverger.
 *
 * <h2>La version</h2>
 *
 * Enregistrée avec la signature, côté serveur. Sans elle on saurait qu'un
 * fournisseur a signé, jamais ce qu'il a signé : le jour où une clause change,
 * c'est la seule chose qui permette de dire qui est tenu par l'ancienne et qui
 * doit relire. Changer le texte ci-dessous sans changer ce numéro, c'est faire
 * signer rétroactivement.
 */
export const CONTRAT_VERSION = '1.0'

export const CONTRAT_TITRE = 'Contrat-cadre de collaboration fournisseur'

export const CONTRAT_SOUS_TITRE =
  'Mise à disposition, location et commercialisation d’engins et d’équipements professionnels'

/** Nom du fichier proposé au téléchargement. */
export const CONTRAT_FICHIER = `VOLTA-contrat-cadre-fournisseur-v${CONTRAT_VERSION}.md`

/**
 * Ce que VOLTA apporte, dit avant les articles.
 *
 * Un engagement se lit dans les deux sens : vingt articles d'obligations sans
 * un mot sur la contrepartie se lisent comme une liste de contraintes.
 */
export const CONTRAT_PREAMBULE =
  'VOLTA vous apporte des marchés et vous accompagne pour y réaliser des ' +
  'prestations excellentes. En retour, les engagements ci-dessous vous lient. ' +
  'Ils protègent autant votre réputation que la nôtre : c’est sur eux que ' +
  'repose la confiance des clients que nous vous confions.'

/**
 * Le texte intégral.
 *
 * Les crochets sont ceux du document : ils marquent ce que VOLTA renseigne au
 * moment de la signature — sa dénomination, son RCCM, son siège, son
 * représentant. Les laisser visibles vaut mieux que d'inventer des valeurs
 * dans un contrat.
 */
export const CONTRAT_TEXTE = `# VOLTA by Génie Select
## CONTRAT-CADRE DE COLLABORATION FOURNISSEUR
### Mise à disposition, location et commercialisation d'engins et d'équipements professionnels

**Version :** 1.0
**Date d'entrée en vigueur :** date de validation électronique ou de signature par les parties.

## ENTRE LES SOUSSIGNÉS

**VOLTA**, plateforme exploitée par la société **[dénomination sociale complète de la société exploitante]**, société de droit ivoirien, immatriculée au RCCM sous le numéro **[RCCM]**, dont le siège social est situé à **[adresse]**, représentée par **[nom et qualité du représentant habilité]**, ci-après dénommée « VOLTA » ou « la Plateforme » ;

D'une part,

**Le Fournisseur**, personne physique ou morale identifiée dans son espace professionnel VOLTA et dont les informations figurent dans la fiche contractuelle annexée au présent contrat, ci-après dénommé « le Fournisseur » ;

D'autre part,

VOLTA et le Fournisseur étant ci-après désignés individuellement une « Partie » et collectivement les « Parties ».

## PRÉAMBULE

VOLTA a pour objet de faciliter la mise en relation professionnelle entre les clients ayant des besoins en engins, équipements et services associés, et les fournisseurs disposant des ressources nécessaires pour y répondre.

À ce titre, VOLTA peut notamment qualifier les demandes, organiser la transmission des propositions, accompagner les échanges commerciaux, coordonner certaines étapes de réservation et mettre en place des procédures de vérification documentaire ou technique.

Le Fournisseur souhaite accéder aux opportunités commerciales présentées par VOLTA et s'engage à fournir des informations exactes, à respecter ses engagements et à préserver la confiance des clients et partenaires.

Les Parties conviennent de ce qui suit.

## ARTICLE 1 — OBJET ET CHAMP D'APPLICATION

Le présent contrat définit les conditions de collaboration entre VOLTA et le Fournisseur concernant :

- la publication et la gestion des engins et équipements ;
- la réception et le traitement des demandes commerciales ;
- la présentation de devis et la réservation des prestations ;
- les obligations de disponibilité, de conformité et de sécurité ;
- la confidentialité des informations commerciales ;
- la protection des marchés apportés par VOLTA ;
- le traitement des réclamations, incidents et manquements ;
- les conditions de suspension, de résiliation et de règlement des différends.

Le présent contrat constitue un contrat-cadre. Chaque opération peut être précisée par une demande, un devis accepté, une réservation, un bon de commande ou un contrat de prestation distinct.

En cas de contradiction, les conditions particulières expressément acceptées pour une opération prévalent sur le présent contrat uniquement pour cette opération et dans la mesure où elles indiquent clairement la disposition remplacée.

## ARTICLE 2 — STATUT ET RÔLE DE VOLTA

Sauf mandat écrit distinct précisant expressément l'étendue de ses pouvoirs, VOLTA agit comme plateforme de mise en relation et de coordination commerciale.

VOLTA peut notamment :

1. recueillir et qualifier les besoins des clients ;
2. présenter des fournisseurs et des équipements adaptés ;
3. centraliser les demandes de devis et les propositions ;
4. faciliter les réservations et le suivi des engagements ;
5. vérifier certains documents et organiser, selon les prestations proposées, des contrôles techniques ;
6. enregistrer les échanges, décisions et incidents liés aux opérations.

Le présent contrat n'autorise pas VOLTA à engager le Fournisseur au-delà des pouvoirs expressément convenus.

Sauf stipulation particulière, le contrat de location, de vente ou de prestation portant sur l'équipement est conclu entre les parties désignées dans le devis ou le document de réservation correspondant.

Le rôle exact de VOLTA dans chaque opération doit être communiqué aux parties concernées. Si VOLTA agit comme mandataire, commissionnaire, courtier ou dans une autre qualité juridique, les documents contractuels doivent refléter cette qualité réelle.

## ARTICLE 3 — IDENTIFICATION ET CAPACITÉ DU FOURNISSEUR

Le Fournisseur garantit l'exactitude des informations et documents communiqués à VOLTA, notamment :

- sa dénomination ou son identité ;
- son RCCM, lorsqu'il est applicable ;
- son identifiant fiscal et ses informations professionnelles pertinentes ;
- l'identité et les pouvoirs de son représentant ;
- ses coordonnées et moyens de paiement ;
- les justificatifs de propriété, de détention ou de mise à disposition des équipements ;
- les assurances, autorisations, certificats et documents techniques requis pour son activité.

Le Fournisseur s'engage à signaler sans délai toute modification significative.

VOLTA peut demander des justificatifs complémentaires et suspendre la publication d'une ressource lorsque les documents nécessaires sont absents, expirés, incohérents ou sérieusement contestés.

La vérification de documents ne constitue pas une certification générale de la solvabilité, de la compétence ou de la conformité permanente du Fournisseur.

## ARTICLE 4 — PUBLICATION ET DISPONIBILITÉ DES ÉQUIPEMENTS

Le Fournisseur s'engage à publier des informations exactes, à jour et suffisamment détaillées sur chaque engin ou équipement proposé, notamment :

- sa nature, sa marque, son modèle et son état ;
- ses capacités et caractéristiques techniques ;
- sa localisation et sa disponibilité ;
- son tarif, les frais complémentaires et les conditions de mobilisation ;
- les conditions d'utilisation et les éventuelles restrictions ;
- les documents et justificatifs requis.

Le Fournisseur doit mettre à jour la disponibilité d'un équipement dès qu'un changement affecte sa possibilité réelle de réservation.

Lorsqu'un équipement devient indisponible, inutilisable ou non conforme à l'annonce, le Fournisseur doit en informer VOLTA sans délai et demander sa suspension du catalogue.

Le Fournisseur ne peut confirmer une réservation qu'après avoir vérifié la disponibilité réelle de l'équipement et sa capacité à exécuter la prestation aux conditions proposées.

## ARTICLE 5 — INSPECTION ET NIVEAUX DE VÉRIFICATION

VOLTA peut mettre en place des niveaux de vérification documentaire, visuelle ou technique, selon la nature de l'équipement et le service concerné.

Le Fournisseur s'engage à faciliter les contrôles convenus et à communiquer les documents nécessaires.

Chaque contrôle doit être interprété au regard de son périmètre, de sa date et des éléments effectivement examinés. Il ne dispense pas le Fournisseur de ses obligations légales et contractuelles.

Sauf engagement écrit spécifique, une inspection ne constitue ni une garantie absolue d'absence de défaut, ni une assurance de disponibilité future, ni une substitution à l'entretien réglementaire de l'équipement.

Lorsqu'un défaut susceptible de compromettre la sécurité est constaté ou signalé de manière crédible, VOLTA peut suspendre provisoirement la publication de l'équipement pendant les vérifications nécessaires.

## ARTICLE 6 — DEVIS, RÉSERVATIONS ET EXÉCUTION

Toute demande transmise au Fournisseur doit faire l'objet d'une réponse dans le délai indiqué dans la demande ou convenu entre les Parties.

Le devis doit préciser, selon la prestation :

- l'équipement concerné ;
- la durée et le lieu de mise à disposition ;
- le prix et les taxes applicables ;
- les frais de transport, de mobilisation, de carburant, d'opérateur ou autres frais ;
- les modalités de paiement ;
- les conditions d'annulation, de report et de prolongation ;
- les responsabilités opérationnelles et les conditions de sécurité.

Une réservation est considérée comme confirmée lorsque les conditions de confirmation affichées par VOLTA ou prévues dans le devis sont satisfaites et que la confirmation est enregistrée.

Le Fournisseur ne peut modifier unilatéralement le prix, la durée ou les conditions essentielles d'une réservation confirmée, sauf accord écrit des parties concernées ou application d'une clause de révision expressément acceptée.

Le Fournisseur doit exécuter ses engagements conformément aux documents acceptés et signaler immédiatement toute difficulté susceptible d'affecter la prestation.

## ARTICLE 7 — MANQUEMENTS ET MESURES CORRECTIVES

Constituent notamment des manquements :

- l'annonce répétée d'une disponibilité inexistante ;
- la fourniture d'informations fausses ou trompeuses ;
- le refus injustifié d'honorer une réservation confirmée ;
- la dissimulation d'un défaut connu susceptible d'affecter la sécurité ou l'utilisation ;
- la violation des obligations de confidentialité ;
- le contournement établi des règles de protection des marchés ;
- le défaut de présentation des justificatifs indispensables ;
- tout comportement frauduleux ou portant gravement atteinte à la sécurité des clients.

Lorsqu'un manquement est susceptible d'être corrigé, VOLTA adresse au Fournisseur une notification précisant les faits reprochés, les éléments disponibles et les mesures attendues. Sauf urgence ou gravité particulière, le Fournisseur dispose d'un délai raisonnable, fixé dans la notification, pour répondre ou remédier au manquement.

En cas de risque immédiat pour les personnes, les biens, la sécurité ou l'intégrité d'une opération, VOLTA peut prendre une mesure conservatoire proportionnée, notamment la suspension provisoire d'un équipement ou d'un compte, dans l'attente des vérifications nécessaires.

Trois manquements distincts, matériellement établis et notifiés concernant la disponibilité d'un même équipement peuvent entraîner son retrait du catalogue. Le Fournisseur peut présenter ses observations et demander un réexamen motivé.

La suspension ou le retrait d'un équipement ne supprime pas automatiquement les obligations déjà nées au titre des opérations confirmées.

## ARTICLE 8 — CONFIDENTIALITÉ ET PROTECTION DES INFORMATIONS COMMERCIALES

Sont considérées comme confidentielles, lorsqu'elles ne sont pas publiques et ont été communiquées dans le cadre de la collaboration :

- l'identité et les coordonnées non publiques des clients et prospects présentés ;
- les besoins, volumes, calendriers et spécifications des marchés ;
- les tarifs négociés, devis et conditions commerciales ;
- les informations relatives aux chantiers et aux opérations ;
- les documents techniques, commerciaux ou financiers protégés ;
- les informations d'accès aux espaces professionnels et aux outils de VOLTA.

Le Fournisseur s'engage à utiliser ces informations uniquement pour évaluer, négocier et exécuter les opérations autorisées.

Il ne doit pas les divulguer à des tiers non autorisés ni les utiliser pour porter atteinte aux intérêts légitimes de VOLTA, du client ou d'un autre partenaire.

Ne sont pas considérées comme confidentielles les informations dont le Fournisseur démontre qu'elles étaient déjà licitement en sa possession, qu'elles sont devenues publiques sans violation du contrat, qu'elles lui ont été communiquées licitement par un tiers ou que leur divulgation est imposée par la loi ou une autorité compétente.

Le Fournisseur limite l'accès aux personnes qui en ont besoin pour exécuter la prestation et veille à ce qu'elles respectent des obligations de confidentialité appropriées.

Ces obligations demeurent applicables pendant la collaboration et pendant cinq ans après sa cessation. Les secrets d'affaires et informations protégées par une règle impérative restent protégés aussi longtemps que les conditions légales de cette protection sont réunies.

## ARTICLE 9 — PROTECTION DES MARCHÉS APPORTÉS PAR VOLTA

### 9.1 Définition d'un marché apporté

Un « Marché Apporté par VOLTA » désigne une opportunité commerciale dont la mise en relation ou la transmission au Fournisseur résulte de l'intervention identifiable de VOLTA.

Cette intervention peut être démontrée notamment par une demande enregistrée, une réservation, un devis transmis, un échange conservé dans la Plateforme ou une présentation écrite du client.

Un marché ne relève pas automatiquement de cette définition lorsque le Fournisseur démontre qu'il entretenait déjà, avant l'intervention de VOLTA, une relation commerciale effective et indépendante avec le même client pour la même opération.

### 9.2 Obligation de traçabilité

Le Fournisseur s'engage à traiter dans VOLTA les demandes, devis, réservations et suivis concernant les Marchés Apportés par VOLTA, selon les fonctionnalités disponibles et les modalités communiquées.

Lorsqu'un échange doit exceptionnellement se poursuivre hors de la Plateforme pour des raisons opérationnelles, le Fournisseur en informe VOLTA et conserve les éléments nécessaires à la traçabilité de l'opération.

### 9.3 Interdiction de contournement

Pendant la durée du présent contrat et pendant douze mois après sa cessation, le Fournisseur s'interdit de contourner intentionnellement VOLTA afin de conclure directement avec un client présenté par VOLTA une opération substantiellement identique ou directement issue du Marché Apporté, dans le but de se soustraire à une obligation contractuelle, à des frais expressément convenus ou au processus de réservation applicable.

Cette interdiction ne vise pas les relations commerciales antérieures dûment démontrées, les sollicitations indépendantes sans lien avec le marché apporté, ni les situations dans lesquelles la loi impose ou autorise une conduite différente.

### 9.4 Conséquences d'un contournement

En cas de contournement établi, VOLTA peut demander la cessation du manquement, la régularisation des sommes contractuellement dues et la réparation du préjudice direct prouvé, conformément au droit applicable.

Toute indemnité forfaitaire ou pénalité spécifique devra faire l'objet d'une stipulation expresse, proportionnée et validée juridiquement. Le présent article ne crée pas, à lui seul, une commission qui n'aurait pas été convenue.

## ARTICLE 10 — TECHNICIENS, OPÉRATEURS ET PERSONNEL FORMÉ

Lorsque VOLTA ou Génie Select Academy présente au Fournisseur un technicien, un opérateur ou un autre professionnel, les Parties respectent les conditions applicables à cette mise en relation.

Le Fournisseur s'engage à ne pas utiliser les informations confidentielles ou les ressources de recrutement de VOLTA pour éluder intentionnellement des frais de recrutement ou autres obligations expressément convenus par écrit.

Toute prestation de recrutement, présentation de candidat, mise à disposition de personnel ou formation fait l'objet de conditions particulières précisant, le cas échéant, les frais, la durée, les garanties de remplacement et les modalités de recrutement.

Le présent contrat ne crée pas, à lui seul, une relation de travail entre VOLTA et le personnel du Fournisseur, ni une interdiction générale pour un professionnel de changer d'employeur.

Les restrictions relatives au recrutement direct doivent être définies dans un accord distinct lorsque la nature de l'opération le nécessite, dans le respect du droit applicable et des droits des personnes concernées.

## ARTICLE 11 — OBLIGATIONS DU FOURNISSEUR EN MATIÈRE DE SÉCURITÉ

Le Fournisseur demeure responsable, dans la mesure de ses obligations légales et contractuelles, de l'état, de l'entretien, de la conformité et de la disponibilité des équipements qu'il fournit.

Il doit notamment :

- s'assurer que les équipements sont adaptés à l'usage convenu ;
- respecter les règles de sécurité et d'entretien applicables ;
- fournir les notices, consignes et documents nécessaires ;
- signaler tout incident, défaut ou danger connu ;
- s'assurer que les opérateurs qu'il fournit disposent des qualifications et autorisations requises ;
- disposer des assurances obligatoires et des garanties convenues ;
- suspendre l'utilisation d'un équipement lorsqu'un risque sérieux l'exige.

Chaque partie doit coopérer de bonne foi pour prévenir les risques et traiter les incidents relevant de son intervention.

## ARTICLE 12 — OBLIGATIONS ET RESPONSABILITÉ DE VOLTA

VOLTA s'engage à mettre en œuvre les services de plateforme et de coordination convenus, avec un niveau de diligence adapté à leur nature.

VOLTA peut suspendre une fonctionnalité, une annonce ou une opération lorsque cela est raisonnablement nécessaire pour des raisons de sécurité, de conformité, de fraude présumée ou de protection des utilisateurs.

Sauf engagement écrit distinct, VOLTA ne garantit ni la conclusion de chaque marché, ni un volume minimal de demandes, ni le résultat économique du Fournisseur.

Le Fournisseur reconnaît que la vérification documentaire ou technique réalisée par VOLTA est limitée à son périmètre annoncé.

Aucune disposition du présent contrat n'exclut une responsabilité dans les cas où une telle exclusion serait interdite par la loi. La responsabilité de chaque Partie est appréciée selon ses obligations, ses fautes, les préjudices établis et les règles impératives applicables.

## ARTICLE 13 — PRIX, FRAIS ET PAIEMENTS

Les prix de location, de vente, de mobilisation, de maintenance, de recrutement ou de toute autre prestation sont ceux indiqués dans les documents acceptés par les parties concernées.

Les frais dus à VOLTA, le cas échéant, doivent être précisés dans une grille tarifaire ou des conditions particulières acceptées par le Fournisseur avant l'opération concernée.

Aucun frais, aucune commission et aucune pénalité ne peuvent être considérés comme acceptés du seul fait de la présence du Fournisseur sur la Plateforme, s'ils n'ont pas été clairement portés à sa connaissance et valablement acceptés.

Chaque Partie assume les obligations fiscales et comptables qui lui incombent.

Lorsqu'un paiement transite par un prestataire de paiement ou par un mécanisme spécifique de la Plateforme, les conditions de ce mécanisme sont communiquées séparément et acceptées avant son utilisation.

## ARTICLE 14 — DONNÉES PERSONNELLES ET SÉCURITÉ DES ACCÈS

Chaque Partie s'engage à traiter les données personnelles auxquelles elle accède conformément au droit applicable en Côte d'Ivoire.

Le Fournisseur s'engage notamment à :

- utiliser les données des clients uniquement pour les finalités autorisées ;
- ne pas vendre, divulguer ou réutiliser ces données à des fins étrangères à l'opération ;
- protéger les identifiants et accès à son espace professionnel ;
- signaler rapidement tout accès non autorisé ou incident de sécurité ;
- supprimer ou restituer les données lorsque leur conservation n'est plus nécessaire, sous réserve des obligations légales d'archivage.

Les Parties coopèrent pour répondre aux demandes des personnes concernées et aux obligations légales applicables.

Les modalités détaillées de traitement des données peuvent être précisées dans une politique de confidentialité ou un accord distinct, notamment lorsque l'une des Parties traite des données pour le compte de l'autre.

## ARTICLE 15 — PROPRIÉTÉ INTELLECTUELLE ET USAGE DE LA MARQUE

Chaque Partie conserve ses droits sur ses marques, logos, documents, logiciels et autres éléments préexistants.

Le Fournisseur autorise VOLTA, pendant la durée de la collaboration, à utiliser ses dénominations, logos, photographies et descriptions d'équipements aux seules fins de présenter, promouvoir et administrer les offres concernées sur la Plateforme et dans les supports de communication associés.

Le Fournisseur garantit qu'il dispose des droits nécessaires sur les éléments qu'il transmet et qu'il autorise VOLTA à les utiliser dans les limites prévues au présent article.

Cette autorisation n'emporte aucune cession de propriété intellectuelle. Toute utilisation au-delà de ces finalités nécessite un accord distinct.

## ARTICLE 16 — DURÉE, SUSPENSION ET RÉSILIATION

Le présent contrat prend effet à sa date de signature ou d'acceptation électronique valable. Il est conclu pour une durée indéterminée, sauf durée différente expressément prévue dans les conditions particulières.

Chaque Partie peut y mettre fin par notification écrite avec un préavis de trente jours.

En cas de manquement susceptible d'être corrigé, la Partie lésée peut adresser une mise en demeure précisant les faits et accordant un délai raisonnable, généralement de quinze jours, pour remédier au manquement.

En cas de fraude, de risque grave pour la sécurité, d'utilisation illicite des données, de falsification de documents ou de violation grave des obligations de confidentialité, une suspension conservatoire immédiate peut être mise en œuvre. La résiliation sans préavis demeure soumise aux conditions prévues par le droit applicable et à la gravité des faits.

La fin du contrat n'annule pas les réservations confirmées, les sommes dues, les obligations de confidentialité, les obligations relatives aux données ni les dispositions qui doivent raisonnablement survivre à la cessation de la collaboration.

Les Parties organisent de bonne foi le traitement des opérations en cours et la restitution des documents ou matériels appartenant à l'autre Partie.

## ARTICLE 17 — FORCE MAJEURE ET ÉVÉNEMENTS EXCEPTIONNELS

Aucune Partie n'est tenue responsable d'un retard ou d'une inexécution directement causé par un événement répondant aux conditions de la force majeure selon le droit applicable.

La Partie affectée informe l'autre Partie dans les meilleurs délais, précise les conséquences prévisibles et prend des mesures raisonnables pour limiter les effets de l'événement.

Si l'empêchement se prolonge au-delà d'une durée raisonnable, les Parties se concertent pour adapter, suspendre ou mettre fin à l'opération concernée, sous réserve des règles impératives applicables.

## ARTICLE 18 — NOTIFICATIONS ET PREUVE ÉLECTRONIQUE

Les notifications contractuelles peuvent être effectuées par les moyens expressément prévus dans l'espace professionnel VOLTA, par courrier électronique ou par tout autre moyen convenu permettant d'établir leur transmission et leur contenu.

Les Parties reconnaissent que les échanges électroniques, historiques de demandes, devis, réservations et journaux d'acceptation peuvent constituer des éléments de preuve, sous réserve des exigences légales applicables, de leur fiabilité et de leur intégrité.

VOLTA conserve les éléments de preuve selon une politique de conservation documentée et compatible avec ses obligations légales et de protection des données.

Chaque Partie est responsable de la sécurité de ses accès et doit signaler sans délai toute suspicion de compromission.

## ARTICLE 19 — DROIT APPLICABLE ET RÈGLEMENT DES DIFFÉRENDS

Le présent contrat est régi par le droit applicable en République de Côte d'Ivoire, y compris les Actes uniformes OHADA applicables.

En cas de différend, les Parties s'efforcent d'abord de parvenir à une solution amiable dans un délai de trente jours à compter de la notification écrite du différend.

À défaut d'accord amiable, le différend est soumis à la juridiction compétente déterminée conformément aux règles de compétence applicables.

Les Parties peuvent convenir par écrit de recourir à la médiation ou à l'arbitrage, dans les conditions prévues par les textes applicables.

## ARTICLE 20 — DISPOSITIONS FINALES

Le présent contrat, ses annexes et les conditions particulières expressément acceptées constituent l'accord entre les Parties concernant son objet.

Toute modification doit être portée à la connaissance du Fournisseur et acceptée lorsque le droit applicable ou la nature de la modification l'exige. Les modifications substantielles ne peuvent être imposées rétroactivement aux opérations déjà confirmées sans base contractuelle valable.

Si une disposition est jugée invalide ou inapplicable, les autres dispositions demeurent applicables dans la mesure permise par le droit. Les Parties se concertent pour remplacer la disposition concernée par une stipulation licite poursuivant un objectif économique comparable.

Le fait pour une Partie de ne pas exercer immédiatement un droit ne vaut pas renonciation à ce droit.

Le Fournisseur déclare avoir pu prendre connaissance du présent contrat, en comprendre la portée et poser toute question utile avant de l'accepter.

## ANNEXE 1 — FICHE D'IDENTIFICATION DU FOURNISSEUR

- Dénomination / nom complet :
- Forme juridique :
- RCCM, si applicable :
- Identifiant fiscal, si applicable :
- Adresse du siège ou de l'activité :
- Nom du représentant :
- Qualité du représentant :
- Téléphone professionnel :
- Courriel professionnel :
- Type d'équipements ou de services proposés :
- Documents justificatifs vérifiés :
- Date de validation :

## ANNEXE 2 — ACCEPTATION ÉLECTRONIQUE

En validant le présent contrat dans son espace professionnel, le Fournisseur confirme :

1. avoir accès au texte intégral du contrat et à sa version ;
2. avoir pris connaissance de ses clauses ;
3. accepter les obligations qui lui sont applicables ;
4. certifier l'exactitude des informations fournies ;
5. autoriser l'enregistrement de la preuve de son acceptation dans les conditions légales applicables.

**Version du contrat acceptée :** [identifiant de version]
**Identité du compte :** [identifiant professionnel]
**Date et heure :** [horodatage]
**Mode d'acceptation :** [signature électronique / validation explicite]
**Référence de preuve :** [identifiant du journal d'audit]

## SIGNATURES

Pour VOLTA :

Nom :
Qualité :
Date :
Signature :

Pour le Fournisseur :

Nom / dénomination :
Représentant habilité :
Date :
Signature :
`
