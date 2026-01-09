FROM node:23-alpine3.20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run prisma:generate
RUN npm run build

FROM node:23-alpine3.20 AS runner
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/dist ./dist

USER node
EXPOSE 4000
ENV PORT=4000
CMD ["node", "dist/index.js"]