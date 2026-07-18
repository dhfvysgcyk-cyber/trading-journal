# Trading Journal

Persönliches Trading Journal (Live + Propfirm) als installierbare PWA. Vite + React + TypeScript, Backend ausschließlich Supabase (Auth + Postgres + Row Level Security).

## Setup

```bash
npm install
cp .env.example .env.local   # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY eintragen
npm run dev
```

## Neue Nutzer anlegen

Kein Self-Signup. Neue Personen werden manuell im Supabase-Dashboard angelegt:
Authentication → Add user → E-Mail/Passwort setzen, "Auto Confirm User" aktivieren.
Jede Person sieht danach automatisch nur ihre eigenen Trades (Row Level Security).

## Deployment

Push nach `main` löst automatisch den Build + Deploy nach GitHub Pages aus (`.github/workflows/deploy.yml`).
Benötigte Repo-Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
Repo-Einstellung: Settings → Pages → Source = "GitHub Actions".

## Datenbank-Migrationen

SQL-Migrationen liegen in `supabase/migrations/`, bereits auf dem Supabase-Projekt angewendet.
