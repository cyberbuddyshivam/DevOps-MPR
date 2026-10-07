# =============================================================================
# FindIT Frontend — Multi-Stage Dockerfile (Experiment 5: Containerization)
# Jira Ticket: FIND-08
#
# Stage 1 (builder): Node.js 20 Alpine — installs all deps and runs vite build
#                    Produces optimised static assets in /app/dist
# Stage 2 (runtime): Nginx Alpine — serves static assets on port 80
#                    Tiny final image (~25MB). No Node.js runtime needed at runtime.
#
# Reverse Proxy: Proxies /api/ and /health to backend:5000 in Docker network
# HEALTHCHECK:   Nginx responds to HTTP GET /nginx-health on port 80
# =============================================================================

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev: tailwindcss, vite, postcss)
RUN npm ci

# Copy source and config files
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Build the Vite production bundle — outputs to /app/dist
RUN npm run build

# ---- Stage 2: Runtime (Nginx) ----
FROM nginx:1.27-alpine AS runtime

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with reverse proxy & SPA fallback
COPY nginx.conf /etc/nginx/conf.d/findit.conf

# Expose port 80
EXPOSE 80

# Built-in Docker health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/nginx-health || exit 1

# Nginx runs as PID 1 in foreground
CMD ["nginx", "-g", "daemon off;"]
