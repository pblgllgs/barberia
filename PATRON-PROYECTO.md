# Patrón de Proyectos — stack web del usuario

> Documento de referencia para agentes de IA (opencode, Claude Code, Codex, etc.).
> Cuando lo pases o digas "**usa el patrón del stack**" (o "el patrón de barbería/centro-estético"),
> replica exactamente esta arquitectura. Es el estándar usado en los proyectos de
> `E:\frontend` (referencias: `barberia`, `centro-estetico`, `automotora`).

---

## 1. Resumen en una línea

**Vite + React + TypeScript + Tailwind v4** como frontend, **Supabase** (Postgres + Auth + RLS) como backend,
**Cloudflare Pages** para el deploy del sitio, **Cloudflare Workers + R2** para subir/almacenar imágenes,
y un **sistema de marca en `DESIGN.md`** que alimenta la generación de UI vía Open Design (agente-native).

Reglas fijas:
- La app funciona en **modo demo** (sin credenciales) usando `seed.ts` + `localStorage`, y conmuta
  automáticamente a Supabase cuando existen `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` en `.env`.
- Idioma de la UI: **Español (Chile)**.
- **Sin comentarios en el código** salvo que se pidan explícitamente.
- Alias de importación `@/` → `src/`.
- Convención de placeholders en este documento: `<proyecto>`, `<dominio>`, `<entidad>`
  (p. ej. `automotora` + `vehiculos`), `<cuenta>` (subdominio de workers.dev del usuario).

---

## 2. Stack y versiones (probadas)

```jsonc
// dependencies
"@supabase/supabase-js": "^2.112.2",
"lucide-react": "^1.31.0",
"react": "^19.2.8",
"react-dom": "^19.2.8",
"react-router-dom": "^7.18.2"

// devDependencies
"@cloudflare/workers-types": "^5.20260804.1",
"@tailwindcss/vite": "^4.3.3",
"@types/node": "^26.2.0",
"@types/react": "^19.2.18",
"@types/react-dom": "^19.2.4",
"@vitejs/plugin-react": "^6.0.5",
"oxlint": "^1.78.0",
"tailwindcss": "^4.3.3",
"typescript": "^7.0.2",
"vite": "^8.2.1",
"wrangler": "^4.120.1"
```

Scripts estándar (`package.json`):

```jsonc
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "oxlint .",
  "preview": "vite preview",
  "db:start": "supabase start",
  "db:reset": "supabase db reset",
  "db:push": "supabase db push",
  "worker:deploy": "npm --prefix workers/images run deploy"
}
```

Nota TS7: `baseUrl` fue eliminado. Usar `"paths": { "@/*": ["./src/*"] }` **sin** `baseUrl`.

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const here = import.meta.dirname

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(here, 'src') } },
  server: { port: 5173 },
})
```

---

## 3. Estructura de carpetas

```
├── DESIGN.md                 # Sistema de marca (Open Design, agent-readable)
├── AGENTS.md                 # Instrucciones para agentes (proyecto, comandos, diseño)
├── .env.example              # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_IMAGE_UPLOAD_URL
├── .github/workflows/deploy-cloudflare.yml
├── open-design-output/       # Prototipos HTML de referencia (home, catálogo, admin)
├── public/
│   ├── _redirects            # /*    /index.html   200   (SPA routing)
│   └── favicon.svg
├── supabase/
│   ├── config.toml           # proyecto local (cli)
│   ├── .env.local            # password postgres (solo CLI, no versionar)
│   ├── migrations/           # 00001_init.sql, 00002_*.sql ...
│   └── seed.sql              # datos demo + usuario admin
├── workers/images/           # Worker Cloudflare para R2
│   ├── package.json          # { "scripts": { "deploy": "wrangler deploy" } }
│   ├── wrangler.toml         # binding [[r2_buckets]] + vars SUPABASE
│   └── src/index.ts
└── src/
    ├── main.tsx              # BrowserRouter > AuthProvider > ToastProvider > App
    ├── App.tsx               # rutas (SiteLayout público + AdminLayout protegido)
    ├── index.css             # tokens @theme (colores, fuentes) + componentes
    ├── lib/
    │   ├── supabase.ts       # createClient + isSupabaseConfigured()
    │   ├── config.ts         # IMAGE_UPLOAD_URL (env + fallback)
    │   ├── auth.tsx          # AuthProvider / useAuth (signIn, signUp, signOut)
    │   ├── types.ts          # interfaces de la BD
    │   ├── api.ts            # capa de datos (demo | supabase)
    │   ├── seed.ts           # datos demo
    │   ├── utils.ts          # formatos (CLP, fechas, labels), badgeClassFor
    │   └── usePagination.ts
    ├── components/
    │   ├── ui/               # Button, Badge, Field, ImageUpload, GalleryUpload, Modal, Toast, Feedback, Pagination
    │   ├── layout/           # SiteLayout, Navbar, Footer, AdminLayout
    │   └── site/             # VehicleCard/<EntityCard>, Kicker, PageHeader
    └── pages/
        ├── Home.tsx
        └── admin/            # Login, Dashboard, <Entidad> (CRUD)
