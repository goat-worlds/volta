# syntax=docker/dockerfile:1

# ---- Étape 1 : build du frontend React (Vite) ----
FROM node:20-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Étape 2 : build du backend Quarkus (le dist frontend est copié dans META-INF/resources) ----
FROM maven:3.9-eclipse-temurin-21 AS backend-build
# Miroir Maven optionnel (utile si repo.maven.apache.org est limité) :
#   docker build --build-arg MAVEN_MIRROR=https://maven-central.storage-download.googleapis.com/maven2/ .
ARG MAVEN_MIRROR=
RUN if [ -n "$MAVEN_MIRROR" ]; then \
      mkdir -p /root/.m2 && \
      printf '<settings><mirrors><mirror><id>mirror</id><mirrorOf>central</mirrorOf><url>%s</url></mirror></mirrors></settings>' "$MAVEN_MIRROR" > /root/.m2/settings.xml; \
    fi
WORKDIR /build
COPY pom.xml ./
RUN mvn -q -DskipFrontend dependency:go-offline || true
COPY src ./src
COPY --from=frontend-build /build/frontend/dist ./src/main/resources/META-INF/resources
RUN mvn -q package -DskipTests -DskipFrontend

# ---- Étape 3 : image d'exécution ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /build/target/quarkus-app/lib/ ./lib/
COPY --from=backend-build /build/target/quarkus-app/*.jar ./
COPY --from=backend-build /build/target/quarkus-app/app/ ./app/
COPY --from=backend-build /build/target/quarkus-app/quarkus/ ./quarkus/
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]
