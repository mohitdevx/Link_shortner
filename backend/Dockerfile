# ==========================================
# Stage 1: Dependencies & Build
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native packages (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

# Install pnpm 
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

# Copy package manifests
COPY package*.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy application source
COPY . .

# Switch to non-root node user for security
USER node

# Expose application port
EXPOSE 5000

# Health check using native Node.js fetch (Node 18+)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/health').then(r => (r.ok ? process.exit(0) : process.exit(1))).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"]
