# Questions à trancher — VOLTA

Audit au 12 novembre 2026. Ce document ne contient que des questions ouvertes :
des choix qui ne se devinent pas depuis le code, et sur lesquels aucune session
ne doit décider seule.

Chaque entrée dit ce qui a été constaté, pourquoi la question se pose, et ce qui
arrive tant qu'elle reste sans réponse.

---

## 1. Urgences — du travail est en danger

### 1.1 Deux correctifs existent hors du dépôt

Construits directement sur le VPS, qui n'a pas d'accès en écriture à
`goat-worlds/volta` :

| Fichier | Contenu |
|---|---|
| `/opt/volta/src-patches/0001-*.patch` | Le contrat se télécharge en PDF, avec le logo |
| `/opt/volta/src-patches/0002-*.patch` | Lecture tolérante des références |

**Tant qu'ils ne sont pas rapatriés, la première mise à jour depuis GitHub les
efface.**

> **Question.** Qui les rapatrie, et quand ? La méthode proposée reste
> `cat` sur le serveur, collage, puis `git am` depuis le poste de développement.
> Un jeton GitHub déposé sur le VPS a été proposé : il resterait dans
> l'historique du shell et dans la transcription de la session.

### 1.2 Le compte administrateur de production

Aux dernières nouvelles, la production portait `a_remplir@exemple.ci` avec le
mot de passe `a_remplir` — les valeurs d'exemple du fichier de configuration.

> **Question.** A-t-il été corrigé depuis ? Si non, c'est un accès
> d'administration ouvert à quiconque a lu les échanges de cette semaine, sur un
> site public en HTTPS.

Conséquence liée : **aucun email n'est envoyé par la plateforme** — ni
`JavaMailSender`, ni configuration SMTP, vérifié. Un mot de passe perdu ne peut
donc être réinitialisé par aucun moyen, administrateur compris. La seule sortie
passe par `psql` dans le conteneur.

### 1.3 Deux sessions écrivent dans le même dépôt

Cela a déjà produit un renommage de constantes laissé à moitié — l'arbre ne
compilait plus — et les deux correctifs ci-dessus.

> **Question.** Laquelle tient le code ? Le poste de développement a le dépôt ;
> le serveur a l'accès SSH. Tant que les deux écrivent, chaque correction risque
> d'en annuler une autre.

### 1.4 Le format des références

La production attribue encore l'ancien format — `VOL-RES-2026-000001`, lu sur
`/api/equipment`. Le dépôt produit depuis `6a0346a` le format court
`ENG-26-0001`, et ne sait plus lire l'ancien.

Une demande réelle existe en production sous `VOL-REQ-2026-000008`.

> **Question.** Déployer la version actuelle rendrait cette demande introuvable
> pour le client qui a noté sa référence. Faut-il restaurer la lecture de
> l'ancien format — une vingtaine de lignes, sans la migration de 270 lignes qui
> l'accompagnait ? Le correctif `0002` traite peut-être déjà ce point : à lire
> avant de décider.

---

## 2. Contrat et informations légales

Rien ici ne doit être inventé. Ce sont des mentions qui engagent.

### 2.1 Marqueurs restés dans le contrat-cadre

`src/lib/contrat.ts` porte encore :

```
[dénomination sociale complète]
[RCCM]
[adresse]
[nom et qualité du représentant habilité]
```

> **Question.** Les valeurs réelles pour Génie Sélect.

### 2.2 Fiche contractuelle à compléter

Demandé : **RCCM**, **NCC**, nom du dirigeant et son numéro de téléphone.

> **Question.** Les quatre valeurs. Le NCC n'apparaît nulle part dans le code
> aujourd'hui.

### 2.3 Niveaux Basic / Silver / Gold

Le cahier des charges (§5.7) dit que les règles d'attribution sont « définies
librement par l'administrateur », sans algorithme automatique.

> **Question.** Ces règles existent-elles par écrit ? Sans elles, l'administrateur
> attribue au jugé, et deux fournisseurs comparables peuvent recevoir des niveaux
> différents sans que personne puisse l'expliquer.

---

## 3. Les sept travaux demandés

Reprises de `docs/TRAVAUX-DEMANDES.md`, où elles bloquent l'implémentation.

### 3.1 Formulaire fournisseur — les champs obligatoires

« Compteur », « Prix » et **deux autres champs en haut du formulaire**, laissés à
préciser.

