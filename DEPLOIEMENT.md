# Déploiement

Le frontend et le backend sont hébergés séparément : un site statique sur
Vercel, une API et sa base sur Render. Chacun ignore l'autre jusqu'à ce que deux
variables les relient — c'est la seule étape manuelle, et elle ne peut pas être
faite avant que les deux URL n'existent.

---

## 1. Backend et base de données — Render

Le blueprint `render.yaml` décrit les deux ressources.

1. Sur [render.com](https://render.com), **New** → **Blueprint**, désigner ce dépôt.
2. Render lit `render.yaml`, crée `volta-db` (PostgreSQL) puis `volta-backend`
   (Docker), et injecte les identifiants de connexion dans le service.
3. Laisser `VOLTA_CORS_ALLOWED_ORIGINS` vide pour l'instant : l'URL du frontend
   n'existe pas encore.
4. Noter l'URL du service, de la forme `https://volta-backend.onrender.com`.

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
(Aiven, PlanetScale, Railway) : retirer alors le bloc `databases` du blueprint et
renseigner `DB_URL`, `DB_USER`, `DB_PASSWORD` et `HIBERNATE_DIALECT` à la main,
sans activer le profil `render`.

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

## Comptes de démonstration

Créés au premier démarrage sur une base vide, mot de passe `password123` :

| Rôle | Adresse |
|---|---|
| Direction | `dg@volta.com` |
| Fournisseur | `supplier@volta.com` |
| Équipe technique | `verificateur@volta.com` |
| Client | `jean@konan.ci` |

**À supprimer avant toute mise en service réelle** : ce sont des accès connus,
avec un mot de passe public.

---

## Le plan gratuit de Render

Le service s'endort après quinze minutes sans trafic ; la requête suivante le
réveille et met une trentaine de secondes. La première visite après une période
calme paraîtra donc lente — ce n'est pas un défaut de l'application.
