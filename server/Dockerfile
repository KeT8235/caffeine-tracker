# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/Dump ./Dump
COPY --from=builder /app/migrations ./migrations
EXPOSE 3002
CMD ["npm", "start"]