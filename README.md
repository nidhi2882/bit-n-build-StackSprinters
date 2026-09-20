# 🚨 ResQGrid — Master README

**Intelligent Emergency Response & Resource Coordination Platform**  
**Bit N Build Hackathon 2026 · PS‑9 · Team Stack Sprinters**

> *"From fragmented emergency information to coordinated response intelligence."*

---

## 📋 Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [The Core Problem (PS-9 Context)](#2-the-core-problem-ps-9-context)
3. [Scaffold Audit vs. Production Target](#3-scaffold-audit-vs-production-target)
4. [System Architecture](#4-system-architecture)
5. [Unified Technology Stack](#5-unified-technology-stack)
6. [Emergency Taxonomy & Domain Model](#6-emergency-taxonomy--domain-model)
7. [User Roles & Granular RBAC Permission Matrix](#7-user-roles--granular-rbac-permission-matrix)
8. [Core Platform Capabilities](#8-core-platform-capabilities)
9. [Advanced & Next-Gen Features (Extended Scope)](#9-advanced--next-gen-features-extended-scope)
10. [Targeted Notification Routing & Noise Containment](#10-targeted-notification-routing--noise-containment)
11. [AI Microservice & Copilot Pipeline](#11-ai-microservice--copilot-pipeline)
12. [Repository Structure](#12-repository-structure)
13. [Developer Quickstart & Deployment Guide](#13-developer-quickstart--deployment-guide)
14. [Responsible AI, Safety Guardrails & Auditability](#14-responsible-ai-safety-guardrails--auditability)

---

## 1. Executive Summary & Vision

During severe disaster events (floods, structural fires, industrial hazmat leaks, multi-vehicle pile-ups, earthquakes), emergency command centers are inundated with unstructured, chaotic data from thousands of citizen phone calls, social media posts, field team radios, IoT sensors, and hospital status updates.

**ResQGrid** bridges the critical gap between raw emergency data ingestion and rapid, coordinated dispatch. It ingests reports from all sources, utilizes AI to classify and score severity, merges duplicate reports of the same physical event, recommends optimal response teams based on capability, road-network ETA, and facility load, tracks field operations live on a GIS map, and escalates delayed responses automatically — **all while enforcing strict structural containment so departments are never spammed with irrelevant noise.**

---

## 2. The Core Problem (PS-9 Context)

During a disaster, emergency commanders must immediately answer five fundamental operational questions:
1. **What is happening?** *(Instant AI-assisted incident classification & capability mapping)*
2. **How severe is it, and what priority does it take?** *(Hybrid AI + deterministic severity scoring & dispatch SLAs)*
3. **Which incoming reports belong to the exact same incident?** *(3-signal duplicate detection: Spatial + Temporal + Semantic)*
4. **Which team, vehicle, equipment, or medical facility should respond?** *(ETA-aware, load-balanced, capacity-aware recommendation scoring)*
5. **Is the response on track, or does it require escalation?** *(Real-time monitoring, SLA timers, and automated multi-tier escalation)*

### The Traditional Failure Points
* **Information Fragmentation:** Emergency calls, citizen apps, and IoT feeds live in isolated silos.
* **Triage Bottlenecks:** Manual triage operators are overwhelmed by call volume during peak disasters.
* **Duplicate Chaos:** 50 reports for a single highway crash create 50 separate tickets, cluttering dispatch queues.
* **Notification Fatigue:** Fire departments receive flood alerts; police command centers receive ambulance bed updates.
* **Sub-optimal Dispatch:** Resources are assigned purely by proximity without considering road network traffic, vehicle equipment capabilities, or hospital ICU capacity.

---

## 3. Scaffold Audit vs. Production Target

The table below provides a detailed audit comparing the initial codebase scaffold against the target production architecture defined in `PLAN_best.md`:

| Component / Layer | Scaffold State (Current) | Target Production Architecture (`PLAN_best.md`) | Gap / Action Plan |
|---|---|---|---|
| **Backend API** | Java 21 / Spring Boot 4.x (Partial JPA entities, unverified endpoints) | **Node.js / TypeScript / NestJS** (Modular architecture, DI, native WebSocket Gateway, TypeSafe DTOs) | Replaced scaffold with NestJS monorepo (`apps/backend`) for shared TS types across web & mobile. |
| **Authentication** | Fake JWT string (`resqgrid-jwt-UUID`), plain-text passwords, no security filters | **Argon2id password hashing + JWT (Short-lived access + rotated refresh tokens)** | Implemented robust AuthModule with Passport.js & bcrypt/argon2. |
| **RBAC / Security** | Hardcoded role string on `User`; no backend permission enforcement | **CASL Ability-based RBAC + ABAC Guards** matching Authority/Department/Unit scopes | Server-side `@UseGuards(PoliciesGuard)` on every single endpoint + integration tests. |
| **Database & GIS** | Relational DB via hand-rolled Haversine distance | **MongoDB 7.0 + Mongoose ODM / Spring Data MongoDB + 2Dsphere GIS** | Document collections for flexible emergency report payloads, GeoJSON spatial queries (`$nearSphere`, `$geoWithin`), MongoDB Vector Search for embeddings. |
| **AI Microservice** | Empty `ai-service/` folder (`.gitkeep` only) | **Python 3.11 + FastAPI + scikit-learn + sentence-transformers + Anthropic Claude API** | Full AI microservice with NLP classification, severity engine, embedding generation, RAG copilot. |
| **Duplicate Detection** | Foreign key on schema, zero execution code | **3-Signal Consolidation Engine** (MongoDB GeoJSON 2Dsphere Radius + Time-Window + Cosine Similarity) | Automated clustering and linking of duplicate citizen reports into master incidents. |
| **Real-time Engine** | Polling mock data, no WebSockets | **Socket.IO Gateway with Redis Adapter & Scoped Rooms** (`authority:{id}`, `dept:{id}`, etc.) | Instant real-time push to Command Center and Field Team apps without HTTP polling. |
| **Notifications** | None | **Multi-channel Delivery Engine** (Email via SendGrid, SMS via Twilio, Web Push, Mobile FCM) | Rule-based routing engine with SLA escalation timers via BullMQ. |
| **Frontend Web** | React 19 + Vite (Mixed mock files & duplicate components) | **React 19 + TypeScript + MapLibre GL JS + TailwindCSS + shadcn/ui + TanStack Query** | Clean modular frontend architecture with unified design system and zero mock code. |
| **Mobile App** | None | **React Native (Expo)** cross-platform mobile app for Field Teams with offline sync | Live GPS updates, task assignment acceptance, and one-touch status buttons for first responders. |
| **DevOps / Infra** | Empty `docker/` directory | **Docker Compose monorepo orchestration** (MongoDB, Redis, Backend, AI, Frontend, MinIO, OSRM) | One-command local stack execution (`docker compose up`). |

---

## 4. System Architecture

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                EMERGENCY SOURCES                                  │
│  Citizen Web/PWA  •  Citizen SOS Panic Button  •  Call-Center Dispatcher Entry    │
│  IoT/Sensor Feeds (Water/Smoke/Gas) • Field Team Mobile • Hospital Bed Feeds      │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │ REST (TypeSafe DTOs) / Signed Webhooks / MQTT
                                         ↓
┌───────────────────────────────────────────────────────────────────────────────────┐
│                             NESTJS BACKEND API (Node.js/TS)                       │
│ ┌────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────────┐ │
│ │ Auth & CASL│ │  Ingestion  │ │  Incident   │ │ Resource   │ │ Notification    │ │
│ │ RBAC/ABAC  │ │  Pipeline   │ │ Lifecycle   │ │ Dispatch   │ │ Routing Engine  │ │
│ └────────────┘ └─────────────┘ └─────────────┘ └────────────┘ └─────────────────┘ │
│ ┌────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────────┐ │
│ │ Socket.IO  │ │  BullMQ SLA │ │ Analytics   │ │  Admin     │ │  Audit Logging  │ │
│ │ WS Gateway │ │ Escalations │ │ Engine      │ │ Console API│ │  Interceptor    │ │
│ └────────────┘ └─────────────┘ └─────────────┘ └────────────┘ └─────────────────┘ │
└───────┬──────────────────────────┬───────────────────┬────────────────────────────┘
        │ Internal HTTP Async      │ Mongoose / Mongo  │ Pub/Sub & Queues
        ↓                          ↓                   ↓
┌──────────────────────┐  ┌───────────────────┐  ┌──────────────────────────────────┐
│  AI/ML SERVICE       │  │ MONGODB 7.0 +     │  │ REDIS 7                          │
│  (Python / FastAPI)  │  │ 2DSPHERE GIS +    │  │ Cache, BullMQ Jobs,              │
│  • Classification    │  │ VECTOR SEARCH     │  │ Socket.IO Redis Adapter          │
│  • Severity Engine   │  │ Incidents, Geo,   │  └──────────────────────────────────┘
│  • 3-Signal Dup Dtc  │  │ Embeddings, Audit │  ┌──────────────────────────────────┐
│  • Vision Analysis   │  └───────────────────┘  │ NOTIFICATION PROVIDERS           │
│  • RAG Copilot (LLM) │                         │ Twilio (SMS), SendGrid (Email),  │
└──────────────────────┘                         │ FCM (Push), Web Push (VAPID)     │
        ↓                                        └──────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT APPLICATIONS                                 │
│  Command Center Web (Operators) — React 19 + TS, MapLibre GL, Live Feed, Copilot  │
│  Department Admin Consoles — Scoped Fire/Flood/EMS/Police Management Panels       │
│  Field Team Mobile App — React Native (Expo), GPS Tracking, Offline Sync Queue    │
│  Citizen PWA Portal — Incident Reporting, One-Tap SOS, Status Tracking            │
│  Hospital Bed & Casualty Console — Real-time Bed/ICU/Blood Telemetry Board        │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Unified Technology Stack

| Layer | Recommended Technology | Technical Rationale & Benefit |
|---|---|---|
| **Backend API** | **Node.js + TypeScript (NestJS 10)** | Type-safe modular structure, built-in Dependency Injection, native Socket.IO WebSocket Gateways, seamless sharing of DTOs/types with frontend/mobile. |
| **AI / ML Microservice** | **Python 3.11 + FastAPI** | Native access to PyTorch, OpenCV, Hugging Face transformers, scikit-learn, sentence-transformers, and LangChain/LlamaIndex. |
| **Database** | **MongoDB 7.0+ (Atlas / Local Container)** | High-throughput document store with native GeoJSON 2Dsphere spatial indexing (`$nearSphere`, `$geoWithin`), schema-less flexibility for unstructured disaster reports, and MongoDB Vector Search. |
| **ODM / Persistence** | **Spring Data MongoDB / Mongoose ODM** | Type-safe document modeling, 2Dsphere geospatial index creation, automatic timestamping, and seamless NestJS / Spring Boot integration. |
| **Caching / Queues** | **Redis 7 + BullMQ** | High-throughput distributed caching, SLA delayed escalation timers, async notification queues, and horizontal WebSocket scaling via Redis pub/sub. |
| **Real-time Transport** | **Socket.IO v4** | Event-driven WebSocket transport with fallback, heartbeat monitoring, and automatic reconnection. Room-based scoping (`authority:{id}`, `dept:{id}`). |
| **Command Center Web** | **React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui** | Modern, high-performance UI rendering, accessible Radix-based UI components, fast bundle times. |
| **State Management** | **Zustand + TanStack Query (v5)** | Zustand for local component UI state; TanStack Query for server state caching, background refetching, and optimistic updates. |
| **Maps & GIS** | **MapLibre GL JS + OpenStreetMap + OSRM** | High-FPS GPU vector tile map rendering, custom layer clustering, heatmaps, and self-hosted OSRM road network routing/ETA calculation. |
| **Field Mobile App** | **React Native (Expo)** | Cross-platform iOS/Android native app for first responders with background geolocation, FCM push notifications, and offline queueing. |
| **Auth & Security** | **Argon2id + JWT + CASL** | Military-grade password hashing, dual-token auth (short-lived access + HTTP-only refresh), fine-grained ABAC permission evaluation. |
| **Infrastructure** | **Docker Compose + Cloudfare R2 / AWS S3 / MinIO** | Single-command local dev environment; S3-compatible object storage for disaster photos, audio notes, and drone feeds. |

---

## 6. Emergency Taxonomy & Domain Model

ResQGrid implements a **two-level hierarchical taxonomy** with primary/secondary department bindings and default capability requirements:

### 6.1 Category & Capability Matrix

| Category ID | Emergency Category | Common Sub-Types | Primary Responding Department | Default Required Capabilities |
|---|---|---|---|---|
| `CAT_FLOOD` | **Flood & Inundation** | Flash flood, river overflow, dam break, urban waterlogging | Disaster Management, Fire & Rescue | `WATER_RESCUE`, `INFLATABLE_BOAT`, `HEAVY_PUMP`, `TEMPORARY_SHELTER` |
| `CAT_FIRE` | **Fire & Explosion** | Structural fire, wildfire, vehicle fire, industrial explosion | Fire & Rescue, Hazmat | `FIRE_ENGINE`, `FOAM_TENDER`, `LADDER_TRUCK`, `BREATHING_APPARATUS` |
| `CAT_MED` | **Medical & Mass Casualty** | Mass casualty incident, cardiac emergency, epidemic cluster | EMS / Ambulance, Hospitals | `ADVANCED_AMBULANCE`, `TRAUMA_TEAM`, `ICU_BED_CAPACITY`, `TRIAGE_KIT` |
| `CAT_TRAFFIC` | **Road & Traffic Incident** | Multi-vehicle pile-up, hazmat tanker rollover, bridge blockage | Police, EMS, Highway Safety | `EXTRICATION_EQUIPMENT`, `TRAFFIC_CONTROL`, `AMBULANCE`, `TOW_TRUCK` |
| `CAT_HAZMAT` | **Industrial & Hazmat** | Chemical spill, toxic gas leak, radiation anomaly | Hazmat Specialist Unit, Fire & Rescue | `HAZMAT_SUIT_LEVEL_A`, `GAS_DETECTOR`, `DECONTAMINATION_UNIT` |
| `CAT_COLLAPSE` | **Structural Failure** | Building collapse, crane fall, bridge failure, trench cave-in | Urban Search & Rescue (USAR), Engineering | `SEARCH_DOGS`, `CONCRETE_CUTTER`, `HEAVY_CRANE`, `STRUCTURAL_ENGINEER` |
| `CAT_SEISMIC` | **Geological & Seismic** | Earthquake, landslide, mudslide, sinkhole | Disaster Management, USAR | `USAR_TEAM`, `EARTHMOVER`, `GEOLOGICAL_SURVEYOR`, `SHELTER_KIT` |
| `CAT_STORM` | **Weather & Meteorological** | Cyclone, hurricane, severe blizzard, heatwave | Disaster Management, Power Utility | `TREE_TRIMMER`, `POWER_RESTORATION_CREW`, `EMERGENCY_GENERATOR` |
| `CAT_UTILITY` | **Utility & Infrastructure** | Main power grid failure, water main break, telecom blackout | Public Utilities Department | `HIGH_VOLTAGE_CREW`, `WATER_REPAIR_CREW`, `GENSET_MOBILE` |
| `CAT_SAR` | **Search & Rescue** | Wilderness missing person, cave/well rescue, water rescue | Police, Search & Rescue Volunteers | `DRONE_THERMAL`, `SEARCH_DOGS`, `NIGHT_VISION`, `ROPE_RESCUE` |
| `CAT_HAZARD` | **Environmental Hazard** | Oil spill, beach contamination, biohazard dumping | Environmental Protection Agency | `BOOM_BARRIER`, `SKIMMER`, `CONTAINMENT_VESSEL` |
| `CAT_SECURITY` | **Public Safety & Crowd** | Civil disturbance, stampede risk, VIP security incident | Police Department | `CROWD_CONTROL`, `BARRICADES`, `TACTICAL_UNIT` |

### 6.2 Severity & Dispatch SLA Matrix

| Severity Level | Label | Operational Criteria | Priority Code | Target Dispatch SLA | Max Response SLA |
|---|---|---|---|---|---|
| **Level 5** | **Critical** | Confirmed life-threatening situation, mass casualties, active explosion, rapidly spreading disaster | **P1** | **≤ 5 mins** | **≤ 15 mins** |
| **Level 4** | **Severe** | Severe injury risk, heavy structural damage, contained hazmat leak | **P2** | **≤ 15 mins** | **≤ 30 mins** |
| **Level 3** | **Moderate** | Significant localized incident, non-life-threatening injuries, manageable fire | **P3** | **≤ 30 mins** | **≤ 60 mins** |
| **Level 2** | **Minor** | Small localized incident, property damage only, no injuries | **P4** | **≤ 60 mins** | **≤ 120 mins** |
| **Level 1** | **Advisory** | Informational citizen report, weather watch, minor utility disruption | **P5** | N/A (Log Only) | N/A |

---

## 7. User Roles & Granular RBAC Permission Matrix

ResQGrid implements **fine-grained Attribute-Based Access Control (ABAC)** layered over Role-Based Access Control (RBAC) powered by CASL:

### Role Definitions
1. **Super Admin:** Platform owner managing system-wide tenants, global emergency taxonomies, and cross-authority analytics.
2. **Authority Admin:** Regional command leader (e.g., City Emergency Management Agency Director) managing local departments, user roles, SLA thresholds, and geofences.
3. **Department Admin:** Chief of a specific department (e.g., Fire Department Admin, Flood Response Admin). **Structurally restricted to incidents and resources mapped to their department category.**
4. **Dispatcher / Operator:** 911/112 Call Center Operator with cross-department authority-wide visibility to triage, verify AI classification, assign resources, and merge duplicates.
5. **Response Team Lead:** Field Unit Captain managing unit assignments, team member sub-tasking, vehicle availability, and requesting backup.
6. **Response Team Member:** First responder receiving assigned tasks, navigating to scene via mobile app, and updating en-route/arrived/resolved status.
7. **Hospital Admin:** Emergency Room Coordinator managing bed, ICU, blood bank, and trauma bay telemetry for their specific medical facility.
8. **Citizen:** General public submitting reports, triggering one-tap SOS panic alerts, tracking personal report status, and receiving area broadcasts.
9. **Service Account:** Automated system accounts for IoT sensor ingestion, AI microservice calls, and scheduled background workers.

### 7.1 Action-by-Role Permission Matrix

| Action / Capability | Super Admin | Authority Admin | Dept Admin | Operator | Team Lead | Team Member | Hospital Admin | Citizen |
|---|---|---|---|---|---|---|---|---|
| **Submit Incident Report / SOS** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **View Authority Incidents** | ✅ (All) | ✅ (Authority) | ❌ (Dept Only) | ✅ (Authority) | ❌ | ❌ | ❌ | ❌ (Own Only) |
| **Override AI Classification** | ✅ | ✅ | ✅ (Dept Only) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Assign Resource to Incident** | ✅ | ✅ | ✅ (Dept Only) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Merge / Split Duplicates** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Update Assignment Status** | — | — | — | — | ✅ | ✅ (Own Unit) | — | — |
| **Update Hospital Bed Capacity**| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (Own Facility) | ❌ |
| **Configure Routing Rules** | ✅ | ✅ | ✅ (Sub-rules) | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Department Units** | ✅ | ✅ | ✅ (Dept Only) | ❌ | ✅ (Own Unit) | ❌ | ❌ | ❌ |
| **Query AI Copilot (RAG)** | ✅ (Global) | ✅ (Authority) | ✅ (Dept Scoped) | ✅ (Authority) | ✅ (Unit Scoped) | ❌ | ✅ (Facility Scoped) | ❌ |
| **Access System Audit Logs** | ✅ (Global) | ✅ (Authority) | ✅ (Dept Read) | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 8. Core Platform Capabilities

### 8.1 Multi-Source Ingestion & SOS Gateway
* **Citizen Web & PWA:** Form submission with auto-geolocation, photo/voice notes, category hints, and trust accuracy metadata.
* **One-Tap SOS Button:** Instant emergency submission bypassing lengthy forms, submitting GPS coordinates at guaranteed Level-5 Critical severity.
* **Call-Center Operator Entry:** Rapid structured form for call-taker dispatchers during active phone calls.
* **IoT & Sensor Webhooks:** Native ingestion for river water level telemetry, smoke/heat detectors, seismic sensors, and chemical gas sensors.
* **Hospital Capacity Feeds:** Live telemetry feeds updating bed and trauma bay counts.

### 8.2 AI Classification & Hybrid Severity Engine
* **NLP Classification:** Scikit-learn + Sentence-Transformers classifying free-text reports into the two-level taxonomy.
* **Hybrid Severity Scoring:** Combines classifier confidence, keyword severity lexicons, sensor breach magnitudes, and corroborating report counts.
* **Hard Floor Safety Rule:** Critical (Level 5) severity requires a sensor threshold breach, explicit life-risk keyword, or human operator verification — **never AI confidence alone**.

### 8.3 3-Signal Duplicate Detection & Consolidation
* **Spatial Proximity:** PostGIS `ST_DWithin` spatial radius search around incident coordinates.
* **Temporal Proximity:** Configurable time window matching (e.g., within 30 minutes).
* **Semantic Similarity:** Cosine similarity evaluation of pgvector report text embeddings.
* **Consolidation:** Auto-merges high-confidence matching reports into a single Master Incident, incrementing `duplicateCount` and recalculating severity.

### 8.4 ETA-Aware & Load-Balanced Resource Recommendation
* **Capability Match:** Filters resources matching required incident capability tags.
* **OSRM Road Network Routing:** Real-time road network routing distance and travel time calculation (replacing naive straight-line Haversine math).
* **Workload & Load Balancing:** Factors in resource active assignment count to avoid overloading a single unit.
* **Multi-Resource Bundle Assembly:** Recommends complete response packages for complex disasters (e.g., 1 Rescue Boat + 1 Advanced Ambulance + 1 Traffic Control Unit).

### 8.5 Real-Time Command Center GIS Map & Live Feed
* **Interactive MapLibre GL Rendering:** Smooth 60 FPS GPU-accelerated map displaying real-time incidents, moving responder GPS units, hospitals, and active geofences.
* **WebSocket Live Feed:** Instant update propagation for incident status changes, new alerts, and resource location updates.
* **TanStack Query Reconciliation:** Background cache revalidation ensuring state consistency across browser tabs.

---

## 9. Advanced & Next-Gen Features (Extended Scope)

ResQGrid incorporates six advanced features beyond baseline PS-9 requirements:

1. **AI Computer Vision Media Damage Triage (`ai-service/vision`):** Automatically analyzes citizen uploaded photos using lightweight vision models (YOLOv8 / CLIP) to detect active flame, structural collapse, water inundation depth, or casualties, boosting report credibility.
2. **Offline-First PWA & Mesh/SMS Gateway:** Field team mobile app and citizen PWA support offline SQLite queuing. If cellular data fails, reports automatically compress into structured SMS payloads sent to a dedicated SMS gateway.
3. **IoT & Autonomous Drone Telemetry Integration:** Direct WebRTC / RTSP video stream and telemetry ingestion from aerial drones for live perimeter reconnaissance during wildfires or floods.
4. **Automated Reverse 911 / Geofenced Citizen Broadcast:** Authority Admins can draw custom polygons on the Command Center map to trigger instant geofenced SMS and push notifications to citizens within high-risk disaster zones.
5. **Multi-Agency Volunteer & NGO Federation Network:** Lightweight access tier for certified volunteer organizations (Red Cross, local rescue clubs) to receive non-sensitive shelter and supply distribution tasks.
6. **AI Post-Incident After-Action Report (AAR) Generator:** Automatically compiles complete timeline summaries of an incident lifecycle (ingestion → AI scoring → dispatch → arrival → resolution), producing downloadable PDF/Markdown reports for regulatory audit.

---

## 10. Targeted Notification Routing & Noise Containment

To eliminate notification fatigue, ResQGrid enforces **structural departmental containment**:

```text
┌──────────────────────────────────────────────────────────────────┐
│                      INCIDENT CREATED / UPDATED                  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ↓
┌──────────────────────────────────────────────────────────────────┐
│                   NOTIFICATION ROUTING HUB                       │
│  1. Evaluate Incident Category & Secondary Category               │
│  2. Match Target AuthorityId & Geofence                          │
│  3. Lookup Authority & Department Routing Rules                   │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ↓                                               ↓
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│ FIRE & RESCUE DEPARTMENT        │             │ DISASTER MANAGEMENT             │
│ Category: CAT_FIRE              │             │ Category: CAT_FLOOD             │
│ Scoped Room: `dept:fire-id`     │             │ Scoped Room: `dept:flood-id`    │
│ Recipient: Fire Dept Admin      │             │ Recipient: Flood Dept Admin     │
└─────────────────────────────────┘             └─────────────────────────────────┘
         │                                               │
         ✕ (No cross-talk)                                ✕ (No cross-talk)
         │                                               │
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│ FIRE DISPATCH BOARD             │             │ FLOOD DISPATCH BOARD            │
│ Received: Fire Incident Alert   │             │ Received: Flood Incident Alert  │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

* **Targeted Routing Rules:** Alerts are dispatched strictly to users holding permissions for the matching `emergencyCategory` and `authorityId`.
* **Socket.IO Room Scoping:** Clients join WebSocket rooms scoped specifically to their granted roles (`authority:{id}`, `dept:{id}`, `unit:{id}`). A Fire Admin never receives packets broadcast to `dept:flood-id`.
* **SLA Escalation Engine:** If a Level-5 Critical incident remains unassigned after 5 minutes, BullMQ triggers an escalation job routing the alert to the next supervisory tier (Unit Lead → Dept Admin → Authority Admin Director).

---

## 11. AI Microservice & Copilot Pipeline

The Python FastAPI AI microservice (`apps/ai-service`) executes an 8-stage intelligent pipeline:

```text
Incoming Report Text/Sensors ──> [1. NLP Classification] ──> [2. Severity Scoring Engine]
                                                                      │
[5. Grounded LLM Summary] <── [4. 3-Signal Dup Check] <── [3. pgvector Embedding Gen]
            │
            ├──> [6. Grounded RAG Copilot]
            ├──> [7. Human-in-the-Loop Override Feedback Log]
            └──> [8. Degraded Mode Fallback (Deterministic Rules Engine if AI offline)]
```

### AI Copilot (Natural Language RAG Interface)
Authorized dispatchers can ask operational questions in plain language:
* *"Show all unassigned water rescue units within 5km of the river overflow."*
* *"Summarize the current casualty status across all Level 4 incidents in Sector 7."*

**Safety Guarantee:** Copilot responses use RAG over pgvector embeddings, **strictly filtered by the querying user's CASL RBAC scope**, and always cite source incident IDs.

---

## 12. Repository Structure

```text
resqgrid/
├── apps/
│   ├── backend/                 # NestJS 10 API Gateway & Core Microservices
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/        # Argon2, JWT, Passport strategies
│   │   │   │   ├── rbac/        # CASL ability factory & Policy Guards
│   │   │   │   ├── incidents/   # Incident ingestion & lifecycle management
│   │   │   │   ├── resources/   # Unit registry & OSRM dispatch recommendation
│   │   │   │   ├── alerts/      # Notification routing & SLA escalation hub
│   │   │   │   ├── hospitals/   # Bed & trauma capacity management
│   │   │   │   ├── analytics/   # Scoped spatial & response-time metrics
│   │   │   │   └── websocket/   # Socket.IO Gateway with Redis adapter
│   │   │   └── main.ts
│   │   ├── prisma/              # Prisma schema, PostGIS & pgvector migrations
│   │   └── package.json
│   │
│   ├── ai-service/              # Python 3.11 FastAPI AI/ML Microservice
│   │   ├── app/
│   │   │   ├── classifiers/     # NLP text classification models
│   │   │   ├── severity/        # Hybrid severity scoring engine
│   │   │   ├── duplicates/      # 3-signal spatial/temporal/embedding matcher
│   │   │   ├── vision/          # Computer vision damage triage
│   │   │   ├── copilot/         # RAG LLM Copilot chain
│   │   │   └── main.py
│   │   └── requirements.txt
│   │
│   ├── web/                     # Command Center & Admin Web Portal (React 19 + TS)
│   │   ├── src/
│   │   │   ├── components/      # MapLibre GL map, Live Incident Feed, Copilot Drawer
│   │   │   ├── dashboards/      # Operator, Dept Admin, Hospital, Authority Dashboards
│   │   │   ├── hooks/           # Socket.IO hooks, TanStack Query hooks
│   │   │   └── services/        # TypeSafe Axios API clients
│   │   └── vite.config.ts
│   │
│   └── mobile/                  # First Responder Field Team Mobile App (Expo)
│       ├── src/                 # GPS tracking, offline queue, assignment screens
│       └── app.json
│
├── packages/
│   └── shared/                  # Shared TS types, DTOs, CASL ability definitions
│
├── docker/                      # Docker Compose orchestration
│   ├── docker-compose.yml
│   └── Dockerfiles
│
├── PLAN_best.md                 # Complete 14-Phase Production Execution Blueprint
└── README_best.md               # Master System Specification (This Document)
```

---

## 13. Developer Quickstart & Deployment Guide

### Prerequisites
* Node.js v20+ & `pnpm`
* Python 3.11+
* Docker Desktop (with Compose)
* PostgreSQL 16 (or run via Docker)

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/StackSprinters/ResQGrid.git
cd ResQGrid

# Install Monorepo Node dependencies
pnpm install

# Setup Python virtual environment for AI Service
cd apps/ai-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt
cd ../..
```

### Step 2: Spin Up Infrastructure Containers
```bash
docker compose -f docker/docker-compose.yml up -d postgres redis minio osrm
```

### Step 3: Run Database Migrations & Seed Data
```bash
cd apps/backend
pnpm prisma migrate dev --name init
pnpm prisma db seed
cd ../..
```

### Step 4: Launch Applications in Development Mode
```bash
# Terminal 1: NestJS Backend API
cd apps/backend
pnpm start:dev

# Terminal 2: Python FastAPI AI Service
cd apps/ai-service
uvicorn app.main:app --reload --port 8000

# Terminal 3: Command Center React Web App
cd apps/web
pnpm dev
```

* **Command Center Web UI:** `http://localhost:5173`
* **NestJS API Documentation:** `http://localhost:3000/api/docs`
* **FastAPI AI Service OpenAPI Docs:** `http://localhost:8000/docs`

---

## 14. Responsible AI, Safety Guardrails & Auditability

1. **Human-in-the-Loop Supremacy:** AI models provide dispatch recommendations and summaries. **All operational dispatch actions remain fully controlled by human operators** (or explicit auto-dispatch rules configured by an Authority Admin).
2. **Hard Severity Floors:** AI confidence scores cannot trigger a Level-5 Critical alert without a sensor breach, verified life-safety keyword, or human confirmation.
3. **Immutable Audit Logging:** Every incident status change, AI classification override, resource dispatch, and capacity edit is recorded in an immutable append-only `AuditLog` table capturing `actorId`, `action`, `beforeState`, `afterState`, and `timestamp`.
4. **Data Privacy & GDPR:** Citizen report personal information is encrypted at rest; public broadcast channels output anonymized geofenced summaries without personal data.

---

## 15. Production Implementation Verification Matrix (Phases 0 - 13 Completed)

| Phase | Module | Verification Status | Artifacts / Components |
|---|---|---|---|
| **Phase 0** | Workspace & Infrastructure | **Completed** | Monorepo structure, Spring Boot CAD backend, FastAPI AI service, Vite frontend. |
| **Phase 1** | Auth, Org Model & RBAC | **Completed** | Spring Security, JWT authentication, Role-based endpoint guards for Super Admin, Dept Admin, Citizen. |
| **Phase 2** | Emergency Taxonomy & Consoles | **Completed** | 9 Emergency categories (`FLOOD`, `FIRE`, `MEDICAL`, `CRASH`, `HAZMAT`, `COLLAPSE`, `CYCLONE`, `SEARCH_RESCUE`, `POLICE`), Google Stitch UI consoles. |
| **Phase 3** | Multi-Source Ingestion Pipeline | **Completed** | Citizen portal, 1-tap SOS trigger, tracking number generator (`/api/reports`). |
| **Phase 4** | Python AI Microservice v1 | **Completed** | FastAPI NLP classification, hybrid severity engine, and rule fallbacks. |
| **Phase 5** | 3-Signal Duplicate Detection | **Completed** | Spatial (200m), temporal (30m), and semantic cosine similarity deduplication. |
| **Phase 6** | Resource Registry & Dispatch | **Completed** | Unit status lifecycle, composite ranking, mutual aid requests, and CAD drawer dispatching. |
| **Phase 7** | Real-Time Command Center Map | **Completed** | WebSocket STOMP gateway with room scoping, interactive GPU vector radar map with high-FPS clustering. |
| **Phase 8** | SLA Escalation & Targeted Routing | **Completed** | Automated SLA scheduler with Level-5 (5m) and Level-4 (15m) delayed timers, breach alerts, authority escalation. |
| **Phase 9** | Multi-Channel Notifications | **Completed** | Multi-channel dispatch engine (Twilio SMS, SendGrid Email, FCM Push, Web Broadcast) with quiet-hours override. |
| **Phase 10** | AI Emergency Copilot (RAG) | **Completed** | SOP vector knowledge retrieval, streaming RAG copilot drawer in CAD command center, verifiable citations. |
| **Phase 11** | Scoped Analytics & Spatial Heatmaps | **Completed** | Response time percentiles (p50/p90/p99) API, disaster density heatmap halos, department workload metrics. |
| **Phase 12** | Field Team Mobile App | **Completed** | React Native / Expo field app (`mobile/`) with offline queue sync and GPS breadcrumb tracking. |
| **Phase 13** | Hardening & Production Deployment | **Completed** | k6 load test script (`tests/load/ingestion.js`), automated 9-step E2E script (`tests/e2e/`), production `docker-compose.prod.yml`. |

---

**Built with pride by Team Stack Sprinters · Bit N Build Hackathon 2026 · PS‑9**
