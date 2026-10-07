# =============================================================================
# FindIT Backend — Multi-Stage Dockerfile (Experiment 5: Containerization)
# Jira Ticket: FIND-08
#
# Stage 1 (builder): Full node:20-alpine image, installs production deps only
# Stage 2 (runtime): Clean alpine image, copies only what's needed
#
# Security: Runs as non-root 'node' user (UID 1000)
# Size:     ~120MB final image (vs ~900MB if single-stage with dev tools)
# Health:   Built-in HEALTHCHECK against /health endpoint
# =============================================================================

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package files first (leverages Docker layer caching)
# If package.json doesn't change, this layer is cached and npm ci is skipped
COPY package.json package-lock.json ./

# Install ONLY production dependencies (no devDeps: jest, eslint, supertest)
RUN npm ci --omit=dev

# Copy application source code
COPY src/ ./src/

# ---- Stage 2: Runtime ----
FROM node:20-alpine AS runtime

# Install curl for HEALTHCHECK (small addition, stays Alpine)
RUN apk add --no-cache curl

# Create non-root user for security (node user already exists in node:alpine at UID 1000)
# Ensure /app is owned by node user
WORKDIR /app
RUN chown -R node:node /app

# Copy built artifacts from Stage 1 (node_modules + src)
COPY --from=builder --chown=node:node /app ./

# Switch to non-root user
USER node

# Expose application port
EXPOSE 5000

# Built-in Docker health check — used by Docker Compose and Kubernetes readiness probes
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the Node.js server
CMD ["node", "src/server.js"]
