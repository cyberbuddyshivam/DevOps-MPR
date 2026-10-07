# FindIT — Multi-Service Deployment Guide (Experiment 6: Docker Compose)
## Jira Ticket: FIND-09 | Artifact: `docker/docker-compose.yml`, `docker-compose.yml`

---

## 1. Multi-Service Architecture Overview

FindIT orchestrates three microservices in an isolated Docker bridge network:

```
[ Host Browser / Evaluator ]
          │
          │ :3000 (HTTP)
          ▼
┌────────────────────────────────────────────────────────┐
│  Container: findit-frontend (Nginx 1.27 Alpine)        │
│  - Serves compiled React 18 SPA                        │
│  - Reverse-proxies /api and /health to backend:5000    │
│  - Healthcheck: wget http://localhost/nginx-health     │
└──────────────────────────┬─────────────────────────────┘
                           │ findit-network (bridge)
                           │ http://backend:5000
                           ▼
┌────────────────────────────────────────────────────────┐
│  Container: findit-backend (Node.js 20 Alpine)         │
│  - Express REST API & Rule-Based Matching Engine       │
│  - Non-root user 'node' (UID 1000)                     │
│  - Healthcheck: curl http://localhost:5000/health      │
└──────────────────────────┬─────────────────────────────┘
                           │ findit-network (bridge)
                           │ postgres:5432
                           ▼
┌────────────────────────────────────────────────────────┐
│  Container: findit-postgres (PostgreSQL 16 Alpine)     │
│  - Database: findit_db                                 │
│  - Schema & Seed data initialized from init.sql        │
│  - Storage: Named persistent volume 'findit-db-data'   │
│  - Healthcheck: pg_isready -U postgres -d findit_db    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Key Orchestration Features

### 2.1 Deterministic Startup Sequence (`depends_on` + `service_healthy`)
A common failure in multi-container setups is a "race condition": the backend container starts before PostgreSQL finishes initializing its socket, causing crash loops.
FindIT prevents this by combining `depends_on` with condition `service_healthy`:
```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy

frontend:
  depends_on:
    backend:
      condition: service_healthy
```
Startup sequence:
1. `findit-postgres` starts and initializes tables using `init.sql`.
2. Docker executes `pg_isready` health check every 10s.
3. Once postgres status transitions to `healthy`, `findit-backend` is started.
4. Docker executes `curl http://localhost:5000/health` every 15s.
5. Once backend status transitions to `healthy`, `findit-frontend` is started.

### 2.2 Network Isolation (`findit-network`)
All three containers join a private user-defined bridge network `findit-network`. Docker automatically provides DNS resolution using service names (`postgres`, `backend`, `frontend`). Outside containers cannot access internal communication channels.

### 2.3 Volume Persistence (`findit-db-data`)
Database files are written to the named Docker volume `findit-db-data`. Data persists across container restarts, stops, and updates. Even after running `docker compose down`, subsequent `docker compose up` retains all reported lost and found items.

---

## 3. Step-by-Step Execution & Verification Guide

### 3.1 Start All Services (Detached Mode)
```bash
# From workspace root:
docker compose up -d --build

# Or from docker/ directory:
docker compose -f docker/docker-compose.yml up -d --build
```

### 3.2 Verify Container Status and Health
```bash
docker compose ps
```
Expected output:
```
NAME              IMAGE                    COMMAND                  SERVICE    CREATED          STATUS                    PORTS
findit-backend    findit-backend:v1.0.0    "docker-entrypoint.s…"   backend    30 seconds ago   Up 30 seconds (healthy)   0.0.0.0:5000->5000/tcp
findit-frontend   findit-frontend:v1.0.0   "nginx -g 'daemon of…"   frontend   15 seconds ago   Up 15 seconds (healthy)   0.0.0.0:3000->80/tcp
findit-postgres   postgres:16-alpine       "docker-entrypoint.s…"   postgres   45 seconds ago   Up 45 seconds (healthy)   0.0.0.0:5432->5432/tcp
```

### 3.3 Verify Live Health Endpoints
```bash
# 1. Check Backend Health & Database Connectivity
curl -s http://localhost:5000/health
# Response:
# {"status":"UP","timestamp":"2026-10-07T...","uptime":35.2,"database":"connected","memory":{...}}

# 2. Check Frontend Nginx Health
curl -s http://localhost:3000/nginx-health
# Response: healthy

# 3. Check Items API through Frontend Reverse Proxy
curl -s http://localhost:3000/api/items | grep "success"
# Response contains: {"success":true,"count":6,"data":[...]}
```

### 3.4 Verify Data Persistence Across Restarts
```bash
# 1. Post a new item
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@college.edu","phone":"9876543210","title":"Titan Chronograph Watch","category":"Accessories","location":"Sports Complex","date":"2026-10-07","type":"LOST","description":"Silver wrist watch with black leather strap"}'

# 2. Stop and remove containers (WITHOUT -v flag)
docker compose down

# 3. Verify volume exists
docker volume ls | grep findit-db-data

# 4. Bring containers back up
docker compose up -d

# 5. Fetch items — the newly created item Alex's watch is still intact!
curl -s http://localhost:5000/api/items | grep "Titan Chronograph"
```

### 3.5 Graceful Shutdown & Teardown
```bash
# Stop containers preserving data volume:
docker compose down

# To completely wipe containers AND volumes:
docker compose down -v
```

---

## 4. Viva Voce Q&A — Experiment 6 (Docker Compose)

### Q1: What is Docker Compose and what problem does it solve in microservice architectures?
> **Answer**: Docker Compose is a declarative tool for defining and running multi-container Docker applications using a single YAML configuration. In a multi-service application like FindIT (PostgreSQL + Express + React/Nginx), starting each container with manual `docker run` commands requires coordinating environment variables, port mappings, network bridges, volume mounts, and container dependencies manually. Compose automates the entire lifecycle with single commands (`docker compose up -d`, `down`).

### Q2: Why is `depends_on: [postgres]` alone not sufficient, and why is `condition: service_healthy` necessary?
> **Answer**: By default, `depends_on` only checks that the dependency container has *started* (PID 1 is running). However, databases like PostgreSQL take several seconds to load configuration, bind ports, and execute startup migration scripts. An application starting immediately after PostgreSQL process creation encounters connection-refused errors. By configuring a `healthcheck` (`pg_isready`) and setting `condition: service_healthy`, Docker Compose waits until the database is actively ready to accept TCP connections before starting the backend.

### Q3: How do the containers communicate with each other inside Compose?
> **Answer**: They communicate through an isolated user-defined Docker bridge network (`findit-network`). Docker provides embedded DNS resolution: each container name or service name (e.g. `postgres`, `backend`) resolves to its container IP inside the bridge network. Therefore, the backend accesses PostgreSQL via `DB_HOST=postgres:5432`, and Nginx proxies to `http://backend:5000`.

### Q4: How is data persistence guaranteed across container rebuilds?
> **Answer**: Data persistence is achieved via Docker **named volumes** (`findit-db-data`). Unlike container layers which are ephemeral and destroyed when a container is stopped or removed, named volumes are managed by Docker on the host filesystem independently of the container lifecycle. Running `docker compose down` destroys containers but leaves the named volume intact.
