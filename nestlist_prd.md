# NestList – Produktkravsdokument (PRD)

## 1. Produktoversigt

NestList er en privat, webbaseret applikation, udviklet specifikt til at organisere opgaver, indkøbslister og daglige gøremål for en eller flere familier. Systemet skal understøtte både delte og private opgaver/lister, med særlige funktioner til voksne/børn samt en intelligent indkøbsliste med automatisk kategorisering.

Appen skal være **simpel, minimalistisk, flot designet** og fungere optimalt på **mobil** (primær platform) samt desktop. Den skal fungere som en **PWA** med offline support, real-time opdateringer og uendelig login-session.

## 2. Målgruppe

- Primært: Medlemmer af én eller flere familier, der ønsker en fælles platform til opgavestyring.
- Sekundært: Små grupper, der har brug for opgavestyring med roller og delte/private lister.

## 3. Forretningsmål

- Give familier et enkelt værktøj til koordinering af opgaver og indkøb.
- Minimere friktion i dagligdagen ved at tilbyde hurtig oprettelse, deling og opdatering af opgaver.
- Skabe en platform, der er så brugervenlig, at hele familien – inkl. børn – kan bruge den.

## 4. Funktionelle krav

### 4.1 Brugerstyring og roller
- Admin kan oprette nye familier.
- Admin kan oprette brugere inden for en familie.
- Brugere har roller: **Admin**, **Voksen**, **Barn**.
- Roller styrer adgang til visse lister (fx voksenlister).
- Login via **NextAuth.js** med e-mail/kodeord.
- "Husk mig" = uendelig session (persistent login), indtil manuel log ud.

### 4.2 Lister og mapper
- **Lister** kan være:
  - Private (kun ejeren ser dem)
  - Familie (alle i familien ser dem)
  - Voksen (kun voksne i familien ser dem)
- **Mapper** kan også være private, familie eller voksen.
- Mapper bruges til at organisere lister.

### 4.3 Opgaver
- Felter:
  - Titel (obligatorisk)
  - Beskrivelse
  - Deadline
  - Gentagelse (dagligt, ugentligt, månedligt, custom)
  - Underopgaver
  - Tags
  - Tildelt person
- Muligheder:
  - Sortering og filtrering (efter deadline, status, tags, ansvarlig)
  - Farvekoder på lister/mapper
  - Arkivering af opgaver/lister
  - Drag-and-drop sortering
  - Hurtig oprettelse af opgaver (global “quick add”)

### 4.4 Indkøbsliste
- En dedikeret liste-type til indkøb.
- Auto-complete på fødevarer og husholdningsvarer.
- Automatisk kategorisering (grupperer varer efter kategori).
- Mulighed for at markere varer som købt uden at slette dem.

### 4.5 Real-time og offline
- Ændringer vises i realtid for alle relevante brugere.
- Offline mode med automatisk sync, når internet er tilbage.
- Push-notifikationer ved deadlines eller ændringer.

### 4.6 Kalender
- Viser opgaver med deadlines i uge- eller månedsvisning.

### 4.7 Søgning
- Global søgning på tværs af lister/opgaver (full-text search).

### 4.8 Historik
- Aktivitetshistorik: hvem ændrede hvad og hvornår.

### 4.9 Brugerprofiler
- Profilbillede (avatar upload via custom API endpoint).

### 4.10 Datahåndtering
- Eksport/backup af data til JSON eller CSV.

## 5. Ikke-funktionelle krav
- Skal fungere som **PWA**.
- Skal være **responsive** og mobiloptimeret.
- Minimalistisk UI med **shadcn/ui**.
- Deployment via **Dokploy**.
- Docker-baseret opsætning.
- **PostgreSQL** database med **Prisma ORM**.
- **Application-level** access control for datasikkerhed.
- JWT tokens via NextAuth.js styrer adgang til data.

## 6. Teknisk arkitektur

**Frontend:**
- Next.js 15.4.6 (TypeScript) med App Router
- shadcn/ui komponenter
- NextAuth.js integration
- Socket.io client for real-time
- Serwist for PWA funktionalitet

**Backend:**
- PostgreSQL database
- Prisma ORM for database access
- Next.js API routes
- Socket.io for real-time kommunikation
- Application-level access control
- JWT håndtering via NextAuth.js

**Hosting & Deploy:**
- Docker-compose til lokal udvikling
- Dokploy til produktion

## 7. User Stories

