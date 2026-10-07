# FindIT CI Pipeline — Demo Guide (Experiment 3: GitHub Actions)
## Jira Ticket: FIND-07 | Artifact: `.github/workflows/ci.yml`

---

## Pipeline Architecture

```
[Git Push / Pull Request]
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│               GitHub Actions CI — FindIT Pipeline                    │
│                                                                      │
│  Job 1: backend-ci          Job 2: frontend-ci                      │
│  ┌──────────────────┐       ┌──────────────────┐                    │
│  │ ① checkout       │       │ ① checkout       │                    │
│  │ ② setup-node@v4  │       │ ② setup-node@v4  │ (run in parallel) │
│  │   (npm cache)    │       │   (npm cache)    │                    │
│  │ ③ npm ci         │       │ ③ npm ci         │                    │
│  │ ④ ESLint src/    │       │ ④ ESLint src/    │                    │
│  │ ⑤ Jest tests     │       │ ⑤ vite build     │                    │
│  │   (in-memory DB) │       │ ⑥ upload dist/   │                    │
│  │ ⑥ upload results │       └──────────────────┘                    │
│  └──────────────────┘                │                              │
│           │                         │                              │
│           └──────────┬──────────────┘                              │
│                      ▼                                              │
│           Job 3: docker-build-check  (runs only if Jobs 1+2 pass)  │
│           ┌──────────────────────────────┐                          │
│           │ ① checkout                  │                          │
│           │ ② setup buildx              │                          │
│           │ ③ Build backend:ci-{sha}    │ (no push, cache=gha)    │
│           │ ④ Build frontend:ci-{sha}   │ (no push, cache=gha)    │
│           └──────────────────────────────┘                          │
│                      │                                              │
│                      ▼                                              │
│           Job 4: ci-status                                          │
│           ┌─────────────────────┐                                   │
│           │ Print summary table │  Exit 1 if any job failed        │
│           └─────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

| Design Choice | Rationale |
|---|---|
| **In-memory DB fallback** | Tests run without Postgres service containers. `db.js` gracefully falls back; 23 tests pass in CI without any DB setup. |
| **`npm ci` not `npm install`** | `ci` uses `package-lock.json` exactly, ensuring reproducible, deterministic installs across runs. |
| **`cache: "npm"` on setup-node** | Caches the npm cache dir between runs. Dependencies are ~900MB; caching saves 60–90 seconds per run. |
| **`continue-on-error: true` on frontend lint** | Frontend linting is configured as advisory (warn level) in this academic scope, but lint still runs and output is visible. |
| **Docker jobs `needs: [backend-ci, frontend-ci]`** | Dockerfiles are only built after source is confirmed lint-clean and test-passing. Saves compute on broken pushes. |
| **`push: false` on docker/build-push-action** | Validates Dockerfile syntax and build process without registry credentials. Sufficient for Exp 3 + Exp 5 integration demo. |
| **GHA layer cache (`type=gha`)** | Docker layer cache stored in GitHub Actions cache. Speeds up subsequent image builds significantly. |
| **`if: always()` on ci-status** | Status summary runs even if previous jobs failed, providing a clean report card for the PR. |

---

## How to Trigger the Pipeline

### A. Triggering a Passing Run (Normal)
Push any code change to `develop` or `main`:
```bash
git add .
git commit -m "FIND-07: ci: add github actions CI pipeline"
git push origin develop
```
→ GitHub → Actions tab → "FindIT CI Pipeline" → See 4 green jobs.

### B. Triggering via Pull Request
```bash
git checkout -b feature/my-feature develop
# make some changes
git push origin feature/my-feature
# Open PR on GitHub targeting develop
# CI runs automatically on the PR
```

### C. Triggering a Deliberately Failing Run (Demo)
**Method 1 — Break a test:**
```bash
# Edit backend/tests/matching.test.js, change an expected value:
# expect(result.score).toBeGreaterThan(60)  →  expect(result.score).toBeGreaterThan(200)
git add backend/tests/matching.test.js
git commit -m "DEMO: deliberately break test to show CI failure detection"
git push origin develop
# Result: backend-ci job goes RED, docker-build-check is SKIPPED, ci-status exits 1
```

**Method 2 — Introduce a lint error:**
```bash
# Edit backend/src/app.js, add a line: const unused = 42;
git add backend/src/app.js
git commit -m "DEMO: introduce eslint violation for CI demo"
git push origin develop
# Result: backend-ci ESLint step fails (error exit code), job turns RED
```

**Method 3 — Break the frontend build:**
```bash
# Edit frontend/src/App.jsx, add an invalid import: import FakeModule from './nonexistent';
git add frontend/src/App.jsx
git commit -m "DEMO: break frontend build import for CI demo"
git push origin develop
# Result: frontend-ci build step fails with "cannot find module" error
```

**Recovering from a demo failure:**
```bash
git revert HEAD --no-edit
git push origin develop
# CI reruns and goes green
```

---

## Reading the CI Badge in README

The status badge links to the Actions tab and shows real-time build status:
```markdown
![CI](https://github.com/<YOUR_GITHUB_USERNAME>/FindIT/actions/workflows/ci.yml/badge.svg)
```

| Badge | Meaning |
|---|---|
| ![passing](https://img.shields.io/badge/build-passing-brightgreen) | All 4 jobs green; code ready to merge |
| ![failing](https://img.shields.io/badge/build-failing-red) | One or more jobs failed; PR should not merge |
| ![running](https://img.shields.io/badge/build-running-yellow) | Pipeline is currently executing |

---

## Screenshot Checklist for Viva (Exp 3)

| # | Screenshot to Capture | Where to Show |
|---|---|---|
| 1 | GitHub → Actions tab → workflow list showing "FindIT CI Pipeline" | Report §8 (Exp 3) |
| 2 | Green passing run — all 4 jobs expanded showing individual step durations | Report §8 |
| 3 | Red failing run — `backend-ci` job in red, `docker-build-check` skipped | Report §8 |
| 4 | Backend-ci job logs showing `23 passed` test results | Report §8 |
| 5 | Frontend-ci job showing Vite build output (`205 kB gzipped`) | Report §8 |
| 6 | Docker build check logs — `findit-backend:ci-xxx` and `findit-frontend:ci-xxx` built | Report §8 |
| 7 | CI status badge in README (green) | Report §8 |
| 8 | `.github/workflows/ci.yml` file shown in GitHub UI | Report §8 |

---

## Viva Q&A (Exp 3 Specific)

**Q: What is GitHub Actions?**
> A cloud-native CI/CD automation platform built into GitHub. Workflows are defined as YAML files in `.github/workflows/`. Each `push` or `pull_request` event triggers a run on GitHub-managed `ubuntu-latest` runner machines.

**Q: Why use `npm ci` instead of `npm install` in CI?**
> `npm ci` reads `package-lock.json` exclusively and installs the exact locked versions — no version resolution, no modification of lockfile. This ensures identical builds across developer machines and CI runners (deterministic).

**Q: Why don't you need a real PostgreSQL container in CI?**
> `db.js` has a resilient in-memory fallback: it attempts a Postgres connection on startup, and if it fails (as it will in CI), it silently switches to a built-in JavaScript array store. All 23 tests use the Supertest API layer which exercises the controllers, matching engine, and validation logic without touching a real database.

**Q: What is the purpose of Docker image build in CI?**
> It validates that the Dockerfiles are syntactically correct and that the build process succeeds with the committed source code. Catches issues like missing `COPY` paths, broken `RUN` commands, or incompatible base images — before they reach the deployment stage.