```

---

## 4. `DESIGN.md` — sistema de marca (Open Design)

- Formato: encabezado `# Design System — <Marca>` + bloques `##` con la dirección visual,
  paleta con roles, tipografía con jerarquía tabular, componentes, layout, elevación,
  do's/don'ts, responsive y una guía rápida de prompts para el agente.
- Debe quedar **en el repo** para que toda generación renderice on-brand.

Estructura de un `DESIGN.md`:

```
# Design System — Marca
> Brand / Direction / Works with Open Design + coding agents.

## 1. Visual Theme & Atmosphere
## 2. Color Palette & Roles     (acento, superficie/fondo, neutros, semánticos)
## 3. Typography Rules          (familias display/body/mono + tabla de jerarquía)
## 4. Component Stylings        (botones, nav, cards, formularios, tablas/admin)
## 5. Layout Principles         (max-width, secciones, hairlines)
## 6. Depth & Elevation
## 7. Do's and Don'ts
## 8. Responsive Behavior
## 9. Agent Prompt Guide        (quick color reference + ejemplos de prompt)
```

Reglas de tipografía invariables: **display = títulos, sans = lectura, mono = metadata
(kickers, precios, horas, specs)**. Nunca mono en párrafos. Uppercase solo en mono y logo.
Un **único acento** usado con moderación.

---

## 5. `open-design-output/` — flujo Open Design

1. El agente lee `DESIGN.md` + `AGENTS.md`.
2. Genera prototipos **HTML autocontenidos** (CSS en `<style>` con tokens `:root`) en
   `open-design-output/` (p. ej. `home.html`, `catalogo.html`, `admin.html`).
3. Esa UI se **porta a React + Tailwind** (tokens en `@theme`), nunca se deja como HTML suelto.
4. La GUI de escritorio "Open Design" la opera el usuario; el agente no hace clic en ella.

---

## 6. Frontend — capa de datos con modo demo

### `src/lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
```

### `src/lib/config.ts`

```ts
export const IMAGE_UPLOAD_URL =
  import.meta.env.VITE_IMAGE_UPLOAD_URL || 'https://<proyecto>-images.<cuenta>.workers.dev'
```

### `src/lib/auth.tsx` (AuthProvider)

- `useEffect`: `supabase.auth.getSession()` + `onAuthStateChange`; si no hay Supabase → `loading=false`.
- `signIn(email, password)` → `signInWithPassword`, devuelve `{ error, user }`.
- `signUp(email, password, fullName)` → `signUp({ email, password, options: { data: { full_name } } })`,
  devuelve `{ error, needsConfirmation: !data.session }`.
- `signOut()`. Exporta `useAuth()`.

### `src/lib/api.ts` — patrón demo | supabase

Cada función: si `!isSupabaseConfigured()` opera sobre `localStorage` (claves `demo_*` con un
`DemoStore`), si no, ejecuta la query en Supabase. Ejemplo genérico:

```ts
const online = () => isSupabaseConfigured()

