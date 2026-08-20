# 🚀 Guide de Lancement - CYBERAS Intelligence

## Mode Développement (Sans Docker)

### Prérequis
- Node.js 20+ (pour le frontend)
- Java 21 (pour Quarkus)
- Maven 3.9+ (pour la compilation)

### Option 1 : Lancement en Parallèle (Recommandé)

#### Terminal 1 - Quarkus Backend
```bash
cd c:\Users\DELL PRECISION 5550\CYBERAS-MAIN
./mvnw quarkus:dev
```
Le backend sera accessible à : **http://localhost:8080**

#### Terminal 2 - React Frontend
```bash
cd c:\Users\DELL PRECISION 5550\CYBERAS-MAIN\frontend
npm install  # (première fois uniquement)
npm run dev
```
Le frontend sera accessible à : **http://localhost:5173**

### Option 2 : Build et Lancement Production

#### Frontend Build
```bash
cd frontend
npm run build
```
Cela génère le dist/ qui sera intégré dans Quarkus

#### Backend + Frontend Intégré
```bash
./mvnw package
java -jar target/quarkus-app/quarkus-run.jar
```
Accessible à : **http://localhost:8080**

### Option 3 : Docker Compose (Recommandé pour prod)
```bash
docker compose up --build
```

---

## 📱 Routes Disponibles

### Pages Marketing (Publiques)
- `/` - Landing page
- `/plateforme` - Plateforme
- `/solutions` - Solutions
- `/agents-ia` - Agents IA
- `/tarifs` - Tarification
- `/inscription` - Inscription (5 étapes)

### Application Auditeur
- `/app/auditeur` - Dashboard
- `/app/auditeur/missions` - Lister les missions
- `/app/auditeur/audit-iso27001` - **Audit ISO 27001** ✨

### Application RSSI
- `/app/rssi` - Dashboard RSSI
- `/app/rssi/risques` - Risques
- `/app/rssi/vulnerabilites` - Vulnérabilités
- `/app/rssi/assets` - Assets
- `/app/rssi/rapports` - Rapports

### Application Admin
- `/app/admin` - Dashboard Admin
- `/app/admin/utilisateurs` - Gestion utilisateurs
- `/app/admin/organisations` - Organisations
- `/app/admin/abonnements` - Abonnements
- `/app/admin/logs` - Logs

---

## 🔐 Audit ISO 27001

Une page d'audit complète avec :
- ✅ 118 contrôles ISO 27001:2022
- ✅ Évaluation du statut (Conforme / Non-conforme / Partiel / N/A)
- ✅ Éléments de preuve
- ✅ Observations
- ✅ Calculateur de conformité en temps réel
- ✅ Recherche et filtrage

Accès : `/app/auditeur/audit-iso27001`

---

## 🛠️ Développement Frontend

### Scripts disponibles
```bash
npm run dev      # Mode développement avec HMR
npm run build    # Build production
npm run preview  # Prévisualiser le build
npm run lint     # Linter le code
```

### Structure du Frontend
```
frontend/
├── public/
│   └── audit-iso27001.json    # Framework ISO 27001
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── marketing/         # Pages publiques
│   │   └── app/               # Pages application
│   │       ├── admin/
│   │       ├── auditeur/
│   │       │   └── ISO27001AuditPage.tsx
│   │       └── rssi/
│   ├── services/
│   │   └── auditService.ts    # API audit
│   ├── types/
│   │   └── audit.ts
│   └── App.tsx
├── vite.config.ts
├── package.json
└── tsconfig.json
```

---

## 📝 Notes

- **HMR (Hot Module Reload)** activé en dev pour le frontend
- **Dev UI Quarkus** accessible à `http://localhost:8080/q/dev/`
- **Swagger UI** accessible à `http://localhost:8080/q/swagger-ui/`
- **OpenAPI** accessible à `http://localhost:8080/q/openapi`

---

## 🐛 Troubleshooting

### Port déjà utilisé
```bash
# Changer le port Quarkus
./mvnw quarkus:dev -Dquarkus.http.port=8081

# Changer le port Vite (frontend)
npm run dev -- --port 5174
```

### Cache npm
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Réinitialiser Maven
```bash
./mvnw clean install
```

---

## 📞 Support

Pour toute question, consultez :
- Documentation Quarkus : https://quarkus.io/
- Documentation React : https://react.dev
- Documentation Vite : https://vitejs.dev

