# Déployer VOLTA sur un VPS Hostinger

Ce document décrit le déploiement par Docker Compose sur un VPS Hostinger, via
Docker Manager. Il remplace `DEPLOIEMENT.md`, qui vise Neon + Render + Vercel et
reste valable pour cette autre cible.

---

## Ce que l'on installe

Trois conteneurs sur un réseau privé Docker. **Un seul port est ouvert sur
Internet** : le 80, tenu par nginx.

```
Internet ──▶ :80  web (nginx)
                   ├── sert le site construit (React)
                   ├── /api/      ──▶ backend:9000
                   └── /uploads/  ──▶ backend:9000
                                        │
                                        └──▶ db:5432 (PostgreSQL)
```

La base n'a aucun port publié : elle n'est joignable que depuis le backend.
Le backend non plus : tout passe par nginx.

Conséquence utile : le navigateur ne voit qu'une seule origine, donc **aucune
requête inter-origines**. La liste `VOLTA_CORS_ALLOWED_ORIGINS` ne sert plus
qu'en secours.

### Pourquoi `/uploads` doit être relayé

Les photos envoyées par les fournisseurs reviennent en
`/uploads/equipment/{uuid}.jpeg` — un chemin nu, que le navigateur résout sur
l'origine du site. Elles sont servies par le **backend**, pas par nginx. Un
proxy qui ne relaierait que `/api` afficherait un catalogue aux images cassées,
sans la moindre erreur dans les journaux du site.

---

## Avant de commencer

- Un VPS Hostinger avec Docker et Docker Compose (gabarit « Ubuntu + Docker »).
- **2 Go de RAM au minimum.** Spring Boot met une à deux minutes à démarrer sur
  une petite machine ; en dessous, le conteneur est tué avant d'avoir fini.
- Un accès SSH au VPS, pour les sauvegardes et le diagnostic. Docker Manager
  seul ne suffit pas à administrer une installation.

---

## Étape 1 — Publier les images

Docker Manager **ne sait pas cloner un dépôt** : un `build:` dans le compose
n'aurait pas de sources sous la main. Les images sont donc construites ailleurs
et récupérées depuis un registre.

Sur GitHub, onglet **Actions** → « Images Docker » → **Run workflow**. Le
workflow construit et pousse :

```
ghcr.io/goat-worlds/volta-backend:latest
ghcr.io/goat-worlds/volta-frontend:latest
```

Aucun secret à créer : `GITHUB_TOKEN` suffit.

### Rendre les images récupérables depuis le VPS

Un paquet publié par Actions est **privé par défaut**, même dans un dépôt
public. Deux chemins :

**a. Paquet public** — le plus simple. Sur GitHub : votre profil → *Packages* →
`volta-backend` → *Package settings* → *Change visibility* → **Public**. Idem
pour `volta-frontend`. Le VPS n'a alors aucune authentification à faire.

Ce qui devient public, ce sont les images — donc le code compilé, déjà public
dans ce dépôt. Aucun secret n'y figure : ils arrivent tous par les variables
d'environnement.

**b. Paquet privé** — créer un jeton GitHub (*Developer settings* → *Personal
access tokens (classic)*, portée `read:packages`), puis sur le VPS en SSH :

```bash
echo "VOTRE_JETON" | docker login ghcr.io -u VOTRE_COMPTE --password-stdin
```

---

## Étape 2 — Préparer le compose

Ouvrir `docker-compose.prod.yml` et remplacer **toutes** les valeurs marquées
`CHANGEZ_MOI` :

| Marqueur | Ce qu'on y met |
|---|---|
| `CHANGEZ_MOI_MOT_DE_PASSE_BASE` | Un mot de passe fort, **aux deux endroits** (service `db` et service `backend`) — ce sont les deux bouts de la même connexion |
| `CHANGEZ_MOI@votredomaine.ci` | L'adresse du premier administrateur |
| `CHANGEZ_MOI_MOT_DE_PASSE_ADMIN` | Son mot de passe, à changer depuis l'application à la première connexion |
| `CHANGEZ_MOI_IP_DU_VPS` | L'adresse publique du VPS, par exemple `http://168.231.x.x` |

Un mot de passe solide, depuis le VPS :

```bash
openssl rand -base64 24
```

> **À savoir** — Docker Manager garde le YAML collé, mots de passe compris. Si
> cela vous gêne, déployez par SSH : placez le compose et un fichier `.env` sur
> le VPS, et lancez `docker compose up -d` depuis le dossier. Les secrets
> restent alors dans un fichier que vous contrôlez.

---

## Étape 3 — Déployer

Dans Hostinger : **VPS** → **Docker Manager** → **Create project** → éditeur
YAML. Coller le contenu de `docker-compose.prod.yml`, nommer le projet `volta`,
déployer.

Le premier démarrage prend quelques minutes : téléchargement des images,
initialisation de PostgreSQL, création du schéma par Hibernate.

---

## Étape 4 — Vérifier

