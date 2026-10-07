import React from 'react';
import {
  X,
  Layers,
  GitBranch,
  PlayCircle,
  Server,
  Box,
  Cpu,
  CheckCircle2,
  Terminal,
  Activity,
  Workflow
} from 'lucide-react';

export default function DevOpsInfoModal({ health, onClose }) {
  const experiments = [
    {
      exp: 'Exp 1',
      title: 'Agile Lifecycle using Jira + DevOps',
      desc: '2 Sprints planned in docs/jira/SPRINT_PLAN.md. 12 Stories (FIND-01 to FIND-12) with story points and CSV import.',
      badge: 'Jira Software',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      artifacts: 'docs/jira/jira_issues.csv, SPRINT_PLAN.md'
    },
    {
      exp: 'Exp 2',
      title: 'Version Control using Git',
      desc: 'Branching model: feature branches merged to develop then main. PR template and Conventional Commits with Jira keys.',
      badge: 'GitFlow',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      artifacts: '.github/pull_request_template.md, docs/GIT_WORKFLOW.md'
    },
    {
      exp: 'Exp 3',
      title: 'Continuous Integration using GitHub Actions',
      desc: 'Automated workflow on push/PR: checkout, Node cache, lint, Jest test execution, Vite build, and Docker build test.',
      badge: 'GitHub Actions',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      artifacts: '.github/workflows/ci.yml'
    },
    {
      exp: 'Exp 4',
      title: 'Provisioning & Configuration using Ansible',
      desc: 'Idempotent playbooks with modular roles (roles/docker, roles/app) ensuring changed=0 on repeat runs.',
      badge: 'Ansible Core',
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
      artifacts: 'ansible/playbook.yml, ansible/inventory, roles/'
    },
    {
      exp: 'Exp 5',
      title: 'Containerization using Docker',
      desc: 'Multi-stage Dockerfiles with unprivileged non-root node user, minimal Alpine base, and built-in HEALTHCHECK.',
      badge: 'Docker Engine',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      artifacts: 'backend/Dockerfile, frontend/Dockerfile'
    },
    {
      exp: 'Exp 6',
      title: 'Multi-Service Deployment using Docker Compose',
      desc: '3 services (Frontend, Backend, PostgreSQL 16) with healthcheck dependencies, named volume, and bridge network.',
      badge: 'Docker Compose',
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      artifacts: 'docker/docker-compose.yml, database/init.sql'
    },
    {
      exp: 'Exp 7',
      title: 'Container Management using Kubernetes',
      desc: 'Production manifests with 2 replicas, self-healing replica sets, liveness/readiness probes, and NodePort service.',
      badge: 'Kubernetes (k8s)',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      artifacts: 'k8s/*.yaml (Deployments, Services, ConfigMap)'
    }
  ];

  return (
    <div
      id="devops-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={e => {
        if (e.target.id === 'devops-modal-overlay') onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">FindIT DevOps Architecture (Exp 1–7)</h3>
              <p className="text-xs text-slate-400">Integrated Syllabus Experiments Verification Dashboard</p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-devops-modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Metrics from /health */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live Backend & Container Health (/health)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">API STATUS</span>
              <span
                className={`font-bold ${
                  health?.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {health?.status || 'UNKNOWN'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">DATABASE</span>
              <span className="font-bold text-cyan-400">{health?.database || 'memory'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">UPTIME</span>
              <span className="font-bold text-indigo-400">
                {health?.uptime ? `${Math.round(health.uptime)}s` : 'Active'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">ENVIRONMENT</span>
              <span className="font-bold text-amber-400">{health?.environment || 'development'}</span>
            </div>
          </div>
        </div>

        {/* Experiments Grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {experiments.map(e => (
            <div
              key={e.exp}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-slate-800">
                    {e.exp}
                  </span>
                  <h4 className="text-sm font-bold text-white">{e.title}</h4>
                </div>
                <p className="text-xs text-slate-300">{e.desc}</p>
                <p className="text-[11px] font-mono text-slate-500">📁 Artifacts: {e.artifacts}</p>
              </div>

              <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border ${e.color}`}>
                {e.badge}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>DevOps MPR — Semester 5</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
