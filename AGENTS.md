# AGENTS.md — Barba Negra Barbershop

Instrucciones para agentes de IA que trabajen en este repositorio.

## Proyecto

Web de una barbería con reserva de horas en línea y panel de administración.
- **Stack:** React 19 + Vite + TypeScript, Tailwind CSS v4, react-router-dom.
- **Backend:** Supabase (Postgres, Auth, RLS). Migraciones en `supabase/migrations`.
- **Idioma de la UI:** Español (Chile).
- **Diseño:** dark premium (carbón + latón dorado). LEE `DESIGN.md`.

## Comandos

- `npm run dev` — dev server (http://localhost:5173).
- `npm run build` — typecheck (`tsc -b`) + build Vite.
- `npm run lint` — oxlint.

## Diseño

**LEE `DESIGN.md` en la raíz y respétalo en toda generación de UI.** Es el sistema de diseño de la marca.

Resumen de reglas no negociables:
- Fondo carbón `#0b0b0d`, superficies `#141416`/`#1d1d21`, bordes hairline `#26262c`.
- Acento único **Brass `#c9a35f`** (máx. 2 momentos por viewport); hover Champagne `#e0c48a`.
- Títulos serif Playfair; body Manrope; mono solo para metadata (kickers, precios, horas).
- Cards y botones radius 6px; badges de estado en píldoras. Nada de blancos puros ni gradientes de marca.

## Demo vs Supabase

La app funciona en **modo demo** sin Supabase (usa `src/lib/seed.ts` + datos en `localStorage`) con tal de poder
desarrollar y previsualizar de inmediato. Cuando existan `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env`,
la capa de datos (`src/lib/api.ts`) conmuta automáticamente a Supabase.

## Deploy (Cloudflare Pages)

- Frontend estático en **Cloudflare Pages** (free tier, builds ilimitados).
- Deploy **solo manual**: GitHub Actions `deploy-cloudflare.yml` (dispara con *Run workflow* en la pestaña Actions).
- Secrets requeridos en el repo: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Local: `npx wrangler pages project create barberia --production-branch=master` (primera vez) y `npx wrangler pages deploy dist --project-name=barberia`.
- SPA routing vía `public/_redirects`.

## Supabase (hosted)

- Proyecto cloud: **barberia** — ref `cvgcaeyzghqnbaecnwtj` (región sa-east-1, free tier).
  Dashboard: https://supabase.com/dashboard/project/cvgcaeyzghqnbaecnwtj
- Credenciales de la web en `.env` (URL + anon key).
- Password de la DB (postgres) en `supabase/.env.local` (solo para operaciones CLI).
- Admin seed: `admin@barbanegra.cl` / `admin123`.
- Migraciones en `supabase/migrations`; datos demo en `supabase/seed.sql`.
- Para aplicar cambios al esquema: `supabase db push` (el proyecto ya está linked).

## Convenciones de código

- Componentes UI en `src/components/ui`; layout en `src/components/layout`; páginas en `src/pages`.
- Datos: acceso via `src/lib/api.ts`, tipos en `src/lib/types.ts`, seed en `src/lib/seed.ts`, helpers en `src/lib/utils.ts`.
- Usar el alias `@/` para importar desde `src`.
- No agregar comentarios al código salvo que se pidan.

## Integración con Open Design

- El sistema de marca vive en `DESIGN.md` (formato Open Design / agent-readable).
- Los prototipos HTML de referencia se guardan en `open-design-output/` (home, reserva, admin).
- La UI React debe portar ese diseño a Tailwind, no quedarse como HTML suelto.

## Base de datos

- Esquema y RLS en `supabase/migrations`; datos demo en `supabase/seed.sql`.
- Usuario admin seed: `admin@barbanegra.cl` / `admin123`.
