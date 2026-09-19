# 🚨 ResQGrid — Master Architecture & Production Execution Plan (v3)

**Problem Statement:** PS-9 — Intelligent Emergency Response & Resource Coordination Platform  
**Hackathon:** Bit N Build Hackathon 2026  
**Team:** Stack Sprinters  

> *This document represents the definitive, production-grade architectural specification and step-by-step implementation blueprint for ResQGrid.*

---

## 📑 Table of Contents
1. [Architectural Vision & Technology Rationale](#1-architectural-vision--technology-rationale)
2. [Domain Model & Emergency Taxonomy](#2-domain-model--emergency-taxonomy)
3. [Authentication & Granular RBAC/ABAC Architecture](#3-authentication--granular-rbacabac-architecture)
4. [Multi-Source Ingestion Pipeline](#4-multi-source-ingestion-pipeline)
5. [AI Microservice & Copilot Pipeline](#5-ai-microservice--copilot-pipeline)
6. [Resource Matching & Optimization Engine](#6-resource-matching--optimization-engine)
7. [Command Center & Real-Time Logistics](#7-command-center--real-time-logistics)
8. [Targeted Notification Routing & SLA Escalation Logistics](#8-targeted-notification-routing--sla-escalation-logistics)
9. [Advanced & Novel Extended Features](#9-advanced--novel-extended-features)
10. [Phased 14-Phase Production Implementation Plan](#10-phased-14-phase-production-implementation-plan)
11. [Non-Functional Requirements & Reliability Metrics](#11-non-functional-requirements--reliability-metrics)
12. [Verification & Acceptance Testing Plan](#12-verification--acceptance-testing-plan)

---

## 1. Architectural Vision & Technology Rationale

### 1.1 Architecture Trade-Off Analysis

To build a resilient emergency response platform capable of surviving peak disaster scenarios, the technology stack was selected after evaluating performance, developer velocity, type safety, real-time pub/sub capabilities, and ecosystem compatibility:

| Component | Choice | Evaluated Alternatives | Technical Rationale & Architectural Decision |
|---|---|---|---|
| **Backend API** | **Node.js 20 + TypeScript + NestJS 10** | Spring Boot 4.x, Go (Gin), Python (Django) | NestJS provides modular Dependency Injection, decorator-based guards, native Socket.IO WebSocket gateways, and allows **sharing TypeScript types/DTOs across Backend, Web Frontend, and Mobile Apps**. Spring Boot was evaluated, but Node.js TS drastically speeds up rapid iteration and eliminates context-switching. |
| **AI Microservice** | **Python 3.11 + FastAPI** | Node.js (Brain.js), Java (DL4J) | Python remains non-negotiable for AI/ML due to scikit-learn, PyTorch, sentence-transformers, OpenCV, and Hugging Face. FastAPI provides async non-blocking concurrency and automatic OpenAPI doc generation. |
| **Database & GIS** | **PostgreSQL 16 + PostGIS 3.4 + pgvector** | MongoDB + GeoJSON, MySQL, Pinecone / Milvus | PostGIS provides military-grade spatial indices (`GIST`) and true GIS functions (`ST_DWithin`, `ST_Distance`). `pgvector` allows storing and querying vector embeddings **inside the same Postgres database**, avoiding the cost and complexity of a separate vector DB. |
| **Caching & Queuing** | **Redis 7 + BullMQ** | RabbitMQ, Apache Kafka | Redis serves three critical roles simultaneously: (1) BullMQ background job queue for SLA timers & notifications; (2) WebSocket pub/sub adapter for horizontal scaling; (3) fast in-memory caching of resource locations. |
| **Real-Time Layer** | **Socket.IO v4** | Pure WebSockets, Server-Sent Events (SSE) | Socket.IO adds auto-reconnection, heartbeat monitoring, fallback transports, and native **room-based multiplexing** matching authority/department boundaries. |
| **Frontend UI** | **React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui** | Vue 3, Angular, Svelte | Maximum component ecosystem flexibility, rapid styling with Tailwind, accessible primitives via Radix UI (shadcn/ui), and high-performance bundling via Vite. |
| **State & Data Sync** | **Zustand + TanStack Query v5** | Redux Toolkit, Context API | Zustand manages lightweight client UI state; TanStack Query handles server state caching, background revalidation, and optimistic mutation updates without manual polling. |
| **GIS Mapping** | **MapLibre GL JS + OSRM** | Leaflet, Google Maps JS API | MapLibre GL renders vector tiles on GPU at 60 FPS (critical for hundreds of moving markers). Self-hosted OSRM provides true road-network driving distance and travel time calculation without API usage costs. |
| **Field Mobile** | **React Native (Expo)** | Flutter, Native Android (Kotlin) | Shared TypeScript code, DTOs, and API client with web app. Supports background GPS geolocation, offline SQLite queueing, and FCM push alerts. |

---

## 2. Domain Model & Emergency Taxonomy

### 2.1 Complete Emergency Taxonomy

ResQGrid structures emergency incidents into a **two-level administrative taxonomy** with default capability mappings and primary department bindings:

```text
                                ┌─────────────────────────────┐
                                │    EmergencyCategory        │
                                │  (Admin-Editable Table)     │
                                └──────────────┬──────────────┘
                                               │ 1
                                               │
                                               │ N
                                ┌──────────────┴──────────────┐
                                │    EmergencySubType         │
                                │  (Admin-Editable Table)     │
                                └──────────────┬──────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ↓                                                               ↓
┌───────────────────────────────┐                               ┌───────────────────────────────┐
│ Primary Responding Department │                               │ Default Required Capabilities │
│ (e.g. Fire & Rescue Dept)     │                               │ (e.g. Boat, Pump, Foam)       │
└───────────────────────────────┘                               └───────────────────────────────┘
```

#### Taxonomy Master Table

| Category ID | Emergency Category | Sub-Type ID | Sub-Type Name | Primary Responding Department | Default Required Capabilities |
|---|---|---|---|---|---|
| `CAT_FLOOD` | **Flood & Water Safety** | `SUB_FL_FLASH` | Flash Flood Inundation | Disaster Management | `WATER_RESCUE`, `INFLATABLE_BOAT`, `HIGH_CAPACITY_PUMP` |
| | | `SUB_FL_RIVER` | River / Dam Overflow | Disaster Management | `WATER_RESCUE`, `HEAVY_PUMP`, `TEMPORARY_SHELTER` |
| | | `SUB_FL_URBAN` | Urban Waterlogging | Fire & Rescue | `DRAINAGE_UNIT`, `TRAFFIC_BARRICADE` |
| `CAT_FIRE` | **Fire & Explosion** | `SUB_FR_STRUCT` | Structural / Building Fire | Fire & Rescue | `FIRE_ENGINE`, `LADDER_TRUCK`, `BREATHING_APPARATUS` |
| | | `SUB_FR_WILD` | Wildfire / Forest Fire | Fire & Rescue | `FOREST_FIRE_TRUCK`, `WATER_BOMBER_LIAISON` |
| | | `SUB_FR_INDUS` | Industrial / Chemical Fire | Fire & Rescue + Hazmat | `FOAM_TENDER`, `HAZMAT_SUIT`, `GAS_DETECTOR` |
| `CAT_MED` | **Medical Emergency** | `SUB_MD_MASS` | Mass Casualty Incident | EMS / Hospitals | `ADVANCED_AMBULANCE`, `TRAUMA_TEAM`, `ICU_BEDS` |
| | | `SUB_MD_CRIT` | Individual Critical Medical | EMS | `BASIC_AMBULANCE`, `PARAMEDIC_TEAM` |
| `CAT_TRAFFIC`| **Road & Traffic** | `SUB_TR_COLL` | Multi-Vehicle Highway Collision | Police + EMS + Fire | `EXTRICATION_EQUIPMENT`, `AMBULANCE`, `TRAFFIC_CONTROL` |
| | | `SUB_TR_HAZ` | Tanker Rollover (Hazmat) | Fire + Hazmat + Police | `HAZMAT_CONTAINMENT`, `TRAFFIC_DIVERSION` |
| `CAT_HAZMAT` | **Hazmat & Chemical** | `SUB_HZ_GAS` | Toxic Gas Leak | Hazmat Specialist | `LEVEL_A_SUIT`, `GAS_SEAL_KIT`, `DECON_UNIT` |
| | | `SUB_HZ_SPILL` | Chemical / Acid Spill | Hazmat Specialist | `NEUTRALIZATION_AGENT`, `ABSORBENT_BOOM` |
| `CAT_COLLAPSE`| **Structural Failure**| `SUB_CL_BLDG` | Building Collapse | USAR + Engineering | `SEARCH_DOGS`, `CONCRETE_BREAKER`, `CRANE` |
| `CAT_SEISMIC` | **Geological** | `SUB_SM_QUAKE` | Earthquake / Landslide | Disaster Management | `USAR_TEAM`, `HEAVY_EARTHMOVER`, `SHELTER_KIT` |
| `CAT_STORM` | **Meteorological** | `SUB_ST_CYCL` | Cyclone / Typhoon | Disaster Management | `TREE_CLEARER`, `POWER_CREW`, `GENSET` |
| `CAT_UTILITY` | **Infrastructure** | `SUB_UT_POWER` | Grid Power Blackout | Utility Dept | `HIGH_VOLTAGE_CREW`, `EMERGENCY_GENERATOR` |
| `CAT_SAR` | **Search & Rescue** | `SUB_SR_MISS` | Missing Person / Wilderness | Police + Search Team | `THERMAL_DRONE`, `SEARCH_DOGS`, `TRACKER` |
| `CAT_SECURITY`| **Public Safety** | `SUB_SC_CROWD` | Stampede / Crowd Risk | Police | `CROWD_CONTROL`, `TACTICAL_UNIT`, `BARRICADES` |

### 2.2 Severity & Priority Scale

| Severity Level | Severity Label | Description & Operational Threshold | Priority Code | Target Dispatch SLA | Target Arrival SLA |
|---|---|---|---|---|---|
| **Level 5** | **Critical** | Confirmed life-threatening disaster, active casualties, collapsing structure, uncontrolled hazard | **P1** | **≤ 5 mins** | **≤ 15 mins** |
| **Level 4** | **Severe** | Severe injury risk, heavy structural damage, contained hazmat leak | **P2** | **≤ 15 mins** | **≤ 30 mins** |
| **Level 3** | **Moderate** | Contained active incident, non-life-threatening injuries, moderate localized fire | **P3** | **≤ 30 mins** | **≤ 60 mins** |
| **Level 2** | **Minor** | Property damage only, minor localized issue, low risk | **P4** | **≤ 60 mins** | **≤ 120 mins** |
| **Level 1** | **Advisory** | Informational citizen report, weather advisory, non-urgent infrastructure query | **P5** | N/A (Log Only) | N/A |

---

## 3. Authentication & Granular RBAC/ABAC Architecture

ResQGrid implements a multi-tenant, scope-bounded permission architecture using **CASL (Code-Assembly Security Layer)** for declarative Ability definitions.

### 3.1 Domain Scoping Hierarchy

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              SUPER ADMIN                               │
│                         (Global System Scope)                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                            AUTHORITY ADMIN                             │
│                  (Authority Scope: e.g. "Authority-NYC")              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ↓                          ↓                          ↓
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ DEPARTMENT ADMIN│        │    OPERATOR     │        │ HOSPITAL ADMIN  │
│(Dept: Fire-NYC) │        │ (Authority-Wide)│        │(Facility: NY-ER)│
└────────┬────────┘        └─────────────────┘        └─────────────────┘
         │
         ↓
┌─────────────────┐
│ RESPONSE TEAM   │
│(Unit: Ladder-4) │
└─────────────────┘
```

### 3.2 CASL Ability Definitions Example (TypeScript)

```typescript
// packages/shared/src/rbac/abilities.ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function defineAbilitiesFor(user: UserSession) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.role === 'SUPER_ADMIN') {
    can('manage', 'all');
  } else if (user.role === 'AUTHORITY_ADMIN') {
    can('manage', 'Incident', { authorityId: user.authorityId });
    can('manage', 'Resource', { authorityId: user.authorityId });
    can('manage', 'User', { authorityId: user.authorityId });
    can('read', 'AuditLog', { authorityId: user.authorityId });
  } else if (user.role === 'DEPARTMENT_ADMIN') {
    // Structural isolation: Only incidents matching department category
    can('read', 'Incident', { 
      authorityId: user.authorityId, 
      category: user.departmentCategory 
    });
    can('update', 'Incident', { 
      authorityId: user.authorityId, 
      category: user.departmentCategory 
    });
    can('manage', 'Resource', { departmentId: user.departmentId });
  } else if (user.role === 'OPERATOR') {
    // Dispatcher: Authority-wide cross-department operational view
    can('read', 'Incident', { authorityId: user.authorityId });
    can('update', 'Incident', { authorityId: user.authorityId });
    can('assign', 'Resource', { authorityId: user.authorityId });
    can('merge', 'Incident', { authorityId: user.authorityId });
  } else if (user.role === 'RESPONSE_TEAM_LEAD' || user.role === 'RESPONSE_TEAM_MEMBER') {
    can('read', 'Incident', { assignedUnitId: user.unitId });
    can('update', 'ResourceAssignment', { resourceUnitId: user.unitId });
  } else if (user.role === 'HOSPITAL_ADMIN') {
    can('read', 'Incident', { category: 'CAT_MED', authorityId: user.authorityId });
    can('update', 'Hospital', { id: user.facilityId });
  } else if (user.role === 'CITIZEN') {
    can('create', 'IncidentReport');
    can('read', 'IncidentReport', { reporterId: user.id });
  }

  return build();
}
```

---

## 4. Multi-Source Ingestion Pipeline

ResQGrid accepts emergency data from seven distinct ingress streams, standardizing all inputs into a unified `ReportIngestedEvent`:

```text
┌─────────────────────────┐
│   CITIZEN WEB / PWA     │──┐
└─────────────────────────┘  │
┌─────────────────────────┐  │
│   ONE-TAP SOS BUTTON    │──┼─┐
└─────────────────────────┘  │ │
┌─────────────────────────┐  │ │
│  CALL-CENTER DISPATCH   │──┤ │  ┌───────────────────────────────┐
└─────────────────────────┘  │ ├─>│   INGESTION CONTROLLER        │
┌─────────────────────────┐  │ │  │   (DTO Validation + Rate-     │
│   IOT / SENSOR WEBHOOK  │──┤ │  │    Limiting + Trust Score)    │
└─────────────────────────┘  │ │  └──────────────┬────────────────┘
┌─────────────────────────┐  │ │                 │
│   FIELD MOBILE APP      │──┤ │                 │ Emits Event
└─────────────────────────┘  │ │                 ↓
┌─────────────────────────┐  │ │  ┌───────────────────────────────┐
│  HOSPITAL TELEMETRY     │──┘ │  │    ReportIngestedEvent        │
└─────────────────────────┘    │  └──────────────┬────────────────┘
┌─────────────────────────┐    │                 │
│  WEATHER / GOVT FEED    │────┘                 ↓
└─────────────────────────┘       ┌───────────────────────────────┐
                                  │   AI ANALYSIS PIPELINE        │
                                  └───────────────────────────────┘
```

### Ingestion Source Matrix

| Source Ingress | Auth Mechanism | Data Format | Spam & Abuse Mitigations |
|---|---|---|---|
| **Citizen PWA** | Optional JWT / Guest Session | JSON + Multipart FormData (Photo/Voice) | IP Rate limit (5/min), GPS accuracy verification, device fingerprint. |
| **SOS Panic Button** | Citizen JWT | Lat/Lng + Timestamp | Instant Level-5 classification, duplicate suppression window (60s). |
| **Call Center Entry** | Operator JWT | Structured DTO Form | Internal operator trust score = 1.0 (Guaranteed authentic). |
| **IoT / Sensors** | HMAC SHA-256 Webhook Signature | JSON Payload (Telemetry readings) | Configurable threshold breach triggers; device ID whitelist. |
| **Field Mobile** | First Responder JWT | GPS Stream + Field Report DTO | Verified team credential check. |
| **Hospital Feed** | Facility API Key | Beds/ICU Count JSON | Automated sanity check on capacity deltas. |
| **Weather Feed** | Service Account API Key | CAP (Common Alerting Protocol) XML/JSON | Scheduled cron polling (every 5 mins). |

---

## 5. AI Microservice & Copilot Pipeline

The Python FastAPI microservice (`apps/ai-service`) executes an 8-stage intelligent pipeline for every ingested report:

```text
                                  ┌───────────────────────────────┐
                                  │    Raw Report Payload         │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ↓
                                  ┌───────────────────────────────┐
                                  │ 1. NLP Classification Engine  │
                                  │ (Scikit-Learn + Transformers) │
                                  └──────────────┬────────────────┘
                                                 │ Category & SubType
                                                 ↓
                                  ┌───────────────────────────────┐
                                  │ 2. Hybrid Severity Engine     │
                                  │ (Rule Floor + ML Score)       │
                                  └──────────────┬────────────────┘
                                                 │ Severity Level (1-5)
                                                 ↓
                                  ┌───────────────────────────────┐
                                  │ 3. pgvector Embedding Gen     │
                                  │ (all-MiniLM-L6-v2, 384-dim)   │
                                  └──────────────┬────────────────┘
                                                 │ Vector Embedding
                                                 ↓
                                  ┌───────────────────────────────┐
                                  │ 4. 3-Signal Duplicate Matcher │
                                  │ (Geo + Time + Cosine Sim)     │
                                  └──────────────┬────────────────┘
                                                 │ Duplicate Found?
                                  ┌──────────────┴──────────────┐
                                  │                             │
                               Yes│                           No│
                                  ↓                             ↓
                   ┌────────────────────────────┐ ┌───────────────────────────┐
                   │ Link to Existing Master    │ │ Create New Master         │
                   │ Incident & Bump Severity   │ │ Incident Ticket           │
                   └──────────────┬─────────────┘ └─────────────┬─────────────┘
                                  │                             │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ↓
                                  ┌───────────────────────────────┐
                                  │ 5. Grounded LLM Summarizer    │
                                  │ (Anthropic Claude 3.5 Sonnet) │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ↓
                                  ┌───────────────────────────────┐
                                  │ 6. Grounded RAG Copilot API   │
                                  └───────────────────────────────┘
```

### 5.1 The 3-Signal Duplicate Matching Algorithm

Two reports $R_1$ and $R_2$ are classified as duplicates if all three thresholds pass:
1. **Spatial Proximity:** $\text{Distance}(R_1.\text{geom}, R_2.\text{geom}) \le D_{\text{max}}$ (Where $D_{\text{max}} = 500\text{m}$ for urban, $2000\text{m}$ for rural).
2. **Temporal Proximity:** $|R_1.\text{timestamp} - R_2.\text{timestamp}| \le T_{\text{max}}$ (Where $T_{\text{max}} = 45\text{ minutes}$).
3. **Semantic Embedding Similarity:** $\cos(\vec{E}_{R1}, \vec{E}_{R2}) \ge 0.82$.

### 5.2 Degraded Mode Fallback
If the Python AI microservice drops offline or times out (> 2000ms), the NestJS backend automatically switches to **Degraded Mode**:
* **Classification:** Uses keyword-regex dictionary lookup.
* **Severity:** Uses default severity mapped to the inferred category.
* **Duplicate Check:** Bypasses vector search; uses PostGIS spatial radius check only.
* **Result:** Zero system downtime; ingestion completes seamlessly without AI dependency.

---

## 6. Resource Matching & Optimization Engine

When an incident requires dispatch, ResQGrid ranks eligible response units using a multi-factor scoring function:

$$\text{Score}(U) = \left( W_{\text{cap}} \times S_{\text{cap}} \right) + \left( W_{\text{dist}} \times S_{\text{dist}} \right) + \left( W_{\text{load}} \times S_{\text{load}} \right) + \left( W_{\text{hosp}} \times S_{\text{hosp}} \right)$$

Where:
* $S_{\text{cap}}$ = Capability Match Ratio ($\text{Matched Capabilities} / \text{Required Capabilities}$).
* $S_{\text{dist}}$ = OSRM Driving Distance Score ($100 - (\text{Driving Distance in km} \times 5)$).
* $S_{\text{load}}$ = Unit Availability / Workload Score ($100 - (\text{Active Assignments} \times 25)$).
* $S_{\text{hosp}}$ = Hospital Bed Availability Score (For medical incidents only).
* Default Weights: $W_{\text{cap}} = 0.40$, $W_{\text{dist}} = 0.35$, $W_{\text{load}} = 0.15$, $W_{\text{hosp}} = 0.10$.

```text
Incident Request ──> Filter Available Units ──> OSRM Road Distance Query ──> Calculate Composite Score ──> Return Ranked Recommendation List
```

---

## 7. Command Center & Real-Time Logistics

### 7.1 Socket.IO Room Scoping & Security

To guarantee that clients only receive real-time updates they are authorized to see, WebSocket connections join scoped Socket.IO rooms during initial authentication:

```text
                      Socket.IO Client Connection (JWT Auth)
                                       │
                                       ↓
                        Extract User Role & Context
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ↓                          ↓                          ↓
   Room: `authority:{id}`     Room: `dept:{deptId}`     Room: `unit:{unitId}`
   (Operator / Admin)        (Dept Admin / Dispatch)   (Field Response Team)
```

### 7.2 Real-Time Event Types

| Event Name | Publisher | Target Room | Payload Description |
|---|---|---|---|
| `incident:created` | Backend Ingestion | `authority:{id}`, `dept:{id}` | New incident created with location, category, severity. |
| `incident:updated` | Operator / System | `authority:{id}`, `dept:{id}` | Incident status change or severity bump. |
| `incident:merged` | Duplicate Engine | `authority:{id}`, `dept:{id}` | Reports consolidated under master incident ID. |
| `resource:location` | Field Mobile App | `authority:{id}`, `unit:{id}` | GPS latitude/longitude location ping. |
| `alert:escalated` | BullMQ SLA Worker | `authority:{id}`, `dept:{id}` | Unassigned incident SLA breach alert. |

---

## 8. Targeted Notification Routing & SLA Escalation Logistics

### 8.1 SLA Escalation Chain Algorithm

```text
[Incident Created Level 5] ──> Start BullMQ Delayed SLA Job (5 min timer)
                                          │
                                          ↓
                                Is Incident Assigned?
                                ┌─────────┴─────────┐
                             Yes│                 No│ (5 mins elapsed)
                                ↓                   ↓
                         Cancel SLA Job     Trigger SLA Breach Alert
                                                    │
                                                    ↓
                                         Escalate to Next Tier:
                                         Dept Admin ──> Authority Admin Director
```

---

## 9. Advanced & Novel Extended Features

ResQGrid includes seven advanced features that elevate the platform to a state-of-the-art emergency solution:

1. **AI Computer Vision Media Triage:** Uses YOLOv8 / CLIP models to analyze citizen-uploaded photos/videos, automatically detecting active flames, water inundation levels, or collapsed structures to boost report credibility scores.
2. **Offline-First PWA & Mesh/SMS Fallback:** When cellular internet drops during major disasters, citizen reports and field team updates compress into encrypted SMS payloads sent to a local GSM modem gateway.
3. **IoT & Drone Telemetry Streaming:** Integrates WebRTC streaming feeds from autonomous reconnaissance drones, displaying live video overlays directly on the Command Center GIS map.
4. **Automated Geofenced Reverse 911 Broadcast:** Allows Authority Admins to draw custom polygons on the map to trigger targeted SMS/Web-Push evacuation warnings to citizens inside dangerous disaster zones.
5. **Multi-Agency Volunteer & NGO Federation Network:** Provides a lightweight portal for certified NGO groups (Red Cross, local rescue clubs) to receive non-sensitive relief tasks without exposing sensitive law-enforcement data.
6. **AI Post-Incident After-Action Report (AAR) Generator:** Automatically compiles complete timeline summaries of incident lifecycles into downloadable PDF reports for regulatory audits.
7. **Gamified Dispatcher Simulator Mode:** Enables emergency management agencies to run simulated disaster drills by replaying historical or synthetic incident feeds against the live Command Center interface.

---

## 10. Phased 14-Phase Production Implementation Plan

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PHASE EXECUTION ROADMAP                                 │
│                                                                                        │
│  Phase 0: Workspace Monorepo & Infra Setup                                              │
│    └─► Phase 1: Authentication, Multi-Tenant Org & CASL RBAC                           │
│          └─► Phase 2: Emergency Taxonomy & Admin Console Shells                        │
│                └─► Phase 3: Multi-Source Ingestion Pipeline                           │
│                      └─► Phase 4: Python AI Microservice v1                             │
│                            └─► Phase 5: 3-Signal Duplicate Consolidation              │
│                                  └─► Phase 6: Resource Dispatch & OSRM Engine         │
│                                        └─► Phase 7: Real-Time Command Center Map       │
│                                              └─► Phase 8: SLA Escalation & Routing     │
│                                                    └─► Phase 9: Multi-Channel Alerts   │
│                                                          └─► Phase 10: AI RAG Copilot   │
│                                                                └─► Phase 11: Analytics │
│                                                                      └─► Phase 12-13  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Phase Execution Breakdown

#### Phase 0: Workspace Monorepo & Infrastructure Setup
* [x] Establish pnpm workspaces monorepo structure (`apps/backend`, `apps/ai-service`, `apps/web`, `apps/mobile`, `packages/shared`).
* [x] Configure Docker Compose for PostgreSQL 16 + PostGIS 3.4, Redis 7, MinIO, and OSRM.
* [x] Initialize Prisma schema with base extensions (`postgis`, `vector`).

#### Phase 1: Authentication, Multi-Tenant Org Model & RBAC/ABAC
* [x] Implement Argon2id password hashing and dual JWT token (access + refresh) lifecycle.
* [x] Define CASL ability factory (`defineAbilitiesFor`) in `@resqgrid/shared`.
* [x] Implement NestJS `@UseGuards(PoliciesGuard)` enforcing fine-grained endpoint authorization.

#### Phase 2: Emergency Taxonomy & Admin Console Shells
* [x] Create database seeds for 12 main categories and 40+ sub-types.
* [x] Build Admin Console Web UI for Super Admins and Authority Admins.

#### Phase 3: Multi-Source Ingestion Pipeline
* [x] Build ingestion controllers for Citizen PWA, One-Tap SOS, Call Center, and IoT Webhooks.
* [x] Implement anti-spam rate limiting and device trust scoring.

#### Phase 4: Python AI Microservice v1
* [x] Build FastAPI app with NLP classification and hybrid severity scoring endpoints.
* [x] Implement Degraded Mode fallback engine in NestJS backend.

#### Phase 5: 3-Signal Duplicate Detection & Consolidation
* [x] Implement PostGIS spatial radius + time-window + pgvector embedding cosine similarity query.
* [x] Build operator merge/split review queue in Command Center.

#### Phase 6: Resource Registry & Recommendation Engine
* [x] Build resource CRUD and live status state machine.
* [x] Integrate OSRM API for road-network driving distance and travel time calculation.

#### Phase 7: Real-Time Command Center Map
* [x] Implement Socket.IO Gateway with Redis adapter and room scoping.
* [x] Integrate MapLibre GL JS GPU vector map with high-FPS marker clustering.

#### Phase 8: Targeted Notification Routing & SLA Escalation Engine
* [x] Implement notification routing rule evaluator enforcing structural department isolation.
* [x] Configure BullMQ delayed job scheduler for Level-5 (5 min) and Level-4 (15 min) SLA escalations.

#### Phase 9: Multi-Channel Notifications
* [x] Integrate Twilio (SMS), SendGrid (Email), Web Push (VAPID), and FCM (Mobile Push).
* [x] Implement critical alert quiet-hours override logic.

#### Phase 10: AI Emergency Copilot (RAG)
* [x] Implement pgvector chunking and embedding retrieval.
* [x] Build Copilot drawer UI in Command Center web app with RBAC-scoped source citation.

#### Phase 11: Scoped Analytics & Spatial Heatmaps
* [x] Build aggregate SQL queries for response time distribution (p50/p90).
* [x] Implement MapLibre GL density heatmap layer for disaster hotspots.

#### Phase 12: Field Team Mobile App (React Native / Expo)
* [x] Build cross-platform mobile app with background GPS location tracking.
* [x] Implement offline SQLite queued update sync on network reconnect.

#### Phase 13: Hardening, Verification & Production Deployment
* [x] Run comprehensive RBAC security audit test matrix across all 9 roles.
* [x] Execute end-to-end simulated emergency scenario validation script.
* [x] Finalize Docker Compose deployment configuration.

---

## 11. Non-Functional Requirements & Reliability Metrics

* **Performance Target:** Incident classification API round-trip < 1500ms; WebSocket packet broadcast latency < 200ms; Resource recommendation query < 400ms.
* **System Availability:** 99.9% uptime target with zero-downtime Degraded Mode fallback if AI microservice fails.
* **Security & Compliance:** Passwords hashed with Argon2id; all endpoints protected by JWT + CASL guards; input sanitized via class-validator DTOs.
* **Auditability:** 100% of mutating administrative and dispatch actions recorded in append-only `AuditLog` table.

---

## 12. Verification & Acceptance Testing Plan

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM VERIFICATION MATRIX                           │
├───────────────────┬──────────────────────────────────┬─────────────────────────┤
│ Testing Tier      │ Execution Command / Method       │ Success Criteria        │
├───────────────────┼──────────────────────────────────┼─────────────────────────┤
│ Unit & DTO Tests  │ `pnpm test:unit`                 │ 100% pass rate          │
│ RBAC Matrix Tests │ `pnpm test:rbac`                 │ All 18 permissions pass │
│ E2E Flow Script   │ `pnpm test:e2e`                  │ Complete incident flow  │
│ Load Testing      │ `k6 run tests/load/ingestion.js` │ 500 req/sec under 2s    │
└───────────────────┴──────────────────────────────────┴─────────────────────────┘
```

### End-to-End Test Scenario Script
1. Citizen submits trapped-water report via PWA.
2. Sensor webhook triggers water level breach.
3. AI microservice classifies as `CAT_FLOOD` / `Level 5 Critical`.
4. 3-Signal duplicate engine consolidates citizen report into master incident ticket.
5. Command Center map receives real-time Socket.IO update packet.
6. Recommendation engine ranks nearest Water Rescue unit via OSRM.
7. Operator assigns unit; SLA timer cancels.
8. Field team app receives assignment via FCM push, updates status to `EN_ROUTE`.
9. Incident status updates to `RESOLVED` on live map.

---

**Master Implementation Plan Approved by Team Stack Sprinters · Bit N Build Hackathon 2026**
