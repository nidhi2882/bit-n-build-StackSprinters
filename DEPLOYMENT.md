# 🚀 ResQGrid Deployment Guide & Live Links

## 🌐 Production Deployments

| Component | Platform | URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web Application** | **Vercel** | **[https://bit-n-build-stack-sprinters.vercel.app](https://bit-n-build-stack-sprinters.vercel.app)** | 🟢 Active |
| **Demo Video Walkthrough** | Google Drive | [Watch Demo](https://drive.google.com/file/d/1tI2c5Tru0btmVy3gLObA89w8CJBl0HKi/view?usp=sharing) | 🟢 Available |
| **Pitch Presentation (Deck)** | Google Slides | [View Presentation](https://docs.google.com/presentation/d/1XqqpVk9L0gO5S2kl14o8TphuRRGo4tC2/edit?usp=sharing&ouid=108215591275858216197&rtpof=true&sd=true) | 🟢 Available |

---

## ⚡ Frontend Vercel Configuration

The frontend single-page application is built using **Vite + React** and hosted on **Vercel**.

### Vercel Build & Output Settings
- **Root Directory:** `frontend`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Single-Page Application (SPA) Routing
A `vercel.json` configuration file is maintained inside `/frontend` to rewrite all client-side paths to `/index.html`, ensuring that direct navigation and page reloads on deep URLs (e.g. `/department/flood`, `/department/fire`, `/citizen/report`, `/login`) resolve correctly without 404 errors:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔑 Quick Demo Credentials

All test credentials are pre-seeded and accessible with one-click quick login buttons on the live site:

* **Super Admin**: `david.chandler@resqgrid.gov` / `admin123`
* **Flood Department**: `flood.admin@resqgrid.gov` / `floodadmin123`
* **Fire Department**: `fire.admin@resqgrid.gov` / `fireadmin123`
* **Medical / EMS**: `medical.admin@resqgrid.gov` / `medadmin123`
* **Citizen**: `citizen@resqgrid.gov` / `citizen123`
