TypeScript Style

Typing: Prefer explicit types on public APIs (function params/returns, exported constants). Prefer interfaces for object shapes used across modules and type aliases for unions/utility types. Use readonly for immutable fields.
Null‑handling: Avoid nullable union pollution; prefer exact types like string | null only when necessary. Use strictNullChecks and prefer undefined for absent optional fields in runtime, null for persisted DB values if the schema uses nulls. Validate/parses dates before casting.
Any‑kielto: Disallow any in lint rules; use unknown when input must be validated first, then narrow to concrete types. Add single-line comment exemptions only when unavoidable, with // TODO explaining why.
Export‑käytännöt: Use named exports for libraries/modules (export function ..., export type ...) and default exports only for React components that are the module’s primary export. Keep related types next to implementations and export them explicitly.
Nimeämiskonventiot

Tiedostot: Kettotasoiset komponentit ja sivut: PascalCase.tsx (esim. SessionPane.tsx), utilit ja hookit: camelCase.ts (esim. useDashboardData.ts), domain‑mallit: snake/kebab ei suositella — käytä camelCase tai kebab-case konsistentisti (repo käyttää pääosin camelCase tiedostonimissä ja PascalCase React‑komponenteissa).
Funktiot / muuttujat: camelCase (esim. fetchSessions, calculateAverage).
Komponentit: PascalCase ja tiedostonimi vastaa komponentinnimeä (esim. SessionPane.tsx sisältää SessionPane).
Hooks: Prefiksi use + camelCase (esim. useSessionForm, useDashboardData).
Constants / enums: UPPER_SNAKE_CASE tai PascalCase enumille riippuen kontekstista; käytä const enum harvoin (tyypin safe-merkintöjen vuoksi).
React / React Native -käytännöt

Component structure: Small, focused components; container/presenter -erottelu kun komponentti tekee data‑hakua. Root komponentit: App.tsx (mobile/web) bootstraptaa kontekstit ja navigaation.
Hooks & state: Prefer custom hooks for data fetching and form state (useDashboardData, useSessionForm). Local UI state with useState; shared state via context or top-level stores (avoid large prop drilling).
API calls: Centralize HTTP logic in an API client (apiClient.ts, api.ts). Hooks call the API client (not fetch directly). Use useEffect/useQuery wrappers for lifecycle; cancel inflight requests on unmount where applicable.
Styling: Keep styles co‑located (e.g., SessionPane.styles.ts alongside SessionPane.tsx). For RN, use StyleSheet or styled‑components consistently.
Performance: Memoize heavy components (React.memo), use useCallback/useMemo only when measurable benefit exists. Key lists with stable keys.
Accessibility: Prefer semantic web elements, add accessibility props in RN (accessibilityLabel, accessible).
Backend (Express + Prisma) - käytännöt

Project layout: Keep app.ts for middleware/route registration, server.ts for listen/bootstrap, routes/ for route definitions and prisma/client.ts for Prisma client instance.
Route naming: Use RESTful, plural nouns: /sessions, /sessions/:id/notes, /themes. For summaries: /summary tai /summary/week.
Controller vs service: Keep request validation and response formatting in route handlers (controllers) and move business logic / DB ops into small service functions (even if in same file initially) for testability.
Prisma usage: Use prisma.<model>.<operation> in service layer. Keep transactions via prisma.$transaction where multiple writes must be atomic. Map DB types to DTOs before returning (avoid leaking Prisma-specific types).
Validation: Validate incoming payloads server‑side (use schema libs like zod/yup) and return 400 for client errors.
Error responses: Consistent error shape: { error: { code: string, message: string, details?: any } }. Return proper status codes: 400 (validation), 401 (auth), 404 (not found), 409 (conflict), 500 (server).
Logging: Centralize logger (e.g., pino/winston), log request lifecycle and errors with correlation IDs. Avoid logging sensitive data.
Security: Sanitize inputs, limit rate, validate auth on protected endpoints.
Do / Don't

Do:
Use explicit types on exported APIs and domain models.
Centralize API calls in apiClient and call them via hooks.
Keep components small and co‑locate styles with components (*.styles.ts).
Validate inputs both client and server side.
Use Prisma transactions for multi‑step DB updates.
Return consistent error payloads and status codes.
Don't:
Use any as a shortcut — prefer unknown + narrowing.
Put business logic ad‑hoc inside route handlers without testable services.
Leak Prisma model instances directly to UI without mapping.
Use default exports for many module utilities (prefer named exports).
Mix UI concerns into data hooks (separate fetching from presentation).
Log secrets or PII to plain console in production.
Tarvittaessa voin generoida eslint/tsconfig ja prettier -asetusehdotuksen, sekä esimerkkitiedostot (apiClient, tyyppimallit) projektin nykyisten käytäntöjen mukaisesti.