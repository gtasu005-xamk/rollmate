# Rollmate Detailed Architecture & Flow Documentation

> Opiskelu-dokumentaatio: Kaikki mitä tapahtuu ja missä

---

## 📑 Sisällysluettelo

1. [Yleiskatsaus](#yleiskatsaus)
2. [Autentikaatio - Yksityiskohtainen](#autentikaatio-yksityiskohtainen)
3. [Backend API - Syvyyteen](#backend-api-syvyyteen)
4. [Web Frontend - Rakenne & Flow](#web-frontend-rakenne--flow)
5. [React Komponentit & Hooks](#react-komponentit--hooks)
6. [Tiedonvuo Käytännössä](#tiedonvuo-käytännössä)
7. [State Management](#state-management)
8. [Error Handling](#error-handling)
9. [TypeScript & Tyypit](#typescript--tyypit)
10. [Local Storage & Session](#local-storage--session)

---

## Yleiskatsaus

Rollmate on kolmitasoinen arkkitehtuuri:

```
┌─────────────────────────────────────────────────────────────┐
│                     WEB (Vite + React)                       │
│  - Components (UI)                                            │
│  - Pages (reitit)                                             │
│  - Features (business logic)                                  │
│  - API Client (HTTP)                                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                  HTTP (REST API)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              BACKEND (Express + TypeScript)                   │
│  - Routes (HTTP handlers)                                     │
│  - Middleware (auth validation)                               │
│  - Database (Prisma ORM)                                      │
└─────────────────────────────────────────────────────────────┘
                        │
                  SQL (PostgreSQL)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   DATABASE                                    │
│  - Users, TrainingSessions, Notes, Themes, Tasks             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Autentikaatio - Yksityiskohtainen

### 1. Miten JWT toimii tässä projektissa

**JWT (JSON Web Token)** = kryptografisesti allekirjoitettu merkkijono, joka sisältää:
- **Header**: Token-tyyppi ja algoritmi
- **Payload**: Käyttäjätiedot (userId)
- **Signature**: Kryptografinen allekirjoitus (salaisuus: `JWT_SECRET`)

**Esimerkki JWT-tokenista:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiJjbTh2c3g3MDAwMDAwMDAwMDAwMDAwMDAifQ.
X3nJz_8x9kL2m3q4r5s6t7u8v9w0x1y2z3a4b5c6d7
```

### 2. Token-generaatio (Backend)

**Tiedosto:** `backend/src/routes/auth.ts`

```typescript
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const ACCESS_TOKEN_EXPIRY = "7d";

function generateAccessToken(userId: string): string {
  return jwt.sign(
    { userId } as TokenPayload,  // Payload
    JWT_SECRET,                   // Salaisuus
    { expiresIn: ACCESS_TOKEN_EXPIRY }  // Vanhenemisaika
  );
}
```

**Mitä tapahtuu:**
1. `jwt.sign()` kutsuu JWT-kirjastoa
2. Se yhdistää payload + salaisuuden + algoritmin
3. Palauttaa merkkijonon (token)

**Esimerkki:**
```
Input:  { userId: "user_123" }
        Secret: "dev-secret-key"
        Expiry: 7 päivää

Output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMyJ9...."
```

### 3. Rekisteröinti / Kirjautuminen (Backend)

**POST /auth/register** → `backend/src/routes/auth.ts`

```typescript
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validointi: email ja password pakollisia
    if (!email || !password) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Email and password are required" }
      });
    }

    // Tarkista: onko käyttäjä jo olemassa?
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: { code: "USER_EXISTS", message: "User with this email already exists" }
      });
    }

    // Hash-salaa salasana (bcryptjs)
    // Salasana: "mypassword123" → "$2a$10$xKz9..."
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Luo käyttäjä tietokantaan
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });

    // Luo JWT-token
    const accessToken = generateAccessToken(user.id);

    // Palauta token + käyttäjätiedot
    return res.status(201).json({
      accessToken,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Registration failed" }
    });
  }
});
```

**Flown vaiheet:**
1. ✅ Validoi request-body (email, password)
2. ✅ Tarkista Prisma:lla, onko käyttäjä olemassa
3. ✅ Hash-salaa salasana bcryptjs:llä (10 rounds)
4. ✅ Luo käyttäjä `prisma.user.create()`
5. ✅ Generoi JWT-token
6. ✅ Palauta 201 + token + käyttäjä

**POST /auth/login** → `backend/src/routes/auth.ts`

```typescript
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validointi
    if (!email || !password) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Email and password are required" }
      });
    }

    // Etsii käyttäjää emailin perusteella
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
    }

    // Vertaa salasanoja (bcryptjs)
    // Input: "mypassword123"
    // Database hash: "$2a$10$xKz9..."
    // bcryptjs.compare() tarkistaa, sopivatko yhteen
    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
    }

    // Kaikki kunnossa → luo token
    const accessToken = generateAccessToken(user.id);

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Login failed" }
    });
  }
});
```

**Flown vaiheet:**
1. ✅ Validoi email + password
2. ✅ Etsi käyttäjä Prisma:lla emailin perusteella
3. ✅ Jos ei löytynyt → 401
4. ✅ Vertaa salasanoja bcryptjs.compare():lla
5. ✅ Jos ei täsmää → 401
6. ✅ Luo token ja palauta

### 4. Token-validaatio (Backend Middleware)

**Tiedosto:** `backend/src/middleware/auth.ts`

```typescript
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Lue Authorization-header
    // Format: "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: { code: "NO_TOKEN", message: "Authorization token required" }
      });
      return;
    }

    // Poista "Bearer " prefix (7 merkkiä)
    // "Bearer eyJhbGci..." → "eyJhbGci..."
    const token = authHeader.slice(7);

    // Tarkista JWT:n allekirjoitus ja vanhenemisaika
    // jwt.verify() jetraps virheet automaattisesti
    // Jos token väärennetty tai vanhentunut → heittää exception
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Tallenna userId request-objektiin
    // Näin route-handlerit pääsevät käyttäjän ID:hen
    req.userId = decoded.userId;

    // Jatka seuraavaan middleware/handler:iin
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: { code: "TOKEN_EXPIRED", message: "Token has expired" }
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: { code: "INVALID_TOKEN", message: "Invalid token" }
      });
    } else {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Unauthorized" }
      });
    }
  }
}
```

**Mitä tapahtuu:**
1. ✅ Lue `Authorization` header
2. ✅ Tarkista format (aloittaa "Bearer ")
3. ✅ Poista "Bearer " prefix
4. ✅ Kutsua `jwt.verify()` salaisuudella
   - Jos token väärennetty → heittää `JsonWebTokenError`
   - Jos vanhentunut → heittää `TokenExpiredError`
   - Jos kelpaava → palauttaa decoded payload
5. ✅ Tallenna `userId` request-objektiin
6. ✅ Kutsua `next()` jatkaa route-handleriin

### 5. Token käytössä (Frontend)

**Tiedosto:** `web/src/lib/apiClient.ts`

```typescript
// Lue token localStorage:sta
function getAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;  // SSR:n varalta
  return localStorage.getItem("accessToken");
}

// Tallenna token localStorage:hen
function setAccessTokenInStorage(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

// Jokainen API-pyyntö lisää tokenin headeriin
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers ?? {});
  headers.set("Content-Type", "application/json");

  // Hae token localStorage:sta
  const token = getAccessTokenFromStorage();
  if (token) {
    // Lisää headeriin muodossa: "Bearer <token>"
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
```

**Flow:**
```
1. getAccessTokenFromStorage()
   └─ lukee localStorage.getItem("accessToken")
   
2. if (token) → headers.set("Authorization", `Bearer ${token}`)
   └─ Esim: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   
3. fetch(url, { headers })
   └─ Lähettää HTTP-pyynnön Authorization-headerilla
```

### 6. Logout (Frontend)

**Tiedosto:** `web/src/features/auth.ts`

```typescript
export async function logout(): Promise<void> {
  // Poista token localStorage:sta
  setAccessToken(null);

  // Ohjaa käyttäjä login-sivulle
  window.location.href = "/login";
}
```

**Mitä tapahtuu:**
1. ✅ Kutsua `setAccessToken(null)`
   - Kutsuu `localStorage.removeItem("accessToken")`
2. ✅ Aseta `window.location.href = "/login"`
   - Sivun lataus uudelleen + navigointi
   - Koska tokeneja ei ole, käyttäjä näkee login-formin

---

## 📡 Backend API - Syvyyteen

### 1. Express-sovellus ja Middleware

**Tiedosto:** `backend/src/app.ts`

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import healthRouter from "./routes/health.js";
import sessionsRouter from "./routes/sessions.js";
import themesRouter from "./routes/themes.js";
import authRouter from "./routes/auth.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// CORS: Sallii cross-origin requestit
// Tarvitaan, koska web on eri originissa (localhost:5173)
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://yourdomain.com"]
    : true,  // Development: salli kaikki origint
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Helmet: Turvallisuus (HTTP headersit)
app.use(helmet());

// Express: JSON-body parser
app.use(express.json());

// Morgan: HTTP-request logging
app.use(morgan("combined"));

// Reitit
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/sessions", sessionsRouter);
app.use("/themes", themesRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

**Middleware order (tärkeä!):**
1. `helmet()` → Asettaa turvallisuus-headersit
2. `cors()` → Sallii cross-origin requestit
3. `express.json()` → Parsii JSON-body
4. `morgan()` → Logaa requestit
5. Reitit → Käsittelevät requesteja

**CORS selitys:**
- Web on `http://localhost:5173`
- Backend on `http://localhost:3000`
- Sama host, eri port → eri origin
- Ilman CORS:ia, selain estää requestin
- CORS-middleware vastaa OPTIONS-pyyntöihin ja sallii requestin

### 2. Sessions-reitti yksityiskohtaisesti

**Tiedosto:** `backend/src/routes/sessions.ts`

```typescript
import { Router } from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Kaikki sessions-reitit vaativat autentikaatiota
router.use(requireAuth);

// Helper: Validoi luku 0–10 välillä
const clampScore = (n: unknown) => {
  const v = Number(n);
  if (!Number.isInteger(v) || v < 0 || v > 10) return null;
  return v;
};

// ========================================
// GET /sessions
// ========================================
router.get("/", async (_req: AuthRequest, res) => {
  // Hae kaikki treeni-istunnot järjestyksessä
  const sessions = await prisma.trainingSession.findMany({
    orderBy: { date: "desc" },  // Uusimmat ensin
  });
  res.json(sessions);
});

// ========================================
// GET /sessions/past
// ========================================
router.get("/past", async (_req, res) => {
  const now = new Date();
  const sessions = await prisma.trainingSession.findMany({
    where: { date: { lte: now } },  // date <= nyt
    orderBy: { date: "desc" },
  });
  res.json(sessions);
});

// ========================================
// GET /sessions/:id
// ========================================
router.get("/:id", async (req, res) => {
  const session = await prisma.trainingSession.findUnique({
    where: { id: req.params.id },
  });
  if (!session) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(session);
});

// ========================================
// POST /sessions
// Luo uusi istunto
// ========================================
router.post("/", async (req, res) => {
  const { date, feeling, performance, rating, feedback } = req.body ?? {};

  // Validointi: arvot 0–10 välillä
  const feelingV = clampScore(feeling);
  const performanceV = clampScore(performance);
  const ratingV = clampScore(rating);

  // Pakollisilla kentillä tarkistus
  if (!date || feelingV === null || performanceV === null || ratingV === null) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Luo Prisma:lla
  const created = await prisma.trainingSession.create({
    data: {
      date: new Date(date),          // Merkkijono → Date
      feeling: feelingV,              // number (0-10)
      performance: performanceV,      // number (0-10)
      rating: ratingV,                // number (0-10)
      feedback: feedback ? String(feedback) : null,  // valinnainen
    }
  });

  // 201: Created
  res.status(201).json(created);
});

// ========================================
// PUT /sessions/:id
// Päivitä istuntoa
// ========================================
router.put("/:id", async (req, res) => {
  const { date, feeling, performance, rating, feedback } = req.body ?? {};

  const updateData: any = {};

  // Jokainen kenttä voi päivittyä itsenäisesti
  if (date !== undefined) updateData.date = new Date(date);

  if (feeling !== undefined) {
    const v = clampScore(feeling);
    if (v === null) return res.status(400).json({ error: "feeling must be 0–10" });
    updateData.feeling = v;
  }

  if (performance !== undefined) {
    const v = clampScore(performance);
    if (v === null) return res.status(400).json({ error: "performance must be 0–10" });
    updateData.performance = v;
  }

  if (rating !== undefined) {
    const v = clampScore(rating);
    if (v === null) return res.status(400).json({ error: "rating must be 0–10" });
    updateData.rating = v;
  }

  if (feedback !== undefined) {
    updateData.feedback = feedback ? String(feedback) : null;
  }

  try {
    // Prisma UPDATE
    const updated = await prisma.trainingSession.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// ========================================
// DELETE /sessions/:id
// Poista istunto
// ========================================
router.delete("/:id", async (req, res) => {
  try {
    await prisma.trainingSession.delete({
      where: { id: req.params.id }
    });
    // 204: No Content
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
```

**Jokaisen reitin vaiheet:**

1. **GET /** (Listaa)
   - `prisma.trainingSession.findMany()` → Kaikki rivit
   - `orderBy: { date: "desc" }` → Uusimmat ensin
   - Palauta JSON-array

2. **POST /** (Luo)
   - Validoi request-body
   - `prisma.trainingSession.create()` → Lisää rivejä
   - Palauta 201 + luotu objekti

3. **PUT /:id** (Päivitä)
   - Validoi each field
   - `prisma.trainingSession.update()` → Päivitä rivi
   - Palauta 200 + päivitetty objekti

4. **DELETE /:id** (Poista)
   - `prisma.trainingSession.delete()` → Poista rivi
   - Palauta 204 (No Content)

### 3. Prisma ORM

**Tiedosto:** `backend/src/prisma/client.ts`

```typescript
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

**Mikä on Prisma?**
- ORM (Object-Relational Mapping) → SQL tietokanta abstraktiona
- Kirjoitat TypeScript:ia → Prisma kääntää SQL:ksi
- Turvallinen → SQL-injektiot poistetaan automaattisesti

**Esimerkki:**

```typescript
// Prisma (TypeScript)
await prisma.trainingSession.create({
  data: {
    date: new Date("2024-01-14"),
    feeling: 8,
    performance: 9,
    rating: 8,
    feedback: "Great workout!",
  }
});

// ↓ ↓ ↓ Prisma muuntaa ↓ ↓ ↓

// SQL (generated)
INSERT INTO "TrainingSession" 
  (date, feeling, performance, rating, feedback) 
VALUES 
  ('2024-01-14'::timestamp, 8, 9, 8, 'Great workout!');
```

---

## 🌐 Web Frontend - Rakenne & Flow

### 1. Sovelluksen rakenne

```
web/src/
├── main.tsx                 ← Vite entry point
├── App.tsx                  ← Root komponentti
├── lib/
│   ├── apiClient.ts         ← API-pyynnöt + token hallinta
│   ├── env.ts               ← Environment variables
│   ├── date.ts              ← Date utilities
│   └── number.ts            ← Number utilities
├── features/
│   ├── auth.ts              ← Logout
│   ├── session.ts           ← Session API calls
│   ├── themes.ts            ← Theme API calls
│   ├── summary.ts           ← Summary API calls
│   ├── types.ts             ← TypeScript interfaces
│   └── validators.ts        ← Form validation
├── pages/
│   ├── LoginPage.tsx        ← Kirjautuminen
│   ├── HomePage.tsx         ← Etusivu
│   ├── SessionPage.tsx      ← Sessions listaus
│   ├── SessionDetailPage.tsx← Session yksityiskohdat
│   ├── ThemesPage.tsx       ← Themes hallinta
│   └── NotFoundPage.tsx     ← 404
├── components/
│   ├── AppShell.tsx         ← Layout + navigation
│   ├── SessionList.tsx      ← Sessions list component
│   ├── SessionForm.tsx      ← Create/edit form
│   ├── NoteList.tsx         ← Notes list
│   ├── NoteForm.tsx         ← Note create/edit
│   ├── ThemeList.tsx        ← Themes list
│   └── ThemeForm.tsx        ← Theme create/edit
├── routes/
│   └── index.tsx            ← React Router routes
└── styles/
    └── globals.css          ← Global CSS
```

### 2. Vite Entry Point

**Tiedosto:** `web/src/main.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Mitä tapahtuu:**
1. React hakee `<div id="root"></div>` HTML:sta
2. `ReactDOM.createRoot()` → Luo React-sovelluksen
3. `<App />` → Root komponentti renderöidään root:iin

### 3. Root App.tsx

**Tiedosto:** `web/src/App.tsx`

```typescript
import { BrowserRouter } from "react-router-dom";
import routes from "./routes";
import AppShell from "./components/AppShell";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        {routes}
      </AppShell>
    </BrowserRouter>
  );
}
```

**Mitä tapahtuu:**
1. `BrowserRouter` → React Router setup (URL-navigaatio)
2. `AppShell` → Layout komponentti (header, nav, footer)
3. `{routes}` → Reitit renderoituvat AppShel:in sisälle

### 4. React Router Routes

**Tiedosto:** `web/src/routes/index.tsx`

```typescript
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import SessionPage from "../pages/SessionPage";
import SessionDetailPage from "../pages/SessionDetailPage";
import ThemesPage from "../pages/ThemesPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <SessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:id"
        element={
          <ProtectedRoute>
            <SessionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/themes"
        element={
          <ProtectedRoute>
            <ThemesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

**Reitit:**
- `/login` → Public (kuka tahansa näkee)
- `/`, `/sessions`, `/sessions/:id`, `/themes` → Protected (vaatii tokenin)
- `*` → 404 ei löytynyt

### 5. ProtectedRoute - Token tarkistus

**Tiedosto:** `web/src/routes/ProtectedRoute.tsx`

```typescript
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../lib/apiClient";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const token = getAccessToken();

  // Jos tokenaa ei ole → ohjaa login-sivulle
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Token on → render children
  return <>{children}</>;
}
```

**Mitä tapahtuu:**
1. `getAccessToken()` → Lukee localStorage:sta
2. Jos null → `<Navigate to="/login" />` → Ohjaa login-sivulle
3. Jos token → `{children}` → Render komponentti

---

## 🎨 React Komponentit & Hooks

### 1. LoginPage - Autentikaatio

**Tiedosto:** `web/src/pages/LoginPage.tsx`

```typescript
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAccessToken } from "../lib/apiClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);  // Toggle: Login ↔ Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Estä sivun lataus
    setError("");
    setLoading(true);

    try {
      // Kutsua API:a riippuen isLogin:sta
      const result = isLogin
        ? await api.login(email, password)
        : await api.register(email, password);

      // Tallenna token
      setAccessToken(result.accessToken);

      // Navigoi etusivulle
      navigate("/");
    } catch (err) {
      // Näytä virhe
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>{isLogin ? "Kirjaudu" : "Rekisteröidy"}</h1>

      {error && <div className="error">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Salasana"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Lähetetään..." : isLogin ? "Kirjaudu" : "Rekisteröidy"}
      </button>

      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Vai rekisteröidy?" : "Vai kirjaudu?"}
      </button>
    </form>
  );
}
```

**State-muuttujat:**
- `isLogin: boolean` → Toggle login/register näkymän
- `email: string` → Email-input arvo
- `password: string` → Password-input arvo
- `loading: boolean` → API-pyynnön aikana true (nappula disabled)
- `error: string` → Virheilmoitus näytetään

**Flow:**
1. Käyttäjä kirjoittaa email + password
2. Klikkaa "Kirjaudu" → `handleSubmit()` kutsuu
3. `setLoading(true)` → Nappula disabled
4. `api.login()` → HTTP POST /auth/login
5. Jos onnistuu:
   - `setAccessToken()` → localStorage
   - `navigate("/")` → Etusivulle
6. Jos virhe:
   - `setError()` → Näytetään virheilmoitus

### 2. HomePage - Sessiot + Teemat

**Tiedosto:** `web/src/pages/HomePage.tsx` (osittain)

```typescript
import { useEffect, useState } from "react";
import { getThemes } from "../features/themes";
import { getSessions, createSession } from "../features/session";
import type { Theme, TrainingSession } from "../features/types";
import SessionList from "../components/SessionList";
import SessionForm from "../components/SessionForm";

export default function HomePage() {
  // State
  const [themes, setThemes] = useState<Theme[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Lataa data kun sivu avautuu
  useEffect(() => {
    load();
  }, []);  // [] = vain mount-yhteydessä

  async function load() {
    setLoading(true);
    try {
      // Lataa sekä themes että sessions rinnakkain
      const [ts, ss] = await Promise.all([
        getThemes(),
        getSessions()
      ]);
      setThemes(ts);
      setSessions(ss);
    } finally {
      setLoading(false);
    }
  }

  // Etsi nykyinen teema (pvm on start–end välillä)
  function currentTheme(): Theme | null {
    const now = new Date().toISOString();
    return themes.find((t) => t.startAt <= now && now <= t.endAt) || null;
  }

  // Luo uusi sessio
  async function handleCreateSession(payload: CreateTrainingSessionInput) {
    await createSession(payload);
    setShowForm(false);
    await load();  // Refreski lista
  }

  if (loading) return <div>Ladataan...</div>;

  const current = currentTheme();

  return (
    <div>
      <h1>Etusivu</h1>

      {current && (
        <div className="current-theme">
          <h2>Nykyinen teema: {current.name}</h2>
          <p>{current.startAt} – {current.endAt}</p>
        </div>
      )}

      <h2>Viimeisimmät sessiot</h2>
      <SessionList sessions={sessions.slice(0, 5)} />

      {showForm ? (
        <SessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button onClick={() => setShowForm(true)}>Uusi sessio</button>
      )}
    </div>
  );
}
```

**State:**
- `themes: Theme[]` → Kaikki teemat (etsi current)
- `sessions: TrainingSession[]` → Kaikki sessiot
- `loading: boolean` → Lataamisen aikana true
- `showForm: boolean` → SessionForm näkyvä?

**Lifecycle:**
1. `useEffect(..., [])` → Kun komponentti mount:aa, kutsua `load()`
2. `load()` → Promise.all([getThemes(), getSessions()])
3. Lataa molemmat rinnakkain, asettaa state:iin

**Render:**
- Jos loading → "Ladataan..."
- Jos nykyinen teema → näytä
- SessionList → viimeisimmät 5 sessiota
- Nappula/Form toggle

### 3. SessionList - Komponentti

**Tiedosto:** `web/src/components/SessionList.tsx`

```typescript
import type { TrainingSession } from "../features/types";

interface Props {
  sessions: TrainingSession[];
  onSelect?: (session: TrainingSession) => void;
  onDelete?: (id: string) => void;
}

export default function SessionList({ sessions, onSelect, onDelete }: Props) {
  if (sessions.length === 0) {
    return <p>Ei sessioita</p>;
  }

  return (
    <ul>
      {sessions.map((session) => (
        <li key={session.id}>
          <div onClick={() => onSelect?.(session)}>
            <h3>{new Date(session.date).toLocaleDateString()}</h3>
            <p>Feeling: {session.feeling}/10</p>
            <p>Performance: {session.performance}/10</p>
            <p>Rating: {session.rating}/10</p>
            {session.feedback && <p>Note: {session.feedback}</p>}
          </div>
          <button onClick={() => onDelete?.(session.id)}>
            Poista
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**Props:**
- `sessions: TrainingSession[]` → Näytettävät sessiot
- `onSelect?: (session) => void` → Kutsutaan kun klikataan
- `onDelete?: (id) => void` → Kutsutaan kun "Poista" klikataan

**Render:**
- `.map()` → Jokainen sessio omaksi `<li>`
- Näytä date, feeling, performance, rating, feedback
- Delete-nappula

### 4. SessionForm - Lomake

**Tiedosto:** `web/src/components/SessionForm.tsx` (osittain)

```typescript
import { useState } from "react";
import type { CreateTrainingSessionInput } from "../features/types";

interface Props {
  initial?: CreateTrainingSessionInput;
  onSubmit: (data: CreateTrainingSessionInput) => Promise<void>;
  onCancel?: () => void;
}

export default function SessionForm({ initial, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? "");
  const [feeling, setFeeling] = useState(initial?.feeling ?? 5);
  const [performance, setPerformance] = useState(initial?.performance ?? 5);
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [feedback, setFeedback] = useState(initial?.feedback ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validointi
    if (!date || feeling < 0 || feeling > 10 || performance < 0 || performance > 10 || rating < 0 || rating > 10) {
      setError("Invalid input");
      return;
    }

    setLoading(true);
    try {
      // Kutsua onSubmit
      await onSubmit({
        date,
        feeling,
        performance,
        rating,
        feedback: feedback || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{initial ? "Muokkaa" : "Uusi sessio"}</h2>

      {error && <div className="error">{error}</div>}

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <label>
        Feeling: {feeling}
        <input
          type="range"
          min="0"
          max="10"
          value={feeling}
          onChange={(e) => setFeeling(Number(e.target.value))}
        />
      </label>

      <label>
        Performance: {performance}
        <input
          type="range"
          min="0"
          max="10"
          value={performance}
          onChange={(e) => setPerformance(Number(e.target.value))}
        />
      </label>

      <label>
        Rating: {rating}
        <input
          type="range"
          min="0"
          max="10"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
      </label>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback (optional)"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Tallennetaan..." : "Tallenna"}
      </button>

      {onCancel && <button type="button" onClick={onCancel}>Peruuta</button>}
    </form>
  );
}
```

**State:**
- `date: string` → ISO date
- `feeling`, `performance`, `rating: number` → 0-10
- `feedback: string` → Valinnainen muistiinpano
- `loading: boolean` → API-pyynnön aikana true
- `error: string` → Virheilmoitus

---

## 🔄 Tiedonvuo Käytännössä

### Esimerkki: Käyttäjä luo uuden sessio

```
KÄYTTÄJÄ KLIKKAA "Uusi sessio"
      ↓
HomePage state: showForm = true
      ↓
<SessionForm /> renderöidään näkyviin
      ↓
Käyttäjä täyttää formin:
  - date: 2024-01-14
  - feeling: 8
  - performance: 9
  - rating: 8
  - feedback: "Great workout!"
      ↓
KÄYTTÄJÄ KLIKKAA "Tallenna"
      ↓
SessionForm.handleSubmit():
  - Validointi: date pakollinen, arvot 0-10
  - setLoading(true) → Nappula disabled
  - onSubmit() kutsuu → HomePage.handleCreateSession()
      ↓
HomePage.handleCreateSession():
  - createSession(payload) kutsuu
      ↓
features/session.ts:
  - createSession(payload) kutsuu
  - api.createSession(payload) kutsuu
      ↓
lib/apiClient.ts:
  - request<TrainingSession>("/sessions", {...})
  - Lue token: getAccessTokenFromStorage()
  - Aseta header: "Authorization: Bearer <token>"
  - fetch(http://localhost:3000/sessions, { method: "POST", ... })
      ↓
BACKEND EXPRESS:
  - POST /sessions päättyy
  - requireAuth middleware tarkistaa JWT:n
  - Kutsuu jwt.verify(token, JWT_SECRET)
  - req.userId asetetaan
  - Route handler: prisma.trainingSession.create(...)
      ↓
DATABASE:
  - INSERT INTO TrainingSession (date, feeling, ...)
  - Palauttaa luotua objektia
      ↓
BACKEND PALAUTTAA:
  - 201 Created
  - Body: { id: "...", date: "...", feeling: 8, ... }
      ↓
Frontend API Client:
  - res.json() → palauttaa TrainingSession objekti
  - Promise resolve
      ↓
features/session.ts:
  - Palauttaa result
      ↓
HomePage.handleCreateSession():
  - setShowForm(false) → Form katoaa
  - load() → Lataa sessiot uudelleen
      ↓
HomePage.load():
  - getSessions() kutsuu
  - API call → /sessions
  - Prisma: findMany()
  - Palauttaa päivitetty lista
      ↓
setState(sessions) → UI päivittyy
      ↓
KÄYTTÄJÄ NÄKEE:
  - Uusi sessio listalla
  - Loading spinner poissa
  - Form suljettu
```

### HTTP-pyyntöjen kulku

```
CLIENT (Browser)
  ↓
fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  body: JSON.stringify({
    date: "2024-01-14",
    feeling: 8,
    ...
  })
})
  ↓
[NETWORK]
  ↓
EXPRESS SERVER
  ↓
Middleware stack:
  1. helmet() → Set security headers
  2. cors() → Check origin, set CORS headers
  3. express.json() → Parse body
  4. morgan() → Log request
  ↓
Route handler: POST /sessions
  ↓
requireAuth middleware:
  - Check "Authorization" header
  - Extract token
  - jwt.verify(token, secret)
  - Set req.userId
  ↓
Route handler:
  - Validate body
  - prisma.trainingSession.create()
  ↓
Prisma:
  - Build SQL query
  - Execute SQL
  - Parse result
  ↓
Response:
  res.status(201).json({...})
  ↓
[NETWORK]
  ↓
CLIENT
  ↓
response.json() → JavaScript object
  ↓
Promise resolve
```

---

## 💾 State Management

Rollmate käyttää **React local state** + **localStorage**:

### 1. Local State (useState)

**Sivulla (HomePage, SessionPage, jne):**
```typescript
const [sessions, setSessions] = useState<TrainingSession[]>([]);
const [loading, setLoading] = useState(false);
```

**Komponentissa (SessionForm):**
```typescript
const [date, setDate] = useState("");
const [feeling, setFeeling] = useState(5);
```

**Milloin päivittyy:**
- Käyttäjä kirjoittaa input:iin → `setXxx()`
- API-vastaus saapuu → `setState(data)`
- User klikkaa nappia → `setState(newValue)`

### 2. localStorage (Token)

**Tallennaa:**
```typescript
// apiClient.ts
localStorage.setItem("accessToken", token);
```

**Lukee:**
```typescript
const token = localStorage.getItem("accessToken");
```

**Milloin käytetään:**
- Login-sivulla: tallenna token
- API-pyynnöissä: lue token → Authorization header
- Logout: poista token
- ProtectedRoute: tarkista token → 401?

---

## ⚠️ Error Handling

### Backend → Frontend

**Backend vastaus (401):**
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid token"
  }
}
```

**Frontend apiClient.ts:**
```typescript
if (!res.ok) {
  const text = await res.text().catch(() => "");
  throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
}
```

**Komponentti ottaa kiinni:**
```typescript
try {
  await api.login(email, password);
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed");
}
```

**Käyttäjä näkee:**
```
HTTP 401: Invalid token
```

### Validointivirheet

**Backend validoi (400):**
```typescript
if (feelingV === null) {
  return res.status(400).json({
    error: { code: "VALIDATION_ERROR", message: "..." }
  });
}
```

**Frontend validoi (local):**
```typescript
if (feeling < 0 || feeling > 10) {
  setError("Feeling must be 0-10");
  return;  // Ei kutsua API:a
}
```

---

## 🔤 TypeScript & Tyypit

### 1. API Types (`features/types.ts`)

```typescript
export interface TrainingSession {
  id: string;
  date: string;           // ISO string
  feeling: number;        // 0-10
  performance: number;    // 0-10
  rating: number;         // 0-10
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingSessionInput {
  date: string;
  feeling: number;
  performance: number;
  rating: number;
  feedback?: string | null;
}
```

### 2. Component Props

```typescript
interface SessionListProps {
  sessions: TrainingSession[];
  onSelect?: (session: TrainingSession) => void;
  onDelete?: (id: string) => void;
}

export default function SessionList({ sessions, onSelect, onDelete }: SessionListProps) {
  // ...
}
```

### 3. API Client Types

```typescript
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // <T> = generic type parameter
  // Käyttäjä määrittää, mitä tyyppiä T on
}

// Esimerkki:
request<TrainingSession>("/sessions/123")  // T = TrainingSession
request<Theme[]>("/themes")                // T = Theme[]
```

---

## 📦 Local Storage & Session

### Mitä tallennetaan localStorage:een?

**Ainoastaan:** `accessToken`

```typescript
localStorage.setItem("accessToken", token);
localStorage.getItem("accessToken");
localStorage.removeItem("accessToken");  // logout
```

### Miksi localStorage?

- ✅ Persiste reload-yhteydessä (token ei häviä)
- ✅ Yksinkertainen (ei komplekseja storeita)
- ✅ Kaikki selaimet tukevat
- ⚠️ XSS-riski (JavaScript pääsy)

### Miksi EI sessionStorage?

- ❌ Katoaa browser-sulkemisen yhteydessä

### Miksi EI cookies?

- ❌ Hybrid-kompleksisuus (refresh token)
- ❌ CORS-ongelmat
- ❌ SameSite / Secure / HttpOnly konfiguraatio

Nykyinen ratkaisu on yksinkertainen ja riittävä MVP:lle.

---

## 🔌 API Client Yksityiskohtaisesti

**Tiedosto:** `web/src/lib/apiClient.ts`

```typescript
import { env } from "./env";
import type { /* ... types ... */ } from "../features/types";

// === Token Storage ===

function getAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;  // SSR varalta
  return localStorage.getItem("accessToken");
}

function setAccessTokenInStorage(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

// === HTTP Request ===

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Luo Headers objekti
  const headers = new Headers(options?.headers ?? {});
  headers.set("Content-Type", "application/json");

  // Hae token ja lisää Bearer headeriin
  const token = getAccessTokenFromStorage();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Tee fetch
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,           // Levitä options (method, body, jne)
    headers,              // Aseta headers (Content-Type, Authorization)
  });

  // Tarkista response status
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  // Parse response
  if (res.status === 204) return undefined as T;  // No Content
  return (await res.json()) as T;
}

// === Public API ===

export function setAccessToken(token: string | null) {
  setAccessTokenInStorage(token);
}

export function getAccessToken(): string | null {
  return getAccessTokenFromStorage();
}

export const api = {
  // ===== AUTH =====
  register: (email: string, password: string) =>
    request<{ accessToken: string; user: { id: string; email: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  login: (email: string, password: string) =>
    request<{ accessToken: string; user: { id: string; email: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  // ===== THEMES =====
  getThemes: () =>
    request<Theme[]>("/themes"),

  createTheme: (payload: CreateThemeInput) =>
    request<Theme>("/themes", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updateTheme: (id: string, payload: CreateThemeInput) =>
    request<Theme>(`/themes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  deleteTheme: (id: string) =>
    request<void>(`/themes/${id}`, { method: "DELETE" }),

  // ===== SESSIONS =====
  getSessions: () =>
    request<TrainingSession[]>("/sessions"),

  createSession: (payload: CreateTrainingSessionInput) =>
    request<TrainingSession>("/sessions", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getSession: (id: string) =>
    request<TrainingSession>(`/sessions/${id}`),

  updateSession: (id: string, payload: CreateTrainingSessionInput) =>
    request<TrainingSession>(`/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  deleteSession: (id: string) =>
    request<void>(`/sessions/${id}`, { method: "DELETE" }),

  // ===== NOTES =====
  getSessionNotes: (sessionId: string) =>
    request<Note[]>(`/sessions/${sessionId}/notes`),

  createSessionNote: (sessionId: string, payload: CreateNoteInput) =>
    request<Note>(`/sessions/${sessionId}/notes`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updateSessionNote: (sessionId: string, noteId: string, payload: CreateNoteInput) =>
    request<Note>(`/sessions/${sessionId}/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  deleteSessionNote: (sessionId: string, noteId: string) =>
    request<void>(`/sessions/${sessionId}/notes/${noteId}`, {
      method: "DELETE"
    }),

  // ===== SUMMARY =====
  getWeeklySummary: () =>
    request<WeeklySummary[]>("/summary/week"),
};
```

---

## 🎯 Yhteenveto: Miten data kulkee

```
1. KÄYTTÄJÄ
   └─ Klikkaa nappia, täyttää formin, jne

2. KOMPONENTIN STATE PÄIVITTYY
   └─ useState(), setState() kutsuu

3. EVENT HANDLER KUTSUU FEATURE-FUNKTIOTA
   └─ handleSubmit() kutsuu createSession()

4. FEATURE KUTSUU API-CLIENTIA
   └─ createSession() kutsuu api.createSession()

5. API-CLIENT TEKEE HTTP-PYYNNÖN
   └─ Hae token localStorage:sta
   └─ Aseta Authorization header
   └─ fetch() HTTP POST

6. BACKEND VASTAANOTTAA
   └─ Middleware: requireAuth tarkistaa JWT:n
   └─ Handler: Validoi request-body
   └─ Prisma: Luo tietokantaan

7. BACKEND PALAUTTAA
   └─ HTTP 201 + JSON body

8. API-CLIENT VASTAA
   └─ Parsii JSON
   └─ Palauttaa Promise<T>

9. FEATURE VASTAA
   └─ Palauttaa result

10. KOMPONENTTI PÄIVITTÄÄ STATE
    └─ setState(newData)

11. REACT RENDERÖI UUDELLEEN
    └─ UI päivittyy
```

---

## � Tasks (Tehtävät) - API & Frontend

### Backend Routes: `/tasks`

**Tiedosto:** `backend/src/routes/tasks.ts`

#### GET /tasks
```typescript
// Listaa kaikki tehtävät järjestyksessä: uusimmat ensin
router.get("/", async (_req, res) => {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});
```

**Response:**
```json
[
  {
    "id": "cm8v...",
    "title": "Treena juoksu",
    "completed": false,
    "createdAt": "2025-01-14T10:00:00Z",
    "completedAt": null
  },
  {
    "id": "cm8w...",
    "title": "Osta vesipullo",
    "completed": true,
    "createdAt": "2025-01-13T14:30:00Z",
    "completedAt": "2025-01-14T09:00:00Z"
  }
]
```

#### POST /tasks
```typescript
// Luo uuden tehtävän
router.post("/", async (req, res) => {
  const { title } = req.body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const created = await prisma.task.create({
    data: { title: title.trim() },
  });

  res.status(201).json(created);
});
```

**Request:**
```json
{ "title": "Uusi tehtävä" }
```

**Response:** `201 Created`
```json
{
  "id": "cm8x...",
  "title": "Uusi tehtävä",
  "completed": false,
  "createdAt": "2025-01-14T11:00:00Z",
  "completedAt": null
}
```

#### PUT /tasks/:id
```typescript
// Päivitä tehtävää (title ja/tai completed)
router.put("/:id", async (req, res) => {
  const { title, completed } = req.body ?? {};

  const updateData: any = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title must be a non-empty string" });
    }
    updateData.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "completed must be a boolean" });
    }
    updateData.completed = completed;
    updateData.completedAt = completed ? new Date() : null;
  }

  try {
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});
```

**Request:** (merkitse tehdyksi)
```json
{ "completed": true }
```

**Response:** `200 OK`
```json
{
  "id": "cm8x...",
  "title": "Uusi tehtävä",
  "completed": true,
  "createdAt": "2025-01-14T11:00:00Z",
  "completedAt": "2025-01-14T11:05:00Z"
}
```

#### DELETE /tasks/:id
```typescript
// Poista tehtävä
router.delete("/:id", async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});
```

**Response:** `204 No Content` (ei bodya)

### Frontend: Tasks-sivu

**Tiedosto:** `web/src/pages/TasksPage.tsx`

```typescript
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload: CreateTaskInput) {
    await api.createTask(payload);  // POST /tasks
    await load();  // Lataa uudelleen
  }

  return (
    <div>
      <h2>Tehtävät</h2>
      <TodoForm onCreate={handleCreate} />
      <TodoList tasks={tasks} onUpdate={load} />
    </div>
  );
}
```

**Flow:**
1. Sivu latautuu → `useEffect` kutsuu `load()`
2. `load()` kutsuu `api.getTasks()` → GET /tasks
3. Tiedot tallennetaan state:een `setTasks(data)`
4. UI renderöituu taskeilla
5. Käyttäjä klikkaa "Lisää" → `TodoForm` avautuu
6. Käyttäjä submitoii → `handleCreate()` kutsuu `api.createTask()`
7. Backend luo tehtävän ja palauttaa sen
8. `load()` kutsutaan uudelleen → UI päivittyy

### TodoList Komponentti

**Tiedosto:** `web/src/components/TodoList.tsx`

```typescript
export default function TodoList({ tasks, onUpdate }: {
  tasks: Task[];
  onUpdate: () => void;
}) {
  async function toggleTask(task: Task) {
    // PUT /tasks/:id { completed: !task.completed }
    await api.updateTask(task.id, { completed: !task.completed });
    onUpdate();  // Päivitä parent-komponentin state
  }

  async function deleteTask(id: string) {
    if (!confirm("Haluatko varmasti poistaa?")) return;
    // DELETE /tasks/:id
    await api.deleteTask(id);
    onUpdate();
  }

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(task)}
          />
          <span style={task.completed ? { textDecoration: "line-through" } : {}}>
            {task.title}
          </span>
          <button onClick={() => deleteTask(task.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
```

**Mitä tapahtuu:**
- Checkbox: Kutsuu `toggleTask()` → `api.updateTask()` → PUT /tasks/:id
- Näyttää completed-status visuaalisesti (yliviivaus)
- × nappi: Kutsuu `deleteTask()` → `api.deleteTask()` → DELETE /tasks/:id

### HomePage: Tasks Preview

**Tiedosto:** `web/src/pages/HomePage.tsx`

```typescript
export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  async function load() {
    const [ts, ss, tks] = await Promise.all([
      getThemes(),
      getSessions(),
      api.getTasks()  // ← Hae tehtävät
    ]);
    setTasks(tks);
  }

  return (
    <div>
      <section>
        <h2>Tehtävät</h2>
        {/* Näytä vain 5 viimeisintä */}
        <TodoList tasks={tasks.slice(0, 5)} onUpdate={load} />
        <button onClick={() => setShowTodoForm(true)}>
          + Lisää tehtävä
        </button>
      </section>

      {/* TodoForm modal */}
      {showTodoForm && (
        <TodoForm
          onCreate={async (payload) => {
            await api.createTask(payload);  // POST /tasks
            setShowTodoForm(false);
            await load();  // Päivitä UI
          }}
          onClose={() => setShowTodoForm(false)}
        />
      )}
    </div>
  );
}
```

---

## �📌 Tärkeimmät käsitteet

| Käsite | Selitys | Esimerkki |
|--------|---------|----------|
| **State** | React komponentin muuttuvat tiedot | `const [count, setCount] = useState(0)` |
| **Props** | Komponentin input-parametrit | `<Button onClick={handleClick} />` |
| **Effect** | Sivuvaikutus (data-lataus, subscriptions) | `useEffect(() => { load(); }, [])` |
| **localStorage** | Pysyvä client-side storage | `localStorage.setItem("key", value)` |
| **Token** | JWT-merkkijono, identifies käyttäjän | `Authorization: Bearer <token>` |
| **Promise** | Async operation, resolve/reject | `fetch().then(res => res.json())` |
| **TypeScript** | Type-safe JavaScript | `const user: User = { ... }` |
| **Prisma** | ORM, TypeScript ↔ SQL | `prisma.user.findUnique()` |

---

**Päivitetty:** 14.1.2026 | Detailed explanation document for learning purposes
