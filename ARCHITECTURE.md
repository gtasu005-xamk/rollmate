# Rollmate: Backend & Web Toiminnot

## 📋 Yleiskatsaus

Rollmate on treenikirjanpito-sovellus, joka koostuu:
- **Backend**: Node.js + Express + Prisma (RESTful API)
- **Web**: Vite + React + TypeScript (PWA, paikallinen storage)
- **Mobile**: React Native / Expo (olemassa oleva)

Kaikki käyttävät samaa backend-APIa ja samoja data-sopimuksia.

---

## 🔐 Autentikaatio

### Arkkitehtuuri
- **Token-tyyppi**: JWT (JSON Web Token)
- **Tallennus**: 
  - Web: `localStorage`
  - Mobile: `SecureStore` (Expo)
- **Lähetys**: `Authorization: Bearer <token>` -header
- **Expiry**: 7 päivää
- **Backend**: Middleware validoi tokenia jokaisessa pyynnössä

### Middleware: `backend/src/middleware/auth.ts`
```typescript
requireAuth(req, res, next)
```
- Lukee tokenia **vain** `Authorization` headerista
- Purkaa JWT:n ja tallentaa `userId` requestiin (`req.userId`)
- Vastaa **401** jos token puuttuu tai on virheellinen
- Vastaa **401** jos token on vanhentunut

Kaikki suojatut reitit käyttävät middleware:a:
```typescript
router.use(requireAuth);
```

---

## 📡 Backend API

### 1. **Health Check** (`GET /health`)
```
GET /health
Response: 200 OK
Body: { status: "ok" }
```
Ei vaadi autentikointia. Käytetään deployment-tarkistuksiin.

---

### 2. **Autentikaatio** (`/auth`)

#### Rekisteröinti
```
POST /auth/register
Body: { email: string, password: string }
Response: 201 Created
Body: {
  accessToken: string,
  user: { id: string, email: string }
}
```
- Validoi email + password
- Tarkistaa, ettei käyttäjä ole jo olemassa (409 Conflict)
- Hash-salaa salasanan (bcryptjs)
- Luo JWT-tokenin (7 päivää)

#### Kirjautuminen
```
POST /auth/login
Body: { email: string, password: string }
Response: 200 OK
Body: {
  accessToken: string,
  user: { id: string, email: string }
}
```
- Etsii käyttäjää emailin perusteella
- Vertaa salasanaa (bcryptjs)
- Luo JWT-tokenin (7 päivää)
- 401 jos email tai salasana väärä

---

### 3. **Treeni-istunnot (Sessions)** (`/sessions`, **vaatii autentikaation**)

#### Listaa kaikki istunnot
```
GET /sessions
Response: 200 OK
Body: TrainingSession[]
```
Järjestyksessä: uusimmat ensin.

#### Listaa menneet istunnot
```
GET /sessions/past
Response: 200 OK
Body: TrainingSession[]
```

#### Hae yksittäinen istunto
```
GET /sessions/:id
Response: 200 OK (tai 404 Not Found)
Body: TrainingSession
```

#### Luo uusi istunto
```
POST /sessions
Body: {
  date: string (ISO date),
  feeling: number (0-10),
  performance: number (0-10),
  rating: number (0-10),
  feedback?: string
}
Response: 201 Created
Body: TrainingSession
```
- Validoi arvot 0-10 välillä
- Pakollinen: date, feeling, performance, rating
- Valinnainen: feedback

#### Päivitä istunto
```
PUT /sessions/:id
Body: { /* kuten POST, kaikki valinnaisia */ }
Response: 200 OK
Body: TrainingSession
```

#### Poista istunto
```
DELETE /sessions/:id
Response: 204 No Content
```

