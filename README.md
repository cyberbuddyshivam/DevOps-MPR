# FindIT — College Lost & Found Management System
> **DevOps Mini-Project (MPR) — Sem 5**  
> An end-to-end cloud-native lost and found portal integrating academic Experiments 1 through 7 into a single production-grade delivery lifecycle.

[![CI Pipeline](https://github.com/cyberbuddyshivam/FindIT/actions/workflows/ci.yml/badge.svg)](https://github.com/cyberbuddyshivam/FindIT/actions/workflows/ci.yml)
![Node Version](https://img.shields.io/badge/Node.js-20.x%20LTS-green.svg)
![React Version](https://img.shields.io/badge/React-18.x-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED.svg)
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28%2B-326CE5.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📌 Project Overview

**FindIT** streamlines lost property resolution across college campuses. It combines a clean, accessible React frontend with an Express/PostgreSQL backend and a deterministic **Rule-Based Matching Engine** that automatically matches Lost and Found item reports when similarity exceeds **60%**.

The primary objective of this project is demonstrating genuine, visible DevOps engineering across all syllabus experiments:

| Exp # | Syllabus Experiment Title | Key Technology / Artifact | Status |
|:---:|---|---|:---:|
| **1** | Agile Lifecycle using Jira + DevOps | Atlassian Jira Cloud (`FIND-01`..`12`), 2 Sprints, 5-column board | ✅ Complete |
| **2** | Version Control using Git | GitFlow (`main`, `develop`, `feature/*`), PR template, Conventional Commits | ✅ Complete |
| **3** | Continuous Integration using GitHub Actions | `.github/workflows/ci.yml`, Lint, Unit/API tests, Docker build | ✅ Complete |
| **4** | Provisioning & Configuration using Ansible | `ansible/playbook.yml`, `roles/docker`, `roles/app`, Idempotence | ⏳ Phase 7 |
| **5** | Containerization using Docker | Multi-stage `Dockerfile` (Alpine, non-root `node`, Healthchecks) | ✅ Complete |
| **6** | Multi-Service Deployment using Docker Compose | `docker/docker-compose.yml`, health checks, network & volume isolation | ⏳ Phase 6 |
| **7** | Container Management using Kubernetes | Manifests in `k8s/`, Deployments, Probes, Scaling, Self-healing | ⏳ Phase 8 |

---

## 📂 Repository Layout

```
FindIT/
├── frontend/             # React + Vite + Tailwind CSS SPA
├── backend/              # Express REST API & Rule-Based Matching Engine
├── database/             # PostgreSQL init.sql schema & seed rows
├── docker/               # docker-compose.yml local orchestration
├── ansible/              # Playbooks, inventory & roles for server provisioning
├── k8s/                  # Kubernetes manifests (deployments, services, configs)
├── .github/              # GitHub Actions workflows & PR templates
├── docs/                 # Master Plan, Jira artifacts, Git workflow, Report
├── README.md             # Project documentation
└── .gitignore            # Git exclusion rules
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20 LTS, npm 10+
- Docker Desktop (for Compose/Kubernetes modes)
- PostgreSQL 16 (optional — in-memory fallback is built-in)

### 1. Backend
```bash
cd backend
npm install
npm test        # 23 tests — all should pass
npm run dev     # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:5173 (proxied to :5000)
```

### 3. Docker Compose (all services)
```bash
# requires: docker/docker-compose.yml and backend/Dockerfile + frontend/Dockerfile
docker compose -f docker/docker-compose.yml up --build
# → frontend: http://localhost:3000  backend: http://localhost:5000
```

### 4. Kubernetes (minikube/kind)
```bash
# See docs/CI_DEMO.md and k8s/ directory for full instructions
kubectl apply -f k8s/
kubectl get pods,svc -n findit
```

> **Detailed setup and all run modes:** See [`docs/PLAN.md`](docs/PLAN.md) and [`docs/CI_DEMO.md`](docs/CI_DEMO.md)
