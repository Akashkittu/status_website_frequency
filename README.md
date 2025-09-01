# 🟢 Status Monitor & Incident Manager (Full-stack)

A full-stack system for **service monitoring** (uptime, latency, health), **incident management** (CRUD, timelines, logs), **admin/user auth**, **real-time updates** via Socket.IO, and **AI-assisted summaries/health analysis** (Gemini).

---

## ✨ Features

- **Service Monitoring**
  - Heartbeat pings, uptime %, latency, status badges
  - Historical logs with **time-range filters** and **charts** (Chart.js)
  - Auto-cleanup of logs older than 7 days

- **Incident Management**
  - CRUD + detail pages with **timeline** and **related logs**
  - **AI Incident Summary** (root cause, impact, recommendations)
  - **Service Health Summary** (reliability, trends, actions)
  - Optional **auto-detect** incidents from logs

- **Real-time UX**
  - Live service updates & incident banners via Socket.IO

- **Auth**
  - User & Admin (JWT). Admin email must end with `@service.admin.com`

- **Modern UI**
  - React (CRA), TailwindCSS, Chakra accents, React Router, Toasts

---

## 🗂 Project Structure

```
frontend/
  public/
    index.html
    manifest.json
    robots.txt
    favicon.ico
    logo.png
  src/
    App.js
    index.js
    index.css
    global.css
    theme.js
    api.js
    constants.js
    socket.js
    AuthContext.jsx
    useAuth.js
    useSocket.js
    pages/
      Home.jsx
      IncidentsPage.jsx
      IncidentDetailPage.jsx
    components/
      # Auth & Routing
      AdminRoute.jsx
      PrivateRoute.jsx
      Navbar.jsx
      # Dashboards
      AdminDashboard.jsx
      UserDashboard.jsx
      StatusDashboard.jsx
      # Services
      AdminServiceTable.jsx
      ServiceList.jsx
      ServiceCard.jsx
      ServiceForm.jsx
      ServiceLogsModal.jsx
      ServiceHealthPanel.jsx
      IncidentBanner.jsx
      ServiceStatusCard.jsx
      # Incidents
      AISummaryPanel.jsx
      AutoDetectionPanel.jsx
      CreateIncidentModal.jsx
      IncidentCard.jsx
      IncidentDetail.jsx
      IncidentFilters.jsx
      IncidentsList.jsx
      IncidentTimeline.jsx
      RelatedLogs.jsx

backend/
  server.js
  db.js
  heartbeat.js
  routes/
    adminRoutes.js
    userRoutes.js
    serviceRoutes.js
    incidentRoutes.js
  controllers/
    # (referenced by routes; define handlers here)
  models/
    Admin.js
    User.js
    Incident.js
    StatusLog.js
    Service.js        # (referenced across files; ensure present)
  services/
    aiService.js      # Gemini 1.5-flash helpers
  scripts/
    addTestData.js    # seed sample services
    clearServices.js  # wipe services collection
  utils/
    database-stats.js
    test-ai-features.js
```

> ⚠️ Note: Some scripts (e.g., `addTestData.js`, `db.js`) in your snapshot used hardcoded Mongo URIs. Replace those with `process.env.MONGO_URI` before committing.

---

## 🚀 Quick Start

### 1) Backend

**Requirements:** Node 18+, MongoDB (local or Atlas).

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/status_app
JWT_SECRET=super_secret_change_me

# Optional (enables AI features in aiService/test script)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (if/when email notifications are added)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_smtp_password
```

Add handy scripts to `backend/package.json` (optional):

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon --watch . server.js",
    "seed": "node scripts/addTestData.js",
    "clear": "node scripts/clearServices.js",
    "db:stats": "node utils/database-stats.js",
    "ai:test": "node utils/test-ai-features.js"
  }
}
```

Run the API:

```bash
npm run dev    # or: npm start
```

Mounted route groups:

- `/api/admin` → register/login/manual cleanup
- `/api/users` → register/login
- `/api/services` → services CRUD, status, logs, uptime, analytics
- `/api/incidents` → incidents CRUD + AI (summary, health, auto-detect)

---

### 2) Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Add scripts to `frontend/package.json` (CRA default is fine; example):

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

Run the app:

```bash
npm start
# opens http://localhost:3000
```

---

## 🔐 Authentication

### Models
- **Admin**
  - `email` (unique; must end with `@service.admin.com`)
  - `passwordHash`
- **User**
  - `email` (unique)
  - `passwordHash`
  - `role` (defaults to `"user"`)

### Frontend Guards
- `<PrivateRoute>` protects user pages
- `<AdminRoute>` protects admin pages

Store JWT in `localStorage` and attach via Axios interceptor.

