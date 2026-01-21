Step 3 — Identify architecture

Arkkitehtuurin yleiskuva

Monorepo, kolme pääkomponenttia: backend (API + DB), mobile (React Native / Expo) ja web (Vite + React). Infra-hakemisto sisältää ympäristö/infra-resursseja.
Backend tarjoaa REST-tyyppiset reitit tiedon hallintaan ja käyttää Prismaa ORM:ään; web ja mobile käyttävät erillisiä API‑client‑abstraktioita kommunikoidakseen backendin kanssa.
Backend

Sovellusrakenne (pääpolut): app.ts (app & middleware), server.ts (käynnistys), reitit: routes (health.ts, sessions.ts, themes.ts).
Reititys: Reitit on organisointi kansioon routes; reitit rekisteröidään todennäköisesti app.ts:ssä. Ei havaittu erillistä controllers/-hakemistoa, eli route-tiedostot sisältävät todennäköisesti request‑handlerit (controller‑tasoa).
Controller / Service -jaottelu: Projektissa ei vaikuta olevan erillistä services/‑kansiota — liiketoimintalogiikka on todennäköisesti suoraan reitinhakemistoissa tai kollokoituna route-handlerien kanssa. Prisma-client toimii datakerroksen abstraktiona (client.ts).
Prisma-mallit & migraatiot: Tietomallit ja skeema löytyvät schema.prisma ja migraatiot kansiosta migrations.
DB-yhteys: Prisma clientin esiasetus ja instanssi sijaitsee osoitteessa client.ts; reitit käyttävät tätä yhteyttä suorittaakseen CRUD‑operaatiot.
Clientit (web & mobile)

API client -abstraktiot
Web: apiClient.ts — keskitetty HTTP/JSON‑asiakas, jota webin feature‑kutsut käyttävät.
Mobile: api.ts — vastaava abstraktio mobile‑sovellukselle.
Käyttötapa: Frontend‑koodi (web: web/src/features/*, mobile: services + components) kutsuu kyseistä API‑clientiä, joka kapseloi base‑URL, auth‑tokenit ja response parsingin; feature‑tiedostot tarjoavat domain‑tasoiset funktiot (esim. session CRUD), jotka puolestaan käyttävät API‑clientiä.
Tyypilliset CRUD-flowt (esimerkki / yleinen malli)

Client muodostaa pyyntöä kutsumalla API‑clientin funktiota (esim. apiClient.post('/sessions', payload)).
Web-esimerkki: session.ts (feature kutsuu apiClient.ts)
Mobile-esimerkki: api.ts + model.ts
HTTP-pyyntö lähetetään backendiin.
Backendin reitti vastaanottaa pyynnön (sessions.ts).
(Mahdollinen) Validointi: clientilla on validointilogiikkaa (mobile/src/domain/*/validators.ts, validators.ts). Backendissä ei näyttänyt olevan erillistä validointimoduulia; validointi tapahtuu todennäköisesti route‑handlerissa tai lightweight‑tarkistuksina.
DB‑operaatio Prisma-clientin kautta: route-handler käyttää client.ts ja Prisma‑malleja (schema.prisma) suoritettaviin CRUD‑operaatioihin.
Backend palauttaa JSON‑vastauksen clientille; client päivittää UI:n tai näyttää virheilmoituksen.
Virheenkäsittely ja logging

Error handling
Yleinen virheenkäsittely näyttää hoidettavan sovellus‑tasolla (odotettavasti app.ts sisältää virhe‑middleware). Ei havaittu erillistä errors/-moduulia tai rikasta validointikerrosta backendissä.
Client‑puolella odotettavat virheet käsitellään API‑clientin vastauksen perusteella (status‑koodit, JSON‑error‑kentät) ja feature‑taso nostaa tai mapittaa virheet käyttöliittymälle.
Logging / observability
Ei löydetty selkeästi konfiguroitua keskitettyä loggeria (esim. winston, pino) tai observability‑konfiguraatiota repo‑tasolla. Todennäköisesti peruslogging on console‑pohjaista tai riippuvuuksien kautta tehtyä, jos asennettuna.
Suositus: lisätä keskitetty logger ja strukturoitu error middleware backendiin sekä konsistentti logitus client‑kutsuihin (API client) ja mobilessa varten.
Huomioitavaa / suositellut tarkastusvaiheet

Tarkista app.ts-sisältö varmistaaksesi, miten error middleware ja request body parsing on toteutettu.
Etsi package.json-riippuvuuksista logging-/validation‑kirjastoja; tämä paljastaa käytännöt (esim. zod, yup, joi, pino).
Jos haluat, voin avata ja listata tarkemmat handler‑funktiot backend/src/routes/* ja esimerkkipolut CRUD‑operaatioille.