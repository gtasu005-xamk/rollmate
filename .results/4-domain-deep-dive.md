Domain deep dive — Rollmate (MVP)
Domain overview
Rollmate on harjoitteluseurantasovellus, jonka MVP:tä varten käyttäjä kirjaa harjoitussessioita (TrainingSession), liittää niihin tekniikkamuistiinpanoja (TechniqueNote / Theme‑tyyppiset merkinnät) ja tarkastelee yhteenvedonomaisia raportteja (WeeklySummary). Backend tallentaa datan Prisma/DB‑kerrokseen, ja web/mobile‑asiakkaat näyttävät, muokkaavat ja luovat sessioita sekä hakevat viikkoyhteenvedon.

Entiteetit (repo‑käytännön nimet / vastaavuudet)
TrainingSession (repo: Session)
TechniqueNote (repo: Theme / note‑tyyppinen sisältö liittyen sessioon)
WeeklySummary (repo: summary / agregoitu view)
TrainingSession
Kuvaus: Yksi harjoittelukerta, jonka metadataa ja mittareita tallennetaan.
Kentät:
id : string (UUID / PK)
userId : string (FK, optional, jos multi‑user)
date : string (ISO 8601, esim. "2026-01-14T18:00:00Z") — pakollinen
duration : number (minutes) — kokonaisluku, >= 0
rating : number (0–10) — yleensä integer; sallittu arvoalue 0..10
notes : string | null — vapaa tekstimuistiinpano
themeId : string | null — FK TechniqueNote/Theme (valinnainen)
createdAt : string (ISO datetime)
updatedAt : string (ISO datetime)
Rajoitteet:
date validoitava ISO‑formaatiksi.
duration ei-negatiivinen.
rating rajattu 0–10 (backend‑validointi).
TechniqueNote / Theme
Kuvaus: Tekniikkaan tai aiheeseen liittyvä kuvaus tai tunniste, jota sessio voi käyttää (voi toimia tagina tai pienimuotoisena muistiinpanona).
Kentät:
id : string (UUID / PK)
name : string — lyhyt nimi (esim. "Guard pass")
description : string | null — pidempi kuvaus tai tekniikkamuistiinpano
color : string | null — UI‑vinkki (hex tms.)
createdAt : string
updatedAt : string
Rajoitteet:
name ei tyhjä.
description vapaaehtoinen.
TechniqueNote (erillinen note-liike)
Jos repo käyttää erillistä note‑entiteettiä (per‑session notes):
id : string
sessionId : string (FK -> TrainingSession)
text : string
type : string | null (esim. "observation", "drill")
createdAt, updatedAt
WeeklySummary
Kuvaus: Agregoitu näkymä yhden viikon harjoitustoiminnasta käyttäjää kohden.
Kentät / arvot:
weekStart : string (ISO date, viikon ensimmäinen päivä)
userId : string
sessionsCount : number
totalDuration : number (minutes)
averageRating : number (float, 0..10)
topThemes : array of { themeId, name, count }
highlights : string | null (vapaamuotoinen tiivistelmä)
Rajoitteet:
Aggregoidut laskelmat (average, sum) lasketaan DB‑kyselyllä tai palvelinlaadulla.
Relaatiot
TrainingSession 1..* TechniqueNote (session voi sisältää useita muistiinpanoja) — many TechniqueNote -> one TrainingSession.
TrainingSession -> TechniqueNote/Theme (valinnainen FK): sessiolla voi olla viite yhteen pääteemaan.
User (jos olemassa) 1..* TrainingSession.
WeeklySummary ei välttämättä ole pysyvä taulu vaan laskettu aggregaatti käyttäjän sessioista (view tai endpoint).
Esimerkki ER‑suhteista:

TechniqueNote.sessionId -> TrainingSession.id (M:N ei käytetty, koska notet liittyvät yleensä yhteen sessioon)
TrainingSession.themeId -> Theme.id (optional, 1:1 tai 1:many riippuen mallista)
Käyttötapaukset (MVP CRUD + Weekly summary)
Create Session

Client (web/mobile) muodostaa POST /sessions (payload sisältää date, duration, rating, notes, themeId)
Backend validoi kentät (date ISO, duration >=0, rating 0..10)
Backend kutsuu Prisma: prisma.session.create({ data: ... })
Response: 201 Created + session object
Read Session(s)

GET /sessions (listaus, mahdolliset query‑parametrit: from, to, themeId)
GET /sessions/:id (yksittäinen, sis. notes)
Backend hakee prisma.session.findMany / findUnique ja palauttaa JSON
Update Session

PATCH/PUT /sessions/:id (payload: kentät jotka muuttuvat)
Backend validoi ja suorittaa prisma.session.update({ where:{id}, data: {...} })
Palauttaa päivitetyn resurssin
Delete Session

DELETE /sessions/:id
Backend poistaa session ja mahdollisesti siihen liittyvät notes (prisma.session.delete tai cascade)
Palauttaa 204 No Content
TechniqueNote CRUD (per session)

POST /sessions/:id/notes — lisää note sessioniin (prisma.note.create)
GET /sessions/:id/notes — listaa
PATCH /notes/:noteId — muokkaa
DELETE /notes/:noteId — poistaa
Theme management

CRUD reitit themes (luo, listaa, muokkaa, poista)
Käytetään UI:ssa valitsemaan session teema
Weekly Summary (read)

GET /summary?week=YYYY-WW tai GET /summary?from=...&to=...
Backend laskee aggregaatit: count, sum(duration), avg(rating), top themes (group by themeId)
Response: WeeklySummary JSON
Huomioita käytännön toteutuksessa
Validointi kannattaa tehdä sekä client‑tasolla että backendissä (rating ja date erityisesti).
Notes‑entiteetin mallinnus mahdollistaa rikkaamman historian (useita notes per session).
WeeklySummary voidaan toteuttaa joko reaaliaikaisena DB‑aggregate‑kyselynä tai taustaprosessilla (cache) riippuen skaalasta.
Prisma‑skaema kannattaa varmistaa seuraavien kenttien osalta: relaatioiden referenssit (sessionId, themeId), indeksointi userId ja date hakupyyntöjä varten.
Tarvittaessa voin avata ja poimia tarkat kenttämäärittelyt suoraan schema.prisma sekä mobile/src/domain/*/model.ts -tiedostoista tarkennuksia varten.