> **Question.** Lesquels ? Le formulaire en porte plusieurs en tête : marque,
> modèle, année, catégorie, localisation.

### 3.2 Masquage des noms de fournisseurs

> **Question.** Pour qui exactement — l'équipe technique, les clients, ou les
> deux ?

Le masquage se fera côté serveur. Un champ retiré de l'écran reste lisible dans
la réponse de l'API.

### 3.3 Statut « À louer »

> **Question.** Est-ce un état du cycle de vie de l'engin, ou une disponibilité
> commerciale que le fournisseur bascule à volonté ?

Le modèle porte déjà un drapeau `available`. La machine à états compte onze
statuts et leurs transitions : un douzième doit dire d'où il vient et où il mène,
sinon l'engin s'y retrouve coincé. Les deux réponses se codent très
différemment.

### 3.4 Images d'inspection illisibles

Diagnostic probable : la route `/uploads/inspections/**` est réservée aux rôles
habilités, mais une balise `<img>` n'envoie jamais de jeton. Le navigateur reçoit
401 et affiche une image cassée. Les photos d'engins y échappent : leur route est
publique.

> **Question.** Ces pièces sont-elles confidentielles ? Si oui, il faut un jeton
> de lecture à usage unique ou un point d'entrée contrôlé. Si non, ouvrir la route
> suffit — mais n'importe qui avec le lien verra les clichés de chantier.

---

## 4. Décisions techniques en attente

### 4.1 Les photos : volume ou base de données

Demandé que les images soient « dans la base de données ». Trois faits :

- Les photos du catalogue sont versionnées dans Git et embarquées dans l'image
  Docker. Elles ne peuvent pas être perdues.
- Les photos téléversées vivent dans le volume `volta-uploads`, avec leurs
  chemins en base. Un `docker volume prune` les effacerait.
- Le projet stocke déjà en base, en base64, les pièces d'entreprise, les pièces
  jointes de demande et les preuves de clôture. Le précédent existe.

> **Question.** Bascule-t-on les photos téléversées en base ? Coût : une base
> plus lourde à sauvegarder, des images servies par l'application au lieu de
> nginx. Gain : une seule sauvegarde à faire, et rien ne dépend plus du volume.
> Les photos du catalogue, elles, doivent rester des fichiers.

### 4.2 Le PDF de la fiche technique d'inspection

Demandé. **N'existe pas** : aucune génération de PDF dans le dépôt, aucune
bibliothèque déclarée. Les données sont complètes — rapport, checklist en quatre
familles, observations, photos, anomalies.

> **Question.** Qui le construit ? La session qui a déjà fait le PDF du contrat a
> choisi une bibliothèque et une mise en page ; en ouvrir une seconde donnerait
> deux documents de la même marque qui ne se ressemblent pas.

### 4.3 Le plafond des comptes fournisseurs non vérifiés

Mis en place : sans RCCM et DFE vérifiés, un fournisseur publie **3 engins** et
ne vend pas sur Volta Market. C'était une proposition, pas une règle validée.

> **Question.** Le chiffre et le principe vous conviennent-ils ? Les deux se
> changent en une ligne.

### 4.4 Le schéma de base en production

`DDL_AUTO` doit passer de `update` à `validate` une fois le site vérifié. Laissé
sur `update`, Hibernate peut modifier la base à chaque déploiement, y compris
raté.

> **Question.** Le basculement a-t-il été fait ? Il faudra repasser à `update` le
> temps d'un démarrage chaque fois qu'une version ajoute une colonne.

---

## 5. Ce qui n'est plus une question

Pour éviter qu'on y revienne.

- **Le numéro `07 48 63 48 53`** n'existe plus ni dans le code ni dans le bundle
  servi par `voltaci.com`. Partout `05 00 99 13 13`. Ce qui s'affichait encore
  venait du cache du service worker.
- **Les téléversements ne sont pas simulés.** Aucun fichier de simulation dans le
  front ; le technicien, le fournisseur et l'administration appellent les vrais
  points d'entrée, qui écrivent sur disque. Le chemin fournisseur a été prouvé en
  production.
- **HTTPS est en place** sur `www.voltaci.com`, derrière Cloudflare et Traefik.
- **Les trois CVE critiques de Tomcat** — dont deux contournements
  d'authentification — sont fermées depuis la version 1.0.5.
