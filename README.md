# Aprende

Plataforma web de aprendizaje que combina videos de YouTube con material original premium: resúmenes claros, ejercicios con solución, diagramas y ejemplos trabajados. Cada lección tiene a la izquierda el video, a la derecha cuatro tabs de contenido nuestro.

**Vertical inicial:** Matemáticas. La arquitectura es horizontal — agregar otras materias (programación, cocina, etc.) consiste en sumar carpetas en `content/`, no en construir software nuevo.

---

## Quick start

```bash
git clone https://github.com/loctime/aprende.git
cd aprende
npm install
npm run dev
```

Abrí `http://localhost:3000`. La primera lección de prueba está en `/cursos/matematicas-i/funciones/que-es-una-funcion`.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload (`localhost:3000`) |
| `npm run build` | Build estático de producción → carpeta `.next/` |
| `npm run start` | Sirve el build de producción |
| `npm test` | Corre los tests con Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run typecheck` | Verificación de tipos sin emitir |
| `npm run lint` | ESLint |

---

## Estructura del repo

```
aprende/
├── app/                        # Rutas Next.js (App Router)
│   ├── layout.tsx              # Header + footer compartidos
│   ├── page.tsx                # Landing
│   ├── cursos/page.tsx         # Catálogo de cursos
│   ├── cursos/[curso]/page.tsx
│   ├── cursos/[curso]/[capitulo]/[leccion]/page.tsx
│   ├── sitemap.ts              # /sitemap.xml
│   └── robots.ts               # /robots.txt
├── components/
│   ├── lesson/                 # TabPanel, LessonNav, CompiledMDX
│   ├── mdx/                    # Componentes custom para .mdx
│   │   ├── Ejercicio.tsx
│   │   ├── Solucion.tsx
│   │   ├── Ejemplo.tsx
│   │   ├── Definicion.tsx
│   │   ├── Diagrama.tsx
│   │   └── MDXComponents.tsx   # Mapeo central
│   └── video/YouTubePlayer.tsx
├── content/
│   └── courses/                # 100% del contenido del sitio
│       └── matematicas-i/
│           ├── course.json
│           └── 01-funciones/
│               ├── chapter.json
│               └── 01-que-es-una-funcion/
│                   ├── lesson.json
│                   ├── resumen.mdx
│                   ├── ejercicios.mdx
│                   ├── diagramas.mdx
│                   └── ejemplos.mdx
├── lib/
│   ├── content.ts              # Scanner del filesystem → árbol tipado
│   ├── types.ts                # Tipos del modelo de contenido
│   └── content.test.ts
├── docs/                       # Documentación
│   ├── architecture.md         # Diseño del sistema
│   ├── authoring.md            # Cómo escribir contenido
│   ├── development.md          # Setup local, tests, debugging
│   ├── deployment.md           # Vercel y producción
│   └── superpowers/
│       ├── specs/              # Specs de diseño originales
│       └── plans/              # Planes de implementación
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

---

## Documentación

- **[docs/architecture.md](docs/architecture.md)** — Cómo está diseñado el sistema, decisiones técnicas, flujo de datos.
- **[docs/authoring.md](docs/authoring.md)** — Cómo se escribe contenido: estructura de carpetas, componentes MDX, sintaxis de math y diagramas, paso a paso para agregar una lección.
- **[docs/development.md](docs/development.md)** — Setup local, comandos detallados, tests, debugging, gotchas de Windows.
- **[docs/deployment.md](docs/deployment.md)** — Cómo desplegar a Vercel y configurar dominio.

---

## Modelo legal y de negocio

- **Videos:** se embeben desde YouTube vía iframe oficial. No se rehospedan. Cada lección incluye atribución visible al creador original.
- **Material original:** los `.mdx` (resúmenes, ejercicios, diagramas, ejemplos) son obra original de este proyecto — acá vive el valor agregado vendible.
- **Modelo de negocio:** freemium — todo gratis al inicio para validar formato. Cuando haya tracción, lecciones premium detrás de paywall (el flag `freeTier` en `lesson.json` ya existe para esto).

---

## Stack

Next.js 15 (App Router) + React 19 + TypeScript 5 + Tailwind 3 + MDX (KaTeX para fórmulas, Mermaid para diagramas) + Vitest. Hosting: Vercel. Storage: filesystem (sin DB en v1).

---

## Estado actual

**v1 (Foundation)** — sitio funcional con 1 lección de prueba. Build estático limpio, 15/15 tests pasando, SEO básico armado, mobile responsive.

**Próximo:** pipeline de ingesta automatizada (`scripts/ingest.mjs`) — un script CLI que toma una URL de YouTube y produce los inputs (transcript + frames + brief) para que Claude genere los 4 MDX. Es un plan separado pendiente de redactar.
