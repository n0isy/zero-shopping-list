# Zero Shopping List

**[list.nvect.com](https://list.nvect.com)**

A real-time collaborative shopping list built with [Rocicorp Zero](https://zero.rocicorp.dev/) and Vite. Multiple users can edit the same list simultaneously — changes sync instantly across all connected clients.

## Features

- **Real-time sync** — powered by Zero's local-first architecture (IVM + WebSocket)
- **Private rooms** — each list gets a unique nanoid URL; share it to collaborate
- **Share via QR code** — built-in share modal with QR code and copy-to-clipboard
- **PWA** — installable, offline-ready with service worker and IndexedDB caching
- **Mobile-first dark theme** — large touch targets, responsive layout
- **Secure by default** — legacy queries/mutators disabled; clients can only access lists by ID

## Architecture

```
Browser ──WebSocket──▸ zero-cache ──WAL──▸ PostgreSQL
                           ▲
                           │ HTTP (mutations/queries)
                           ▼
                      Vite dev server (API plugin)
```

| Component | Role |
|-----------|------|
| **PostgreSQL** | Source of truth |
| **zero-cache** | Replication engine — syncs Postgres ↔ client replicas via WebSocket |
| **Vite** | SPA dev server + API routes via `configureServer` plugin |
| **Caddy** | Reverse proxy — single entry point, routes `/zero/*` to zero-cache |

### Custom Mutators & Queries

Follows the [zbugs reference app](https://github.com/rocicorp/mono/tree/main/apps/zbugs) pattern:

- `shared/mutators.ts` — `defineMutators` / `defineMutator` with Zod validation
- `shared/queries.ts` — `defineQueries` / `defineQuery` with builder pattern
- `frontend/src/server/api-plugin.ts` — Vite plugin handling `/api/mutate` and `/api/query`

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Run

```bash
docker compose up -d
```

The app is available at **http://localhost:20060**

Visit the homepage to get redirected to a new list, or go directly to `http://localhost:20060/list/<any-id>`.

### Stop

```bash
docker compose down       # keep data
docker compose down -v    # reset everything
```

## Project Structure

```
├── docker-compose.yaml
├── Caddyfile
├── db/
│   └── migrate.sql               # PostgreSQL schema (init container)
├── shared/
│   ├── schema.ts                 # Zero schema (tables + relationships)
│   ├── mutators.ts               # Custom mutators (defineMutators)
│   └── queries.ts                # Custom queries (defineQueries)
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── public/                   # PWA icons
│   └── src/
│       ├── main.tsx              # Entry point
│       ├── App.tsx               # Client-side routing
│       ├── app.css               # Dark theme CSS
│       ├── server/
│       │   └── api-plugin.ts     # Vite plugin: /api/mutate, /api/query
│       └── components/
│           ├── ZeroProvider.tsx
│           ├── ShoppingList.tsx
│           └── ShareModal.tsx
├── tests/
│   └── e2e/
│       ├── shopping-list.spec.ts # Playwright e2e tests
│       └── permissions.spec.ts   # Data isolation & security tests
└── playwright.config.ts
```

## Testing

```bash
# install browsers (first time)
npx playwright install chromium
npx playwright install-deps chromium

# run tests (12 tests)
npx playwright test
```

Tests cover: navigation, CRUD operations, toggle/clear, share modal, real-time sync between two browser contexts, data isolation, and legacy API lockdown.

## Tech Stack

| Package | Version |
|---------|---------|
| `@rocicorp/zero` | `1.2.0-canary.1` |
| `vite` | `6.x` |
| `react` | `19.x` |
| `zod` | `4.x` |
| `vite-plugin-pwa` | `1.x` |
| `postgres` (node) | `3.x` |
| `qrcode` | `1.x` |
| PostgreSQL | 16 |
| Caddy | 2 |