```bash
# Le backend répond
curl http://ADRESSE_DU_VPS/actuator/health
# → {"groups":["liveness","readiness"],"status":"UP"}

# L'API sert le catalogue public
curl http://ADRESSE_DU_VPS/api/categories

# Le site est servi, et une route profonde ne tombe pas en 404
curl -o /dev/null -w "%{http_code}\n" http://ADRESSE_DU_VPS/admin/demandes
# → 200

# La base n'est pas joignable depuis l'extérieur
nc -zv ADRESSE_DU_VPS 5432
# → connexion refusée
```

Puis, dans un navigateur : se connecter avec le compte administrateur, publier
un engin avec une photo, et vérifier que la photo s'affiche. C'est le test qui
couvre le relais `/uploads`.

---

## Étape 5 — Figer le schéma

Au premier démarrage, `DDL_AUTO` vaut `update` : la base arrive vide et le
projet n'embarque aucun outil de migration, Hibernate doit donc créer les
tables.

**Une fois le site vérifié**, repasser à `validate` dans le compose et
redéployer :

```yaml
DDL_AUTO: validate
```

Hibernate contrôlera alors que le schéma correspond aux entités, sans jamais le
modifier. Laisser `update` l'autoriserait à toucher la base à chaque
déploiement — y compris lors d'un déploiement raté.

Il faudra repasser à `update` le temps d'un démarrage à chaque fois qu'une
nouvelle version ajoute une colonne, puis revenir à `validate`.

---

## HTTPS

Impossible sans nom de domaine : aucune autorité ne délivre de certificat pour
une adresse IP nue. Le jour où le domaine est prêt :

1. Pointer un enregistrement A du domaine vers l'IP du VPS.
2. Ajouter un service Caddy devant nginx — il obtient et renouvelle le
   certificat tout seul :

```yaml
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    command: caddy reverse-proxy --from volta.ci --to web:80
    volumes:
      - caddy-data:/data
    networks:
      - volta
```

3. Retirer le bloc `ports:` du service `web` — Caddy devient la seule porte.
4. Mettre `VOLTA_CORS_ALLOWED_ORIGINS: https://volta.ci`.
5. Reconstruire l'image frontend n'est **pas** nécessaire : `VITE_API_URL` vaut
   `/api`, un chemin relatif, qui suit le domaine quel qu'il soit.

---

## Maintenance

### Sauvegarder

La base et les fichiers téléversés sont deux choses distinctes. Les deux
comptent.

```bash
# Base
docker exec volta-db pg_dump -U volta volta | gzip > volta-$(date +%F).sql.gz

# Fichiers (photos d'engins, pièces jointes d'inspection)
docker run --rm -v volta_volta-uploads:/data -v "$PWD":/sauvegarde alpine \
  tar czf /sauvegarde/uploads-$(date +%F).tar.gz -C /data .
```

Le nom du volume dépend du nom du projet Docker : `docker volume ls` le donne.

### Restaurer

```bash
gunzip -c volta-2026-10-12.sql.gz | docker exec -i volta-db psql -U volta -d volta
```

### Mettre à jour

Relancer le workflow « Images Docker » sur GitHub, puis sur le VPS :

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Dans Docker Manager, le bouton **Redeploy** fait la même chose.

### Lire les journaux

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f web
```

---

## Ce qui a été vérifié, et où

Toute la pile a été montée et éprouvée en local avant d'écrire ce document :
construction des deux images, schéma PostgreSQL créé de zéro, inscription,
signature de contrat, dépôt de pièces, téléversement d'une photo servie par
nginx, persistance après redémarrage complet, démarrage en `DDL_AUTO=validate`,
et absence de port publié pour la base.

**Ce qui n'a pas pu l'être ici**, et qu'il faut regarder sur place :

- le comportement sous la mémoire réelle du VPS ;
- la récupération des images depuis GHCR par le VPS ;
- HTTPS, qui demande un domaine ;
- la montée en charge et les temps de réponse depuis la Côte d'Ivoire.

---

## Si quelque chose ne va pas

**Le backend redémarre en boucle.** Presque toujours la mémoire : Spring Boot
est tué avant d'avoir fini de démarrer. `docker stats` pendant le démarrage le
montre. Augmenter la RAM du VPS, ou ajouter `JAVA_TOOL_OPTIONS: "-Xmx512m"` au
service `backend`.

**Les photos s'affichent cassées.** Le relais `/uploads` ne passe pas. Vérifier
que l'image frontend déployée est bien celle construite depuis ce dépôt :
`curl -I http://ADRESSE/uploads/equipment/` doit répondre autre chose qu'un 404
de nginx.

**« relation does not exist » dans les journaux.** Le schéma n'a pas été créé.
`DDL_AUTO` était probablement à `validate` au premier démarrage : le remettre à
`update`, redéployer, puis le repasser à `validate`.

**Mot de passe refusé pour l'administrateur.** L'amorçage ne joue que tant
qu'aucun administrateur n'existe. Si un compte a déjà été créé, changer
`VOLTA_ADMIN_PASSWORD` ne le modifie pas. Passer par la base :

```bash
docker exec -it volta-db psql -U volta -d volta -c \
  "SELECT id, email, role FROM app_users WHERE role = 'ADMIN';"
```
