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
- **Un accès SSH.** Il n'est pas optionnel : sur Ubuntu 26.04, hPanel ne prend
  pas en charge Docker Manager, et c'est de toute façon le seul moyen de
  sauvegarder et de diagnostiquer.

---

## Étape 1 — Publier les images

Rien n'est compilé sur le VPS. Construire un projet Spring Boot et un projet
Vite demanderait Maven, Node, et plusieurs minutes de calcul à chaque
déploiement sur une machine qui a mieux à faire. Les images sont construites
par la CI et seulement récupérées.

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

## Étape 2 — Déployer, en SSH

**Docker Manager ne convient pas ici.** hPanel ne le prend pas en charge sur
Ubuntu 26.04, même quand Docker est installé sur la machine. Le déploiement se
fait donc en ligne de commande, par SSH.

Ce n'est pas une rétrogradation. L'interface aurait gardé les mots de passe
dans un champ de formulaire ; en SSH ils vivent dans un fichier que vous seul
lisez.

### Fermer la machine avant de l'ouvrir

UFW est inactif sur une installation Hostinger par défaut, et aucun groupe de
pare-feu n'est associé au VPS. Rien ne filtre donc les ports que l'on
publierait par mégarde.

Compose ne publie que le 80, mais la première commande Docker lancée à la main
avec un `-p` de trop exposerait la base au monde entier. Le pare-feu rattrape
cette erreur-là ; sans lui, personne ne la rattrape.

```bash
ufw allow 22/tcp     # AVANT d'activer, sous peine de se verrouiller dehors
ufw allow 80/tcp
ufw --force enable
ufw status
```

Ne jamais ouvrir 5432 ni 9000 : ces services se parlent sur le réseau privé de
Docker, qui ne passe pas par le pare-feu de l'hôte.

### Déployer

```bash
ssh root@ADRESSE_DU_VPS

# Le dossier du déploiement. Rien d'autre n'y est nécessaire : les images sont
# déjà construites, il n'y a pas de sources à cloner.
mkdir -p /opt/volta && cd /opt/volta

curl -fsSLO https://raw.githubusercontent.com/goat-worlds/volta/main/docker-compose.prod.yml
curl -fsSL  https://raw.githubusercontent.com/goat-worlds/volta/main/.env.prod.example -o .env

# Un mot de passe que personne n'a choisi de tête
openssl rand -base64 24

nano .env          # remplir les quatre valeurs
chmod 600 .env     # lisible par le seul propriétaire

docker compose -f docker-compose.prod.yml up -d
```

Si une variable manque, Compose refuse de démarrer et **nomme laquelle** :

```
required variable VOLTA_ADMIN_PASSWORD is missing a value:
mot de passe administrateur absent du .env
```

C'est voulu. Une valeur oubliée arrête le déploiement au lieu de créer une base
dont le mot de passe est vide.

### Suivre le premier démarrage

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Attendre `Started VoltaBackendApplication`. Compter une à deux minutes : c'est
le temps que prend Hibernate pour créer les vingt-trois tables sur une base
vide.

## Étape 3 — Vérifier

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

## Étape 4 — Figer le schéma

Au premier démarrage, `DDL_AUTO` vaut `update` : la base arrive vide et le
projet n'embarque aucun outil de migration, Hibernate doit donc créer les
tables.

**Une fois le site vérifié**, mettre `validate` dans le `.env` et relancer :

```bash
sed -i 's/^DDL_AUTO=.*/DDL_AUTO=validate/' .env
docker compose -f docker-compose.prod.yml up -d
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
4. Mettre `SITE_ORIGIN=https://volta.ci` dans le `.env`.
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

Pour revenir en arrière, il faut que la version soit nommée : mettre
`VOLTA_VERSION=1.0.0` dans le `.env` et relancer. Avec `latest`, l'image d'hier
et celle d'aujourd'hui portent le même nom et plus rien ne dit laquelle tourne.

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
