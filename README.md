# Zero Shopping List

**[list.nvect.com](https://list.nvect.com)**

A real-time collaborative shopping list built with [Rocicorp Zero](https://zero.rocicorp.dev/) and Next.js. Multiple users can edit the same list simultaneously — changes sync instantly across all connected clients.

## Features

- **Real-time sync** — powered by Zero's local-first architecture (IVM + WebSocket)
- **Private rooms** — each list gets a unique nanoid URL; share it to collaborate
- **Share via QR code** — built-in share modal with QR code and copy-to-clipboard
- **OG meta tags** — dynamic OG image generation, link previews in social media / messengers
- **Mobile-first dark theme** — large touch targets, responsive layout
- **Offline-ready** — Zero caches data in IndexedDB; mutations queue and sync when back online
- **Secure by default** — legacy queries/mutators disabled; clients can only access lists by ID

## Architecture

```
Browser ──WebSocket──▸ zero-cache ──WAL──▸ PostgreSQL
                           ▲
                           │ HTTP (mutations/queries)
                           ▼
                        Next.js API routes
```

| Component | Role |
|-----------|------|
| **PostgreSQL** | Source of truth |
| **zero-cache** | Replication engine — syncs Postgres ↔ client replicas via WebSocket |
| **Next.js** | SSR shell + API routes for custom mutators/queries |
| **Caddy** | Reverse proxy — single entry point, routes `/zero/*` to zero-cache |

### Custom Mutators & Queries

Follows the [zbugs reference app](https://github.com/rocicorp/mono/tree/main/apps/zbugs) pattern:

- `shared/mutators.ts` — `defineMutators` / `defineMutator` with Zod validation
- `shared/queries.ts` — `defineQueries` / `defineQuery` with builder pattern
- `src/app/api/mutate/route.ts` — `handleMutateRequest` + `zeroPostgresJS` adapter
- `src/app/api/query/route.ts` — `handleQueryRequest`

No legacy CRUD mutators, no permissions — auth is handled via context in mutators.

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
│   └── init.sql                  # PostgreSQL schema
├── tests/
│   └── e2e/
│       ├── shopping-list.spec.ts # Playwright e2e tests
│       └── permissions.spec.ts   # Data isolation & security tests
├── playwright.config.ts
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── shared/
    │   ├── schema.ts             # Zero schema (tables + relationships)
    │   ├── mutators.ts           # Custom mutators (defineMutators)
    │   └── queries.ts            # Custom queries (defineQueries)
    └── src/
        ├── app/
        │   ├── page.tsx              # Homepage → redirect to /list/:nanoid
        │   ├── globals.css           # Dark theme CSS
        │   ├── list/[id]/
        │   │   ├── page.tsx          # Server component (OG meta)
        │   │   ├── client.tsx        # ClientOnly wrapper
        │   │   └── opengraph-image.tsx # Dynamic OG image
        │   └── api/
        │       ├── mutate/route.ts   # handleMutateRequest endpoint
        │       └── query/route.ts    # handleQueryRequest endpoint
        └── components/
            ├── ZeroProviderWrapper.tsx
            ├── ShoppingList.tsx
            └── ShareModal.tsx
```

## Testing

```bash
# install browsers (first time)
npx playwright install chromium
npx playwright install-deps chromium

# run tests
npx playwright test
```

Tests cover: navigation, CRUD operations, toggle/clear, share modal, real-time sync between two browser contexts, data isolation, and legacy API lockdown.

## Tech Stack

| Package | Version |
|---------|---------|
| `@rocicorp/zero` | `1.2.0-canary.1` |
| `next` | `15.x` |
| `react` | `19.x` |
| `zod` | `4.x` |
| `postgres` (node) | `3.x` |
| `qrcode` | `1.x` |
| PostgreSQL | 16 |
| Caddy | 2 |
