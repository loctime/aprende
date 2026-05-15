# Arquitectura

Este documento explica cómo está diseñado el sistema, por qué se tomaron las decisiones, y dónde tocar cuando algo necesite cambiar.

## Visión de 30 segundos

Aprende es un **sitio estático** (SSG con Next.js) construido a partir de contenido en `content/courses/`. Los videos vienen embebidos de YouTube — no se rehospedan. El valor agregado son los archivos MDX que viven en el repo, escritos a mano (asistidos por IA) y commiteados como cualquier otro código.

No hay base de datos. No hay backend dinámico. No hay servidor que mantener. Todo el sitio se genera en build time, se sube a la CDN de Vercel, y se sirve como HTML estático con un poquito de JavaScript para tabs y video lazy-load.

---

## Los tres flujos

### 1. Build-time — producción de contenido

Cómo una URL de YouTube se convierte en una lección publicada:

```
[YouTube URL]
    │
    ▼  (scripts/ingest.mjs — pendiente, plan separado)
[yt-dlp + ffmpeg]
    │  baja subtítulos, extrae frames clave
    ▼
[drafts/<id>/]
  ├── transcript.txt
  ├── frames/000.jpg, 001.jpg, ...
  ├── chapters.json
  └── BRIEF.md
    │
    ▼  (Claude en chat lee el brief)
[content/courses/<curso>/<NN-cap>/<NN-leccion>/]
  ├── lesson.json
  ├── resumen.mdx
  ├── ejercicios.mdx
  ├── diagramas.mdx
  └── ejemplos.mdx
    │
    ▼  (review humano + git commit)
[repo en GitHub]
```

**Estado actual:** el pipeline `scripts/ingest.mjs` no existe todavía — en v1 los MDX se escriben directamente. El plan para el pipeline está pendiente.

### 2. Build & deploy

Cada `git push` a `main`:

```
git push origin main
    │
    ▼
[Vercel CI]
    │  next build → genera HTML estático para cada URL
    ▼
[Vercel CDN]
    │  global edge
    ▼
[aprende.app] (cuando esté el dominio)
```

Tiempo típico: 60-90 segundos desde push hasta producción.

### 3. Runtime — qué ve el usuario

```
Usuario abre /cursos/matematicas-i/funciones/que-es-una-funcion
    │
    ▼
[Vercel CDN sirve HTML estático prerendado]
    │
    ▼  (en el browser)
React hidrata:
  ├── YouTubePlayer (poster con play button)
  ├── TabPanel (4 tabs, contenido en client state)
  ├── KaTeX (math renderizado a MathML al cargar HTML)
  └── Mermaid (diagramas se renderizan async on mount)
```

El usuario hace click en el poster → ahí recién se carga el iframe de YouTube. Antes de eso, cero JS de YouTube, cero cookies de terceros.

---

## Tech stack y por qué

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | **Next.js 15** (App Router) | SSG + SSR cuando haga falta. Mejor ecosistema. Vercel-native. |
| Lenguaje | **TypeScript 5 strict** | Tipos sólidos para el árbol de contenido. Catch errores en build, no en runtime. |
| UI | **React 19** | Server Components para páginas, Client Components para interactividad. |
| Estilos | **Tailwind 3** | Productividad alta, paleta consistente, sin runtime CSS-in-JS. |
| Contenido | **MDX** (via `@next/mdx` + `next-mdx-remote`) | Markdown + componentes React. Permite mezclar prosa con UI rica. |
| Math | **KaTeX** (via `rehype-katex` + `remark-math`) | Más rápido que MathJax. Renderiza a MathML, accesible. |
| Diagramas | **Mermaid 11** | Texto → SVG. Cliente-only por design (la lib es browser-oriented). |
| Video | **YouTube iframe** (lazy poster-then-iframe) | Legal, gratis, alta calidad. Lazy carga ahorra cookies + perf inicial. |
| Tests | **Vitest 2** + happy-dom + Testing Library | Rápido, ergonómico, compatible con módulos modernos. |
| Hosting | **Vercel** | Build automático, CDN global, free tier amplio. |
| Storage | **Filesystem** (sin DB en v1) | Cero infra. Versionado en git. Diff y revisión gratis. |

**No usamos:**
- Base de datos (cuando llegue el momento del paywall + tracking, Postgres en Neon/Supabase).
- CMS headless (Sanity/Contentful) — git como CMS funciona bien para 10-100 lecciones.
- Algolia para search — Pagefind cuando el catálogo crezca a 50+ lecciones.
- next/image para los thumbs de YouTube — se usa `<img>` plano por simplicidad (los thumbs YouTube ya están en CDN).

---

## El módulo de contenido

`lib/content.ts` es el scanner. Es **pura función**: lee `content/courses/` del filesystem y devuelve un árbol tipado. Sin efectos secundarios. Sin caché interno. Llamado en build time por `generateStaticParams()` y por las páginas para SSG.

### API

```ts
getAllCourses(): Course[]
getCourse(slug: string): Course | null
getLesson(courseSlug, chapterSlug, lessonSlug): LessonContent | null
```

`LessonContent` incluye:
- `meta` — los datos del `lesson.json`
- `course`, `chapter` — metadata de los niveles superiores (para breadcrumbs)
- `tabs` — los 4 strings raw de MDX (`resumen`, `ejercicios`, `diagramas`, `ejemplos`)
- `navigation` — `prev` y `next` lecciones (cruza fronteras de capítulo)

Ver `lib/types.ts` para los tipos completos.

### Convenciones del filesystem

