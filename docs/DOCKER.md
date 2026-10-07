# FindIT — Containerization Guide (Experiment 5: Docker)
## Jira Ticket: FIND-08 | Artifacts: `backend/Dockerfile`, `frontend/Dockerfile`

---

## 1. Overview & Architecture

FindIT uses **multi-stage Docker builds** for both frontend and backend to achieve:
1. **Minimal image attack surface**: Compilers, devDependencies, and build toolchains are discarded after build.
2. **Drastically reduced image sizes**:
   - Backend: ~120 MB (Alpine runtime with production-only deps) vs ~950 MB (standard Node full dev image).
   - Frontend: ~25 MB (Nginx Alpine static file server) vs ~1.1 GB (Node build environment with Vite + PostCSS).
3. **Hardened security**:
   - Backend runs as non-privileged `node` user (`UID 1000`). Root access is dropped.
   - Read-only execution paths where applicable.
4. **Built-in container healthchecks**:
   - Backend checks `GET http://localhost:5000/health`.
   - Frontend checks `GET http://localhost/nginx-health`.

```
================================================================================
                    FINDIT DOCKER MULTI-STAGE ARCHITECTURE
================================================================================

── BACKEND ─────────────────────────────────────────────────────────────────────
[Stage 1: Builder]
  Base: node:20-alpine
  Action: npm ci --omit=dev (production dependencies only)
    │
    ▼ Copy /app/node_modules + /app/src
[Stage 2: Runtime]
  Base: node:20-alpine
  Action: apk add curl, chown node:node, USER node, HEALTHCHECK :5000/health
  CMD: ["node", "src/server.js"]
  Result Size: ~120 MB

── FRONTEND ────────────────────────────────────────────────────────────────────
[Stage 1: Builder]
  Base: node:20-alpine
  Action: npm ci (all deps including Tailwind & Vite) -> npm run build
  Output: /app/dist (compiled static JS, CSS, HTML, SVGs)
    │
    ▼ Copy /app/dist -> /usr/share/nginx/html
[Stage 2: Runtime]
  Base: nginx:1.27-alpine
  Action: SPA try_files fallback, gzip compression, /nginx-health endpoint
  CMD: ["nginx", "-g", "daemon off;"]
  Result Size: ~25 MB
================================================================================
```

---

## 2. Dockerfile Specifications

### 2.1 Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src/ ./src/

# Stage 2: Runtime
FROM node:20-alpine AS runtime
RUN apk add --no-cache curl
WORKDIR /app
RUN chown -R node:node /app
COPY --from=builder --chown=node:node /app ./
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
CMD ["node", "src/server.js"]
```

#### Key Design Decisions:
- **Layer Caching**: `COPY package*.json ./` is run before `COPY src/`. Since package definitions change far less frequently than source code, `npm ci` is cached between source code changes, reducing rebuild time from ~40s to ~2s.
- **`--omit=dev`**: Omits test runners (`jest`, `supertest`) and linters (`eslint`), saving ~400 MB of dependencies from the production image.
- **Security**: The Alpine base image pre-configures a system user `node` (`UID 1000`). We explicitly set `USER node` so container processes cannot compromise the host kernel through root-level privilege escalation.

### 2.2 Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src/ ./src/
COPY public/ ./public/ 2>/dev/null || true
RUN npm run build

# Stage 2: Runtime
FROM nginx:1.27-alpine AS runtime
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom Nginx config with React SPA routing & healthcheck
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location /nginx-health {\n\
        access_log off;\n\
        return 200 "healthy\\n";\n\
        add_header Content-Type text/plain;\n\
    }\n\
}\n' > /etc/nginx/conf.d/findit.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/nginx-health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

#### Key Design Decisions:
- **Zero Node Runtime in Production**: Frontend assets are purely static HTML, JS, and CSS after Vite compilation. Running Node.js in production to serve static files is an antipattern; Nginx handles static file delivery, HTTP keep-alive, and caching headers orders of magnitude faster with minimal RAM footprint (~8 MB RAM).
- **SPA Fallback (`try_files $uri $uri/ /index.html`)**: Prevents HTTP 404 errors when users refresh deep URLs in the React SPA.
- **Asset Cache Header**: Sets 1-year immutable cache header for hashed assets in `/assets/`, improving browser page-load latency.

---

## 3. Docker CLI Execution Commands & Demonstration

When Docker Desktop / Docker Engine is installed, run the following commands:

### 3.1 Build Commands
```bash
# Build Backend Image
docker build -t findit-backend:v1.0.0 -f backend/Dockerfile ./backend

