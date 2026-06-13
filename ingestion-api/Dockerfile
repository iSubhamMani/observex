# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Compile TypeScript
RUN npm run build

# ---------- Production Stage ----------
FROM node:22-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]