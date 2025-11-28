FROM node:23-alpine3.20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run prisma:generate
RUN npm run build

FROM alpine:3.20 AS runner
ARG app_user=node
ENV NODE_ENV=production

RUN apk add --no-cache nodejs \
	&& addgroup --system --gid 1001 "$app_user" \
	&& adduser --system --uid 1001 "$app_user" \
	&& mkdir -p /app \
	&& chown -R "$app_user":"$app_user" /app

WORKDIR /app
COPY --from=builder --chown="$app_user":"$app_user" /app/node_modules ./node_modules
COPY --from=builder --chown="$app_user":"$app_user" /app/package*.json ./
COPY --from=builder --chown="$app_user":"$app_user" /app/prisma ./prisma
COPY --from=builder --chown="$app_user":"$app_user" /app/dist ./dist

USER $app_user
EXPOSE 4000
ENV PORT=4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]