**Tietotyyppi** (`TrainingSession`):
```typescript
{
  id: string,
  date: string (ISO),
  feeling: number (0-10),
  performance: number (0-10),
  rating: number (0-10),
  feedback: string | null,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

---

### 4. **Teemat (Themes)** (`/themes`, **vaatii autentikaation**)

#### Listaa kaikki teemat
```
GET /themes
Response: 200 OK
Body: Theme[]
```
Järjestyksessä: uusimmat ensin.

#### Luo uusi teema
```
POST /themes
Body: {
  name: string,
  startAt: string (ISO date),
  endAt: string (ISO date)
}
Response: 201 Created
Body: Theme
```
- Validoi: name ei ole tyhjä
- Validoi: startAt ja endAt ovat kelvolliset ISO-päivämäärät
- Validoi: endAt > startAt (409 Conflict jos ei)

#### Poista teema
```
DELETE /themes/:id
Response: 204 No Content
```

**Tietotyyppi** (`Theme`):
```typescript
{
  id: string,
  name: string,
  startAt: string (ISO),
  endAt: string (ISO),
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

---

### 5. **Tehtävät (Tasks)** (`/tasks`, **vaatii autentikaation**)

#### Listaa kaikki tehtävät
```
GET /tasks
Response: 200 OK
Body: Task[]
```
Järjestyksessä: uusimmat ensin.

#### Luo uusi tehtävä
```
POST /tasks
Body: {
  title: string
}
Response: 201 Created
Body: Task
```
- Validoi: title ei ole tyhjä

#### Päivitä tehtävä
```
PUT /tasks/:id
Body: {
  title?: string,
  completed?: boolean
}
Response: 200 OK
Body: Task
```
- Valinnainen: title ja/tai completed
- Jos completed = true, asettaa completedAt:n nykyiseen aikaan
- Jos completed = false, asettaa completedAt:n null

#### Poista tehtävä
```
DELETE /tasks/:id
Response: 204 No Content
```

**Tietotyyppi** (`Task`):
```typescript
{
  id: string,
  title: string,
  completed: boolean,
  createdAt: string (ISO),
  completedAt: string (ISO) | null
}
```

---

### 6. **Viikkoyhteenveto** (`GET /summary/week`, **vaatii autentikaation**)

```
GET /summary/week
Response: 200 OK
Body: WeeklySummary[]
```

**Tietotyyppi** (`WeeklySummary`):
```typescript
{
  week: string,           // ISO week or date range
  sessionCount: number,   // kuinka monta istuntoa tällä viikolla
  totalDuration: number   // minuutteja
}
```

---

## 🌐 Web Frontend

### Arkkitehtuuri

```
src/
├── lib/
│   ├── apiClient.ts      ← API-pyynnöt + token management
│   ├── env.ts            ← Ympäristömuuttujat
│   ├── date.ts           ← Päivämäärä-utilityt
│   └── number.ts         ← Numeerinen-utilityt
├── features/
│   ├── auth.ts           ← Logout-funktio
│   ├── session.ts        ← Session CRUD
│   ├── themes.ts         ← Theme CRUD
│   ├── summary.ts        ← Weekly summary
│   ├── types.ts          ← Tietotyyppi-määrittelyt
│   └── validators.ts     ← Form-validointi
├── pages/
│   ├── LoginPage.tsx     ← Kirjautuminen/rekisteröinti
│   ├── HomePage.tsx      ← Etusivu (sessions + themes + tasks preview)
│   ├── SessionPage.tsx   ← Sessions listaus
│   ├── SessionDetailPage.tsx ← Yksittäinen sessio + notes
│   ├── ThemesPage.tsx    ← Themes hallinta
│   ├── TasksPage.tsx     ← Tasks hallinta
│   └── NotFoundPage.tsx  ← 404
├── components/
│   ├── AppShell.tsx      ← Layout + navigation
│   ├── SessionList.tsx   ← Sessions listaus
│   ├── SessionForm.tsx   ← Create/edit session
│   ├── NoteList.tsx      ← Session notes listaus
│   ├── NoteForm.tsx      ← Create/edit note
│   ├── ThemeList.tsx     ← Themes listaus
│   ├── ThemeForm.tsx     ← Create/edit theme
│   ├── TodoList.tsx      ← Tasks listaus
│   └── TodoForm.tsx      ← Create task
├── routes/
│   └── index.tsx         ← React Router konfiguraatio
├── App.tsx               ← Root komponentti
└── main.tsx              ← Vite entry point
```

---

### 1. **API-asiakas** (`src/lib/apiClient.ts`)

**Keskitetty API-käytön piste**. Kaikki API-pyynnöt menevät tämän kautta.

#### Tokenhallinta
```typescript
// Lue tokenia localStorage:sta
getAccessToken(): string | null

// Tallenna token localStorage:hen
setAccessToken(token: string | null): void
```

#### HTTP-pyynnöt
```typescript
// Sisäinen funktio, joka:
// 1. Lisää authorization-headerin
// 2. Käsittelee virheet
// 3. Parsii JSON-vastaukset
request<T>(path: string, options?: RequestInit): Promise<T>
```

#### Päätepisteet
```typescript
api.getHealth()                                    // Health check
api.register(email, password)                      // POST /auth/register
api.login(email, password)                         // POST /auth/login
api.getThemes()                                    // GET /themes
api.createTheme(payload)                           // POST /themes
api.updateTheme(id, payload)                       // PUT /themes/:id
api.deleteTheme(id)                                // DELETE /themes/:id
api.getSessions()                                  // GET /sessions
api.createSession(payload)                         // POST /sessions
api.getSession(id)                                 // GET /sessions/:id
api.updateSession(id, payload)                     // PUT /sessions/:id
api.deleteSession(id)                              // DELETE /sessions/:id
api.getSessionNotes(sessionId)                     // GET /sessions/:id/notes
api.createSessionNote(sessionId, payload)          // POST /sessions/:id/notes
api.updateSessionNote(sessionId, noteId, payload)  // PUT /sessions/:id/notes/:id
api.deleteSessionNote(sessionId, noteId)           // DELETE /sessions/:id/notes/:id
api.getWeeklySummary()                             // GET /summary/week
api.getTasks()                                     // GET /tasks
api.createTask(payload)                            // POST /tasks
api.updateTask(id, payload)                        // PUT /tasks/:id
api.deleteTask(id)                                 // DELETE /tasks/:id
```

---

### 2. **Autentikaatio** (`src/features/auth.ts`)

```typescript
logout(): Promise<void>
```
- Poistaa tokenin localStorage:sta
- Ohjaa käyttäjän `/login`-sivulle

---

### 3. **Sessio-features** (`src/features/session.ts`)

```typescript
getSessions(): Promise<TrainingSession[]>
createSession(payload: CreateTrainingSessionInput): Promise<TrainingSession>
getSession(id: string): Promise<TrainingSession>
updateSession(id: string, payload: CreateTrainingSessionInput): Promise<TrainingSession>
deleteSession(id: string): Promise<void>
```

Näitä kutsuvat sivu-komponentit ja päivittävät local state:a.

---

### 4. **Teema-features** (`src/features/themes.ts`)

```typescript
getThemes(): Promise<Theme[]>
createTheme(payload: CreateThemeInput): Promise<Theme>
updateTheme(id: string, payload: CreateThemeInput): Promise<Theme>
deleteTheme(id: string): Promise<void>
```

---

### 6. **Tehtävä-features** (`src/features/tasks.ts`)

```typescript
getTasks(): Promise<Task[]>
createTask(payload: CreateTaskInput): Promise<Task>
updateTask(id: string, payload: { title?: string; completed?: boolean }): Promise<Task>
deleteTask(id: string): Promise<void>
```

Näitä kutsuvat sivu-komponentit ja päivittävät local state:a.

---

### 7. **Yhteenveto-features** (`src/features/summary.ts**)

```typescript
getWeeklySummary(): Promise<WeeklySummary[]>
```

Palauttaa viikkokohtaiset tilastot.

---

### 8. **Sivut (Pages)**

#### LoginPage (`src/pages/LoginPage.tsx`)
- Toggle: Kirjautuminen ↔ Rekisteröinti
- Lomake: email + password
- Kutsuu `api.login()` tai `api.register()`
- Tallentaa tokenin `setAccessToken()`
- Ohjaa `/` -sivulle (kotisivu)

#### HomePage (`src/pages/HomePage.tsx`)
- Näyttää sessiota, teemat ja tehtävät samalla sivulla
- Kutsuu `getSessions()`, `getThemes()` ja `api.getTasks()` samalla
- Näyttää "nykyisen" teeman (pvm välillä start–end)
- Näyttää 5 viimeisintä harjoitusta
- Näyttää 5 viimeisintä tehtävää
- Graafi istunnoista
- Linkit: sessio-muokkaukseen, uuden sessio-luomiseen, uuden tehtävän lisäämiseen

#### SessionPage (`src/pages/SessionPage.tsx`)
- Sessio-listaus
- Luo-nappi → SessionForm
- Klikataan sessiota → SessionDetailPage

#### SessionDetailPage (`src/pages/SessionDetailPage.tsx`)
- Näyttää yksittäisen sessio + sen notes
- Edit-nappi → SessionForm
- Notes-hallinta → NoteList + NoteForm
- Poista-nappi

#### ThemesPage (`src/pages/ThemesPage.tsx`)
- Teema-listaus
- Luo-nappi → ThemeForm
- Poista-nappi per teema

#### TasksPage (`src/pages/TasksPage.tsx`)
- Tehtävä-listaus
- Luo-nappi → TodoForm
- Checkbox per tehtävä (merkitse tehdyksi)
- Poista-nappi per tehtävä

---

### 9. **Komponentit (Components)**

#### SessionList (`src/components/SessionList.tsx`)
```typescript
interface Props {
  sessions: TrainingSession[];
  onDelete?: (id: string) => void;
  showDelete?: boolean; // Näytä poista-nappi (vain SessionPagella true)
}
```
Näyttää sessiot listana. Mobile-optimoitu (korkeat nappit, hyvä väli).
Delete-nappeja näytetään vain jos `showDelete={true}`.

#### SessionForm (`src/components/SessionForm.tsx`)
```typescript
interface Props {
  initial?: CreateTrainingSessionInput;
  onSubmit: (data: CreateTrainingSessionInput) => Promise<void>;
  onCancel?: () => void;
}
```
Lomake uuden sessio-luomiseen tai muokkaukseen.
Validoinnit: date (pakollinen), feeling/performance/rating (0-10).

#### NoteList (`src/components/NoteList.tsx`)
```typescript
interface Props {
  notes: Note[];
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
}
```
Näyttää session notes:t listana.

#### NoteForm (`src/components/NoteForm.tsx`)
```typescript
interface Props {
  initial?: CreateNoteInput;
  onSubmit: (data: CreateNoteInput) => Promise<void>;
  onCancel?: () => void;
}
```
Lomake uuden note-luomiseen tai muokkaukseen.

#### ThemeList (`src/components/ThemeList.tsx`)
```typescript
interface Props {
  themes: Theme[];
  onDelete?: (id: string) => void;
}
```
Näyttää teemat listana.

#### ThemeForm (`src/components/ThemeForm.tsx`)
```typescript
interface Props {
  initial?: CreateThemeInput;
  onSubmit: (data: CreateThemeInput) => Promise<void>;
  onCancel?: () => void;
}
```
Lomake teeman luomiseen.
Validoinnit: name (pakollinen, ei tyhjä), startAt < endAt.

#### TodoList (`src/components/TodoList.tsx`)
```typescript
interface Props {
  tasks: Task[];
  onUpdate: () => void; // Callback kun tehtävä muuttuu
}
```
Näyttää tehtävät listana.
- Checkbox: Merkitse tehdyksi/tekemättömäksi
- × nappi: Poista tehtävä
- Completed-tehtävät näytetään yliviivattuna

#### TodoForm (`src/components/TodoForm.tsx`)
```typescript
interface Props {
  onCreate: (payload: CreateTaskInput) => Promise<void>;
  onClose?: () => void;
}
```
Lomake uuden tehtävän luomiseen.
Validointi: title ei ole tyhjä.

#### AppShell (`src/components/AppShell.tsx`)
- Layout-komponentti
- Navigation-bar: Home, Sessions, Themes, Tasks, Logout
- Responsive design (mobile-first)
- Sidebar/drawer mobile-näkymässä

---

## 🔄 Tiedonvuo

### Esimerkki: Sessio-luominen

1. **Käyttäjä** klikkaa "Uusi sessio" → `SessionForm` avautuu
2. **SessionForm** validoi syötteen (lokaalisti)
3. **Käyttäjä** painaa "Tallenna" → kutsutaan `onSubmit()`
4. **Sivu-komponentti** kutsuu `createSession(payload)`
5. **Session-feature** kutsuu `api.createSession()`
6. **API-client** 
   - Lukee tokenin localStorage:sta
   - Lisää `Authorization: Bearer <token>` headeriin
   - Tekee POST `/sessions`
7. **Backend** 
   - Middleware validoi JWT:n
   - Validoi payload:a
   - Luo Prisma:n kautta tietokantaan
   - Palauttaa 201 + luodun sessio-objektin
8. **API-client** vastaa Promise<TrainingSession>
9. **Sivu-komponentti** päivittää local state:a
10. **UI** päivittyy automaattisesti

---

## 🛡️ Virheenkäsittely

### Backend
```typescript
// Validation error
400 Bad Request
{
  error: {
    code: "VALIDATION_ERROR",
    message: "..."
  }
}

// Token missing/invalid
401 Unauthorized
{
  error: {
    code: "NO_TOKEN" | "INVALID_TOKEN" | "TOKEN_EXPIRED",
    message: "..."
  }
}

// Not found
404 Not Found
{
  error: { message: "Not found" }
}

// User exists
409 Conflict
{
  error: {
    code: "USER_EXISTS",
    message: "..."
  }
}

// Server error
500 Internal Server Error
{
  error: {
    code: "INTERNAL_ERROR",
    message: "..."
  }
}
```

### Web
- API-client jetraps virheet ja throws `Error`
- Sivu-komponentit ottavat ne kiinni try/catch:lla
- Näyttävät käyttäjälle `error` state:na

---

## 📦 Tietotyypit

### User
```typescript
{
  id: string,
  email: string,
  password: string (hashed)
}
```

### TrainingSession
```typescript
{
  id: string,
  date: string (ISO),
  feeling: number (0-10),
  performance: number (0-10),
  rating: number (0-10),
  feedback: string | null,
  createdAt: string,
  updatedAt: string
}
```

### Note
```typescript
{
  id: string,
  sessionId: string,
  text: string,
  createdAt: string,
  updatedAt: string
}
```

### Theme
```typescript
{
  id: string,
  name: string,
  startAt: string (ISO),
  endAt: string (ISO),
  createdAt: string,
  updatedAt: string
}
```

### WeeklySummary
```typescript
{
  week: string,
  sessionCount: number,
  totalDuration: number
}
```

---

## 🚀 Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```
Avaa `http://localhost:3000`

### Web
```bash
cd web
npm install
npm run dev
```
Avaa `http://localhost:5173`

### Testaus
1. Avaa web-sovellus
2. Kirjaudu sisään (uusi käyttäjä = auto-register)
3. Luo uusi sessio
4. Muokkaa/poista
5. Katso, että backend + frontend kommunikoivat ✅

---

## 📋 MVP Scope (Locked)

✅ Sisältää:
- Autentikaatio (register/login)
- Sessions CRUD
- Themes CRUD
- Notes (linkitetty sessioon)
- Viikkoyhteenveto (count + duration)

❌ EI sisällä:
- Auth UI:ssa mitään extra (ei 2FA, recovery codes, etc.)
- Sosiaalisia ominaisuuksia (follow, share, feed)
- Push-notifikaatioita
- Offline-sync
- Uusia entiteettejä tai kenttiä

---

## 🎯 Seuraavat askeleet

1. **Testaa lokaali**: Backend + Web yhdessä
2. **Varmista notes-endpointit**: Backend pitää olla `/sessions/:id/notes` CRUD
3. **Käyttäjä-isolaatio**: Sessions/notes pitää kuulua user:ille (ei cross-user access)
4. **PWA**: Manifest + service worker (caching, installability)
5. **Deployment**: Backend Azureen, web PWA:na

---

**Päivitys**: 14.1.2026 | Simplified auth (no refresh token) | localStorage + Bearer JWT
