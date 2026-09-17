# BUILDER IMAGE 
FROM node:20-alpine AS builder 

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install

# stage 2 RUNNER IMAGE 
FROM node:20-alpine AS runner 

WORKDIR /app

# Copy node_modules correctly into ./node_modules with node user ownership
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 5173

# CMD runs at container startup, unlike RUN which executes during image build
CMD ["npm", "run", "dev", "--", "--host"]