---

## 🧭 API Overview (selected)

> Base URL: `http://localhost:5000/api`

### Auth
- `POST /users/register` — create user
- `POST /users/login` — user login
- `POST /admin/register` — create admin (domain-restricted email)
- `POST /admin/login` — admin login
- `POST /admin/cleanup-logs` — manual status log cleanup (older than 7 days)

### Services
- `GET /services` — list services
- `POST /services` — create service `{ name, url }`
- `PUT /services/:id` — update status or fields
- `DELETE /services/:id` — delete service
- `GET /services/:id/status` — current status
- `GET /services/:id/logs` — status log stream
- `GET /services/:id/uptime` — uptime %
- `GET /services/:id/incidents` — incidents for this service
- `GET /services/:id/analytics` — basic analytics

### Incidents
- `GET /incidents` — list
- `POST /incidents` — create `{ service, title, description, severity }`
- `GET /incidents/:id` — detail
- `PUT /incidents/:id` — update fields (`status`, `endTime`, etc.)
- `DELETE /incidents/:id` — delete
- `POST /incidents/:id/generate-summary` — AI summary (Gemini)
- `GET /incidents/service/:serviceId/health-summary` — AI health summary
- `POST /incidents/service/:serviceId/auto-detect` — auto-detect from logs

---

## 🔔 WebSocket Events

**Server → Client**
- `serviceStatusUpdate` — `{ _id, status, latency, uptime, lastChecked, name, url }`
- `newServiceRegistered` — `service`
- `statusLogsCleanup` — `{ deletedCount, cleanupDate, cutoffDate }`

**Client → Server** (example)
- `join` — `{ userId }` (optional rooming/identification)

Your frontend hooks/components (`useSocket`, `StatusDashboard`, `ServiceList`, etc.) already subscribe to these.

---

## ⏱ Heartbeat & Cleanup

Implemented in `backend/heartbeat.js`.

- **Heartbeat schedule (default)**  
  ```
  cron.schedule('* * * * *', ...)
  ```
  Runs every **1 minute**. (If you truly want 5-minute cadence, change to `*/5 * * * *`.)

  For each service:
  - HTTP GET `${service.url}` with 5s timeout
  - Create `StatusLog` (`status: UP|DOWN`, `latency` when UP)
  - Recompute uptime = `UP logs / total logs * 100`
  - Update `Service` (`status`, `latency`, `lastChecked`, `uptime`)
  - Emit `serviceStatusUpdate`

- **Daily cleanup (midnight)**  
  ```
  cron.schedule('0 0 * * *', ...)
  ```
  Deletes `StatusLog` entries older than **7 days** and emits `statusLogsCleanup`.

- **Manual cleanup**  
  `POST /api/admin/cleanup-logs` uses the same retention.

---

## 🧪 Utilities

- **Seed data**
  ```bash
  npm run seed        # runs scripts/addTestData.js
  ```
- **Clear services**
  ```bash
  npm run clear       # runs scripts/clearServices.js
  ```
- **DB stats & retention simulation**
  ```bash
  npm run db:stats    # runs utils/database-stats.js
  # flags like: --add-test-data, --cleanup (if implemented)
  ```
- **AI smoke test**
  ```bash
  npm run ai:test     # runs utils/test-ai-features.js
  ```

---

## 🖥 Frontend Highlights

- **Status Dashboard**
  - Real-time service cards, incident banner when any service is DOWN
  - “Last updated” timestamp; 60s polling fallback
- **Service Logs Modal**
  - Latency line chart, UP/DOWN bar timeline, recent events table
  - Time-range filter: 1h / 24h / 7d / 30d
- **Service Health Panel (AI)**
  - Health score, uptime, response time, incident count, error rate
  - Markdown recommendations & copy-to-clipboard
- **Incidents**
  - Filters, cards, detail view with timeline & related logs
  - AI summary generation on demand

---



## ⚠️ Troubleshooting

- **CORS**: Ensure frontend `REACT_APP_API_URL` matches backend URL.
- **Mongo**: Verify `MONGO_URI` and DB availability.
- **Socket.IO**: Confirm `REACT_APP_SOCKET_URL` and that server logs show client connect/disconnect.
- **AI**: Set `GEMINI_API_KEY` if you use AI endpoints. Handle quota & network restrictions.

---



## 🗺 Roadmap

- Email / Slack / SMS alerts on downtime
- Per-org multi-tenant support
- Rich analytics (SLA reports, weekly digests)
- RBAC & audit logs

---


## Contributing

Feel free to fork this repository, create a branch, and submit a pull request for improvements.


## Contact

For any queries, feel free to reach out at [akashburnwal550@gmail.com].
