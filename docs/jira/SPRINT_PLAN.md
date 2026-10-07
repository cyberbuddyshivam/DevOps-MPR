# FindIT — Agile Sprint Plan (Experiment 1)

This document formalizes the Agile delivery methodology using Scrum for the **FindIT** DevOps Mini-Project. The project lifecycle is organized into two distinct 2-week sprints balancing full-stack application development and enterprise DevOps automation.

---

## 1. Scrum Framework Overview

- **Project Key**: `FIND`
- **Methodology**: Scrum with 2-week Sprint cycles
- **Board Columns**: `To Do` ➔ `In Progress` ➔ `Code Review` ➔ `Testing` ➔ `Done`
- **Estimation Unit**: Story Points (Fibonacci scale: 1, 2, 3, 5, 8)
- **Velocity Target**: 18–26 Story Points / Sprint

### Definition of Ready (DoR)
A backlog item is ready for sprint inclusion when:
1. User story is clearly articulated with business rationale ("As a... I want to... So that...").
2. Acceptance criteria are unambiguous and testable.
3. Dependencies are identified and unblocked.
4. Estimated in Story Points by the team.

### Definition of Done (DoD)
A story is considered `Done` only when:
1. All acceptance criteria are met and verified.
2. Code is committed with Jira ticket key (`FIND-xx: <msg>`) on a dedicated feature branch.
3. Unit and API tests are written and passing.
4. Code passes ESLint without errors or warnings.
5. Peer review completed via GitHub Pull Request into `develop`.
6. Verified either locally or through automated CI pipeline.

---

## 2. Sprint 1: Core Application & Version Control Baseline

- **Sprint Goal**: Deliver a functional Lost & Found web portal with database persistence, item submission, and filtering, backed by a disciplined GitFlow version control structure.
- **Sprint Duration**: Sprint 1 (2 Weeks)
- **Total Story Points Committed**: 18 Points
- **Status**: Completed

### Sprint 1 Backlog Breakdown

| Issue Key | Type | Summary | Story Points | Assignee | Status |
|---|---|---|:---:|---|:---:|
| **FIND-06** | Task | Git Repository & Branching Workflow Setup | 3 | DevOps Engineer | **Done** |
| **FIND-01** | Story | Report Lost Item Module | 5 | Full-Stack Dev | **Done** |
| **FIND-02** | Story | Report Found Item Module | 5 | Full-Stack Dev | **Done** |
| **FIND-03** | Story | Search and Filter Items | 3 | Frontend Dev | **Done** |
| **FIND-04** | Story | View Item Details and Contact Info | 2 | Frontend Dev | **Done** |

### Detailed Acceptance Criteria & Deliverables

#### `FIND-06`: Git Repository & Branching Workflow Setup (3 SP)
- **Aim**: Establish reproducible GitFlow branching model and peer-review safeguards.
- **Acceptance Criteria**:
  - Root `.gitignore` prevents leaks of `node_modules`, `.env`, and build artifacts.
  - `main` protected for production; `develop` established for integration.
  - Branch naming convention documented (`feature/FIND-xx-<slug>`).
  - GitHub Pull Request template created at `.github/pull_request_template.md`.

#### `FIND-01`: Report Lost Item Module (5 SP)
- **Aim**: Allow campus students to report lost items with contact details.
- **Acceptance Criteria**:
  - REST endpoint `POST /api/items` with payload validation (`title`, `category`, `description`, `location`, `date`, `name`, `email`, `phone`).
  - Sets `type = 'LOST'` and `status = 'ACTIVE'`.
  - Responsive web form with instant validation feedback.
  - Returns `201 Created` with generated item record.

#### `FIND-02`: Report Found Item Module (5 SP)
- **Aim**: Allow campus finders to catalog found articles for owners.
- **Acceptance Criteria**:
  - Reusable submission interface configured for `type = 'FOUND'`.
  - Database persistence in PostgreSQL with foreign-key link to `users`.
  - Input sanitation prevents SQL injection and XSS.

#### `FIND-03`: Search and Filter Items (3 SP)
- **Aim**: Enable instant discovery of lost/found items through multi-dimensional filters.
- **Acceptance Criteria**:
  - `GET /api/items` supports query parameters: `q`, `category`, `location`, `type`, `date`.
  - Client-side responsive grid showing item cards with category badges and location tags.
  - Debounced search bar with zero-lag filter toggles.

#### `FIND-04`: View Item Details and Contact Info (2 SP)
- **Aim**: Provide item detail modal/page with safe contact information.
- **Acceptance Criteria**:
  - `GET /api/items/:id` returns comprehensive item metadata and reporter contact card.
  - Status indicator displays `ACTIVE`, `CLAIMED`, or `CLOSED`.

---

## 3. Sprint 2: Matching Engine & End-to-End DevOps Pipeline

- **Sprint Goal**: Implement rule-based matching intelligence, containerize all tiers, establish automated CI with GitHub Actions, and deploy through Ansible and Kubernetes with high availability.
- **Sprint Duration**: Sprint 2 (2 Weeks)
- **Total Story Points Committed**: 26 Points
- **Status**: Completed

