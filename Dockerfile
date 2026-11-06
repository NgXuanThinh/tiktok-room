# Multi-stage Dockerfile for TikTok LIVE 3D Bar

# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for Vite build)
RUN npm install

# Copy application source code
COPY . .

# Build frontend static assets via Vite into /app/dist
RUN npm run build

# --- Stage 2: Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy backend server code, public assets, and built frontend distribution
COPY server/ ./server/
COPY public/ ./public/
COPY --from=builder /app/dist ./dist

# Ensure music directory exists
RUN mkdir -p ./public/music

EXPOSE 3000

# Start unified Express + WebSocket broker server
CMD ["node", "server/server.js"]