export async function getItems(): Promise<Item[]> {
  if (!online()) return demo.items.filter((i) => i.is_active)
  const { data, error } = await supabase.from('items').select('*').eq('is_active', true)
  if (error) throw error
  return (data ?? []) as Item[]
}
```

`DemoStore`:

```ts
class DemoStore {
  get items() { return loadLocal<Item[]>(DEMO_KEYS.items, seedItems) }
  set items(v: Item[]) { saveLocal(DEMO_KEYS.items, v) }
  // ... otras entidades
}
```

---

## 7. Supabase — esquema, RLS, RPC

### Migraciones (`supabase/migrations/00001_init.sql`)

Patrón por entidad:

```sql
create table if not exists public.<entidad> (
  id uuid primary key default gen_random_uuid(),
  ...
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- helper: es admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable
as $$ select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'); $$;

alter table public.<entidad> enable row level security;

-- lecturas públicas / escritura admin
create policy "<entidad>_select" on public.<entidad> for select using (is_active = true or public.is_admin());
create policy "<entidad>_write_admin" on public.<entidad> for all using (public.is_admin()) with check (public.is_admin());
```

### `profiles` (rol + auto-creación al registrarse)

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'client' check (role in ('admin', 'employee', 'client')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
```

### RPCs (security definer) para operaciones que cruzan tablas

Siempre `security definer`, `set search_path = public`, y `grant execute ... to authenticated`.

```sql
create or replace function public.<fn>(...)
returns uuid language plpgsql security definer set search_path = public as $$ ... $$;
grant execute on function public.<fn>(...) to authenticated;
```

### `seed.sql` — datos demo + admin

- Inserta `auth.users` + `auth.identities` + `public.profiles` con `crypt('admin123', gen_salt('bf'))`.
- Usuario admin típico: `admin@<dominio>.cl` / `admin123`.
- IDs deterministas `'10000000-0000-0000-0000-0000000000NN'` con `on conflict (id) do nothing`.
- Se aplica localmente con `supabase db reset` (rol postgres, bypass RLS).

### `supabase/config.toml` + `.env.local`

- `config.toml`: configuración del proyecto local (project_id, api, db, seed, auth).
- `.env.local`: `SUPABASE_DB_PASSWORD=...` (no versionar).

---

## 8. Cloudflare Worker + R2 — subida de imágenes

Carpeta `workers/images/` con `wrangler.toml`:

```toml
name = "<proyecto>-images"
main = "src/index.ts"
compatibility_date = "2024-11-01"

[vars]
SUPABASE_URL = "<url>"
SUPABASE_ANON_KEY = "<anon-key>"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "<proyecto>-images"
```

`src/index.ts` (patrón):

- **GET /<key>**: sirve la imagen desde R2 con `Cache-Control: public, max-age=31536000, immutable`
  y `Access-Control-Allow-Origin: *`.
- **POST /upload**: requiere `Authorization: Bearer <JWT supabase>`; valida que el usuario sea **admin**
  consultando `profiles` (`isAdmin()` decodifica el JWT y hace `GET /rest/v1/profiles?select=role&id=eq.<sub>`).
  Acepta multipart `file` (máx 5 MB, imagen), sube a R2 con clave `crypto.randomUUID() + ext`
  y devuelve `{ url: "<origin>/<key>" }`.
- **OPTIONS**: preflight CORS (métodos GET, POST, OPTIONS).

```ts
/// <reference types="@cloudflare/workers-types" />

export interface Env {
  IMAGES: R2Bucket
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handle(request, env)
    } catch (err) {
      console.error(err)
      return new Response(`ERROR: ${(err as Error).stack ?? (err as Error).message}`, { status: 500 })
    }
  },
} satisfies ExportedHandler<Env>
```

Deploy local del worker: `npm run worker:deploy` (o `npx wrangler deploy` dentro de `workers/images`).

### `src/components/ui/ImageUpload.tsx` (cliente)

- Si no hay `IMAGE_UPLOAD_URL` → muestra `<input>` de URL manual (fallback demo).
- Si hay → label dropzone; al elegir archivo valida imagen + ≤5 MB, obtiene el `access_token`
  de Supabase (`supabase.auth.getSession()`), hace `POST <URL>/upload` con `Authorization: Bearer`
  y `FormData('file')`, y llama `onChange(url)`.
- Previsualización + botón "Quitar". `GalleryUpload.tsx` es la versión multi-imagen (array).

---

## 9. Deploy — Cloudflare Pages + GitHub Actions

`public/_redirects` (SPA):

```
/*    /index.html   200
```

`.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy Cloudflare Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_IMAGE_UPLOAD_URL: ${{ secrets.VITE_IMAGE_UPLOAD_URL }}
      - name: Ensure Pages project exists
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler@latest pages project create <proyecto> --production-branch=master || true
      - name: Deploy to Cloudflare Pages
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler@latest pages deploy dist --project-name=<proyecto>
      - name: Deploy images Worker (R2)
        working-directory: workers/images
        continue-on-error: true
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler@latest deploy
```

Secrets del repo: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_IMAGE_UPLOAD_URL`.

### Permisos del token de Cloudflare (CI)

Token custom en dash.cloudflare.com → **My Profile → API Tokens**, en la cuenta del usuario:

| Recurso | Permiso |
|---|---|
| Account → **Workers Scripts** | **Edit** |
| Account → **Workers R2 Storage** | **Edit** |
| Account → **Pages** | **Edit** |
| Account → **Account Settings** | Read (recomendado) |
| User → **User Details** | Read (recomendado) |

Opcional si usas dominio propio: **Workers Routes → Edit** y **Zone → DNS → Edit**.
El OAuth de `wrangler login` ya sirve para operar localmente; el token de CI es aparte.

---

## 10. Estructura de rutas (App.tsx)

```tsx
<Routes>
  <Route element={<SiteLayout />}>
    <Route index element={<Home />} />
    <Route path="..." element={<... />} />
    <Route path="iniciar-sesion" element={<IniciarSesion />} />
    <Route path="registro" element={<Registro />} />
  </Route>
  <Route path="admin/login" element={<Login />} />
  <Route path="admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="..." element={<... />} />
  </Route>
</Routes>
```

`AdminLayout`: sidebar fijo (240px) `lg:grid-cols-[240px_1fr]`, nav con `NavLink` activos en acento,
bloque "Cerrar sesión", header con email; redirige a `/admin/login` si no hay sesión.

---

## 11. `index.css` — tokens Tailwind v4

Los tokens salen del `DESIGN.md` de cada marca. Plantilla:

```css
@import "tailwindcss";

@theme {
  --color-carbon: #0a0a0b;   /* fondo de página */
  --color-coal: #121316;     /* superficies */
  --color-smoke: #1a1c1f;    /* elevado / inputs */
  --color-line: #23262b;     /* hairlines 1px */
  --color-line-strong: #31353c;
  --color-ivory: #f5f1e8;    /* texto principal */
  --color-ash: #8b867b;      /* texto secundario */
  --color-faint: #4a4e55;    /* disabled/placeholders */
  --color-accent: #e8842c;   /* ÚNICO acento */
  --color-accent-strong: #ffa64d;
  --color-success: #4caf7d;
  --color-warning: #d9a441;
  --color-error: #e2534b;
  --color-info: #6f9ceb;

  --font-display: "Oswald", "Arial Narrow", sans-serif;
  --font-sans: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace;
}
```

> Ejemplos reales: automotora = carbón + naranja señal (`--color-accent: #e8842c`);
> Barba Negra = carbón + latón (`--color-brass: #c9a35f`). Adaptar nombres de tokens y valores al `DESIGN.md`.

Helpers de componentes reutilizables: `.kicker` (mono uppercase con línea de 36px), `.label-mono`,
`.meta-mono`, `.container-site` (`width: min(100% - clamp(28px,5vw,64px), 1200px)`), `.hairline-t/b`,
`.card-surface`, `.btn-act` (botón mono para CRUD con hover al acento), `.badge` + tonos (`.badge-success`, etc.).

---

## 12. `AGENTS.md`

Debe contener: descripción del proyecto + stack, comandos (`npm run dev/build/lint`),
la regla de **leer `DESIGN.md`**, el modo demo vs Supabase, deploy (Cloudflare Pages + secrets),
convenciones de código (alias `@/`, sin comentarios, estructura de carpetas) y la integración Open Design.

---

## 13. Conexión real de recursos (supabase + cloudflare)

Con las CLIs autenticadas del usuario (`supabase`, `wrangler`):

### Supabase
```bash
supabase projects create "<proyecto>" --org-id <ORG> --region sa-east-1 --db-password <PW>
supabase link --project-ref <REF>
supabase db push          # aplica migrations
# anon key:
supabase projects api-keys --project-ref <REF> --output json   # type == 'publishable'
```

- Guardar `VITE_SUPABASE_URL=https://<ref>.supabase.co` y la anon key en `.env`.
- Aplicar `seed.sql` al remoto **sin psql**: copiarlo a `supabase/migrations/00002_seed.sql`,
  `supabase db push`, y borrar el archivo temporal (idempotente por `on conflict`).
- Ojo: plan free = máx **2 proyectos activos por org**; hay que pausar/borrar uno o subir de plan.

### Cloudflare
```bash
npx wrangler r2 bucket create "<proyecto>-images"
# en workers/images/wrangler.toml poner SUPABASE_URL y SUPABASE_ANON_KEY reales
npx wrangler deploy        # dentro de workers/images
npx wrangler pages project create "<proyecto>" --production-branch=master
npx wrangler pages deploy dist --project-name="<proyecto>"
```

### Verificación end-to-end
- Login: `POST <url>/auth/v1/token?grant_type=password` con `apikey` → 200 + access_token.
- RLS: `GET <url>/rest/v1/profiles` con Bearer → el admin ve filas; anónimo no.
- Upload R2: `POST <worker>/upload` con `Authorization: Bearer <token>` + `FormData('file')` → `{ url }`;
  `GET <url>` → 200; upload sin token → 401.

---

## 14. Checklist para crear un proyecto nuevo con este patrón

1. [ ] `package.json` + `vite.config.ts` + tsconfigs (alias `@/` sin `baseUrl`, Tailwind v4 plugin, `@cloudflare/workers-types`).
2. [ ] `DESIGN.md` del sistema de marca + `AGENTS.md`.
3. [ ] `open-design-output/` con prototipos HTML (home, catálogo, admin).
4. [ ] `src/index.css` con tokens `@theme` (del DESIGN.md).
5. [ ] Capa `src/lib`: `supabase.ts`, `config.ts`, `auth.tsx`, `types.ts`, `api.ts` (demo|supabase), `seed.ts`, `utils.ts`.
6. [ ] `src/components/ui` + `layout` + `site`.
7. [ ] Páginas públicas + `admin` (CRUD por entidad).
8. [ ] `supabase/migrations/*.sql` + `seed.sql` + `config.toml` + `.env.local`.
9. [ ] `workers/images/` (worker R2) + `ImageUpload.tsx` / `GalleryUpload.tsx`.
10. [ ] `public/_redirects` + `.github/workflows/deploy-cloudflare.yml`.
11. [ ] `.env.example` + README con setup (Supabase, R2, deploy).
12. [ ] Verificación: `npm install && npm run lint && npm run build`.
13. [ ] Conectar real: proyecto Supabase (create/link/push/seed), bucket R2 + worker, Pages project + deploy, `.env`.
