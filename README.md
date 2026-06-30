# TransportFlow AI Frontend

React frontend and backend setup for the TransportFlow AI PRD.

## Scope

This project currently covers:

### Milestone 1: UI/UX Design & Setup

- Vite + React frontend setup
- React Router app shell
- TransportFlow AI visual foundation
- Overview page
- Design-system reference page
- Reusable layout and UI components
- Plain CSS theme and responsive layout

### Milestone 2: Authentication, Vehicle & Driver Management - $1,000

- Protected app routes
- Vehicle management page
- Driver management page
- Local React state for search, filtering, and adding vehicle/driver records

### Milestone 3: Customer, Route & Trip Management

- Customer management page section
- Route management page section
- Trip management page section
- Local React state for search, filtering, and adding customer/route/trip records

### Milestone 4: Fuel & Maintenance Management

- Firebase Authentication for protected frontend and backend API requests
- Firebase password reset from the login screen
- Express REST API backend
- MongoDB Atlas persistence with Mongoose
- Zod validation for create/update requests, including no-past-date rules
- Fuel Log CRUD
- Maintenance CRUD
- Dashboard cards powered by backend summary API

### Milestone 5: Invoice & Payment Management

- Invoice CRUD
- Backend-generated invoice numbers
- Invoice PDF export
- Customer, trip, and vehicle selection
- Tax, discount, and GST calculation
- Paid, Pending, and Partial payment statuses
- Revenue dashboard cards
- MongoDB invoice model
- Zod validation for invoice create/update requests, including no-past-date rules

Not included:

- Reports module
- AI features
- Payment gateway integration
- Load management
- Dispatch workflow
- Unrelated backend modules

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

Fill in Firebase and MongoDB Atlas values in `.env` and `server/.env`.

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
```

`CLIENT_ORIGIN` can contain comma-separated frontend URLs for local, staging, and production. The Firebase web config in `.env` and Firebase Admin service account in `server/.env` must use the same Firebase project, otherwise protected API requests will return 401.

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

## Routes

- `/login` — Firebase Auth login, sign-up, and forgot-password page
- `/` — Protected overview page
- `/vehicles-drivers` — Protected vehicle and driver management page
- `/customers-routes-trips` — Protected customer, route, and trip management page
- `/fuel-maintenance` — Protected fuel and maintenance management page
- `/invoices-payments` — Protected invoice and payment management page
- `/design-system` — Protected UI foundation/reference page
- `*` — Static not-found page

## API List

All backend APIs require a Firebase ID token:

```txt
Authorization: Bearer <Firebase ID token>
```

### Fuel Logs

- `GET /api/fuel-logs`
- `POST /api/fuel-logs`
- `PATCH /api/fuel-logs/:id`
- `DELETE /api/fuel-logs/:id`

### Maintenance

- `GET /api/maintenance`
- `POST /api/maintenance`
- `PATCH /api/maintenance/:id`
- `DELETE /api/maintenance/:id`

### Fuel & Maintenance Dashboard Summary

- `GET /api/fuel-maintenance/summary`

### Invoices

- `GET /api/invoices`
- `GET /api/invoices/next-number`
- `GET /api/invoices/revenue-summary`
- `GET /api/invoices/:id`
- `POST /api/invoices`
- `PATCH /api/invoices/:id`
- `DELETE /api/invoices/:id`

## Milestone 5 note

Invoice records are stored in MongoDB Atlas and protected by Firebase Auth. The invoice page consumes backend APIs for CRUD and revenue dashboard data. PDF export is generated on the frontend from saved invoice data. Reports and AI features are intentionally not implemented.
