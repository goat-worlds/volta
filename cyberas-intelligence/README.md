# CYBERAS-INTELLIGENCE

## Projet d'Automatisation des Audits des SI

Plateforme d'audit intelligent basée sur Quarkus, avec support Kafka, PostgreSQL, JWT, OIDC, et monitoring Prometheus.

---

## 🚀 Démarrage rapide

### Mode développement
```shell
./mvnw quarkus:dev
```

Accédez à l'interface Dev UI : http://localhost:8080/q/dev/

### Compilation
```shell
./mvnw clean package
```

Exécution :
```shell
java -jar target/quarkus-app/quarkus-run.jar
```

### Build JAR Über
```shell
./mvnw package -Dquarkus.package.jar.type=uber-jar
java -jar target/*-runner.jar
```

### Exécutable natif
```shell
./mvnw package -Dnative
```

Ou avec conteneur (sans GraalVM) :
```shell
./mvnw package -Dnative -Dquarkus.native.container-build=true
./target/cyberas-audit-service-1.0.0-SNAPSHOT-runner
```

---

## 📋 Guides associés

### ORM & Persistance
- [Hibernate ORM with Panache](https://quarkus.io/guides/hibernate-orm-panache)
- [Hibernate Validator](https://quarkus.io/guides/validation)

### Messaging & Événements
- [Kafka Reactive Messaging](https://quarkus.io/guides/kafka-reactive-getting-started)
- [SmallRye Fault Tolerance](https://quarkus.io/guides/smallrye-fault-tolerance)

### Sécurité
- [OpenID Connect](https://quarkus.io/guides/security-openid-connect)
- [SmallRye JWT](https://quarkus.io/guides/security-jwt)

### Intégration & APIs
- [REST with Jackson](https://quarkus.io/guides/rest#json-serialisation)
- [OpenAPI & Swagger UI](https://quarkus.io/guides/openapi-swaggerui)

### Infrastructure
- [PostgreSQL JDBC](https://quarkus.io/guides/datasource)
- [Redis Client](https://quarkus.io/guides/redis)
- [SmallRye Health](https://quarkus.io/guides/smallrye-health)
- [Prometheus Metrics](https://quarkus.io/guides/micrometer)
- [Kubernetes](https://quarkus.io/guides/kubernetes)

---

## 🏗️ Architecture

### Stack technique
- **Framework** : Quarkus 3.38.1
- **Java** : 21 LTS
- **BD** : PostgreSQL
- **Messaging** : Apache Kafka
- **Authentification** : OIDC + JWT
- **Cache** : Redis
- **Monitoring** : Prometheus + Micrometer

### Composants clés
- `GreetingResource` - Endpoint REST de test
- `MyEntity` - Entité JPA avec Panache
- `MyLivenessCheck` - Health check liveness
- `MyMessagingApplication` - Consumer Kafka

---

## 📦 Endpoints disponibles

| Méthode | Path | Description |
|---------|------|-------------|
| GET | `/hello` | Test endpoint |
| GET | `/q/health` | Health check |
| GET | `/q/dev` | Dev UI |
| GET | `/q/openapi` | OpenAPI schema |
| GET | `/q/swagger-ui` | Swagger UI |

---

## 🐳 Docker

### Build & Run avec Docker
```bash
docker build -t cyberas-audit-service .
docker run -p 8080:8080 cyberas-audit-service
```

### Docker Compose (avec PostgreSQL & Kafka)
```bash
docker-compose up
```

---

## 📝 Configuration

Voir `src/main/resources/application.properties` pour :
- Configuration Kafka
- Datasource PostgreSQL
- OIDC & JWT
- Redis
- Logging

---

## ✅ Tests

Exécuter les tests :
```bash
./mvnw test
```

Tests d'intégration :
```bash
./mvnw verify
```

---

## 📄 License

Ce projet est sous licence propriétaire.
