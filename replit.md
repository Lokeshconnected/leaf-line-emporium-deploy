# LEAFLINE — Premium Plant Ecommerce Platform

## Overview

Full-stack premium plant ecommerce platform. pnpm workspace monorepo with TypeScript throughout.

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24 | **TypeScript**: 5.9
- **Backend**: Express 5 + PostgreSQL + Drizzle ORM + Zod validation
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + Framer Motion + Lenis + Wouter
- **State**: Zustand (cart + auth with persist)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **AI**: OpenAI streaming SSE via Replit AI Integrations proxy
- **PDF**: jsPDF (donation certificates)
- **Theming**: next-themes (dark/light)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API — all backend logic
│   └── leafline/           # React frontend — the storefront
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed-plants.ts  # Seeds 50 plants into the DB
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

## LEAFLINE Features

### Backend (`artifacts/api-server`)

All routes mounted at `/api` prefix in `src/app.ts`.

| Route group | Endpoints |
|-------------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Plants | `GET /api/plants` (filter, search, sort, paginate), `GET /api/plants/:id` |
| Cart | `GET/POST /api/cart`, `PUT/DELETE /api/cart/:id` |
| Orders | `GET /api/orders`, `POST /api/orders`, `GET /api/orders/:id` |
| Wishlist | `GET/POST/DELETE /api/wishlist` |
| Donations | `GET/POST /api/donations`, `GET /api/donations/:id/certificate` |
| AI Chat | `GET/POST /api/openai/conversations`, `POST /api/openai/conversations/:id/messages` (SSE streaming) |

**Key files:**
- `src/app.ts` — Express setup, CORS, middleware, route mounting
- `src/routes/index.ts` — all sub-routers
- `src/routes/openai.ts` — streaming SSE AI chat
- `src/middleware/auth.ts` — JWT verification middleware

**Database tables:** users, plants, cart_items, orders, order_items, wishlist_items, donations, conversations, messages

### Frontend (`artifacts/leafline`)

**Pages:**
- `/` — Cinematic homepage: hero, stats, FeaturedPlants (top 6 by popularity), categories, testimonials, CTA
- `/shop` — 50 plants with search, category filters, sort (popular/price/rating/name), filter panel (size, care, pet-safe, min-rating), wishlist hearts, add-to-cart
- `/plants/:id` — Plant detail: image, description, care tips, add-to-cart, related plants
- `/auth` — Sign in / Register with animated toggle
- `/checkout` — Cart summary + address form + order placement
- `/orders` — Order history with status tracking
- `/donations` — Donate a Plant form + PDF certificate download
- `/assistant` — AI Plant Care Assistant with conversation history and streaming responses

**Key files:**
- `src/App.tsx` — global layout (Navbar + CartSidebar) + Wouter routing
- `src/lib/api.ts` — `getApiBase()` returns `window.location.origin`; `apiFetch()` helper with auth header
- `src/store/authStore.ts` — Zustand + persist (JWT token + user)
- `src/store/cartStore.ts` — Zustand cart with item count
- `src/components/Navbar.tsx` — nav with cart badge + dark mode toggle
- `src/components/CartSidebar.tsx` — animated slide-out cart

## API URL Pattern (CRITICAL)

The api-server's `previewPath = "/api"` in artifact.toml. All API calls use:
```
`${window.location.origin}/api/<route>`
```
`getApiBase()` returns `window.location.origin` — **never** hardcode a port or `/api-server` path.

## AI Integration

- Base URL: `http://localhost:1106/modelfarm/openai` (env: `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Model: `gpt-5.2`
- Streaming SSE: `POST /api/openai/conversations/:id/messages` streams `data: <chunk>\n\n`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (Replit-provided)
- `JWT_SECRET` — fallback: `"leafline-secret-key-2024"`
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI proxy URL

## Development Commands

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/leafline run dev

# Seed plants (run once)
pnpm --filter @workspace/scripts run seed-plants

# DB schema push
pnpm --filter @workspace/db run push
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` (`composite: true`). Always typecheck from root:
```bash
pnpm run typecheck  # tsc --build --emitDeclarationOnly
```
