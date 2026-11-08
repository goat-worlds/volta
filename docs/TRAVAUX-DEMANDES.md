# Travaux demandés — fournisseurs, rapports techniques, contrats

Demande du client, déposée le 8 novembre 2026. À traiter point par point.

Avant de coder : analyser la structure du projet, proposer un plan court et
lister les fichiers concernés. Ne pas casser l'existant ; ajouter ou mettre à
jour les tests pour chaque point. Résumer à la fin ce qui a été modifié, ce qui
reste à faire et ce qui demande confirmation.

---

## À lire avant de commencer

Trois choses que le dépôt ne dit pas et qui changent la façon d'aborder ces
travaux.

### Le serveur porte du code qui n'est pas ici

Deux correctifs attendent dans `/opt/volta/src-patches/` sur le VPS :

- `0001-…-le-contrat-se-t-l-charge-en-PDF-avec-le-logo-et-la-f.patch`
- `0002-…` (lecture tolérante des références)

Ils ont été construits directement sur le serveur, qui n'a pas d'accès en
écriture au dépôt. **Tant qu'ils ne sont pas rapatriés, toute mise à jour depuis
GitHub les efface.** Le point 5 ci-dessous touche la fiche contractuelle,
c'est-à-dire exactement le fichier que `0001` modifie : les rapatrier d'abord,
sinon le travail se fera deux fois et en conflit.

### La référence des dossiers est en chantier

La production attribue encore l'ancien format — `VOL-RES-2026-000001`, vérifié
sur `/api/equipment`. Le dépôt, lui, produit depuis `6a0346a` le format court
`ENG-26-0001` et ne sait plus lire l'ancien.

**Déployer `1.0.7` en l'état rendrait introuvable toute demande dont la
référence commence par `VOL-`**, et il en existe en production
(`VOL-REQ-2026-000008`). Le correctif `0002` traite probablement ce point : le
lire avant d'écrire quoi que ce soit sur `ReferenceService`.

### Une seule session écrit à la fois

VOLTA a été modifié en parallèle depuis le poste de développement et depuis le
serveur. Cela a produit un renommage de constantes laissé à moitié, un arbre qui
ne compilait plus, et deux correctifs hors dépôt. Le poste de développement tient
le code ; le serveur déploie.

---

## 1. Formulaire fournisseurs / ressources

- Les champs doivent être **vides par défaut**. Aucune valeur pré-remplie.
- « Compteur », « Prix » et les deux autres champs en haut du formulaire
  deviennent **obligatoires**, validés **côté front et côté serveur**, avec un
  message d'erreur explicite.

> **À confirmer avec le client** : le nom exact des deux autres champs. Le
> formulaire d'ajout d'engin en porte plusieurs en tête — marque, modèle, année,
> catégorie, localisation. Ne pas deviner.

Une validation posée seulement dans le navigateur ne protège de rien : un appel
direct à l'API la contourne. Les deux côtés, donc.

Fichiers probables : `src/pages/supplier/SupplierEquipmentNew.tsx`,
`backend/.../web/ApiController.java`, `backend/.../service/VoltaService.java`.

## 2. Rapports techniques

### Compléter un rapport après soumission

L'équipe technique doit pouvoir modifier son rapport **tant qu'il est en attente
de décision**. Dès la décision prise, il redevient non modifiable.

La machine à états des engins porte déjà `REPORT_SUBMITTED` et
`PENDING_ADMIN_REVIEW` : la fenêtre de modification correspond à ces deux états.
Le verrou se pose côté serveur, dans le service, pas dans l'écran.

Fichiers probables : `backend/.../domain/EquipmentWorkflow.java`,
`backend/.../service/VoltaService.java`, `src/pages/technical/`.

### L'image jointe au rapport ne s'affiche pas

Bug à diagnostiquer avant de corriger. Ce qui est déjà établi :

- `InspectionFileController` écrit réellement sur le disque, par `Files.write`,
  dans `app.inspection-upload-dir`.
- `UploadConfig` sert ce dossier sous `/uploads/inspections/**`.
- `SecurityConfig` réserve cette route en lecture aux rôles **TECHNICAL, ADMIN,
  SUPPLIER**.
