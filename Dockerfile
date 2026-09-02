FROM node:20 AS builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY package.json package-lock.json ./
COPY patches/ patches/
RUN npm ci
COPY . .
RUN npm run build

FROM semtech/static-file-service:0.3.0

COPY ./proxy/file-upload.conf /config/file-upload.conf

COPY --from=builder /app/dist /data
