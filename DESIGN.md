# Design System — Barba Negra Barbershop

> Brand: Barba Negra · Barbershop masculina premium.
> Direction: **Dark Premium** — carbón profundo, latón dorado, editorial sobrio.
> Works with Open Design + coding agents (opencode). Keep this file in the repo so every generation renders on-brand.

## 1. Visual Theme & Atmosphere

Barbería de barrio premium: oscuro, masculino, táctil. Referencias: speakeasy, club privado, brut social loafers. Fondo carbón casi negro, superficies negras escalonadas separadas por hairline 1px, y un único acento dorado latón usado con disciplina. Tipografía display serif para títulos con alma editorial; sans para lectura; mono para toda metadata (labels, precios, horas). Nada de blanco puro, nada de acentos de colores chillones, sombras suaves solo en tarjetas sobre fondo negro.

**Key Characteristics:**
- Fondo **Carbón** con superficies negras en escalera (0, 1, 2) separadas por hairlines de 1px
- Un solo acento dorado (**Brass `#c9a35f`**), máximo 2 momentos por viewport, usado además en hover de estados
- Títulos **Playfair Display** serif; body Manrope; **mono uppercase** solo para kickers/labels/metadata
- Imágenes en blanco y negro o con tratamiento sepia sutil; recortadas sin esquinas raras
- Sin fondos de color de página completa (blue/red/violet), sin gradientes de marca
- Layout: max-width 1200px, secciones con padding generoso y hairlines horizontales

## 2. Color Palette & Roles

### Primario / Acento
- **Brass** (`#c9a35f`): único acento della marca. CTAs primarios, detalles de nav, números de paso, hover de links, highlight de texto en títulos.
- Hover del acento: usar **Champagne** (`#e0c48a`).
- Texto sobre acento: **Negro** (`#0b0b0d`).

### Superficie & Fondo
- **Carbón** (`#0b0b0d`): fondo de página.
- **Coal** (`#141416`): paneles, cards, bandas alternas, formularios.
- **Smoke** (`#1d1d21`): tarjetas elevadas, inputs sobre coal, rows alternas.
- **Line** (`#26262c`): todos los bordes de 1px (hairline). En hover de elementos interactivos → `#3a3a42`.

### Neutros & Texto
- **Ivory** (`#f2ede4`): texto principal, títulos.
- **Ash** (`#8a8579`): texto secundario, metadata, kickers.
- **Faint** (`#4c4c52`): disabled, placeholders, divisores terciarios.

### Semánticos
- **Success** (`#4caf7d`): confirmaciones, badge "confirmada".
- **Warning** (`#d9a441`): badge "pendiente".
- **Error** (`#d85656`): validación de formularios, badge "cancelada".
- **Info** (`#6f9ceb`): enlaces legales e información.

## 3. Typography Rules

### Familias
- **Display — serif:** `'Playfair Display', Georgia, 'Times New Roman', serif`. Pesos 400–500, cursiva solo para énfasis en títulos.
- **Body — sans:** `'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`. Pesos 400–600.
- **Mono — metadata:** `ui-monospace, 'SF Mono', 'Cascadia Mono', Consolas, monospace`. SÓLO kickers, labels, precios, horas, teléfonos, números de paso.

### Jerarquía

| Rol | Tamaño | Peso | Notas |
|-----|--------|------|-------|
| Hero Display | `clamp(2.6rem, 5.4vw, 4.6rem)` | 400 | Serif, `1.06`, tracking `-0.01em` |
| Sección | `clamp(1.9rem, 3.6vw, 3rem)` | 400 | Serif, `1.12`, tracking `-0.005em` |
| Card/Nombre | `20px` | 400 | Serif, `1.2` |
| Body | `16px` | 400 | `1.65`, color Ash para texto secundario |
| Intro | `clamp(1rem, 1.3vw, 1.12rem)` | 400 | Muted (Ash) |
| Kicker | `11px` mono | 500 | Uppercase, tracking `0.22em`, precedido por línea de 36px |
| Label mono | `11px` mono | 500 | Uppercase, tracking `0.16em` |
| Meta mono | `12.5px` mono | 500 | Horas, precios, duraciones |

### Principios
- Serif = títulos e identidad; sans = lectura; mono = metadata. Nunca mono en párrafos.
- Énfasis en títulos con *itálica serif* en color Brass (p. ej. "Cortes con *carácter*").
- Uppercase solo en mono (kickers/labels) y logotipo.
- Leading generoso (1.55–1.65) para lectura.

## 4. Component Stylings

### Botones
- **Primario (Brass):** bg `#c9a35f`, texto `#0b0b0d`, `padding 14px 28px`, **radius 6px**, `14px` sans 600. Hover: bg `#e0c48a`. Disabled: opacity .45.
- **Outline:** transparente, borde 1px `#3a3a42`, texto Ivory. Hover: borde Brass, texto Brass.
- **Ghost:** transparente, texto Ash, hover texto Ivory. Sin borde.
- **Agregar/CRUD (mono):** `12px` mono uppercase tracking `0.12em`, borde 1px Line, texto Brass. Hover: borde Brass.
- Links inline: color Brass, underline offset 3px; hover → Champagne.

