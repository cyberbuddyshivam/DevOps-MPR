# =============================================================================
# FindIT — Unified Developer & DevOps Automation Makefile
# College DevOps Mini-Project (MPR) — Experiments 1 through 7
# =============================================================================

.DEFAULT_GOAL := help
SHELL := /bin/bash

.PHONY: help install dev test lint build docker-build compose-up compose-down compose-logs ansible-check ansible-run k8s-apply k8s-delete k8s-status clean

help: ## Display available targets
	@echo "======================================================================"
	@echo " FindIT — College Lost & Found Management System (DevOps MPR)"
	@echo "======================================================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo "======================================================================"

install: ## Install all dependencies for backend and frontend
	@echo "==> Installing backend dependencies..."
	cd backend && npm install
	@echo "==> Installing frontend dependencies..."
	cd frontend && npm install

dev-backend: ## Run backend in development mode (port 5000)
	cd backend && npm run dev

dev-frontend: ## Run frontend in development mode (port 5173)
	cd frontend && npm run dev

test: ## Run backend unit and integration test suite
	cd backend && npm test

lint: ## Run ESLint across backend and frontend
	cd backend && npm run lint
	cd frontend && npm run lint || true

build: ## Run frontend production Vite build
	cd frontend && npm run build

docker-build: ## Build multi-stage Docker images for backend and frontend
	@echo "==> Building backend Docker image..."
	docker build -t findit-backend:v1.0.0 -f backend/Dockerfile ./backend
	@echo "==> Building frontend Docker image..."
	docker build -t findit-frontend:v1.0.0 -f frontend/Dockerfile ./frontend

compose-up: ## Start PostgreSQL, Backend, and Frontend via Docker Compose
	docker compose up -d --build
	@echo "==> Stack online: Frontend at http://localhost:3000 | Backend at http://localhost:5000"

compose-down: ## Stop Docker Compose stack
	docker compose down

compose-logs: ## Tail logs from all Docker Compose services
	docker compose logs -f

ansible-check: ## Run syntax check on Ansible playbook
	ansible-playbook ansible/playbook.yml -i ansible/inventory/hosts.ini --syntax-check

ansible-run: ## Execute Ansible provisioning and deployment playbook
	ansible-playbook ansible/playbook.yml -i ansible/inventory/hosts.ini

k8s-apply: ## Deploy all Kubernetes manifests to 'findit' namespace
	kubectl apply -k k8s/
	@echo "==> Waiting for deployment rollout..."
	kubectl rollout status deployment/backend -n findit --timeout=90s
	kubectl rollout status deployment/frontend -n findit --timeout=90s

k8s-delete: ## Delete all FindIT resources from Kubernetes cluster
	kubectl delete -k k8s/

k8s-status: ## Check pods, services, and deployments in 'findit' namespace
	kubectl get all,pvc,configmap,secret -n findit

clean: ## Clean built assets and logs
	rm -rf frontend/dist backend/coverage
	@echo "==> Clean complete."
