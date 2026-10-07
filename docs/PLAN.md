# FindIT — College Lost & Found Management System
## DevOps Mini-Project (MPR) — Phase 0: Master Plan & Specifications

---

## 1. Architecture Overview

FindIT is engineered as a cloud-native, three-tier application with an integrated DevOps lifecycle spanning Experiments 1 through 7. The system bridges daily college lost-and-found coordination with enterprise DevOps practices.

### 1.1 Application Layer Architecture

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                     |
|                      (Responsive UI, Tailwind CSS, Instant Filters)                   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                HTTP / JSON | Port 80 / 5173
                                            v
+---------------------------------------------------------------------------------------+
|                                FRONTEND TIER (Vite + React)                           |
|  - Report Lost Form                     - Report Found Form                           |
|  - Real-time Item Search & Filters     - Match Details & Possible Match Banners       |
+-------------------------------------------+-------------------------------------------+
                                            |
                         REST API Requests  | Reverse Proxy / Port 5000
                                            v
+---------------------------------------------------------------------------------------+
|                                 BACKEND TIER (Node.js + Express)                      |
|  +--------------------+  +----------------------+  +-------------------------------+  |
|  | Items Controller   |  | Matching Engine (Rule|  | Health Check Controller       |  |
|  | - POST /items      |  | - Category (30%)     |  | - GET /health                 |  |
|  | - GET /items       |  | - Title (30%)        |  |   (DB Ping, Memory, Uptime)   |  |
|  | - PATCH status     |  | - Location (25%)     |  +-------------------------------+  |
|  |                    |  | - Description (15%)  |                                     |
|  +--------------------+  +----------------------+                                     |
+-------------------------------------------+-------------------------------------------+
                                            |
                               pg (Pool)    | SQL Queries / Port 5432
                                            v
+---------------------------------------------------------------------------------------+
|                                DATABASE TIER (PostgreSQL 16)                          |
|  - users table (Contact & Author Info)                                                |
|  - items table (LOST / FOUND Records, Status, Metadata)                               |
|  - matches table (Calculated Match Pairs, Scores > 60%, Status)                       |
|  - Volume Mount: postgres_data (Data Persistence)                                     |
+---------------------------------------------------------------------------------------+
```

---

### 1.2 DevOps Lifecycle Architecture (Experiments 1–7)

```
[ Exp 1: Agile Planning ]
       │ Jira Cloud / Epics (FIND-01..12), User Stories & Sprints
       ▼
[ Exp 2: Git Version Control ]
       │ Feature Branches (feature/FIND-xx) -> develop -> main
       │ GitFlow, Conventional Commits, PR Templates
       ▼
[ Exp 3: GitHub Actions CI Pipeline ]
       │ Triggers: Push & Pull Request to main/develop
       │ Steps: Lint (ESLint) -> Unit & API Tests (Jest) -> Build Frontend -> Docker Build Test
       ▼
[ Exp 5: Docker Containerization ]
       │ Multi-stage Dockerfiles (Alpine/Slim base, Non-root user, Healthchecks)
       │ findit-frontend:latest | findit-backend:latest
       ▼
[ Exp 6: Multi-Service Docker Compose ]
       │ Local Orchestration: Frontend + Backend + PostgreSQL
       │ Isolated Bridge Network, Healthcheck Dependencies, Named Volumes
       ▼
[ Exp 4: Ansible Configuration & Provisioning ]
       │ Host Automation: Docker Engine installation, Directory setup, Compose Deployment
       │ Idempotent Playbooks (roles/docker, roles/app), Handlers, Variables
       ▼
[ Exp 7: Kubernetes Orchestration (k8s) ]
       │ Production-grade Cluster Deployment:
       │ - Namespaces, ConfigMaps, Secrets, PersistentVolumeClaims
       │ - Deployments (Backend 2 Replicas, Frontend, PostgreSQL)
       │ - Services (ClusterIP, NodePort)
       │ - High Availability: Rolling Updates, Self-Healing, Horizontal Scaling
```

---

## 2. Experiment-to-Feature Mapping Table

This table maps every academic syllabus experiment to its physical project artifacts and the exact viva demonstration scenario.

| Exp # | Syllabus Experiment Title | Associated Artifacts & Files | Concrete Viva Demonstration Scenario |
|---|---|---|---|
| **Exp 1** | Agile Lifecycle using Jira + DevOps | `docs/jira/jira_issues.csv`<br>`docs/jira/SPRINT_PLAN.md`<br>`docs/jira/BOARD_SETUP.md` | Show imported Jira Scrum board with 2 Sprints (Sprint 1: Core App, Sprint 2: DevOps Pipeline); demonstrate traceability from Jira ticket key `FIND-xx` to Git branch and commit messages. |
| **Exp 2** | Version Control using Git | `.gitignore`<br>`README.md`<br>`docs/GIT_WORKFLOW.md`<br>`.github/pull_request_template.md`<br>Git commit graph | Run `git log --graph --oneline --all` displaying feature branch creation, `develop` integration, and tag releases. Show PR template enforcement and Conventional Commit syntax. |
| **Exp 3** | Continuous Integration using GitHub Actions | `.github/workflows/ci.yml`<br>`README.md` (CI Badge)<br>Test suite in `backend/tests/` | Demonstrate GitHub Actions pipeline execution on commit/PR: Automated checkout, dependency cache, ESLint check, Jest test execution with PostgreSQL service, frontend Vite build, and Docker build check. Show simulated broken test causing red build and recovery. |
| **Exp 4** | Provisioning & Configuration using Ansible | `ansible/inventory`<br>`ansible/playbook.yml`<br>`ansible/roles/docker/`<br>`ansible/roles/app/` | Run `ansible-playbook --syntax-check` and `ansible-playbook -i inventory playbook.yml`. Demonstrate target host setup (Docker installation, user group setup, container launch). Run second time to prove **idempotency (`changed=0`)**. |
| **Exp 5** | Containerization using Docker | `frontend/Dockerfile`<br>`backend/Dockerfile`<br>`frontend/.dockerignore`<br>`backend/.dockerignore` | Inspect multi-stage Dockerfiles showing minimal image footprints (`node:20-alpine`), unprivileged user execution (`USER node`), and built-in `HEALTHCHECK`. Run `docker build`, `docker images`, and execute standalone container. |
| **Exp 6** | Multi-Service Deployment using Docker Compose | `docker/docker-compose.yml`<br>`database/init.sql`<br>`.env.example` | Execute `docker compose up --build -d`. Verify ordered startup using `condition: service_healthy` (Postgres -> Backend -> Frontend). Verify database persistence across `docker compose down` and restart. Inspect container networking with `docker compose ps`. |
| **Exp 7** | Container Management using Kubernetes | `k8s/configmap.yaml`<br>`k8s/secret.yaml`<br>`k8s/postgres-deployment.yaml`<br>`k8s/postgres-service.yaml`<br>`k8s/backend-deployment.yaml`<br>`k8s/backend-service.yaml`<br>`k8s/frontend-deployment.yaml`<br>`k8s/frontend-service.yaml` | Apply manifests using `kubectl apply -f k8s/`. Verify running pods/services. Demonstrate: (1) **Self-healing** by manually deleting a backend pod (`kubectl delete pod`) and watching ReplicaSet recreate it; (2) **Zero-downtime scaling** from 2 to 3 replicas (`kubectl scale`); (3) **Rolling update** and rollback (`kubectl rollout undo`). |

---

## 3. Technology Stack & Exact Versions

To guarantee zero environment drift, exact versions are locked:

| Layer / Tool | Technology / Package | Target Version | Justification |
|---|---|---|---|
| **Frontend Framework** | React + Vite | React 18.3.1 / Vite 5.4.0 | Fast HMR, lightweight production build, clean static SPA output suitable for Nginx/Alpine container. |
| **Styling** | Tailwind CSS | 3.4.10 | Utility-first CSS, responsive styling for campus portal, no runtime styling overhead. |
| **Icons & UI** | Lucide React | 0.441.0 | Clean, lightweight SVG icons for lost/found categories and actions. |
| **Backend Runtime** | Node.js (LTS) | 20.17.0 (Alpine in Docker) | Enterprise LTS, native fetch, high I/O throughput. |
| **Web Server** | Express | 4.19.2 | Industry-standard Node HTTP framework; clean routing, middleware, and error handling. |
| **Database Driver** | `pg` (node-postgres) | 8.12.0 | High-performance pooled PostgreSQL client with parameterized query safety. |
| **Database Engine** | PostgreSQL | 16.4 Alpine | ACID compliant, reliable relational storage, low memory Alpine container footprint. |
| **Testing Framework** | Jest + Supertest | Jest 29.7.0 / Supertest 7.0.0 | Unit tests for matching engine, integration tests for REST API endpoints. |
| **Linter** | ESLint | 8.57.0 | Static code analysis enforced in local git hooks and GitHub Actions CI. |
| **Container Engine** | Docker & Compose | Docker Engine 24.0+ / Compose v2.20+ | Multi-stage container builds and declarative multi-container orchestrations. |
| **Configuration** | Ansible Core | 2.15+ / 2.16+ | Agentless, YAML-based infrastructure automation and idempotent state management. |
| **Container Orchestration** | Kubernetes | 1.28+ (Minikube / Kind / Docker Desktop K8s) | Declarative deployments, replica sets, service discovery, config separation, self-healing. |
| **Agile Tool** | Jira Cloud CSV Format | Standard Jira Jira-Software CSV | Industry-standard ticket tracking, easily imported into free Jira Cloud or evaluated locally. |

---

## 4. Data Model & REST API Contract

### 4.1 Relational Schema (`database/init.sql`)

```sql
-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ITEMS TABLE
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('LOST', 'FOUND')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLAIMED', 'CLOSED')),
    image_url TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MATCHES TABLE
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    lost_item_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    found_item_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'POTENTIAL' CHECK (status IN ('POTENTIAL', 'CONFIRMED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_item_pair UNIQUE (lost_item_id, found_item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_type_status ON items(type, status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_matches_lost ON matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found ON matches(found_item_id);
```

### 4.2 REST API Contract

Base URL: `/api`

| Method | Endpoint | Description | Request Body | Response (Success) | Response (Error) |
|---|---|---|---|---|---|
| `POST` | `/api/items` | Create new Lost or Found item. Automatically triggers Matching Engine against opposite active items. | JSON with: `name`, `email`, `phone`, `title`, `category`, `description`, `location`, `date`, `type` (`LOST`\|`FOUND`), `image_url` (optional) | `201 Created`<br>`{ success: true, item: {...}, matchesCreated: N }` | `400 Bad Request`<br>`{ success: false, errors: [...] }` |
| `GET` | `/api/items` | Search & filter items. Query params: `q`, `category`, `location`, `type`, `status`, `date` | None | `200 OK`<br>`{ success: true, count: N, data: [...] }` | `500 Internal Server Error` |
| `GET` | `/api/items/:id` | Get item details by ID, including creator contact info. | None | `200 OK`<br>`{ success: true, item: {...} }` | `404 Not Found`<br>`{ success: false, message: "Item not found" }` |
| `PATCH` | `/api/items/:id/status` | Update item status (`ACTIVE`, `CLAIMED`, `CLOSED`). | JSON: `{ status: "CLAIMED" }` | `200 OK`<br>`{ success: true, item: {...} }` | `400 Bad Request` / `404 Not Found` |
| `GET` | `/api/items/:id/matches` | Get potential matches for an item where `match_score > 60`. Returns paired item data. | None | `200 OK`<br>`{ success: true, matches: [...] }` | `404 Not Found` |
| `GET` | `/health` | Kubernetes & Docker health check endpoint. Pings PostgreSQL pool and reports system metrics. | None | `200 OK`<br>`{ status: "UP", timestamp: "...", uptime: 124.5, database: "connected" }` | `503 Service Unavailable`<br>`{ status: "DOWN", database: "disconnected" }` |

---

## 5. Matching Algorithm & Worked Numeric Example

### 5.1 Algorithm Breakdown (Rule-Based, Non-ML)

When an item of type $T$ (`LOST` or `FOUND`) is inserted, it is compared against all active items of the opposite type $T_{opp}$. The match score $S \in [0, 100]$ is computed as:

$$S = S_{category} + S_{title} + S_{location} + S_{description}$$

| Factor | Weight | Scoring Rule |
|---|---|---|
| **Category Match** | **30%** | Exact case-insensitive string equality: if $cat_A == cat_B$, then **30.0**, else **0.0**. |
| **Title Similarity** | **30%** | Token Jaccard Similarity: $\frac{\|Tokens_A \cap Tokens_B\|}{\|Tokens_A \cup Tokens_B\|} \times 30.0$. |
| **Location Match** | **25%** | Token Jaccard Similarity on normalized location strings: $\frac{\|Loc_A \cap Loc_B\|}{\|Loc_A \cup Loc_B\|} \times 25.0$. If exact match: **25.0**. |
| **Description Keyword Overlap** | **15%** | Stopword-filtered keyword overlap: $\frac{\|Keywords_A \cap Keywords_B\|}{\min(\|Keywords_A\|, \|Keywords_B\|)} \times 15.0$. |

**Threshold Rule:** If $S \ge 60.0$, a match entry is recorded in the `matches` table with status `POTENTIAL`.

---

### 5.2 Worked Numeric Example

#### Item A (Reported LOST)
- **Title**: `"Black Dell Inspiron Laptop"`
- **Category**: `"Electronics"`
- **Location**: `"Central Library 2nd Floor"`
- **Description**: `"Has sticker of React on top lid, black charger inside blue sleeve"`

#### Item B (Reported FOUND)
- **Title**: `"Dell Laptop with charger"`
- **Category**: `"Electronics"`
- **Location**: `"Central Library Reading Hall"`
- **Description**: `"Black laptop found near desks, includes charger and sleeve"`

#### Step-by-Step Scoring:
1. **Category ($W = 30$)**:
   - Both categories are `"Electronics"`.
   - Score = $1.0 \times 30.0 =$ **30.0 points**.
2. **Title Similarity ($W = 30$)**:
   - Tokens A: `{"black", "dell", "inspiron", "laptop"}` (Size 4)
   - Tokens B: `{"dell", "laptop", "with", "charger"}` (Size 4)
   - Intersection: `{"dell", "laptop"}` (Size 2)
   - Union: `{"black", "dell", "inspiron", "laptop", "with", "charger"}` (Size 6)
   - Jaccard = $2 / 6 = 0.3333$
   - Score = $0.3333 \times 30.0 =$ **10.0 points**.
3. **Location Match ($W = 25$)**:
   - Tokens A: `{"central", "library", "2nd", "floor"}` (Size 4)
   - Tokens B: `{"central", "library", "reading", "hall"}` (Size 4)
   - Intersection: `{"central", "library"}` (Size 2)
   - Union: `{"central", "library", "2nd", "floor", "reading", "hall"}` (Size 6)
   - Jaccard = $2 / 6 = 0.3333$
   - Score = $0.3333 \times 25.0 =$ **8.33 points**.
4. **Description Keyword Overlap ($W = 15$)**:
   - Filter stopwords (`has`, `of`, `on`, `inside`, `with`, `and`, `near`, `found`):
   - Keywords A: `{"sticker", "react", "top", "lid", "black", "charger", "blue", "sleeve"}` (Size 8)
   - Keywords B: `{"black", "laptop", "desks", "includes", "charger", "sleeve"}` (Size 6)
   - Intersection: `{"black", "charger", "sleeve"}` (Size 3)
   - Minimum size = $\min(8, 6) = 6$
   - Overlap ratio = $3 / 6 = 0.50$
   - Score = $0.50 \times 15.0 =$ **7.5 points**.

#### Total Computed Score:
$$S = 30.0 + 10.0 + 8.33 + 7.50 = 55.83$$

Since $55.83 < 60.0$, this does **NOT** trigger a false-positive match.

#### Contrast: True Positive Case (Item C Reported FOUND)
- **Title**: `"Black Dell Laptop"`
- **Category**: `"Electronics"`
- **Location**: `"Central Library"`
- **Description**: `"Black Dell laptop with charger and blue sleeve"`
- **Calculations**:
  - Category: $30.0$
  - Title: Tokens A $\cap$ C = `{"black", "dell", "laptop"}` (3), Union (4) $\rightarrow (3/4) \times 30 = 22.5$
  - Location: Tokens A $\cap$ C = `{"central", "library"}` (2), Union (4) $\rightarrow (2/4) \times 25 = 12.5$
  - Description: Intersection `{"black", "charger", "blue", "sleeve"}` (4), Min (5) $\rightarrow (4/5) \times 15 = 12.0$
  - **Total Score**: $30.0 + 22.5 + 12.5 + 12.0 = \mathbf{77.0}$ ($\ge 60.0$) $\rightarrow$ **MATCH CREATED (Score: 77%)**.

---

## 6. Phase-by-Phase Task List & Acceptance Criteria

### Phase 0: Master Plan & Specification (Current Phase)
- **Goal**: Finalize architecture, experiment mapping, data contracts, and verification plans.
- **Acceptance Criteria**: Comprehensive `docs/PLAN.md` created; zero application code written before user approval.

### Phase 1: Exp 1 — Agile Lifecycle using Jira + DevOps
- **Goal**: Establish project management artifacts with full traceability.
- **Tasks**:
  1. Generate `docs/jira/jira_issues.csv` with Epics (FIND-EPIC-01: Application Development, FIND-EPIC-02: DevOps Pipeline) and Stories (FIND-01 through FIND-12) containing acceptance criteria and story points.
  2. Write `docs/jira/SPRINT_PLAN.md` detailing Sprint 1 (Core App) and Sprint 2 (DevOps Automation).
  3. Write `docs/jira/BOARD_SETUP.md` with column workflow instructions (`To Do` $\rightarrow$ `In Progress` $\rightarrow$ `Code Review` $\rightarrow$ `Testing` $\rightarrow$ `Done`) and viva screenshot checklist.
- **Acceptance Criteria**: Valid CSV format that can be directly imported into Jira Cloud; ticket keys `FIND-xx` ready for branch/commit naming.

### Phase 2: Exp 2 — Version Control using Git
- **Goal**: Initialize repository structure, branch taxonomy, and PR guidelines.
- **Tasks**:
  1. Initialize Git repository, configure `.gitignore` (node_modules, dist, .env, etc.).
  2. Create base branches: `main` and `develop`.
  3. Create feature branches for each story: `feature/lost-item`, `feature/found-item`, `feature/search`, `feature/matching`, `feature/ci`, `feature/docker`, `feature/compose`, `feature/ansible`, `feature/kubernetes`.
  4. Create `.github/pull_request_template.md` and `docs/GIT_WORKFLOW.md`.
- **Acceptance Criteria**: `git branch -a` shows all branches; `git log --graph` shows initial commits; PR template matches Jira ticket requirements.

### Phase 3: Application Build (Full Stack & Matching Engine)
- **Goal**: Complete operational application verified in local environment.
- **Tasks**:
  1. Database: Create `database/init.sql` with tables, indexes, and initial test seed data.
  2. Backend: Build Express server (`backend/src/`), controllers, routes, PostgreSQL pool, input validation, and `matching.service.js`.
  3. Backend Tests: Write Jest unit tests for `matching.service.js` and Supertest API tests for `/api/items` and `/health`.
  4. Frontend: Build React + Vite + Tailwind CSS UI (`frontend/src/`) featuring Report Lost, Report Found, Filterable Search, Item Detail view with Possible Match banner, and status badges.
- **Acceptance Criteria**: Backend tests pass (`npm test`); health check returns 200; reporting Lost and Found items triggers match score calculation and displays "Possible Match" banner on UI.

### Phase 4: Exp 3 — Continuous Integration using GitHub Actions
- **Goal**: Implement automated testing, linting, and container validation.
- **Tasks**:
  1. Create `.github/workflows/ci.yml`.
  2. Configure jobs: Dependency caching, ESLint linting, backend Jest testing against a PostgreSQL service container, frontend production build, and Docker build verification.
  3. Add status badge to `README.md`.
  4. Document passing and intentional failing test demo in `docs/CI_DEMO.md`.
- **Acceptance Criteria**: CI workflow syntax validates; local test runs mirror CI job commands; failing test triggers non-zero exit code as expected.

### Phase 5: Exp 5 — Containerization using Docker
- **Goal**: Create optimized, secure, multi-stage container images.
- **Tasks**:
  1. Create `backend/Dockerfile` using multi-stage build (`node:20-alpine`), unprivileged `USER node`, and `HEALTHCHECK`.
  2. Create `frontend/Dockerfile` using multi-stage build (build stage with Node, production stage serving static files with lightweight Nginx or Node server), with `HEALTHCHECK`.
  3. Add `.dockerignore` for backend and frontend.
- **Acceptance Criteria**: `docker build` succeeds for both images; images are inspectable with `docker images`; images launch and pass health checks.

### Phase 6: Exp 6 — Multi-Service Deployment using Docker Compose
- **Goal**: Declarative local orchestration with health-dependent startup.
- **Tasks**:
  1. Create `docker/docker-compose.yml` defining services: `postgres`, `backend`, `frontend`.
  2. Configure isolated bridge network `findit-network` and persistent named volume `findit-db-data`.
  3. Configure `healthcheck` on postgres and `depends_on: { postgres: { condition: service_healthy } }` on backend.
  4. Mount `database/init.sql` to `/docker-entrypoint-initdb.d/init.sql`.
- **Acceptance Criteria**: `docker compose up -d` brings up all 3 services in correct order; web UI accessible at `http://localhost:3000` (or `5173`); data persists across `docker compose down` and restart.

### Phase 7: Exp 4 — Provisioning & Configuration using Ansible
- **Goal**: Infrastructure automation for target host configuration and application deployment.
- **Tasks**:
  1. Create `ansible/inventory` (supporting localhost/WSL/remote target).
  2. Create `ansible/playbook.yml` utilizing modular roles.
  3. Role `roles/docker`: Installs Docker prerequisites, official GPG key, repository, Docker CE, Docker Compose plugin, and manages systemd service.
  4. Role `roles/app`: Sets up deployment directory `/opt/findit`, templates `.env`, copies compose files, and executes `docker compose up -d`.
  5. Validate with `ansible-playbook --syntax-check` and `--check`.
- **Acceptance Criteria**: Playbook passes syntax check; subsequent execution on target shows `changed=0` (idempotency verified).

### Phase 8: Exp 7 — Container Management using Kubernetes
- **Goal**: Deploy FindIT on Kubernetes with high availability and self-healing.
- **Tasks**:
  1. Manifests in `k8s/`:
     - `configmap.yaml` & `secret.yaml`: Decoupled configuration.
     - `postgres-pvc.yaml`, `postgres-deployment.yaml`, `postgres-service.yaml`: Stateful storage and ClusterIP.
     - `backend-deployment.yaml` (2 replicas, liveness/readiness probes on `/health`, resources requests/limits) & `backend-service.yaml`.
     - `frontend-deployment.yaml` & `frontend-service.yaml` (NodePort).
  2. Document Minikube/Kind local cluster commands.
  3. Scaling & self-healing verification scripts (`kubectl scale`, pod deletion recovery, rolling update demo).
- **Acceptance Criteria**: All pods transition to `Running`; service routing functions; deleting a backend pod results in automatic replacement within seconds.

### Phase 9: Integration, Automation & Polish
- **Goal**: Provide streamlined developer controls and clean-slate verification.
- **Tasks**:
  1. Create `Makefile` (and PowerShell helper `run.ps1`) supporting commands: `dev`, `test`, `docker-build`, `compose-up`, `compose-down`, `ansible-run`, `k8s-apply`.
  2. Complete `README.md` with architecture diagrams, quickstart guides, environment variable references, and troubleshooting.
  3. Perform clean-slate verification run.
- **Acceptance Criteria**: Any evaluator can clone the repo and run any of the 4 run modes (Local, Docker Compose, Ansible, Kubernetes) using only the README instructions.

### Phase 10: Final Comprehensive Report & Viva Preparation
- **Goal**: Produce academic-grade project report (`docs/REPORT.md`).
- **Tasks**:
  1. Generate all 16 required academic sections.
  2. Provide complete 25-question Viva Voce Q&A with deep DevOps justifications.
  3. Compile full Screenshot Checklist with exact execution commands.
  4. Compile Verification Status matrix distinguishing executed vs. manual steps.
- **Acceptance Criteria**: Comprehensive, submission-ready Markdown report that fulfills all college MPR evaluation guidelines.

---

## 7. Risks, Environmental Constraints & Mitigations

| Risk / Constraint | Impact | Mitigation Strategy |
|---|---|---|
| **Host OS is Windows** | Shell differences, carriage returns (`CRLF`), Unix path mismatches. | 1. Use cross-platform npm scripts and path utilities in Node.js.<br>2. Provide both `Makefile` and `run.ps1` for PowerShell.<br>3. Enforce LF in `.gitattributes`. |
| **Ansible on Windows** | Ansible controller requires Linux/POSIX environment. | 1. Provide commands to run Ansible via WSL2 (`wsl ansible-playbook ...`) or via an Ansible Docker container wrapper (`docker run -v ... cytopia/ansible`).<br>2. Provide a mock/syntax-check report and step-by-step target guide. |
| **Kubernetes Cluster Availability** | Student machine may not have active cloud or local K8s cluster running during testing. | 1. Manifests written strictly to standard Kubernetes v1.28+ specs compatible with Minikube, Kind, Docker Desktop K8s, and MicroK8s.<br>2. Provide automated launch script for Kind/Minikube and exact output transcript for viva verification. |
| **SaaS Tools (Jira)** | Jira Cloud cannot be fully executed or verified from an offline CLI. | 1. Provide an RFC-4180 compliant CSV file (`docs/jira/jira_issues.csv`) that can be imported directly into Jira Cloud in under 2 minutes.<br>2. Provide full board setup guide and visual ASCII layout of columns. |
| **PostgreSQL Port Collision (Port 5432)** | Local machine might already run a native PostgreSQL service. | 1. In Docker Compose, support configurable host port mapping (e.g. `5433:5432` or default `5432`).<br>2. Use in-memory SQLite / mock DB fallback for unit testing in CI if external DB is absent. |

---

## 8. Git Branching Strategy & Commit Message Convention

### 8.1 Branching Strategy (GitFlow Variant)

- `main`: Production-ready, stable releases. Tagged with semantic versions (`v1.0.0`).
- `develop`: Integration branch where completed features are merged before release.
- Feature branches branched off `develop`:
  - `feature/FIND-01-report-lost`
  - `feature/FIND-02-report-found`
  - `feature/FIND-03-search`
  - `feature/FIND-04-matching`
  - `feature/FIND-06-git-workflow`
  - `feature/FIND-07-ci-pipeline`
  - `feature/FIND-08-dockerfile`
  - `feature/FIND-09-docker-compose`
  - `feature/FIND-10-ansible`
  - `feature/FIND-11-kubernetes`

### 8.2 Commit Message Convention (Conventional Commits + Jira Keys)

Every commit must reference the corresponding Jira ticket key to maintain end-to-end traceability required for Experiment 1 and Experiment 2:

```
FIND-<TICKET_ID>: <type>(<scope>): <concise subject>

[optional body explaining motivation and changes]
```

#### Allowed Types:
- `feat`: New user-facing feature or API endpoint
- `fix`: Bug fix
- `test`: Adding or refactoring test suites
- `ci`: Changes to CI/CD workflows and configuration
- `docker`: Dockerfile and container changes
- `compose`: Docker Compose orchestration updates
- `ansible`: Provisioning playbooks and roles
- `k8s`: Kubernetes manifests and configurations
- `docs`: Documentation, Jira guides, reports

#### Examples:
- `FIND-01: feat(items): implement report lost item endpoint and validation`
- `FIND-04: feat(matching): create rule-based matching engine service with 60% threshold`
- `FIND-07: ci(github-actions): add automated lint and test pipeline with postgres service`
- `FIND-11: k8s(backend): add deployment with 2 replicas, probes, and clusterip service`

---

## 9. Verification & Submission Plan

Once approved:
1. Proceed strictly in the order: Phase 1 $\rightarrow$ Phase 2 $\rightarrow$ Phase 3 ... $\rightarrow$ Phase 10.
2. Execute actual commands at every phase where locally runnable.
3. Record real command outputs and commit to Git under Jira-tagged commit messages.
4. Provide the mandatory 5-line summary after every completed phase.
