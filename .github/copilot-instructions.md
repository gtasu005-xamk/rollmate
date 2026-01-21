Project overview — Rollmate

Backend toimii (API + Prisma + migrations). Mobile-sovellus toimii nykyisessä muodossaan (React Native / Expo) mutta sitä ei laajenneta.
Tavoite: tuoda vastaava toiminnallisuus web-kansioon (Vite + React) ja julkaista se PWA:na puhelimelle. Web käyttää samaa backend-APIa ja samoja data‑sopimuksia kuin mobile.
Locked MVP scope (Älä laajenna)

Sisältää tarkasti:
Training sessions CRUD
Technique notes CRUD (linkitetty session-entiteettiin)
Kevyt viikkoyhteenveto: laskenta = count of sessions + total duration per week
EI SISÄLLÄ:
Auth UI (kirjautuminen/register UI)
Sosiaaliset ominaisuudet (follow, share, feed)
Push-notifikaatiot
Offline-sync / komplex sync-logiikka
Uusien entiteettien tai kenttien lisääminen MVP:ssa
Tech stack & repo-rakenne

Tech stack (present in repo):
Backend: Node.js + TypeScript, Express (app/server pattern), Prisma ORM, migrations in migrations
Mobile: React Native / Expo (TypeScript)
Web: Vite + React + TypeScript (implement as PWA)
Infra: infra for deployment / infra artifacts
Repo structure (high level):
backend — API, src/app.ts, src/server.ts, src/prisma/client.ts, src/routes/*, prisma/schema.prisma, prisma/migrations/
mobile — working RN app: App.tsx, src/components, src/domain, src/services/api.ts
web — frontend to be completed: src/main.tsx, src/App.tsx, src/lib/apiClient.ts, src/components, src/pages
infra — infra/deploy resources
.results — analysis artifacts; use for reference when working
Backend & API conventions

API style:
RESTful endpoints, plural nouns: /sessions, /sessions/:id/notes, /themes, /summary (or /summary/week).
Health check endpoint: GET /health → 200 OK + simple payload.
ORM / DB:
Prisma as single ORM. Prisma client instance exported from client.ts.
Migrations in migrations and schema in schema.prisma.
Request / response patterns:
JSON request bodies and JSON responses.
Request validation server-side (use zod/yup or equivalent); return 400 on validation errors.
Successful create: 201 + created resource.
Read list: 200 + array.
Read single: 200 + resource or 404 if not found.
Update: 200 + updated resource.
Delete: 204 No Content.
Error handling:
Consistent error shape: { error: { code: string, message: string, details?: any } }.
Status codes: 400 (validation), 401 (auth — not in MVP UI), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error).
Centralize error middleware in app.ts and avoid leaking raw exceptions.
Use Prisma transactions (prisma.$transaction) for multi-step DB writes.
Do not return Prisma internal objects directly; map to DTOs.
Routes organization:
Keep route handlers in backend/src/routes/*.ts. Move heavy business logic into testable service functions (can live in same module initially but prefer small service modules).
Web / PWA implementation guidance

Goal: implement web functionality mirroring mobile and ship as PWA.
UI guidance:
Mobile-first, touch-friendly UI (large touch targets, spacing).
Use responsive layouts that prioritize single-column mobile views.
Reuse same API contracts and data models — do NOT invent new fields or change payload shapes.
API client:
Provide a single API client abstraction in web: apiClient.ts (mirrors api.ts).
All web feature modules/hooks call the centralized client (no ad-hoc fetch calls).
API client handles base URL, headers, auth-token wiring (if used later), JSON parsing and standardized error mapping to { error: ... } shape.
PWA specifics:
Add service worker only for caching static assets and enabling installability; do NOT implement offline-write / sync in MVP.
Ensure manifest and meta tags for installability (icons, theme color, display: standalone).
Data reuse:
Share domain shapes conceptually: copy types from domain into features or create explicit DTOs that match Prisma-backed models.
Keep names and types identical to backend DTOs (dates ISO strings, rating number 0..10, duration minutes integer).
Coding standards

TypeScript:
strict compiler options ON (strictNullChecks, noImplicitAny, etc.). No use of any. Use unknown + narrowing if necessary.
Explicit types on exported functions, component props, and domain models. Prefer interface for cross-module shapes.
Null handling: prefer undefined for optional runtime props; use null only when backing store requires it. Validate external inputs.
Naming & file conventions (follow repo patterns):
Components: PascalCase.tsx and export named component (default export allowed for primary component but prefer named exports).
Hooks: useCamelCase.ts with use prefix.
Utils/hooks/services: camelCase.ts (or kebab-case is not used here — follow existing naming which uses camelCase for hooks/files and PascalCase for components).
Styles: co-located style files Component.styles.ts.
Exports: prefer named exports for utilities and types; avoid many default exports for utilities.
React / RN conventions:
Small focused components; container/presenter split when component does data fetching.
Centralized data fetching via custom hooks (useDashboardData, useSessionForm) that call the API client.
Keep side effects in hooks and lifecycle methods; cancel inflight requests on unmount when relevant.
Backend conventions:
app.ts for middleware & route registration, server.ts for bootstrap.
Prisma client single instance exported from client.ts.
Keep controllers thin; business logic in small services; map DB → DTOs before returning.
Linting & formatting:
Enforce no-explicit-any; add lint rule exemptions only with a comment explaining why.
How Copilot should work here (working rules for code generation)

Before writing code:
List, in the PR description or commit message, the exact files you plan to change and why.
Example: "Will modify apiClient.ts (add base client), web/src/pages/SessionsPage.tsx (list + create flow), App.tsx (register routes)."
Make minimal, focused changes:
Implement only what's required for the locked MVP scope.
Follow existing file patterns and styles. Avoid broad refactors unless required.
When unclear:
Add an Assumptions section at top of your change/PR describing any assumptions (e.g., "Assume backend base URL = /api" or "Assume userId is provided by backend responses"). Do not invent new features or endpoints.
Pull requests:
Keep each PR scope-limited to one user-visible change (e.g., "Sessions list + create" or "Notes CRUD endpoints + web UI").
Include testable manual verification steps (how to run backend, how to open web and create a session).
Tests:
Prefer small unit tests for service functions; integration tests are optional for MVP but welcome.
Assumptions (what to state when making changes)

Example assumptions you must state in PRs:
Backend base URL: / or /api (state chosen value).
Authentication: no auth required for MVP UI (public test user); if auth endpoints exist, do not wire auth UI.
Data shapes: follow schema.prisma and mobile/src/domain/*/model.ts exactly. If schema is ambiguous, state the mapping chosen.
Do NOT assume any missing backend endpoints exist — if an endpoint needed for MVP is missing, open an issue and implement the backend route (follow conventions above).
Do / Don't

