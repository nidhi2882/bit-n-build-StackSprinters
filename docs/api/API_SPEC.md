# 📡 ResQGrid API Specification

**Version:** 1.0.0  
**Live Frontend:** [https://bit-n-build-stack-sprinters.vercel.app](https://bit-n-build-stack-sprinters.vercel.app)  
**Base URL:** `http://localhost:8080/api` (Spring Boot) / `http://localhost:3000/api/v1` (NestJS API Gateway)

---

## 🔐 Authentication APIs (`/api/auth`)

### 1. `POST /api/auth/register`
* **Access:** Public
* **Description:** Register a new user account (Citizen, Responder, Facility Staff).
* **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "role": "CITIZEN",
  "phone": "+1234567890"
}
```
* **Response (201 Created):**
```json
{
  "id": "usr_987654",
  "email": "jane@example.com",
  "role": "CITIZEN",
  "token": "jwt_access_token_string",
  "refreshToken": "jwt_refresh_token_string"
}
```

### 2. `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "operator@resqgrid.gov",
  "password": "OperatorPassword123!"
}
```
* **Response (200 OK):** Token credentials & user profile.

---

## 🚨 Incident Ingestion APIs (`/api/incidents`)

### 1. `POST /api/incidents`
* **Access:** Public / Citizen / Operator / Sensors
* **Description:** Submit a raw emergency report or incident ticket.
* **Request Body:**
```json
{
  "title": "Flash flood near Riverbed Road",
  "description": "Rising water level trapped 3 vehicles near bridge.",
  "categoryHint": "CAT_FLOOD",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracyMeters": 5.2,
  "reporterPhone": "+1234567890"
}
```

### 2. `GET /api/incidents`
* **Access:** Authenticated (Scoped by RBAC role)
* **Query Parameters:** `category`, `severity`, `status`, `authorityId`

### 3. `GET /api/incidents/{id}/recommendations`
* **Access:** Operator / Department Admin
* **Description:** Get ranked list of recommended emergency response units based on capability, distance, and workload score.

---

## 🚑 Resource Management APIs (`/api/resources`)

### 1. `GET /api/resources`
* **Access:** Operator / Department Admin
* **Description:** List available teams, vehicles, and equipment.

### 2. `POST /api/incidents/{id}/assign`
* **Access:** Operator / Department Admin
* **Request Body:**
```json
{
  "resourceId": "res_boat_12",
  "notes": "Deploy immediately for water extraction."
}
```

---

## 🏥 Hospital Capacity APIs (`/api/hospitals`)

### 1. `GET /api/hospitals`
* **Access:** Operator / Hospital Admin / Public
* **Description:** Fetch hospital telemetry, ICU bed counts, and trauma capacity.

### 2. `PUT /api/hospitals/{id}/capacity`
* **Access:** Hospital Admin
* **Request Body:**
```json
{
  "availableBeds": 14,
  "icuBeds": 3,
  "traumaBayStatus": "OPEN"
}
```
