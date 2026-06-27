# TransportFlow AI Frontend

React frontend setup for the TransportFlow AI PRD.

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

- Frontend-only mock authentication
- Protected app routes
- Demo login session with localStorage
- Sign out action
- Vehicle management page
- Driver management page
- Local React state for search, filtering, and adding vehicle/driver records

Not included yet:

- Backend or API integration
- Database setup
- Production authentication provider
- Load management
- Dispatch workflow
- Customer management
- Reports module
- Settings module
- Real AI logic or optimization features
- Persistent transportation workflows

## Getting started

```bash
npm install
npm run dev
```

## Demo login

```txt
Email: demo@transportflow.ai
Password: password
```

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Routes

- `/login` — Public mock login page
- `/` — Protected overview page
- `/vehicles-drivers` — Protected vehicle and driver management page
- `/design-system` — Protected UI foundation/reference page
- `*` — Static not-found page

## Milestone note

Milestone 2 is intentionally limited to authentication plus vehicle and driver management. Authentication is a frontend demo only and is not production security. Future milestones can add backend APIs, database persistence, load/dispatch/customer workflows, reporting, settings, and AI-assisted features.
