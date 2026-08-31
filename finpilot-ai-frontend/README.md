# FinPilot AI — Frontend

React 19 + TypeScript frontend for the FinPilot AI financial intelligence platform. Consumes an existing FastAPI backend — no mock data.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Axios · Redux Toolkit · Lucide React · react-markdown

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if not localhost:8000
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Environment

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Project structure

```
src/
├── api/          # centralized Axios instance + one module per resource
├── components/   # layout, ui, ai, customer, transactions, documents, financial
├── hooks/        # useFetch (abortable), useDebounce, useAnalystConversation, useAuth
├── layouts/      # AppLayout (admin sidebar + topbar), PortalLayout (customer portal)
├── pages/        # one page per route, lazy-loaded
├── routes/       # AppRoutes.tsx
├── store/        # Redux Toolkit (authSlice, selected customer)
├── types/        # domain + API TypeScript interfaces
└── utils/        # currency/date formatting, className helper, list normalization
```

## Authentication

The application uses JWT bearer tokens with role-based access control (RBAC). Two roles are supported:
- **ADMIN** — access to the full console with analytics, investigations, and customer management
- **CUSTOMER** — access to a self-service portal showing their own accounts, transactions, loans, and profile

Register at `/register` or login at `/login`. Routes are protected with `RequireRole` wrappers that enforce role checks.

## Features

1. **AI Financial Analyst** (`/analyst`) — chat interface with markdown answers, tool-usage badges, and source citations.
2. **Customer 360** (`/customers/:id`) — financial health, debt exposure, credit profile, liquidity.
3. **Transaction Intelligence** (`/transactions`) — activity table plus anomaly detection.
4. **Document / RAG Center** (`/documents`) — PDF upload with progress, processing states, and a chunking → embeddings → vector search pipeline explainer.
5. **Investigation Workspace** (`/investigation`) — tabbed view across health, transactions, loans, anomalies, and multi-tool AI analysis for a selected customer.
6. **Customer Portal** (`/portal/*`) — self-service view for customers to see their overview, accounts, transactions, loans, and profile information.

## Notes

- All requests go through `src/api/axios.ts`; no component calls Axios directly.
- Backend response shape uncertainty is isolated in `src/api/*` and `src/types/domain.ts` rather than spread through the app as `any`.
- Every API-driven screen implements loading, success, empty, and error states.
- Authentication state is managed by `authSlice` and persisted to localStorage via `authStorage` utilities; 401 responses trigger automatic sign-out and redirect to login.
