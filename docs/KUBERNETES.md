# FindIT — Container Management Guide (Experiment 7: Kubernetes)
## Jira Ticket: FIND-11 | Artifacts: `k8s/*.yaml`, `k8s/kustomization.yaml`

---

## 1. Kubernetes Cluster Topology & Architecture

FindIT deploys into a dedicated Kubernetes namespace `findit` with separated concerns:

```
[ Outside Traffic / Evaluator / Ingress ]
                   │
                   │ NodePort: 30080 (HTTP)
                   ▼
┌────────────────────────────────────────────────────────┐
│  frontend-service (NodePort: 30080 -> 80)              │
└──────────────────────────┬─────────────────────────────┘
                           │ Load Balances across pods
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│ frontend-pod-1   │              │ frontend-pod-2   │
│ Nginx Static SPA │              │ Nginx Static SPA │
└─────────┬────────┘              └────────┬─────────┘
          │                                │
          └────────────────┬───────────────┘
                           │ Proxies /api and /health to backend-service:5000
                           ▼
┌────────────────────────────────────────────────────────┐
│  backend-service (ClusterIP: 5000)                     │
└──────────────────────────┬─────────────────────────────┘
                           │ Round-Robin Load Balancing
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│ backend-pod-1    │              │ backend-pod-2    │
│ Express API      │              │ Express API      │
└─────────┬────────┘              └────────┬─────────┘
          │                                │
          └────────────────┬───────────────┘
                           │ TCP postgres-service:5432
                           ▼
┌────────────────────────────────────────────────────────┐
│  postgres-service (ClusterIP: 5432)                    │
└──────────────────────────┬─────────────────────────────┘
                           │ Single instance Stateful Pod
                           ▼
┌────────────────────────────────────────────────────────┐
│  postgres-pod-1 (PostgreSQL 16)                        │
│  - PersistentVolumeClaim: postgres-pvc (1 Gi)          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Manifest Breakdown & Design Decisions

### 2.1 Namespace Isolation (`k8s/namespace.yaml`)
All resources are scoped within the `findit` namespace. Prevents naming collisions with `default` or `kube-system` resources.

### 2.2 Decoupled Configuration (`k8s/configmap.yaml` & `k8s/secret.yaml`)
- **12-Factor App Compliance**: Application code reads parameters from environment variables injected by Kubernetes.
- `ConfigMap` manages operational parameters (`PORT`, `DB_HOST`, `DB_PORT`).
- `Secret` manages database passwords (`POSTGRES_PASSWORD`).

### 2.3 Stateful Persistence (`k8s/postgres-pvc.yaml`)
PostgreSQL claims 1Gi storage via standard CSI/hostpath storage. Storage survives pod recreation or rescheduling to different nodes.

### 2.4 High Availability & Self-Healing Deployments
- `backend`: Replicas = 2. If one pod crashes, traffic is instantly directed to the healthy replica while the ReplicaSet controller replaces the failed pod.
- `frontend`: Replicas = 2. High availability for static file delivery.

### 2.5 Health Probes (Liveness & Readiness)
- **Liveness Probe**: `GET /health` every 15s. If the Node process deadlocks or terminates, kubelet kills the container and invokes restart policy.
- **Readiness Probe**: `GET /health` every 5s. Prevents routing incoming user traffic to a pod until its database pool is completely established and ready.

### 2.6 Resource Quotas (Requests & Limits)
- Backend: Requests `100m` CPU / `128Mi` RAM; Limits `500m` CPU / `384Mi` RAM.
- Prevents rogue memory leaks from starving other cluster workloads (Noisy Neighbor problem).

---

## 3. Step-by-Step Cluster Execution Commands

### 3.1 Local Cluster Setup (Minikube / Kind)
```bash
# Option A: Start Minikube
minikube start --driver=docker --cpus=2 --memory=3072

# Option B: Create Kind Cluster
kind create cluster --name findit-cluster
```

### 3.2 Deploy All FindIT Manifests (Single Command)
```bash
# Using Kustomize:
kubectl apply -k k8s/

