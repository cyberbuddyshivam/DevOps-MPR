# FindIT — Provisioning & Configuration Guide (Experiment 4: Ansible)
## Jira Ticket: FIND-10 | Artifact: `ansible/playbook.yml`, `ansible/roles/`

---

## 1. Overview & Architecture

Ansible provides **agentless, declarative infrastructure as code (IaC)**. In FindIT, Ansible automates the end-to-end setup of a clean Linux machine from bare-metal/VM state to a fully running, health-checked FindIT deployment.

```
┌────────────────────────────────────────────────────────┐
│  Ansible Control Node (Engineer Machine / WSL / CI)    │
│  - playbook.yml                                        │
│  - inventory/hosts.ini                                 │
│  - roles: common, docker, app                          │
└──────────────────────────┬─────────────────────────────┘
                           │ SSH (Port 22) or Localhost
                           ▼
┌────────────────────────────────────────────────────────┐
│  Target Managed Host (Ubuntu / Debian / RHEL)          │
│                                                        │
│  [Role: common]                                        │
│  ├── Package management (curl, gnupg, git, ufw)        │
│  ├── User creation (deploy:deploy)                     │
│  └── UFW firewall rules (22, 80, 443, 3000, 5000)      │
│                                                        │
│  [Role: docker]                                        │
│  ├── Official Docker GPG key & APT repo                │
│  ├── Docker CE & docker-compose-plugin                 │
│  └── Systemd service enablement                        │
│                                                        │
│  [Role: app]                                           │
│  ├── Directory structure: /opt/findit                  │
│  ├── Jinja2 templating: .env                           │
│  ├── Asset transfer: compose file, init.sql, source    │
│  └── Automated orchestration: docker compose up -d     │
│                                                        │
│  [Post-Tasks Validation]                               │
│  └── HTTP GET http://localhost:5000/health (200 OK)    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Idempotency in Practice

**Idempotency** is the fundamental principle of Ansible: executing the playbook multiple times against the target results in the exact same state without unintended side-effects.

- **First Run**: Installs packages, creates users, writes configs, pulls images $\rightarrow$ `changed=12`.
- **Second Run**: Detects packages already present, user exists, configs identical $\rightarrow$ `changed=0, ok=12`.

FindIT guarantees idempotency by:
1. Using declarative modules (`ansible.builtin.package`, `file`, `template`, `service`) rather than raw shell scripts.
2. Guarding file permissions and templates with cryptographic checksum matching.
3. Using `changed_when` conditions on command executions.

---

## 3. Step-by-Step Execution Commands

### 3.1 Syntax Validation (Dry Run)
Before running on any target, validate YAML syntax and task structures:
```bash
ansible-playbook ansible/playbook.yml -i ansible/inventory/hosts.ini --syntax-check
```
Expected output:
```
playbook: ansible/playbook.yml
```

### 3.2 Check Mode (Simulated Execution)
Simulate playbook execution without making actual modifications:
```bash
ansible-playbook ansible/playbook.yml -i ansible/inventory/hosts.ini --check
```

### 3.3 Target Host Deployment (Full Run)
Deploy to target servers:
```bash
# Run against all app_servers in inventory
ansible-playbook ansible/playbook.yml -i ansible/inventory/hosts.ini

# Or limit to specific tags (e.g. only redeploy application)
ansible-playbook ansible/playbook.yml -i ansible/inventory/hosts.ini --tags "deploy"
```

### 3.4 Running on Windows Host via Dockerized Ansible Controller
Since Windows does not host native Ansible control nodes, run Ansible via an official Docker container wrapper:
```bash
docker run --rm -it \
  -v ${PWD}:/work \
  -w /work \
  cytopia/ansible:latest \
  ansible-playbook ansible/playbook.yml -i ansible/inventory/hosts.ini --syntax-check
```

---

## 4. Expected Execution Transcript

```
PLAY [Provision and Deploy FindIT Lost & Found Management System] ***************

TASK [Gathering Facts] *********************************************************
ok: [127.0.0.1]

TASK [Validate target operating system] ****************************************
ok: [127.0.0.1] => {
    "changed": false,
    "msg": "All assertions passed"
}

TASK [common : Update apt package cache] ***************************************
changed: [127.0.0.1]

TASK [common : Install fundamental system packages] ****************************
changed: [127.0.0.1]

TASK [common : Create dedicated deployment user] *******************************
changed: [127.0.0.1]

TASK [docker : Download official Docker GPG armored key] ************************
changed: [127.0.0.1]

TASK [docker : Install Docker packages] *****************************************
changed: [127.0.0.1]

TASK [docker : Ensure docker service is enabled and started] *******************
changed: [127.0.0.1]

TASK [app : Deploy environment configuration from Jinja2 template] *************
changed: [127.0.0.1]

TASK [app : Deploy and start FindIT multi-service stack via Docker Compose] ****
changed: [127.0.0.1]

TASK [Verify FindIT application deployment health] *****************************
ok: [127.0.0.1] => {
    "status": 200,
    "json": {
        "status": "UP",
        "database": "connected"
    }
}

PLAY RECAP *********************************************************************
127.0.0.1                  : ok=14   changed=8    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

---

## 5. Viva Voce Q&A — Experiment 4 (Ansible)

### Q1: What makes Ansible "agentless" and why is that advantageous?
> **Answer**: Unlike Puppet or Chef which require installing, configuring, and updating a proprietary background agent daemon on every managed target node, Ansible connects over standard OpenSSH (or WinRM on Windows) and executes standard Python code or shell commands, then removes temporary scripts. This reduces resource overhead, attack surface, and maintenance friction.

### Q2: What is the purpose of an Ansible Role?
> **Answer**: Ansible Roles provide a standardized directory structure (`tasks/`, `handlers/`, `templates/`, `vars/`, `defaults/`, `meta/`) to break monolithic playbooks into reusable, modular, and self-contained units of automation. In FindIT, we separated OS setup (`common`), container engine provisioning (`docker`), and application lifecycle (`app`) into dedicated roles.

### Q3: How does Ansible achieve idempotence?
> **Answer**: Ansible modules check the current state of the resource before taking action. For instance, `ansible.builtin.user` inspects `/etc/passwd`. If user `deploy` exists with the desired shell and group, Ansible records status `ok` and makes zero modifications. Only when drift occurs (e.g. user missing) does it perform a write operation and return `changed=true`.

### Q4: What is the role of Jinja2 templating in Ansible?
> **Answer**: Jinja2 (`.j2` files) enables dynamic configuration files based on inventory variables, host facts, and environment secrets. In FindIT, `roles/app/templates/.env.j2` dynamically substitutes database credentials, port configurations, and hostnames depending on whether the target is staging or production without hardcoding secrets in version control.
