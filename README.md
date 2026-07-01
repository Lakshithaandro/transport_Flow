# TransportFlow AI

TransportFlow AI is a logistics operations dashboard for managing fleet records, customers, routes, trips, fuel logs, maintenance work, invoices, reports, and an AI-powered logistics assistant.

The application combines a React/Vite frontend with an Express/MongoDB backend, Firebase authentication, protected REST APIs, analytics services, and a backend-only Anthropic integration for grounded AI operations analysis.

## Features

- Firebase authentication with protected application routes.
- Fleet and driver management.
- Customer, route, and trip management.
- Fuel log and maintenance record CRUD with MongoDB persistence.
- Invoice and payment management with backend-generated invoice numbers and PDF export.
- Reports and analytics for revenue, fuel, maintenance, fleet, driver, route, and operational KPIs.
- AI Operations Assistant for:
  - route optimization and route comparison
  - abnormal fuel usage review
  - fuel cost reduction recommendations
  - fleet health and maintenance risk prediction
  - revenue, invoice, customer, route, driver, vehicle, fuel, and maintenance questions
- Light and dark theme support.

## Architecture

```txt
React + Vite frontend
  ├─ Firebase web authentication
  ├─ Protected routes and app shell
  ├─ TransportFlow UI components
  ├─ API services using Firebase bearer tokens
  └─ AI Assistant interface

Express backend
  ├─ Firebase Admin authentication middleware
  ├─ MongoDB Atlas persistence with Mongoose
  ├─ Zod request validation
  ├─ Fuel, maintenance, invoice, analytics, and AI routes
  └─ Anthropic SDK integration for backend-only AI calls
```

AI requests are handled on the backend so Anthropic credentials are never exposed to the browser. Assistant answers are grounded in the authenticated user's available TransportFlow analytics payload.

## Getting started

Install dependencies:

```bash
npm install
```

Create environment files:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Fill in Firebase, MongoDB Atlas, and Anthropic values in `.env` and `server/.env`.

Frontend `.env` requires:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

Backend `server/.env` requires:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,https://your-frontend.example.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/transportflow
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
ANTHROPIC_API_KEY=your-backend-only-anthropic-api-key
```

`CLIENT_ORIGIN` can contain comma-separated frontend URLs for local, staging, and production. The Firebase web config in `.env` and Firebase Admin service account in `server/.env` must use the same Firebase project, otherwise protected API requests will return 401.

If `ANTHROPIC_API_KEY` is not configured, the Assistant route still returns a safe fallback response based on rule-based analytics, but natural-language AI analysis requires the key.

Run the backend:

```bash
npm run dev:server
```

Run the frontend in another terminal:

```bash
npm run dev
```

Or run both together:

```bash
npm run dev:full
```

## Available scripts

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run dev:full
npm run build
npm run preview
npm run lint
```

## Application routes

- `/login` — Firebase Auth login, sign-up, and forgot-password page.
- `/vehicles-drivers` — Protected fleet and driver management page.
- `/customers-routes-trips` — Protected customer, route, and trip management page.
- `/fuel-maintenance` — Protected fuel and maintenance management page.
- `/invoices-payments` — Protected invoice and payment management page.
- `/reports-analytics` — Protected reports and analytics page.
- `/logistics-assistant` — Protected AI Operations Assistant page.
- `*` — Not-found page.

## API endpoints

All protected backend APIs require a Firebase ID token:

```txt
Authorization: Bearer <Firebase ID token>
```

### Fuel logs

- `GET /api/fuel-logs`
- `POST /api/fuel-logs`
- `PATCH /api/fuel-logs/:id`
- `DELETE /api/fuel-logs/:id`

### Maintenance

- `GET /api/maintenance`
- `POST /api/maintenance`
- `PATCH /api/maintenance/:id`
- `DELETE /api/maintenance/:id`

### Fuel and maintenance summary

- `GET /api/fuel-maintenance/summary`

### Invoices

- `GET /api/invoices`
- `GET /api/invoices/next-number`
- `GET /api/invoices/revenue-summary`
- `GET /api/invoices/:id`
- `POST /api/invoices`
- `PATCH /api/invoices/:id`
- `DELETE /api/invoices/:id`

### Reports and analytics

- `GET /api/analytics/reports`
- `GET /api/analytics/route-optimization`
- `GET /api/analytics/ai-insights`

### AI Assistant

- `GET /api/ai/status`
- `POST /api/ai/assistant`

Request body for `POST /api/ai/assistant`:

```json
{
  "question": "Which vehicles need maintenance this week?"
}
```

The Assistant API builds an authenticated analytics context and uses Claude through the official Anthropic SDK on the backend.

## AI Assistant behavior

The AI Operations Assistant is designed to answer natural-language logistics questions using available TransportFlow data. It can analyze route efficiency, fuel usage, fleet health, maintenance risk, invoices, revenue, customers, drivers, vehicles, and operational performance.

The frontend only calls the AI endpoint when the user clicks **Ask Assistant** or submits the assistant form. Suggested prompts only populate the input field.

Assistant responses support summaries, bullet lists, tables, recommendations, warnings, metrics, and grounding metadata.

## Future integrations

The current implementation uses TransportFlow records and analytics already available to the application. Future integrations may add live map routing, toll-provider pricing, GPS/ELD/telematics streams, fuel-card feeds, payment gateway capture, or dispatch mutation workflows.

Until those integrations exist, the Assistant should treat those areas as unavailable external data sources and provide grounded recommendations from current records only.
