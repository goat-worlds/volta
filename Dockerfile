# Construction et service du frontend VOLTA.
#
# Deux étapes : Node compile le site, nginx le sert. L'image finale ne contient
# ni Node, ni node_modules, ni les sources — une trentaine de mégaoctets au
# lieu de plusieurs centaines.
#
# Le backend a son propre Dockerfile dans backend/.

FROM node:22-alpine AS build
WORKDIR /build

# Les manifestes d'abord : tant qu'ils ne changent pas, la couche
# d'installation est réutilisée et npm ne retélécharge rien.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# L'adresse de l'API est lue à la CONSTRUCTION, pas à l'exécution : Vite la
# remplace dans le JavaScript produit. La changer après coup n'a aucun effet,
# il faut reconstruire l'image.
#
# « /api » est le bon défaut ici : nginx sert le site et relaie /api vers le
# backend sur la même origine. Une URL absolue ne sert que si le backend est
# hébergé ailleurs — et impose alors de régler CORS.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.27-alpine

# La configuration du site remplace celle d'exemple de l'image.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/volta.conf /etc/nginx/conf.d/volta.conf
COPY --from=build /build/dist /usr/share/nginx/html

EXPOSE 80

# wget est présent dans l'image alpine de nginx ; curl ne l'est pas.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/index.html || exit 1