- La configuration nginx relaie bien `/uploads/` vers le backend — c'est un
  chemin nu, hors de `/api`, et un proxy qui l'ignore casse toutes les images.

**Piste la plus probable** : la route est authentifiée, mais une balise `<img>`
n'envoie pas l'en-tête `Authorization`. Le navigateur demande l'image sans jeton,
reçoit 401, et affiche une image cassée. Les photos d'engins échappent au
problème parce que leur route, elle, est publique.

Vérifier d'abord la réponse HTTP de l'image dans l'onglet réseau avant de
chercher ailleurs. Si c'est bien 401, deux sorties possibles — un jeton de
lecture à usage unique dans l'URL, ou un point d'entrée qui renvoie le contenu
après contrôle du rôle. Trancher avec le client : ces pièces sont des documents
de chantier, pas des photos publiques.

## 3. Techniciens — spécialité « Climatisation »

À ajouter partout où les spécialités sont listées : affectation, filtres,
formulaires. Chercher les valeurs existantes avant d'en poser une nouvelle, pour
rester cohérent avec la casse et le nommage déjà en place.

## 4. Confidentialité — masquer les noms de fournisseurs ⚠️

**Le masquage se fait côté serveur, pas à l'affichage.** Un champ retiré dans
l'écran reste lisible dans la réponse de l'API : il suffit d'ouvrir l'onglet
réseau. Si la règle est que ces utilisateurs ne doivent pas connaître le nom,
alors la réponse ne doit pas le contenir.

> **À confirmer avec le client** : pour qui exactement — l'équipe technique, les
> clients, ou les deux ?

`PublicRequestService.listForSupplier` applique déjà ce principe dans l'autre
sens : s'en inspirer.

## 5. Fiche contractuelle

- Compléter avec les informations de Génie Select : **RCCM**, **NCC**, nom du
  dirigeant et son numéro de téléphone.
- Envoyer par email le dernier contrat généré.

> **À demander au client** : les valeurs réelles. `src/lib/contrat.ts` porte
> encore des marqueurs `[dénomination sociale complète]`, `[RCCM]`, `[adresse]`,
> `[nom et qualité du représentant habilité]`. Ne rien inventer sur un document
> contractuel.

Le correctif `0001` du serveur touche ce fichier : le rapatrier avant.

## 6. Emails de la société ⚠️

- Contrats : **volta@genieselect.com**
- Adresse générale : **info@genieselect.com**
- **Aucun identifiant SMTP en dur.** Variables d'environnement uniquement.

Le projet n'envoie aujourd'hui aucun email : ni `JavaMailSender`, ni
configuration SMTP, vérifié. C'est donc une fonctionnalité à construire, pas à
régler — et elle a une conséquence immédiate sur le compte administrateur, dont
le mot de passe ne peut aujourd'hui être réinitialisé par aucun moyen.

Le dépôt est public. Les identifiants passent par le `.env` du serveur, ignoré
par git, et par `.env.prod.example` pour la documentation — sans valeur réelle.

## 7. Engins — statut « À louer » manquant

À ajouter au formulaire **et au modèle de données**.

Attention : `EquipmentWorkflow` définit déjà onze statuts et leurs transitions
autorisées. Un douzième ne s'ajoute pas seul — il faut dire d'où il vient et où
il mène, sinon l'engin s'y retrouve coincé. Vérifier aussi s'il s'agit vraiment
d'un statut, ou plutôt du drapeau `available` qui existe déjà sur le modèle.

> **À confirmer avec le client** : « À louer » est-il un état du cycle de vie, ou
> une disponibilité commerciale que le fournisseur bascule à volonté ? Les deux
> se codent très différemment.

---

## Points à confirmer, rassemblés

1. Le nom des deux champs obligatoires en haut du formulaire (point 1).
2. Qui ne doit pas voir les noms de fournisseurs (point 4).
3. Les valeurs réelles de RCCM, NCC, dirigeant et téléphone (point 5).
4. « À louer » : statut du cycle de vie ou disponibilité commerciale (point 7).
5. Pour les images d'inspection : pièces réservées aux rôles habilités, ou
   lisibles par quiconque a le lien (point 2).