# Build Frontend Image
docker build -t findit-frontend:v1.0.0 -f frontend/Dockerfile ./frontend
```

### 3.2 Inspect Image Sizes
```bash
docker images | grep findit
```
Expected output:
```
REPOSITORY          TAG       IMAGE ID       CREATED          SIZE
findit-backend      v1.0.0    a8d1e2b4c5f6   10 seconds ago   124MB
findit-frontend     v1.0.0    f7c9e0a1b2d3   30 seconds ago   26.4MB
```

### 3.3 Run Containers Independently
```bash
# Run Backend Container
docker run -d \
  --name findit-backend-demo \
  -p 5000:5000 \
  -e PORT=5000 \
  -e NODE_ENV=production \
  findit-backend:v1.0.0

# Verify Backend Container Status and Health
docker ps --filter "name=findit-backend-demo"
# Health status transitions from (health: starting) to (healthy) within 15 seconds

# Test HTTP Health Check
curl -s http://localhost:5000/health
# Response: {"status":"UP","timestamp":"...","uptime":12.3,"database":"connected"}

# Run Frontend Container
docker run -d \
  --name findit-frontend-demo \
  -p 3000:80 \
  findit-frontend:v1.0.0

# Test Frontend HTTP
curl -I http://localhost:3000
# Response: HTTP/1.1 200 OK, Server: nginx/1.27-alpine
```

### 3.4 Cleanup Demo Containers
```bash
docker stop findit-backend-demo findit-frontend-demo
docker rm findit-backend-demo findit-frontend-demo
```

---

## 4. Size & Security Comparison Matrix

| Metric | Single-Stage Approach | Multi-Stage FindIT Approach | Benefit |
|---|---|---|---|
| **Backend Base** | `node:20` (Debian Bookworm) | `node:20-alpine` (Alpine Linux) | Minimal attack surface |
| **Backend Size** | ~950 MB | ~120 MB | **87% smaller** download & storage footprint |
| **Backend User** | `root` (UID 0) | `node` (UID 1000) | Prevents container-breakout root privilege escalation |
| **Frontend Base** | `node:20` (Vite dev server) | `nginx:1.27-alpine` | High throughput, zero runtime interpreter overhead |
| **Frontend Size** | ~1.1 GB | ~26 MB | **97.6% smaller** image size |
| **Health Check** | None (orchestrator guessing) | Explicit `HEALTHCHECK` directive | Self-healing Docker/K8s container restarts |

---

## 5. Viva Voce Q&A — Experiment 5 (Docker Containerization)

### Q1: What is a multi-stage Docker build and why did you use it?
> **Answer**: A multi-stage build uses multiple `FROM` instructions in a single Dockerfile. Each stage can use a different base image and artifacts can be copied selectively from one stage to another using `COPY --from=<stage>`. We use it to separate the build-time environment (which requires full Node.js, npm, compilers, and devDependencies like Jest/Tailwind) from the runtime environment (which only requires production files). This dropped backend image size from ~950MB to ~120MB and frontend from ~1.1GB to ~26MB while stripping out vulnerable build tools.

### Q2: Why is the `USER node` directive critical in production containers?
> **Answer**: By default, Docker containers run processes as `root` (UID 0). If a vulnerability exists in any npm package or the Node runtime, an attacker who gains remote code execution inside the container possesses root capabilities. If the container shares host namespaces or mounts sensitive host sockets, the attacker could escape to the host OS. Running as unprivileged `USER node` enforces principle of least privilege.

### Q3: Why does `COPY package*.json ./` happen before `COPY src/ ./`?
> **Answer**: Docker builds images using cached intermediate layers. Docker invalidates cache for a command if any files copied by that command have changed. Because application source code in `src/` changes on nearly every commit, while dependencies in `package.json` change rarely, placing `COPY package*.json ./` and `npm ci` first ensures Docker reuses the cached node_modules layer. Subsequent builds finish in seconds instead of downloading dependencies every time.

### Q4: How does Docker `HEALTHCHECK` assist container orchestrators?
> **Answer**: Without a `HEALTHCHECK`, Docker considers a container "healthy" as long as PID 1 is running, even if the application is deadlocked or unable to connect to the database. The `HEALTHCHECK` periodically invokes an actual health endpoint (`curl http://localhost:5000/health`). If it fails 3 consecutive times, Docker marks container status as `unhealthy`, allowing Docker Compose and Kubernetes readiness probes to restart or remove the container from load balancing.