| # | User Story | Acceptkriterier | Tekniske noter |
|---|------------|----------------|----------------|
| 1 | Som admin vil jeg kunne oprette en ny familie, så vi kan have separate data. | Kan oprette/slette familier. Unik data pr. familie. | `families` tabel, relation til `users.family_id`. |
| 2 | Som admin vil jeg kunne tildele roller (Admin, Voksen, Barn) til brugere. | Roller vises i UI og styrer adgang. | `app_users.role`. Access control via middleware. |
| 3 | Som bruger vil jeg kunne logge ind og blive husket uendeligt. | Login via NextAuth.js, persistent session. | JWT tokens med NextAuth.js session management. |
| 4 | Som bruger vil jeg kunne oprette private lister. | Kun ejer ser listen. | `lists.visibility='private'`. |
| 5 | Som bruger vil jeg kunne oprette familie-lister. | Alle i familien ser listen. | `lists.visibility='family'`. |
| 6 | Som voksen vil jeg kunne oprette voksenlister. | Kun voksne i familien ser listen. | `lists.visibility='adults'`. |
| 7 | Som bruger vil jeg kunne oprette mapper. | Mapper kan være private/familie/voksen. | `folders` tabel. |
| 8 | Som bruger vil jeg kunne oprette opgaver med alle felter. | Felter kan udfyldes/redigeres. | `tasks`, `subtasks`, `tags`. |
| 9 | Som bruger vil jeg kunne sortere/filtrere opgaver. | UI med sorterings-/filtermuligheder. | SQL queries med indeksering. |
| 10 | Som familie vil vi kunne bruge en delt indkøbsliste med kategorisering. | Varer grupperes automatisk. | `shopping_items` tabel med kategori. |
| 11 | Som bruger vil jeg kunne markere varer som købt. | Købte varer flyttes til separat sektion. | `is_purchased` flag. |
| 12 | Som bruger vil jeg kunne se ændringer i realtid. | Ændringer opdateres automatisk. | Socket.io real-time kommunikation. |
| 13 | Som bruger vil jeg kunne bruge appen offline. | Opgaver synces ved online igen. | IndexedDB + Service Worker. |
| 14 | Som bruger vil jeg kunne modtage push-notifikationer. | Notifikationer ved deadlines/opdateringer. | Web Push API. |
| 15 | Som bruger vil jeg kunne se deadlines i en kalender. | Kalender viser opgaver. | UI-komponent + DB fetch. |
| 16 | Som bruger vil jeg kunne skifte tema. | Tema huskes. | shadcn/ui theme toggle. |
| 17 | Som bruger vil jeg kunne drag-and-drop sortere. | Ændringer gemmes. | react-beautiful-dnd. |
| 18 | Som bruger vil jeg kunne tilføje opgaver hurtigt. | Quick-add modal fungerer overalt. | Global state + API. |
| 19 | Som bruger vil jeg kunne søge på tværs af alt. | Resultater linker til opgave. | Postgres full-text search. |
| 20 | Som bruger vil jeg kunne have et profilbillede. | Avatar vises i UI. | Custom avatar upload API endpoint. |
| 21 | Som bruger vil jeg kunne se historik. | Activity log viser ændringer. | `activity_logs` tabel. |
| 22 | Som bruger vil jeg kunne arkivere opgaver/lister. | Kan gendannes. | `is_archived` flag. |
| 23 | Som bruger vil jeg kunne farvekode mapper/lister. | Farve vises i UI. | Farvekode-felt i DB. |
| 24 | Som bruger vil jeg kunne oprette gentagne opgaver. | Understøtter undtagelser. | Gentagelsesregler i DB. |
| 25 | Som bruger vil jeg kunne tage backup af mine data. | Eksporter til JSON/CSV. | Eksport-endpoint. |

## 8. Sikkerhed
- Alle API-kald autentificeres med NextAuth.js JWT tokens.
- Application-level access control sikrer, at brugere kun får adgang til data i deres egen familie og rolle.
- Adgang til voksenlister begrænses til `role='adult'` eller `role='admin'` via middleware checks.

## 9. Deploymentproces
- Lokal udvikling med Docker-compose.
- Commit/push til main → CI/CD via Dokploy.
- Prod-miljø med separate `.env` værdier.

## 10. Fremtidige muligheder
- Integration med kalenderapps (Google, iCal).
- Tale-til-tekst opgaveoprettelse.
- Notifikationer via SMS.

