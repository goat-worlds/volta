# VOLTA

Plateforme de gestion et location d'engins industriels en Côte d'Ivoire.

**La Volta = Référencer → Vérifier → Décider → Publier → Rechercher → Mettre en relation.**

- **Frontend** : React + TypeScript + Vite (racine du repo)
- **Backend** : Spring Boot 4 (Java 17) + MySQL dans `backend/`
- **Base de données** : MySQL 8.4 via Docker Compose (persistance dans le volume `volta-mysql-data`)

## Démarrage

```bash
# 1. Base de données MySQL (port 3306)
docker compose up -d

# 2. Backend (port 8080)
cd backend && ./mvnw spring-boot:run

# 3. Frontend (port 5173, proxy /api -> localhost:8080)
npm install && npm run dev
```

### Variables d'environnement backend

| Variable | Défaut |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/volta?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false` |
| `DB_USER` | `volta` |
| `DB_PASSWORD` | `volta` |
| `SESSION_DURATION_DAYS` | `7` |

## API REST (`/api`)

- Données : `users`, `categories`, `equipment`, `inspections`, `reports`, `rental-requests`, `notifications`
- Processus opérationnel : `equipment/{id}/submit|reject|request-correction|reference|publish|unpublish`, `inspections/{id}/start|checklist|report`, `rental-requests/{id}/accept|decline`
- Authentification (sessions persistées en base, header `X-Session-Token`) :
  - `POST /api/auth/register` — création de compte client
  - `POST /api/auth/login` — connexion (email + mot de passe)
  - `GET /api/auth/me` — utilisateur courant (prolonge la session)
  - `POST /api/auth/logout` — déconnexion
- Webhooks (notifications HTTP sortantes sur les événements métier) :
  - `GET/POST /api/webhooks`, `DELETE /api/webhooks/{id}`, `POST /api/webhooks/{id}/test`
  - Événements : `EQUIPMENT_SUBMITTED`, `INSPECTION_ASSIGNED`, `REPORT_SUBMITTED`, `EQUIPMENT_REJECTED`, `CORRECTIONS_REQUESTED`, `EQUIPMENT_REFERENCED`, `EQUIPMENT_PUBLISHED`, `EQUIPMENT_UNPUBLISHED`, `RENTAL_REQUEST_CREATED`, `RENTAL_REQUEST_ACCEPTED`, `RENTAL_REQUEST_DECLINED` (souscription à un événement précis ou `*`)

Le backend initialise automatiquement des données de démonstration au premier lancement.

### Comptes de démonstration

Mot de passe commun : `volta123`

| Rôle | Email |
|---|---|
| Admin | `admin@volta.ci` |
| Fournisseur | `contact@btpci.ci`, `contact@afriquemateriel.ci` |
| Équipe technique | `inspection@abc.ci` |
| Client | `jean@konan.ci` |
