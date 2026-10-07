# Git Branching Strategy & Version Control Workflow (Experiment 2)

This document formalizes the Version Control and GitFlow workflow implemented for **FindIT** (DevOps Mini-Project, Semester 5).

---

## 1. Branching Model (GitFlow Variant)

We adopt a disciplined GitFlow variant tailored for academic traceability and automated CI/CD gating:

```
[main] ──────────────────────────────────────────● [v1.0.0 Release]
          \                                     /
[develop]  ●─────────────────●─────────────────● [Integration Branch]
            \               / \               /
[features]   ●─────────────●   ●─────────────●
           feature/lost-item   feature/matching
             (FIND-01)           (FIND-05)
```

### Branch Roles & Policies

1. **`main`**:
   - Production-stable branch.
   - Code in `main` is always deployable and matches production releases.
   - Protected branch: direct commits are disallowed; merges arrive solely from `develop` via release merges.
   - Tagged with semantic version tags (`v1.0.0`).

2. **`develop`**:
   - Primary integration branch.
   - Aggregates completed and tested feature branches.
   - Tested by GitHub Actions CI pipeline on every push and pull request.

3. **`feature/*`**:
   - Individual feature and task branches created off `develop`.
   - Named according to syllabus module or Jira ticket:
     - `feature/lost-item` (`FIND-01`)
     - `feature/found-item` (`FIND-02`)
     - `feature/search` (`FIND-03`)
     - `feature/matching` (`FIND-05`)
     - `feature/ci` (`FIND-07`)
     - `feature/docker` (`FIND-08`)
     - `feature/compose` (`FIND-09`)
     - `feature/ansible` (`FIND-10`)
     - `feature/kubernetes` (`FIND-11`)

---

## 2. Commit Message Convention (Conventional Commits + Jira)

Every commit must be traceable to a Jira ticket key to satisfy Experiment 1 and Experiment 2 compliance:

```
FIND-<TICKET_ID>: <type>(<scope>): <concise message>

[Optional detailed body explaining rationale]
```

### Examples:
- `FIND-06: chore(git): initialize git repository, gitignore, and branching structure`
- `FIND-01: feat(items): implement lost item reporting form and API endpoint`
- `FIND-05: feat(matching): implement rule-based matching engine with 60% threshold`
- `FIND-07: ci(github-actions): configure automated lint and test workflow`
- `FIND-09: compose(docker): add multi-service orchestration with healthchecks`

---

## 3. Step-by-Step Command Playbook

### Step 1: Initializing and Branching Baseline
```powershell
# 1. Initialize repo
git init

# 2. Rename default branch to main
git branch -m main

# 3. Add baseline files and make first commit
git add .
git commit -m "FIND-06: chore(git): initialize repository baseline and project plan"

# 4. Create and checkout develop branch
git checkout -b develop
```

### Step 2: Developing a Feature
```powershell
# 1. Create a feature branch off develop
git checkout develop
git checkout -b feature/lost-item

# 2. Implement changes, test, and commit with Jira ticket key
git add frontend/ backend/
git commit -m "FIND-01: feat(items): add report lost item form and API route"

# 3. Merge back into develop with a merge commit (--no-ff preserves graph history)
git checkout develop
git merge --no-ff feature/lost-item -m "FIND-01: merge feature/lost-item into develop"
```

### Step 3: Preparing a Release to Production
```powershell
# Merge develop into main
git checkout main
git merge --no-ff develop -m "FIND-06: release(v1.0.0): merge develop into main"

# Tag release
git tag -a v1.0.0 -m "Release v1.0.0 - FindIT Complete System"
```

---

## 4. Connecting Local Repository to Remote GitHub

When ready to link to GitHub for **Experiment 3 (GitHub Actions CI)**:

```powershell
# 1. Create an empty repository named 'FindIT' on GitHub
# 2. Add remote origin:
git remote add origin https://github.com/cyberbuddyshivam/FindIT.git

# 3. Push all branches and tags to GitHub
git push -u origin main
git push -u origin develop
git push -u origin --all
git push --tags
```

---

## 5. Pull Request Guidelines

All team contributions are governed by `.github/pull_request_template.md`. Each pull request must:
1. Reference the active Jira Issue Key (`FIND-xx`).
2. Include a description of changes and test steps.
3. Pass automated CI checks (ESLint + Jest unit/API tests).
4. Receive approval prior to merging into `develop`.