### Sprint 2 Backlog Breakdown

| Issue Key | Type | Summary | Story Points | Assignee | Status |
|---|---|---|:---:|---|:---:|
| **FIND-05** | Story | Rule-Based Item Matching Engine | 5 | Backend Dev | **Done** |
| **FIND-07** | Task | Continuous Integration Pipeline with GitHub Actions | 5 | DevOps Engineer | **Done** |
| **FIND-08** | Task | Containerization with Multi-Stage Dockerfiles | 3 | DevOps Engineer | **Done** |
| **FIND-09** | Task | Multi-Service Orchestration with Docker Compose | 5 | DevOps Engineer | **Done** |
| **FIND-10** | Task | Host Provisioning and Configuration with Ansible | 5 | DevOps Engineer | **Done** |
| **FIND-11** | Task | Kubernetes Deployments and Probes | 5 | Cloud Engineer | **Done** |
| **FIND-12** | Task | Kubernetes Service Routing, Scaling & Self-Healing | 3 | Cloud Engineer | **Done** |

### Detailed Acceptance Criteria & Deliverables

#### `FIND-05`: Rule-Based Item Matching Engine (5 SP)
- **Aim**: Automatically detect potential matches between Lost and Found items.
- **Acceptance Criteria**:
  - Rule-based weighted scoring formula ($30\%$ Category, $30\%$ Title Jaccard, $25\%$ Location Jaccard, $15\%$ Description overlap).
  - Matches with score $> 60\%$ written to `matches` table with status `POTENTIAL`.
  - Item detail UI displays prominent "Possible Match" banner with percentage confidence and link to counterpart item.
  - 100% test coverage with Jest unit tests covering edge cases.

#### `FIND-07`: Continuous Integration Pipeline with GitHub Actions (5 SP)
- **Aim**: Automated quality gate on every commit and PR.
- **Acceptance Criteria**:
  - Workflow `.github/workflows/ci.yml` runs on push and PR to `main` and `develop`.
  - Matrix / jobs execute: checkout, Node 20 setup, npm cache, ESLint, Jest tests with PostgreSQL service container, frontend production build, and Docker image build test.
  - CI badge reflects real-time status in `README.md`.

#### `FIND-08`: Containerization with Multi-Stage Dockerfiles (3 SP)
- **Aim**: Build production-grade, secure container images.
- **Acceptance Criteria**:
  - `backend/Dockerfile` and `frontend/Dockerfile` use multi-stage builds (`node:20-alpine`).
  - Run as non-root user (`USER node`).
  - Embedded `HEALTHCHECK` instructions.
  - Images build without extraneous artifacts.

#### `FIND-09`: Multi-Service Orchestration with Docker Compose (5 SP)
- **Aim**: One-command reproducible local environment.
- **Acceptance Criteria**:
  - `docker/docker-compose.yml` launches `postgres`, `backend`, and `frontend`.
  - Configures `findit-network` and persistent named volume `findit-db-data`.
  - Enforces `condition: service_healthy` so backend awaits database readiness.
  - Mounts `database/init.sql` for first-boot schema creation.

#### `FIND-10`: Host Provisioning and Configuration with Ansible (5 SP)
- **Aim**: Declarative, idempotent server setup.
- **Acceptance Criteria**:
  - Modular roles `roles/docker` and `roles/app` in `ansible/`.
  - Installs Docker CE and Docker Compose plugin on target host.
  - Deploys application and starts services.
  - Re-running the playbook yields `changed=0` (idempotency demonstrated).

#### `FIND-11`: Kubernetes Deployments and Probes (5 SP)
- **Aim**: Production orchestration with resilient workloads.
- **Acceptance Criteria**:
  - Manifests in `k8s/`: `configmap.yaml`, `secret.yaml`, `postgres-pvc.yaml`, `postgres-deployment.yaml`, `backend-deployment.yaml` (2 replicas), `frontend-deployment.yaml`.
  - Configured liveness and readiness probes pointing to `/health`.
  - Resource limits and requests specified per pod.

#### `FIND-12`: Kubernetes Service Routing, Scaling & Self-Healing (3 SP)
- **Aim**: High-availability operations and resilience verification.
- **Acceptance Criteria**:
  - Services defined (`ClusterIP` for Postgres/Backend, `NodePort` for Frontend).
  - Demonstration: Horizontal scale from 2 to 3 replicas (`kubectl scale`).
  - Demonstration: Self-healing upon manual pod termination (`kubectl delete pod`).
  - Demonstration: Zero-downtime rolling update and rollout undo.

---

## 4. Sprint Velocity & Burndown Summary

```
Story Points Committed vs Completed:
+-----------+------------------+------------------+------------+
| Sprint    | Committed Points | Completed Points | Completion |
+-----------+------------------+------------------+------------+
| Sprint 1  | 18 SP            | 18 SP            | 100%       |
| Sprint 2  | 26 SP            | 26 SP            | 100%       |
| Total     | 44 SP            | 44 SP            | 100%       |
+-----------+------------------+------------------+------------+
```
