# 🚨 ResQGrid — Development Plan

**Hackathon:** Bit N Build Hackathon 2026
**Problem Statement:** PS-9
**Team:** Stack Sprinters

---

## 1. Project Goal

Build an intelligent emergency-response platform that:

```text
Collect → Understand → Prioritize → Coordinate → Monitor → Escalate
```

ResQGrid will combine AI, geospatial data, resource management, and real-time monitoring into one command center.

---

## 2. MVP Features

### 🚨 Incident Management

* Create and manage emergency incidents.
* Classify incident type.
* Assign severity and priority.
* Track incident status.

### 🤖 AI Intelligence

* Incident classification.
* Severity estimation.
* Emergency summaries.
* Duplicate report detection.

### 🚑 Resource Management

* Manage emergency teams, vehicles, and equipment.
* Track resource availability.
* Recommend suitable resources based on:

    * Capability
    * Availability
    * Distance

### 🗺️ Command Center

* Live incident dashboard.
* Interactive map.
* Resource locations.
* Hospital/facility information.
* Alerts and escalation.

### 📡 Real-Time Monitoring

```text
REPORTED → CLASSIFIED → PRIORITIZED → ASSIGNED
→ DISPATCHED → EN_ROUTE → ARRIVED → RESOLVED
```

### 🚨 Alerts

* Critical incidents.
* No resource assigned.
* Delayed response.
* Increasing severity.
* Resource shortage.

---

## 3. Technology Stack

| Layer      | Technology                       |
| ---------- | -------------------------------- |
| Frontend   | React                            |
| Backend    | Java + Spring Boot               |
| AI/ML      | Python + Scikit-learn + LLM APIs |
| Database   | PostgreSQL                       |
| Maps       | OpenStreetMap + Leaflet/MapLibre |
| Real-Time  | WebSockets                       |
| Security   | JWT + RBAC                       |
| Deployment | Docker + Cloud                   |

---

## 4. Architecture

```text
Emergency Sources
       ↓
React Frontend
       ↓
Spring Boot Backend
   ↙        ↓        ↘
AI Service PostgreSQL  WebSocket
       ↓
Geospatial Layer
```

---

## 5. Main Modules

```text
backend/
├── auth/
├── incidents/
├── resources/
├── recommendations/
├── alerts/
├── hospitals/
├── analytics/
└── websocket/

ai-service/
├── classification/
├── severity/
├── duplicate-detection/
└── summarization/
```

---

## 6. Database Entities

```text
User
Incident
IncidentReport
Resource
ResourceAssignment
Hospital
Alert
IncidentEvent
```

Main relationship:

```text
Reports → Incident → Resource Assignment → Resource
                    ↓
                   Alerts
```

---

## 7. Core APIs

```text
POST   /api/auth/login

POST   /api/incidents
GET    /api/incidents
GET    /api/incidents/{id}

POST   /api/reports

GET    /api/resources
POST   /api/resources

GET    /api/incidents/{id}/recommendations
POST   /api/incidents/{id}/assign-resource

GET    /api/alerts

GET    /api/analytics/overview
```

---

## 8. AI Flow

```text
Emergency Report
      ↓
Classification
      ↓
Severity
      ↓
Summary
      ↓
Duplicate Detection
      ↓
Backend Decision
```

AI should assist operators while critical operational decisions remain controlled by backend rules.

---

## 9. Resource Recommendation

First filter resources by:

```text
Available?
    ↓
Capability Match?
    ↓
Equipment Match?
```

Then rank eligible resources using:

```text
Distance + Capability + Availability + Workload
```

---

## 10. Development Phases

### Phase 1 — Setup

* GitHub repository
* Project structure
* Database
* Spring Boot + React setup

### Phase 2 — Backend

* Authentication
* Incidents
* Resources
* Assignments

### Phase 3 — AI

* Classification
* Severity
* Duplicate detection
* Summarization

### Phase 4 — Frontend

* Command center
* Incident dashboard
* Resource dashboard
* Map
* Alerts

### Phase 5 — Integration

* WebSockets
* Recommendation engine
* Escalation
* Analytics

### Phase 6 — Finalization

* Testing
* Docker
* Deployment
* Demo video
* PPT
* Documentation

---

## 11. Git Strategy

```text
main
 ├── feature/backend
 ├── feature/frontend
 ├── feature/ai
 ├── feature/gis
 └── feature/devops
```

Use clear commits:

```text
feat: add incident API
fix: resolve resource assignment
test: add incident tests
docs: update architecture
```

---

## 12. Demo Scenario

Use a **flood emergency**:

```text
Citizen reports trapped people
        ↓
Sensor reports rising water
        ↓
AI identifies FLOOD + CRITICAL
        ↓
Duplicate reports consolidated
        ↓
System recommends rescue boat
        ↓
Operator assigns team
        ↓
Team status updates in real time
        ↓
Delay detected
        ↓
Alert + escalation
        ↓
Team arrives
        ↓
Incident resolved
```

---

## 13. Definition of Done

The MVP is complete when one emergency can successfully go through:

```text
Report
 ↓
AI Analysis
 ↓
Priority
 ↓
Duplicate Detection
 ↓
Resource Recommendation
 ↓
Assignment
 ↓
Real-Time Tracking
 ↓
Alert
 ↓
Resolution
```

**Focus:** Build a working end-to-end emergency coordination system first, then add advanced features.