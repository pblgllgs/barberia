# Barba Negra · Barbershop

Web de una barbería con **reserva de horas en línea** y **panel de administración**. Diseño dark premium (carbón + latón dorado).

- **Stack:** React 19 + Vite + TypeScript, Tailwind CSS v4, react-router-dom
- **Backend:** Supabase (Postgres, Auth, RLS)
- **Despliegue:** Cloudflare Pages (free tier, builds ilimitados)

## Enlace en vivo

- **Producción:** https://barberia-1ya.pages.dev

## Acceso

- **Reservas públicas:** `/reservar`
- **Mis reservas:** `/mis-reservas` (por código o teléfono)
- **Panel admin:** `/admin` → `admin@barbanegra.cl` / `admin123` (botón "Admin" en el footer)

## Requisitos

- Node.js 22+ y npm
- Cuenta en [Cloudflare](https://dash.cloudflare.com) y en [Supabase](https://supabase.com)

## Desarrollo local

```bash
npm install
npm run dev
```

La app funciona en **modo demo** sin Supabase (usa `src/lib/seed.ts` + `localStorage`). Para conectar Supabase crea un archivo `.env`:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Deploy (Cloudflare Pages)

El proyecto está publicado en **Cloudflare Pages** (proyecto `barberia`). El deploy se hace **solo manual** desde GitHub Actions:

1. **Actions → Deploy Cloudflare Pages → Run workflow** (rama `master`)
2. O automáticamente con un push a `master`

### Variables de entorno / Secrets (GitHub → Settings → Secrets and variables → Actions)

| Secret | Descripción |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token de Cloudflare con permiso **Account → Cloudflare Pages → Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID de Cloudflare (dash.cloudflare.com) |
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key pública de Supabase |

### Despliegue manual con wrangler (local)

```bash
npx wrangler login          # una vez por máquina
npm run build
npx wrangler pages deploy dist --project-name=barberia
```

El SPA routing se maneja con el archivo `public/_redirects` (incluido en el bundle).

## Supabase (base de datos)

- Esquema y RLS en `supabase/migrations`; datos demo en `supabase/seed.sql`.
- Usuario admin seed: `admin@barbanegra.cl` / `admin123`
- Para aplicar cambios al esquema: `supabase db push` (proyecto linked).

## Comandos

```bash
npm run dev       # dev server
npm run build     # typecheck + build
npm run lint      # oxlint
```

## Diseño

Lee `DESIGN.md` (sistema de diseño Open Design): carbón `#0b0b0d`, acento único Brass `#c9a35f`, serif Playfair para títulos, mono para metadata.
