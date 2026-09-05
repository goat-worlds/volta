# Construction et exécution du backend VOLTA.
#
# Deux étapes : la première compile avec Maven, la seconde ne garde que le JRE
# et le jar. L'image finale ne contient donc ni Maven, ni les sources, ni le
# cache de dépendances.

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Le manifeste est copié seul d'abord : tant qu'il ne change pas, la couche de
# dépendances est réutilisée et le build ne les retélécharge pas.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Un utilisateur sans privilège : un défaut applicatif ne doit pas donner root
# dans le conteneur.
RUN addgroup -S volta && adduser -S volta -G volta
COPY --from=build /build/target/*.jar app.jar
RUN chown volta:volta app.jar
USER volta

# Render, comme la plupart des hébergeurs, impose le port par la variable PORT.
# La valeur par défaut garde le comportement local inchangé.
ENV PORT=9000
EXPOSE 9000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
