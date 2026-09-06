# Déploiement

Le frontend et le backend sont hébergés séparément : un site statique sur
Vercel, une API et sa base sur Render. Chacun ignore l'autre jusqu'à ce que deux
variables les relient — c'est la seule étape manuelle, et elle ne peut pas être
faite avant que les deux URL n'existent.

---

## 1. Backend et base de données — Render

Le blueprint `render.yaml` décrit les deux ressources.

**Avant tout** : vérifier qu'aucune autre base PostgreSQL gratuite n'est active
sur le compte. Le plan gratuit n'en autorise qu'une ; s'il en existe déjà une, la
création échoue et annule le service web dans la foulée — « cannot have more
than one active free tier database ». Supprimer l'autre base, ou retirer le bloc
`databases` du blueprint et saisir les cinq variables `PG*` à la main.

1. Sur [render.com](https://render.com), **New** → **Blueprint**, désigner ce dépôt.
2. Render lit `render.yaml`, crée `volta-db` (PostgreSQL) puis `volta-backend`
   (Docker), et injecte les identifiants de connexion dans le service.
3. Il demande la valeur des variables marquées `sync: false` :

   | Nom | Valeur |
   |---|---|
   | `VOLTA_ADMIN_EMAIL` | l'adresse du premier administrateur |
   | `VOLTA_ADMIN_PASSWORD` | son mot de passe, choisi ici et nulle part ailleurs |
   | `VOLTA_CORS_ALLOWED_ORIGINS` | laisser vide — l'URL du frontend n'existe pas encore |

4. **Apply**. Le premier build compile Maven dans l'image : comptez cinq à dix
   minutes.
5. Noter l'URL du service, de la forme `https://volta-backend.onrender.com`.

Le premier démarrage crée le schéma : le projet n'embarque pas d'outil de
migration, `DDL_AUTO` vaut donc `update`. Une fois le schéma stable, le passer à
`validate` dans les variables du service — Hibernate vérifiera alors la
correspondance sans jamais modifier la base.

### Pourquoi PostgreSQL en ligne alors que le développement est en MySQL

Render ne provisionne pas de MySQL. Le projet n'ayant aucune requête native,
Hibernate produit le SQL selon le dialecte et les deux moteurs conviennent. Le
pilote PostgreSQL est ajouté à côté de celui de MySQL ; celui qui sert est
déterminé par l'URL JDBC. Le développement local reste inchangé.

Pour rester sur MySQL en ligne, il faut une base chez un autre fournisseur
(Aiven, PlanetScale, Railway) : renseigner alors `DB_URL`, `DB_USER`,
`DB_PASSWORD` et `HIBERNATE_DIALECT` à la main, sans activer le profil `render`
— ce sont ces variables-là, et non les `PG*`, que lit la configuration par
défaut.

---

## 2. Frontend — Vercel

`vercel.json` porte la configuration : build Vite, sortie `dist`, et la
réécriture qui renvoie toutes les routes vers `index.html` — sans elle, ouvrir
directement `/catalogue` ou recharger une page renvoie une 404, le routage étant
tenu par le navigateur.

1. Sur [vercel.com](https://vercel.com), **Add New** → **Project**, importer ce dépôt.
2. Vercel détecte Vite et lit `vercel.json`. Ne rien changer aux commandes.
3. Avant de déployer, ajouter la variable d'environnement :

   | Nom | Valeur |
   |---|---|
   | `VITE_API_URL` | `https://volta-backend.onrender.com/api` |

   Cette valeur est lue **à la construction**, pas à l'exécution : la modifier
   demande un redéploiement pour prendre effet.

4. Déployer, puis noter l'URL, de la forme `https://volta.vercel.app`.

En ligne de commande, si vous préférez :

```bash
npm i -g vercel
vercel login
vercel link
vercel env add VITE_API_URL production   # coller l'URL de l'API
vercel --prod
```

---

## 3. Relier les deux

Retourner sur Render, service `volta-backend`, **Environment** :

| Nom | Valeur |
|---|---|
| `VOLTA_CORS_ALLOWED_ORIGINS` | `https://volta.vercel.app` |

Puis redéployer le service.

Ne jamais mettre `*` : les requêtes portent un jeton de session, et toute
origine autorisée pourrait agir avec les droits du visiteur connecté. Plusieurs
origines se séparent par des virgules, sans espace.

---

## 4. Vérifier

```bash
# L'API répond et sert le catalogue public
curl -s -o /dev/null -w "%{http_code}\n" https://volta-backend.onrender.com/api/categories

# Le frontend est servi, et une route profonde ne tombe pas en 404
curl -s -o /dev/null -w "%{http_code}\n" https://volta.vercel.app/catalogue

# Les en-têtes CORS autorisent bien le frontend
curl -s -I -X OPTIONS https://volta-backend.onrender.com/api/categories \
  -H "Origin: https://volta.vercel.app" \
  -H "Access-Control-Request-Method: GET" | grep -i access-control-allow-origin
```

Puis, dans le navigateur : se connecter, ouvrir une fiche d'engin, demander un
devis. Si les appels échouent alors que l'API répond en `curl`, c'est le CORS —
l'origine déclarée sur Render doit correspondre exactement au domaine servi,
schéma compris.

---

## Qui peuple l'instance en ligne

Aucun compte de démonstration : le profil `render` force `volta.seed.demo` à
`false`, et leur mot de passe est écrit en clair dans un dépôt public.

Une instance en ligne démarre donc avec les seules catégories du catalogue —
elles relèvent de la taxonomie du métier, pas du jeu d'essai — et
l'administrateur amorcé par `VOLTA_ADMIN_EMAIL` et `VOLTA_ADMIN_PASSWORD`. Tout
le reste vient des utilisateurs : les fournisseurs s'inscrivent par le site,
l'administrateur leur donne leur rôle, puis dépose et publie les engins.

L'amorçage ne joue que tant qu'aucun administrateur n'existe. Les deux variables
deviennent ensuite inertes : un mot de passe laissé dans le tableau de bord de
l'hébergeur ne rouvre pas un accès à chaque redémarrage, même après que
l'exploitant l'a changé. Si l'adresse correspond à un compte déjà inscrit, ce
compte est promu et son mot de passe n'est pas touché.

Les comptes de démonstration (`dg@volta.com` et les autres, mot de passe
`password123`) n'existent qu'en développement local, où `application.properties`
active le jeu d'essai.

---

## Le plan gratuit de Render

Le service s'endort après quinze minutes sans trafic ; la requête suivante le
réveille et met une trentaine de secondes. La première visite après une période
calme paraîtra donc lente — ce n'est pas un défaut de l'application.
