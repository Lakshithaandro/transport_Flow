# TransportFlow AI Frontend

React frontend and Milestone 4 backend setup for the TransportFlow AI PRD.

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
- Express REST API backend
- MongoDB Atlas persistence with Mongoose
- Zod validation for create/update requests
- Fuel Log CRUD
- Maintenance CRUD
- Dashboard cards powered by backend summary API
- Frontend page consuming backend APIs only for fuel and maintenance records

Not included:

- Invoices
- Reports module
- AI features
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

- `/login` — Firebase Auth login page
- `/` — Protected overview page
- `/vehicles-drivers` — Protected vehicle and driver management page
- `/customers-routes-trips` — Protected customer, route, and trip management page
- `/fuel-maintenance` — Protected fuel and maintenance management page
- `/design-system` — Protected UI foundation/reference page
- `*` — Static not-found page

## API List

All Milestone 4 APIs require a Firebase ID token:

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

### Dashboard Summary

- `GET /api/fuel-maintenance/summary`

Returns:

- Total Fuel Cost
- Average Mileage
- Vehicles Due for Service
- Total Maintenance Cost

## Milestone 4 note

Fuel and maintenance records are not dummy data. The Milestone 4 page fetches and mutates records through the backend REST API. MongoDB Atlas and Firebase credentials are required before the backend can run successfully.
