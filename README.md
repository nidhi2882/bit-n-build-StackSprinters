# 🚨 ResQGrid — Emergency Response & Resource Coordination Platform

**Bit N Build Hackathon 2026 · PS‑9 · Team Stack Sprinters**

> *"From fragmented emergency information to coordinated response intelligence."*

---

## 🎥 Demo Video & Presentation

▶️ **[Watch the ResQGrid demo](https://drive.google.com/file/d/1tI2c5Tru0btmVy3gLObA89w8CJBl0HKi/view?usp=sharing)**

📊 **[View the pitch presentation (PPT)](https://docs.google.com/presentation/d/1XqqpVk9L0gO5S2kl14o8TphuRRGo4tC2/edit?usp=sharing&ouid=108215591275858216197&rtpof=true&sd=true)**

A full walkthrough of the platform — citizen reporting, AI-assisted triage, department dispatch, the real-time incident lifecycle, and the command analytics console.

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [The Problem (PS-9)](#2-the-problem-ps-9)
3. [Key Features](#3-key-features)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Roles & Departments](#6-roles--departments)
7. [Incident Lifecycle](#7-incident-lifecycle)
8. [AI Microservice & Copilot](#8-ai-microservice--copilot)
9. [Repository Structure](#9-repository-structure)
10. [Getting Started](#10-getting-started)
11. [Demo Login Credentials](#11-demo-login-credentials)
12. [Diagrams](#12-diagrams)
13. [Team](#13-team)

---

## 1. Overview

During disasters — floods, structural fires, hazmat leaks, multi-vehicle crashes, building collapses — command centers are flooded with unstructured data from citizens, sensors, and field teams. **ResQGrid** turns that chaos into coordinated action.

The platform ingests emergency reports, uses AI to classify and score them, routes each incident to the correct department, recommends the right response units, tracks the full incident lifecycle in real time, and keeps every department focused only on the alerts that belong to them.

ResQGrid is built as **three cooperating services**:

- **Frontend** — a React + Vite single-page app with role-based dashboards, a live CAD console, a GIS map, analytics charts, and an AI Copilot.
- **Backend** — a Spring Boot (Java 17) REST + WebSocket API handling auth, incident lifecycle, dispatch, routing, notifications, and analytics.
- **AI service** — a Python FastAPI microservice for NLP classification, severity scoring, duplicate detection, and a Gemini-powered RAG copilot.

---

## 2. The Problem (PS-9)

During an emergency, commanders must answer five questions fast:

1. **What is happening?** — AI-assisted incident classification.
2. **How severe is it?** — hybrid AI + deterministic severity scoring with dispatch SLAs.
3. **Which reports are the same incident?** — spatial + temporal + semantic duplicate detection.
4. **Who should respond?** — capability- and availability-aware unit recommendation.
5. **Is the response on track?** — live status tracking with automatic SLA escalation.

Traditional systems fail through information silos, triage bottlenecks, duplicate tickets, notification fatigue (fire departments getting flood alerts), and proximity-only dispatch. ResQGrid addresses each of these directly.

---

## 3. Key Features

- **Multi-source reporting** — citizen portal, one-tap SOS, and operator entry.
- **Category-based auto-routing** — every incident is routed to its owning department, with cross-department mutual-aid requests generated automatically.
- **Real-time incident lifecycle** — `Reported → Assigned → En-Route → On-Scene → Resolved`, with assigned-unit and status changes reflected live.
- **Department-scoped access** — each of the 9 department admins sees and acts on only their own category; Super Admin sees everything.
- **AI Copilot** — a Gemini-powered RAG assistant grounded on emergency SOPs, with a deterministic fallback when the LLM is unavailable.
- **Targeted notifications** — alerts are scoped per department, auto-refresh every minute, clear themselves when an incident is resolved, and support a manual clear-all.
- **Command analytics** — live charts for category volume, severity distribution, incident status, response-time percentiles, fleet readiness, per-department SLA, and an hourly incident-inflow trend.
- **SLA escalation** — a background scheduler flags breaches and auto-escalates unassigned critical incidents.

---

## 4. System Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  React + Vite SPA — Super Admin · 9 Dept Admins · Citizen Portal     │
│  CAD console · GIS map · analytics · AI Copilot · notifications       │
└───────────────────────────────┬─────────────────────────────────────┘
                                 │ REST (JWT) + WebSocket/STOMP
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│               SPRING BOOT BACKEND  (Java 17, port 8080)              │
│  Auth · Incidents · Resources · ServiceRequests · Alerts · Analytics │
│  Department routing · SLA escalation scheduler · WebSocket broker     │
│  Spring Security (JWT) · Spring Data JPA repositories                 │
└──────────┬────────────────────────────────────────┬──────────────────┘
           │ REST (classify/severity/copilot)        │ JDBC + Mongo sync
           ↓                                          ↓
┌──────────────────────────────┐        ┌────────────────────────────────┐
│  AI SERVICE (FastAPI, 5000)  │        │  DATA LAYER                      │
│  NLP classifier · severity   │        │  H2 (in-memory, PostgreSQL mode) │
│  duplicate matcher           │        │  MongoDB Atlas (optional sync)   │
│  Gemini RAG copilot + SOPs   │        └────────────────────────────────┘
└──────────────────────────────┘
```

> Detailed diagrams are available under [`docs/architecture/`](docs/architecture).

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Axios, STOMP/SockJS, custom SVG charts |
| **Backend** | Java 17, Spring Boot 2.7, Spring Web, Spring Security + JWT (HMAC SHA-256, BCrypt), Spring Data JPA (Hibernate), Spring WebSocket, Spring Scheduling, Maven |
| **AI Service** | Python, FastAPI, Uvicorn, Google Gemini (`gemini-flash-latest`), NLP classifier, severity engine, duplicate matcher |
| **Data** | H2 (in-memory, PostgreSQL mode), MongoDB Atlas (optional cloud sync) |
| **Infra** | Docker / docker-compose, `.env` configuration |

---

## 6. Roles & Departments

ResQGrid uses **3 roles**, with the Department Admin role scoped across **9 department categories**.

**Roles**

1. **Super Admin** — full visibility across all departments, cross-sector analytics, mass alerts, and sector switching.
2. **Department Admin** — locked to a single department category; manages that department's incidents, units, and mutual-aid requests.
3. **Citizen** — submits reports and SOS alerts and tracks the status of their own reports.

**9 department categories** (each has its own seeded admin login and console):

`FLOOD` · `FIRE` · `MEDICAL` · `CRASH` · `HAZMAT` · `COLLAPSE` · `CYCLONE` · `SEARCH_RESCUE` · `POLICE`

Access is enforced server-side: a department admin can only read or act on incidents in their own category. Logging in as a specific department renders only that department's console.

---

## 7. Incident Lifecycle

Every incident moves through a dynamic, real-time lifecycle:

| Stage | What happens |
|---|---|
| **1 · Reported** | Citizen/operator submits; incident is auto-routed to the owning department, an alert is raised, and a timeline entry is logged. |
| **2 · Assigned** | A response unit is dispatched; `assignedUnitId` is set and the unit's status becomes En-Route. |
| **3 · En-Route** | Unit is moving; resource status stays in sync and the SLA countdown runs live. |
| **4 · On-Scene** | Unit has arrived; the citizen-facing timeline updates. |
| **5 · Resolved** | Incident is completed; assigned units are freed to Available and its notifications are automatically cleared. |

Status vocabulary is consistent across the drawer, the CAD queue, and the citizen timeline. Cross-department **mutual-aid requests** follow their own `PENDING → ACCEPTED / DECLINED → RESOLVED` flow and notify the target department admin.

---

## 8. AI Microservice & Copilot

The Python FastAPI service (`ai-service/`, port 5000) exposes:

- `POST /api/classify` — NLP incident-type classification.
- `POST /api/severity` — hybrid severity scoring.
- `POST /api/duplicates/check` — spatial + temporal + semantic duplicate detection.
- `POST /api/copilot` — RAG copilot query.
- `GET  /api/copilot/status`, `GET /api/copilot/sop/{category}` — key status and SOP retrieval.

**Copilot:** answers operational questions using Google Gemini, grounded on emergency SOPs and the live operational context, with domain guardrails that keep responses focused on emergency management. If no valid LLM key is configured (or the call fails), it gracefully falls back to a deterministic, SOP-grounded engine so the copilot always responds.

The LLM key is read from `.env` (`LLM_API_KEY` / `GEMINI_API_KEY`); the provider is auto-detected (Gemini / Groq / OpenAI).

---

## 9. Repository Structure

```text
bit-n-build-StackSprinters/
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── pages/            # dashboards, department consoles, citizen, auth, admin
│       ├── components/       # incidents, copilot, layout, modals, common, gis
│       ├── services/         # Axios API clients (incident, auth, alert, analytics…)
│       ├── context/          # AuthContext, EmergencyContext
│       └── config/           # department & routing configuration
│
├── backend/                  # Spring Boot API (Java 17)
│   └── src/main/java/com/resqgrid/backend/
│       ├── controller/       # Auth, Incident, Resource, ServiceRequest, Alert, Analytics…
│       ├── service/          # IncidentService, DepartmentRoutingService, SLA, AI client…
│       ├── entity/           # Incident, Resource, ServiceRequest, Alert, User, Role…
│       ├── repository/       # Spring Data JPA repositories
│       ├── security/         # JWT provider, filter, UserPrincipal
│       └── config/           # SecurityConfig, WebSocketConfig, DataInitializer (seed)
│
├── ai-service/               # Python FastAPI AI microservice
│   └── app/
│       ├── api/              # FastAPI routes
│       ├── classifiers/      # NLP classifier
│       ├── severity/         # severity engine
│       ├── duplicates/       # duplicate matcher
│       └── copilot/          # Gemini RAG engine + SOPs
│
├── docs/                     # architecture diagrams, API, deployment, security docs
├── demo/                     # demo video reference
├── presentation/             # pitch deck reference
├── docker/                   # container configuration
├── start_all.ps1             # launches all three services (Windows)
└── start_all.bat
```

---

## 10. Getting Started

### Prerequisites

- **Java 17** and **Maven** (backend)
- **Node.js 18+** (frontend)
- **Python 3.10+** (AI service)
- (Optional) MongoDB running locally for cloud-sync mirroring

### Quick start (Windows)

```powershell
# From the project root — launches all three services in separate windows
./start_all.ps1
```

### Run each service manually

```bash
# 1) Backend  →  http://localhost:8080
cd backend
./mvnw spring-boot:run        # (or: mvn spring-boot:run)

# 2) AI service  →  http://localhost:5000  (docs at /docs)
cd ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload

# 3) Frontend  →  http://localhost:5173
cd frontend
npm install
npm run dev
```

### Configuration (`.env`)

```env
MONGODB_URI=mongodb://localhost:27017/resqgrid
SPRING_DATASOURCE_URL=jdbc:h2:mem:resqgrid;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
JWT_SECRET=<your-secret>
JWT_EXPIRATION_MS=86400000
LLM_API_KEY=<your-gemini-api-key>   # enables the live AI Copilot
```

> The backend seeds demo users, incidents, resources, and cross-department requests on startup, so charts and consoles are populated immediately.

---

## 11. Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `david.chandler@resqgrid.gov` | `admin123` |
| Flood Admin | `flood.admin@resqgrid.gov` | `floodadmin123` |
| Fire Admin | `fire.admin@resqgrid.gov` | `fireadmin123` |
| Medical Admin | `medical.admin@resqgrid.gov` | `medadmin123` |
| Crash Admin | `crash.admin@resqgrid.gov` | `crashadmin123` |
| Hazmat Admin | `hazmat.admin@resqgrid.gov` | `hazmatadmin123` |
| Collapse Admin | `collapse.admin@resqgrid.gov` | `collapseadmin123` |
| Cyclone Admin | `cyclone.admin@resqgrid.gov` | `cycloneadmin123` |
| SAR Admin | `rescue.admin@resqgrid.gov` | `rescueadmin123` |
| Police Admin | `police.admin@resqgrid.gov` | `policeadmin123` |
| **Citizen** | `citizen@resqgrid.gov` | `citizen123` |

All 11 accounts are available as one-click quick-login buttons on the login screen.

---

## 12. Diagrams

Architecture and flow diagrams live in [`docs/architecture/`](docs/architecture):

- `system-architecture.svg` — full service/layer architecture
- `tech-stack.svg` — frameworks and libraries per service
- `website-flow.svg` — authentication, role routing, and the incident lifecycle

---

## 13. Team

**Built by Team Stack Sprinters** · Bit N Build Hackathon 2026 · PS‑9
