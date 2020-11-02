FROM alpine:3
LABEL maintainer="Leonhard Kuboschek <leo@jacobs-alumni.de>"

RUN apk update \
    && apk add --no-cache \
      chromium \
      nodejs \
      npm

ADD src /app/src
ADD package.json /app
ADD package-lock.json /app
ADD tsconfig.json /app

WORKDIR /app

RUN npm install && npm run build && npm install -g .
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT [ "pdf-render-server" ]