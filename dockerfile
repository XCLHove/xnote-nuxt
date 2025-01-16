FROM node:20-alpine

WORKDIR /app

COPY ./.output /app

ENV API_SERVER_URL=https://api.xclhove.top/xnote

EXPOSE 3000

CMD [ "node", "./server/index.mjs" ]

LABEL org.opencontainers.image.source https://github.com/xclhove/xnote-nuxt