Project tree (summary)
root
backend/
package.json, tsconfig.json
prisma/
schema.prisma, migrations/
src/
app.ts, server.ts, prisma/client.ts, routes/ (health.ts, sessions.ts, themes.ts)
infra/
mobile/
app.json, App.tsx, index.ts, package.json, tsconfig.json, assets/, src/ (components/, domain/, hooks/, screens/, services/, utils/)
web/
package.json, vite.config.ts, index.html, tsconfig.*, src/ (App.tsx, main.tsx, components/, features/, pages/, services/, styles/)
readme.md
Luokittelut
backend: Palvelin- ja data‑kerros — API, Prisma‑tietokantakonfiguraatiot ja reitit. (Sijainti: backend)
mobile: Mobiilisovellus — React Native / Expo -projekti sovelluslogiikalla, komponenteilla ja palveluilla. (Sijainti: mobile)
web: Web‑asiakas — Vite + React -frontend, sivut, komponentit ja client‑palvelut. (Sijainti: web)
infra: Infra‑resurssit ja mahdolliset deploy/raw‑konfiguraatiot; käytössä projektin ympäristön hallintaan. (Sijainti: infra)
shared: Jaetut mallit/validoinnit/utilityt näkyvät pääosin domain, utils ja lib -kansioissa — tarkoitettu domain‑logiikan ja apufunktioiden uudelleenkäyttöön.
Tärkeimmät entry point -tiedostot ja configit
Backend entry / config:
server.ts — palvelimen käynnistys
app.ts — express/fastify app-konfiguraatio (reitit, middleware)
package.json — riippuvuudet & skriptit
tsconfig.json
schema.prisma — tietomalli
Mobile entry / config:
App.tsx — sovelluksen root
app.json — Expo/metadata
package.json, tsconfig.json
Merkittävät kansionimet: components, domain, screens
Web entry / config:
main.tsx — web-sovelluksen bootstrap
App.tsx — root-komponentti
index.html
package.json, vite.config.ts, tsconfig.app.json
Merkittävät kansionimet: components, pages, features
Infra:
infra — sisältö ei listattu tarkasti, mutta käytännössä infrastruktuuri- ja deploy‑resurssit elävät täällä.
Shared / cross-cutting:
mobile/src/domain/* ja web/src/features/* — domain-mallit ja validoinnit
utils ja lib — apufunktiot kuten date.ts, number.ts, API‑clientit (apiClient.ts, api.ts)
Yhteenveto