# Or using plain kubectl apply:
kubectl apply -f k8s/
```

### 3.3 Verify Cluster Resources
```bash
# Check all resources in findit namespace
kubectl get all,pvc,configmap,secret -n findit
```
Expected output:
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/backend-7c98fdb57d-4m2p9    1/1     Running   0          45s
pod/backend-7c98fdb57d-xk91b    1/1     Running   0          45s
pod/frontend-5d8f6d7b4-82xln    1/1     Running   0          45s
pod/frontend-5d8f6d7b4-pt9v2    1/1     Running   0          45s
pod/postgres-67b95f98cf-m4k82   1/1     Running   0          45s

NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/backend-service    ClusterIP   10.96.142.11     <none>        5000/TCP       45s
service/frontend-service   NodePort    10.96.220.84     <none>        80:30080/TCP   45s
service/postgres-service   ClusterIP   10.96.88.204     <none>        5432/TCP       45s

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend    2/2     2            2           45s
deployment.apps/frontend   2/2     2            2           45s
deployment.apps/postgres   1/1     1            1           45s
```

### 3.4 Access Application
```bash
# If using Minikube:
minikube service frontend-service -n findit

# If using Kind / Docker Desktop:
# Open http://localhost:30080 in your browser
```

---

## 4. Viva Demonstrations: Scaling & Self-Healing

### Demo 1: Self-Healing Demonstration (Automatic Pod Recovery)
Demonstrates Kubernetes detecting an abrupt pod failure and restoring the desired state within seconds:
```bash
# 1. Note existing backend pod names
kubectl get pods -n findit -l app=backend

# 2. Simulate node failure or crash by abruptly deleting one pod
kubectl delete pod -n findit -l app=backend --wait=false

# 3. Observe the ReplicaSet immediately spawn a replacement pod
kubectl get pods -n findit -l app=backend -w
```
Expected output:
```
backend-7c98fdb57d-4m2p9   1/1   Terminating   0   2m
backend-7c98fdb57d-z8q12   0/1   Pending       0   1s
backend-7c98fdb57d-z8q12   0/1   ContainerCreating   0   2s
backend-7c98fdb57d-z8q12   1/1   Running       0   6s
```

### Demo 2: Horizontal Scaling Demonstration
Demonstrates dynamic capacity scaling during peak campus traffic:
```bash
# Scale backend from 2 to 4 replicas
kubectl scale deployment backend --replicas=4 -n findit

# Verify 4 pods are running
kubectl get pods -n findit -l app=backend
```
Expected output:
```
NAME                       READY   STATUS    RESTARTS   AGE
backend-7c98fdb57d-4m2p9   1/1     Running   0          5m
backend-7c98fdb57d-xk91b   1/1     Running   0          5m
backend-7c98fdb57d-z8q12   1/1     Running   0          1m
backend-7c98fdb57d-9vwb4   1/1     Running   0          12s
```

### Demo 3: Zero-Downtime Rolling Update Demonstration
Demonstrates updating application image without interrupting active user traffic:
```bash
# Trigger rolling update
kubectl set image deployment/backend backend=findit-backend:v1.1.0 -n findit

# Observe rolling update status
kubectl rollout status deployment/backend -n findit

# Rollback if needed
kubectl rollout undo deployment/backend -n findit
```

---

## 5. Viva Voce Q&A — Experiment 7 (Kubernetes)

### Q1: What is the difference between a Pod and a Container?
> **Answer**: A container is an isolated execution environment. A Pod is the smallest deployable atomic unit in Kubernetes. A Pod encapsulates one or more tightly coupled containers that share the same network namespace (IP address and port space), shared IPC, and mounted storage volumes. In FindIT, each microservice runs in its own dedicated pod for horizontal scalability.

### Q2: What is the difference between Liveness and Readiness Probes?
> **Answer**:
> - **Liveness Probe**: Determines if the container is still operational. If it fails, Kubernetes terminates and restarts the container.
> - **Readiness Probe**: Determines if the container is ready to accept incoming network traffic. If it fails, Kubernetes temporarily isolates the pod by removing its IP from the Service endpoints list so users never receive HTTP 500/502 errors while the database connection pool is initializing.

### Q3: Why did we use `ClusterIP` for Postgres/Backend and `NodePort` for Frontend?
> **Answer**:
> - `ClusterIP` exposes a service on a cluster-internal IP address. It is strictly inaccessible from outside the cluster, providing security isolation for internal services like the PostgreSQL database and Express backend API.
> - `NodePort` exposes the frontend service on a static port across all cluster nodes (`nodePort: 30080`), allowing external client browsers to access the application UI.

### Q4: How does Kubernetes ensure self-healing?
> **Answer**: Kubernetes uses a declarative control loop: the **ReplicaSet Controller** continuously compares the **Observed State** (number of running pods) against the **Desired State** specified in the deployment manifest (`replicas: 2`). If a pod is deleted or killed due to hardware failure, the controller detects `observed < desired` and immediately invokes the kube-apiserver to schedule and instantiate a replacement pod.
