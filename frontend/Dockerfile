FROM node:18-alpine AS builder

WORKDIR /app/frontend

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage - serve with lightweight server
FROM node:18-alpine

RUN npm install -g serve

WORKDIR /app/frontend

# Copy built app from builder
COPY --from=builder /app/frontend/dist ./dist

# Expose frontend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Serve production build
CMD ["serve", "-s", "dist", "-l", "3000"]
