# VR Park CRM

A real-time booking management system for VR entertainment parks — dark dispatch-center UI for managing zones, bookings, clients, and events.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/vr-crm run dev` — run the CRM frontend (port 18875)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, shadcn/ui, @dnd-kit, framer-motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/` (zones, sessionTypes, clients, bookings, events)
- API contract: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`
- API routes: `artifacts/api-server/src/routes/`
- Frontend: `artifacts/vr-crm/src/`

## Architecture decisions

- Dark-only UI (no theme toggle) — the spec requires a command-center dark interface
- Booking conflict detection: POST/PATCH /bookings checks zone + time overlap before saving
- Bookings seeded use UTC timestamps — frontend date filter normalizes to UTC day boundaries
- Zones, session types, and clients are pre-seeded with sample VR park data
- Event stages are ordered by `orderIndex` for timeline display

## Product

VR Park CRM lets administrators manage their entertainment venue:
- **Main page**: Booking grid — daily schedule showing all zones and time slots
- **Client library**: Searchable client database with visit history
- **Events**: Event management with timeline stages (birthday parties, tournaments, etc.)
- **Settings**: CRUD for zones, session types, working hours

## User preferences

_Populate as you build._

## Gotchas

- After every OpenAPI spec change, run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Zod schema names follow Orval convention: `CreateZoneBody`, `UpdateZoneBody`, `UpdateZoneParams`, `DeleteZoneParams` — NOT entity-shaped names
- Do NOT add `ZoneInput`, `BookingInput` etc. to routes — use the Orval-generated names

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