- Cada directorio de curso/capítulo/lección tiene un prefijo numérico `NN-` que determina el orden.
- El slug expuesto es el nombre sin el prefijo (`01-funciones` → slug `funciones`).
- Directorios con nombre que empieza con `_` o `.` se ignoran a nivel scanner para algunos consumidores pero NO se filtran globalmente — el filtrado para producción se hace en cada página (`generateStaticParams` filtra `_`-prefixed). Esto permite mantener `_test-fixture/` en el repo para los tests sin que aparezca en producción.

### Robustez

El scanner es defensivo:
- Directorio sin JSON requerido → se ignora (no crashea).
- JSON malformado → loud failure (build falla). Decisión: para un build-time scanner, silencio es peor que crash.
- Nombre de directorio sin prefijo `NN-` → se ignora.
- Prefijo de cualquier longitud (`1-`, `01-`, `001-`) → soportado (lookup por slug, no reconstrucción).

---

## Componentes UI

### Página de lección — la pieza central

`app/cursos/[curso]/[capitulo]/[leccion]/page.tsx` arma:

```
┌─ Breadcrumb: Cursos / Curso / Capítulo
├─ Título de la lección
├─┬─────────────────┬─────────────────┐
│ │                 │                 │
│ │  YouTubePlayer  │   TabPanel      │
│ │   (60% width)   │   (40% width)   │
│ │                 │   - Resumen     │
│ │                 │   - Ejercicios  │
│ │                 │   - Diagramas   │
│ │                 │   - Ejemplos    │
│ │  Atribución     │                 │
│ └─────────────────┴─────────────────┘
├─ LessonNav (prev | next)
```

En mobile (`< lg`) el grid se apila vertical.

### `<YouTubePlayer>` — lazy poster-then-iframe

Patrón: por defecto renderiza un `<button>` con el poster (thumbnail HD) y un play button. El iframe de YouTube **no se carga** hasta que el usuario hace click. Beneficios:
- Page load mucho más rápido (no se descarga el player JS de YouTube).
- Sin cookies de terceros hasta interacción explícita.
- Mejor Lighthouse Performance score.

Acepta `startSec` y `endSec` opcionales — permite que una "lección" sea un chunk de un video más largo (YouTube embed soporta `?start=X&end=Y` nativamente).

### `<TabPanel>`

Tabs accesibles (ARIA `role="tablist"`, `role="tab"`, `aria-selected`). Estado client-side simple. Solo renderiza el tab activo (los demás se desmontan).

### `<CompiledMDX>`

Wrapper sobre `MDXRemote` de `next-mdx-remote/rsc`. Compila MDX en build time (al ser Server Component) con remark-math + rehype-katex configurados. Si el source es vacío, muestra un placeholder italic.

### Componentes MDX custom

Vistos en `components/mdx/`. Ver [docs/authoring.md](authoring.md) para uso. Se inyectan globalmente via `mdx-components.tsx` (convención de Next.js).

---

## Decisiones y trade-offs

### Por qué filesystem-driven y no CMS

- **Pro:** cero infra, versionado en git, diff de cambios, revisión en PRs, gratis.
- **Pro:** el contenido es código — refactor masivo es factible.
- **Contra:** no editorial UI — colaboradores no técnicos no pueden contribuir directamente. Mitigación a futuro: agregar un admin panel que escriba al filesystem, o migrar a un CMS cuando el catálogo lo justifique.

### Por qué SSG en lugar de SSR

- El contenido cambia con cada `git push`, no en tiempo real. SSG es lo correcto.
- Páginas estáticas escalán infinitamente sin costo de servidor.
- SEO perfecto out-of-the-box.
- Cuando agreguemos auth/progreso, esas porciones serán SSR/Client; el contenido sigue SSG.

### Por qué `next-mdx-remote` para el contenido y no MDX-as-pages

`@next/mdx` te permite tener archivos `.mdx` directamente en `app/` como páginas. **No funciona** para contenido fuera de `app/` (como `content/`). Como queremos el contenido como datos (escaneable, listable, filtrable), usamos `next-mdx-remote/rsc` que compila MDX a partir de strings en build time.

### Por qué Mermaid client-side y no server-side

Mermaid es una librería browser-oriented (necesita DOM). Renderizar en servidor requiere puppeteer o similar — costoso en build. Como alternativa, hay `@beoe/rehype-mermaid` que sí lo hace, pero para v1 priorizamos simplicidad. El brief flash al renderizar es aceptable. Se puede cambiar después.

### Por qué dark theme por defecto

Decisión estética + práctica: contenido técnico/matemático se lee mejor con fondo oscuro en sesiones largas. El sistema usa `color-scheme: dark` en `:root` y paleta custom en Tailwind. Si se necesita modo claro, hay que extender el theme — no es trivial pero tampoco difícil.

---

## Qué NO está construido todavía (post-v1)

- **Pipeline de ingesta** (`scripts/ingest.mjs`) — automatización para nuevas lecciones.
- **Auth** — NextAuth cuando llegue el paywall.
- **Pagos** — Stripe + paywall por lección (flag `freeTier` ya existe).
- **DB de usuarios y progreso** — Neon/Supabase Postgres.
- **Búsqueda** — Pagefind cuando crezca el catálogo.
- **Admin panel** — para editar contenido sin tocar git.
- **Otras verticales** — programación, cocina, etc. (la arquitectura ya soporta — sumar carpetas).
- **Auto-chunking de videos largos** — para v1 hay que cortar manualmente con `startSec`/`endSec`.

Cada uno tiene un lugar previsto en el diseño actual. Ninguno requiere reescribir el core.
