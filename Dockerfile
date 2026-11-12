# Multi-stage Dockerfile for TikTok LIVE 3D Bar

# --- Stage 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Configure npm network resilience
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for Vite build)
RUN npm install

# Copy application source code
COPY . .

# Build frontend static assets via Vite into /app/dist
RUN npm run build

# Prune devDependencies to keep only production dependencies
RUN npm prune --omit=dev && npm cache clean --force

# --- Stage 2: Production Runner Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests
COPY package*.json ./

# Copy production node_modules and built assets directly from builder (avoids network re-fetch in runner)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy backend server code and public assets
COPY server/ ./server/
COPY public/ ./public/

# Ensure music directory exists
RUN mkdir -p ./public/music

EXPOSE 3000

# Start unified Express + WebSocket broker server
CMD ["node", "server/server.js"]
