# =============================================================================
# FindIT Frontend — Multi-Stage Dockerfile (Experiment 5: Containerization)
# Jira Ticket: FIND-08
#
# Stage 1 (builder): Node.js 20 Alpine — installs all deps and runs vite build
#                    Produces optimised static assets in /app/dist
# Stage 2 (runtime): Nginx Alpine — serves static assets on port 80
#                    Tiny final image (~25MB). No Node.js runtime needed at runtime.
#
# HEALTHCHECK: Nginx responds to HTTP GET / on port 80
# =============================================================================

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev: tailwindcss, vite, postcss)
RUN npm ci

# Copy source and config files
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY src/ ./src/
COPY public/ ./public/ 2>/dev/null || true

# Build the Vite production bundle — outputs to /app/dist
RUN npm run build

# ---- Stage 2: Runtime (Nginx) ----
FROM nginx:1.27-alpine AS runtime

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx configuration
COPY --from=builder /app/dist /usr/share/nginx/html

# Write nginx config: serve SPA with fallback to index.html for React Router
# Also proxies /api and /health to backend service
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Serve static assets with cache headers\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    # React SPA fallback — all unknown routes return index.html\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Health check endpoint for the nginx container itself\n\
    location /nginx-health {\n\
        access_log off;\n\
        return 200 "healthy\\n";\n\
        add_header Content-Type text/plain;\n\
    }\n\
}\n' > /etc/nginx/conf.d/findit.conf

# Expose port 80
EXPOSE 80

# Built-in Docker health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/nginx-health || exit 1

# Nginx runs as PID 1 in foreground
CMD ["nginx", "-g", "daemon off;"]
