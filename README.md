
# FamTodo – Self-hosted (Docker + Dokploy) + Next.js + BetterAuth + Supabase Core

**Hvad du får her:**
- Docker-compose til Postgres, PostgREST (RLS), Realtime, Storage og web
- SQL init (enums, tabeller, funktioner, triggers, RLS policies)
- Next.js 14 skeleton (klar til at koble BetterAuth på)
- JWT-baseret RLS uden GoTrue (BetterAuth mints JWT med `app_user_id`, `family_id`, `role_name`)

## Kom i gang (lokalt)
1) Kopiér `.env.example` til `.env` i repo-roden og justér secrets.
2) Kør:
```bash
docker compose up -d --build
```
3) Åbn web på http://localhost:3000

## BetterAuth integration (skitse)
- BetterAuth skal udstede JWT med `aud=postgrest`, `iss=famtodo`, og claims:
```json
{
  "app_user_id": "<uuid fra app_users>",
  "family_id": "<uuid fra families>",
  "role_name": "admin|adult|child"
}
```
- JWT signeres med samme `JWT_SECRET` som PostgREST/Realtime.
- Klienten sender `Authorization: Bearer <token>` til PostgREST og bruger samme token i Realtime-connection.

## Realtime
- Realtime er sat op til publication `supabase_realtime` (oprettes i `02_functions.sql`).
- Husk `wal_level=logical` er enabled i containeren (default i supabase/postgres image).

## Storage
- Kører med storage-api. Brug `Authorization: Bearer <JWT>` for at respektere policies.
- Til avatars mm.

## Database
- SQL kører automatisk ved første start (mapper: `supabase/init`).

## Næste skridt
- Implementér BetterAuth i `apps/web` (API routes) og mints JWT med claims jf. ovenfor.
- Byg UI med shadcn/ui.
- Tilføj eventuel seeds til `shopping_dictionary`.