Do:
Implement only the locked MVP features.
Mirror mobile data models and API contracts exactly.
Centralize API calls behind one client per platform.
Validate inputs both client and server side.
Map DB results to DTOs before returning to clients.
Keep changes minimal and file-scoped; list files to change before coding.
Don't:
Add auth UI, social features, push notifications, offline-sync, or other MVP extensions.
Change core technologies (no swapping Prisma/Express/React/TypeScript in MVP work).
Introduce new global state solutions or architectural rewrites without explicit signoff.
Use any or weaken TypeScript strictness.
Leak Prisma instances or DB internals directly to the frontend.
Add broad refactors in the same PR as a feature implementation.
Operational checklist for contributors / Copilot

Read 1-determine-techstack.md … 5-styleguide-generation.md for context.
Open an issue describing the small change (if backend endpoint missing) or start a branch for web UI work.
Before coding: list files to modify and reason in PR description.
Implement minimal changes, follow code style and naming conventions.
Add Assumptions block in PR if any unclear behavior or missing details.
Run local backend migrations: use Prisma migrations in migrations when changing schema.
Manual test: start backend (server.ts), run web locally (web), verify sessions + notes CRUD and weekly summary.
Seuraa tätä tiedostoa tarkasti — se on projektin sitova ohjeistus Copilot‑automaation ja kehittäjien toimintamallille MVP‑työssä.