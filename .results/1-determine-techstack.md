Yhteenveto teknisestä pinosta (Step 1 — Rollmate repo)

Projektirakenne: Monorepo kolmella pääosalla: backend (package.json), web (package.json) ja mobile (package.json). Prisma-migraatiot löytyvät migrations.
Pääkieli(t): TypeScript koko pinossa; backend ja web käyttävät TypeScript-compile/tsconfig, mobile käyttää Expo + TypeScript.
Tarkoitus: Backend tarjoaa REST-API:t (Express), web on Vite + React -sovellus, mobile on Expo / React Native -asiakas.
Keskeiset frameworkit, kirjastot ja työkalut

Backend:
Framework: express
Datakirjasto: @prisma/client, Prisma CLI (prisma) — skeema: schema.prisma
DB-ajuri: pg (postgres), mutta Prisma-datasource on konfiguroitu sqlite (katso skeema)
Turvallisuus/HTTP: helmet, cors, morgan (logging)
Dev/Build: typescript, tsx (dev watch)
Web:
UI: react, react-dom
Router: react-router-dom
Build/dev: vite, @vitejs/plugin-react
Lint: eslint + @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh
Mobile:
Framework: expo, react-native
Native: @react-native-community/datetimepicker, react-native-safe-area-context
Yleisiä työkaluja:
TypeScript, ESLint, Vite, Expo, Prisma, tsx (backend hot-reload)
Build / test / run -komennot (löydetty package.json -tiedostoista)

Backend (package.json):
dev: tsx watch src/server.ts
build: tsc
start: node dist/server.js
Prisma-CLI: prisma:generate, prisma:migrate, prisma:deploy, prisma:studio
test: placeholder (echo "Error: no test specified" && exit 1)
Web (package.json):
dev: vite
build: tsc -b && vite build
lint: eslint .
preview: vite preview
Mobile (package.json):
start: expo start
android: expo start --android
ios: expo start --ios
web: expo start --web
Olennaiset konfiguraatiot ja huomiot

TypeScript
Backend: tsconfig.json
target/module: ES2022, rootDir: src, outDir: dist, strict: true, esModuleInterop: true
Web: tsconfig.app.json
target: ES2022, module: ESNext, jsx: react-jsx, noEmit: true (lint/build via Vite), moduleResolution: bundler, types: vite/client, strict-linting -asetukset
Mobile: TypeScript on dev-dependency (konfiguraatio löytyy oletettavasti [mobile/tsconfig.json], ei luettu), Expo + TS -workflow.
ESLint
Web: eslint.config.js — käyttää @eslint/js, TypeScript ESLint -konfiguraatiota, React Hooks ja Refresh -pluginien asetuksia; dist on ignore-alue.
Vite
Web: vite.config.ts — perus @vitejs/plugin-react plugin.
Prisma
Schema: schema.prisma
Datasource: provider = "sqlite", url = env("DATABASE_URL")
Generator: prisma-client-js
Mallit: TrainingSession ja Theme (kentät: id UUID, date, feeling, performance, rating, feedback; Theme: name, startAt, endAt, createdAt)
Migrations-kansio olemassa: migrations (useita migraatioita)
Express app
app.ts — Configuroitu middlewaret: helmet(), cors() (origin: http://localhost:5173), express.json(), morgan('combined'). Rekisteröidyt reitit: /health, /sessions, /themes.
Sovellus kuuntelee porttia (env PORT tai 3000). Dev-skript käyttää tsx watch suoraan server.ts.
CORS / kehitysyhteensopivuus
CORS origin on kovakoodattu http://localhost:5173 (oletus Vite dev -palvelin).
Repo- / README
Top-level readme.md on tyhjä.
Assumptions & Unknowns

DATABASE_URL: Prisma-schema käyttää env("DATABASE_URL") mutta tarkka arvo/formaatti ei ole repossa. Vaikka pg on dependencies, Prisma datasource on asetettu sqlite. Epäselvää on, käytetäänkö tuotannossa PostgreSQL:ää tai paikallista SQLite-tiedostoa.
Prod DB: pg on asennettu backendissä, mikä viittaa PostgreSQL-tukeen; mutta nykyinen schema.prisma on sqlite. Tarvitaan vahvistus, mikä DB käytössä tuotannossa.
Mobile tsconfig: tsconfig.json mainittu workspace-listauksessa, mutta sen sisältöä ei luettu — oletetaan Expo TypeScript -oletusasetukset.
Testit: Testejä ei löydy; test-skriptit ovat placeholdereja.
Ympäristökonfiguraatio: Env-tiedostot (.env) tai CI-konfiguraatiot eivät olleet nähtävillä — deployment- ja DB-salaisuuksien hallintatapa ei selviä.
Node / Expo / Browser-versiot: Ei eksplisiittistä engines/Node-versoa package.json-tiedostoissa.
API spec / auth: API:n autentikointi/autorisaatio ei näy — reitit (/sessions, /themes) löytyvät, mutta turvallisuus- tai auth-mekanismia ei löydetty.
Leikkaa tiivis jatkotoimintaehdotus tarvittaessa (esim. paikallisen käynnistysohjeen lisääminen README:hen, .env esimerkkitiedosto, tai selvitys tuotantotietokannasta).