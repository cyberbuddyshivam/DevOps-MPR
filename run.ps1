<#
.SYNOPSIS
    FindIT — Windows PowerShell Automation Helper
    Provides single-command shortcuts for all development, testing, and DevOps workflows.

.PARAMETER Target
    The workflow target to execute:
    - install       : Install backend and frontend dependencies
    - test          : Run backend test suite (Jest)
    - lint          : Run ESLint
    - build         : Build frontend production bundle
    - dev-backend   : Start backend on port 5000
    - dev-frontend  : Start frontend on port 5173
    - compose-up    : Start multi-service Docker Compose stack
    - compose-down  : Stop Docker Compose stack
    - k8s-apply     : Deploy Kubernetes manifests
    - k8s-status    : Check Kubernetes pod and service status
#>

param (
    [Parameter(Position=0)]
    [ValidateSet("help", "install", "test", "lint", "build", "dev-backend", "dev-frontend", "compose-up", "compose-down", "k8s-apply", "k8s-status")]
    [string]$Target = "help"
)

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Show-Help {
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host " FindIT — College Lost & Found Management System (DevOps MPR)" -ForegroundColor Yellow
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host " Usage: .\run.ps1 [target]`n"
    Write-Host " Available Targets:"
    Write-Host "   install       : Install dependencies for backend and frontend" -ForegroundColor Green
    Write-Host "   test          : Run Jest unit & API tests (23 tests)" -ForegroundColor Green
    Write-Host "   lint          : Run ESLint static analysis" -ForegroundColor Green
    Write-Host "   build         : Build frontend production bundle with Vite" -ForegroundColor Green
    Write-Host "   dev-backend   : Run backend server in development mode (:5000)" -ForegroundColor Green
    Write-Host "   dev-frontend  : Run frontend React UI in dev mode (:5173)" -ForegroundColor Green
    Write-Host "   compose-up    : Launch PostgreSQL + Backend + Frontend with Compose" -ForegroundColor Green
    Write-Host "   compose-down  : Stop Compose stack" -ForegroundColor Green
    Write-Host "   k8s-apply     : Apply Kubernetes manifests to cluster" -ForegroundColor Green
    Write-Host "   k8s-status    : Check Kubernetes resources in 'findit' namespace" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Cyan
}

switch ($Target) {
    "help" {
        Show-Help
    }
    "install" {
        Write-Host "==> Installing backend dependencies..." -ForegroundColor Cyan
        Push-Location "$rootDir\backend"; npm install; Pop-Location
        Write-Host "==> Installing frontend dependencies..." -ForegroundColor Cyan
        Push-Location "$rootDir\frontend"; npm install; Pop-Location
    }
    "test" {
        Write-Host "==> Running backend test suite..." -ForegroundColor Cyan
        Push-Location "$rootDir\backend"; npm test; Pop-Location
    }
    "lint" {
        Write-Host "==> Linting backend..." -ForegroundColor Cyan
        Push-Location "$rootDir\backend"; npm run lint; Pop-Location
        Write-Host "==> Linting frontend..." -ForegroundColor Cyan
        Push-Location "$rootDir\frontend"; npm run lint; Pop-Location
    }
    "build" {
        Write-Host "==> Building frontend production bundle..." -ForegroundColor Cyan
        Push-Location "$rootDir\frontend"; npm run build; Pop-Location
    }
    "dev-backend" {
        Write-Host "==> Starting backend server on http://localhost:5000..." -ForegroundColor Cyan
        Push-Location "$rootDir\backend"; npm run dev; Pop-Location
    }
    "dev-frontend" {
        Write-Host "==> Starting frontend server on http://localhost:5173..." -ForegroundColor Cyan
        Push-Location "$rootDir\frontend"; npm run dev; Pop-Location
    }
    "compose-up" {
        Write-Host "==> Starting Docker Compose stack..." -ForegroundColor Cyan
        docker compose up -d --build
    }
    "compose-down" {
        Write-Host "==> Stopping Docker Compose stack..." -ForegroundColor Cyan
        docker compose down
    }
    "k8s-apply" {
        Write-Host "==> Applying Kubernetes manifests..." -ForegroundColor Cyan
        kubectl apply -k "$rootDir\k8s"
    }
    "k8s-status" {
        Write-Host "==> Checking Kubernetes resources..." -ForegroundColor Cyan
        kubectl get all,pvc,configmap,secret -n findit
    }
}