### Nav
- Sticky, bg Carbón/90 con blur, hairline inferior `Line`, altura 72px.
- Logo "Barba Negra" en serif 20px con "N" dorado (logomark "BN" SVG).
- Links sans 13px Ash; activo → Ivory con underline Brass 1px.
- CTA "Reservar hora" — botón primario pequeño (padding 10px 18px) o mono uppercase con borde.

### Cards
- **Servicio / Barbero:** bg Coal, borde 1px Line, **radius 6px**, padding 20px, hover → borde y texto acentúan sin elevación.
- Imágenes: `aspect 4/5` para barberos, `aspect 16/10` para servicios, filter `grayscale(100%) contrast(1.05)`; hover → `grayscale(0%)` (transición).

### Formularios
- Inputs/selects: bg Smoke, borde 1px Line, **radius 6px**, padding 12px 14px, focus → borde Brass con ring sutil `box-shadow 0 0 0 3px rgba(201,163,95,.15)`.
- Labels: mono 11px uppercase tracking `0.16em`, color Ash.
- Slots de hora: botones cuadrados mono 13px, bg Smoke borde Line; disabled/ocupado → opacity .35 cursor not-allowed; seleccionado → bg Brass texto Carbón.
- Radio-card (servicio/barbero): como card selectable, con borde Brass al seleccionar y "check" mono "✓".
- Estado éxito: panel Coal con hairline, icono cuadrado Brass, título serif, resumen en filas con hairline, código de reserva mono.

### Tablas / Admin
- Header de tabla: mono 11px uppercase Ash con hairline inferior.
- Filas: hairline inferior `Line`; hover de fila → bg Smoke.
- Badges de estado: mono 10.5px uppercase pill, fondo del color semántico al 14% y texto del color (sin borde).

## 5. Layout Principles

- **Max width:** 1200px, container `width: min(100% - clamp(28px, 5vw, 64px), 1200px)`.
- **Secciones:** padding `clamp(60px, 8vw, 104px)`. Alternar Carbón ↔ Coal mediante hairline `border-top`, no via color.
- **Base de separación:** hairline 1px `Line`. Acento Brass solo para CTA y detalles, jamás como color de fondo de sección.
- **Whitespace generoso:** kicker (con línea 36px) → título serif → intro Ash → contenido.
- **Hero:** título serif grande con palabra en italica Brass, subtítulo Ash, CTA Brass + link ghost "Ver servicios". Fondo Carbón con textura sutil (radial gradient muy sutil vertical) e imagen lateral con máscara.

## 6. Depth & Elevation

- **Ninguna sombra dramática.** La jerarquía se logra con superficies en escalera, hairlines y tipografía.
- Elevación sutil (sombra `0 8px 24px rgba(0,0,0,.35)`) solo en dropdowns, modales y el slider de slots.
- Hover: cambio de borde/color (a Brass), nunca translate y shadow simultáneos, nunca escalar tarjetas.

## 7. Do's and Don'ts

### Do
- Usa el acento Brass con moderación (máx. 2 momentos por viewport).
- Serif solo títulos; mono solo metadata; sans el resto.
- Fotos con `grayscale` por defecto; color solo en hover.
- Hairlines de 1px para toda separación.

### Don't
- No uses blanco puro (`#ffffff`); usar Ivory para texto.
- No uses fondos de color de página completa ni gradientes de marca (solo textura sutil en hero).
- No radios grandes: solo `6px` en cards/botones. Nada de píldoras salvo badges de estado.
- No más de un acento. Hover del acento siempre Champagne.
- No párrafos en mono. No mayúsculas en sans/serif (salvo logo).

## 8. Responsive Behavior

| Width | Cambios |
|-------|---------|
| ≥1024px | Hero 2 col (texto + imagen), grid servicios 3 cols, barberos 4 cols, wizard en 3 pasos horizontales |
| 640–1023px | Grids 2 cols, wizard apilado con steps en línea, nav colapsa a hamburguesa |
| <640px | 1 columna, hamburguesa mono, touch targets ≥44px, slots de hora en grid 4 cols |

## 9. Agent Prompt Guide

### Quick Color Reference
- Acento/CTA: "Brass (#c9a35f)" · Fondo: "Carbón (#0b0b0d)" · Superficie: "Coal (#141416)" · Elevado: "Smoke (#1d1d21)" · Borde: "Line (#26262c)" · Texto: "Ivory (#f2ede4)" · Secundario: "Ash (#8a8579)" · Success: "#4caf7d" · Error: "#d85656"

### Ejemplos
- "Botón primario: bg Brass #c9a35f, texto #0b0b0d, radius 6px, padding 14px 28px; hover bg #e0c48a."
- "Kicker mono uppercase 11px tracking .22em con línea de 36px antes del título serif Playfair."
- "Card de servicio: bg Coal, borde 1px Line, imagen 16/10 en grayscale, título serif 20px, meta mono con duración y precio."
- "Hero: título serif Playfair clamp(2.6rem,5.4vw,4.6rem) con <em> en cursiva y color Brass, subtítulo Ash, CTA Brass."
- "Badge de estado: mono 10.5px uppercase pill, fondo del color semántico 14% alpha, texto color semántico."