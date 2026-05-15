# Aprende — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable Next.js site with content scanner, MDX rendering (KaTeX + Mermaid + custom components), lesson page (video + 4 tabs + navigation), catalog routes, and one hand-crafted sample lesson — proving the architecture end-to-end.

**Architecture:** Next.js 15 App Router with SSG. Content lives as MDX files in `content/`, scanned at build time. Custom React components handle exercises/examples/diagrams. KaTeX renders LaTeX server-side. Mermaid renders client-side on mount. YouTube videos load via lazy-mounted iframe (poster-then-iframe pattern).

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 3, @next/mdx, remark-math, rehype-katex, mermaid, Vitest, @testing-library/react, happy-dom.

**Reference spec:** `docs/superpowers/specs/2026-05-14-aprende-mvp-design.md`

**Working directory:** `C:\Users\User\Desktop\Proyectos\aprende` (already cloned from github.com/loctime/aprende; contains `.gitignore` and `docs/`).

---

## Task 1: Initialize project metadata and TypeScript config

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `next-env.d.ts`
- Create: `.eslintrc.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "aprende",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "drafts"]
}
```

- [ ] **Step 3: Create `next.config.mjs`**

```js
import createMDX from '@next/mdx'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: false, output: 'mathml' }]],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
}

export default withMDX(nextConfig)
```

- [ ] **Step 4: Create `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 5: Create `.eslintrc.json`**

```json
{ "extends": ["next/core-web-vitals"] }
```

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json next.config.mjs next-env.d.ts .eslintrc.json
git commit -m "chore: initialize Next.js project metadata"
```

---

## Task 2: Install dependencies

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install next@^15 react@^19 react-dom@^19 \
  @next/mdx@^15 @mdx-js/loader@^3 @mdx-js/react@^3 @types/mdx \
  remark-math@^6 rehype-katex@^7 katex@^0.16 \
  mermaid@^11 gray-matter@^4
```

Expected: `package.json` updated with these deps. No errors.

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D typescript@^5 @types/node@^22 @types/react@^19 @types/react-dom@^19 \
  tailwindcss@^3 postcss@^8 autoprefixer@^10 \
  vitest@^2 @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  eslint@^8 eslint-config-next@^15
```

Expected: dev deps installed. No errors.

- [ ] **Step 3: Verify install**

```bash
npx next --version
```

Expected: prints a version string starting with `15.`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install dependencies"
```

---

## Task 3: Configure Tailwind CSS and global styles

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`

- [ ] **Step 1: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: '#0b0f17', soft: '#0f172a', card: '#111827' },
        ink: { DEFAULT: '#e2e8f0', dim: '#94a3b8', muted: '#64748b' },
        brand: { DEFAULT: '#2563eb', soft: '#1e3a8a' },
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Create `postcss.config.mjs`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

- [ ] **Step 3: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import 'katex/dist/katex.min.css';

:root { color-scheme: dark; }

html, body { background: theme('colors.bg.DEFAULT'); color: theme('colors.ink.DEFAULT'); }

.prose-aprende {
  @apply max-w-none text-ink;
}
.prose-aprende h1 { @apply text-2xl font-semibold mt-6 mb-3; }
.prose-aprende h2 { @apply text-xl font-semibold mt-5 mb-2; }
.prose-aprende h3 { @apply text-lg font-semibold mt-4 mb-2; }
.prose-aprende p { @apply my-3 leading-relaxed; }
.prose-aprende ul { @apply list-disc pl-6 my-3; }
.prose-aprende ol { @apply list-decimal pl-6 my-3; }
.prose-aprende code { @apply font-mono text-sm bg-bg-soft px-1 py-0.5 rounded; }
.prose-aprende a { @apply text-brand underline underline-offset-2; }
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts postcss.config.mjs app/globals.css
git commit -m "chore: configure Tailwind + global styles"
```

---

## Task 4: Configure Vitest with happy-dom + Testing Library

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'drafts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Run an empty test pass to verify config**

```bash
npx vitest run
```

Expected: "No test files found" — config is valid.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts vitest.setup.ts
git commit -m "chore: configure Vitest"
```

---

## Task 5: Define content types

**Files:**
- Create: `lib/types.ts`
- Test: `lib/types.test.ts` (not needed — types only)

- [ ] **Step 1: Create `lib/types.ts`**

```ts
export type LessonMeta = {
  slug: string
  title: string
  order: number
  youtubeId: string
  startSec?: number
  endSec?: number
  durationSec: number
  sourceUrl: string
  sourceAttribution: string
  freeTier: boolean
}

export type ChapterMeta = {
  slug: string
  title: string
  order: number
  summary?: string
}

export type CourseMeta = {
  slug: string
  title: string
  description: string
  level: 'inicial' | 'intermedio' | 'avanzado'
  coverImage?: string
}

export type Chapter = ChapterMeta & {
  lessons: LessonMeta[]
}

export type Course = CourseMeta & {
  chapters: Chapter[]
}

export type LessonContent = {
  meta: LessonMeta
  course: CourseMeta
  chapter: ChapterMeta
  tabs: {
    resumen: string
    ejercicios: string
    diagramas: string
    ejemplos: string
  }
  navigation: {
    prev: { courseSlug: string; chapterSlug: string; lessonSlug: string; title: string } | null
    next: { courseSlug: string; chapterSlug: string; lessonSlug: string; title: string } | null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: define content types"
```

---

## Task 6: Write content scanner (TDD)

The scanner reads `content/courses/` and builds the course tree. Pure function, no side effects beyond filesystem reads. We TDD it because all rendering depends on it being correct.

**Files:**
- Create: `lib/content.ts`
- Test: `lib/content.test.ts`
- Create test fixtures: `content/courses/_test-fixture/...`

- [ ] **Step 1: Create test fixture directories**

```bash
mkdir -p content/courses/_test-fixture/01-cap-uno/01-leccion-uno
mkdir -p content/courses/_test-fixture/01-cap-uno/02-leccion-dos
mkdir -p content/courses/_test-fixture/02-cap-dos/01-leccion-tres
```

- [ ] **Step 2: Create fixture JSON files**

```bash
# content/courses/_test-fixture/course.json
cat > content/courses/_test-fixture/course.json <<'EOF'
{
  "title": "Curso de prueba",
  "description": "Solo para tests",
  "level": "inicial"
}
EOF
```

Now create the other fixture files using the Write tool (replicating below format):

`content/courses/_test-fixture/01-cap-uno/chapter.json`:
```json
{ "title": "Capítulo uno", "summary": "primer capítulo" }
```

`content/courses/_test-fixture/02-cap-dos/chapter.json`:
```json
{ "title": "Capítulo dos" }
```

`content/courses/_test-fixture/01-cap-uno/01-leccion-uno/lesson.json`:
```json
{
  "title": "Lección uno",
  "youtubeId": "abc123",
  "durationSec": 600,
  "sourceUrl": "https://youtube.com/watch?v=abc123",
  "sourceAttribution": "Canal X",
  "freeTier": true
}
```

`content/courses/_test-fixture/01-cap-uno/02-leccion-dos/lesson.json`:
```json
{
  "title": "Lección dos",
  "youtubeId": "def456",
  "durationSec": 720,
  "sourceUrl": "https://youtube.com/watch?v=def456",
  "sourceAttribution": "Canal X",
  "freeTier": true
}
```

`content/courses/_test-fixture/02-cap-dos/01-leccion-tres/lesson.json`:
```json
{
  "title": "Lección tres",
  "youtubeId": "ghi789",
  "durationSec": 500,
  "sourceUrl": "https://youtube.com/watch?v=ghi789",
  "sourceAttribution": "Canal X",
  "freeTier": true
}
```

For each lesson dir also create 4 empty MDX placeholders:
```bash
for d in content/courses/_test-fixture/*/*/; do
  touch "$d/resumen.mdx" "$d/ejercicios.mdx" "$d/diagramas.mdx" "$d/ejemplos.mdx"
done
```

- [ ] **Step 3: Write the failing tests**

Create `lib/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getAllCourses, getCourse, getLesson } from './content'

const FIXTURE = '_test-fixture'

describe('content scanner', () => {
  it('lists all courses', () => {
    const courses = getAllCourses()
    const fixture = courses.find(c => c.slug === FIXTURE)
    expect(fixture).toBeDefined()
    expect(fixture!.title).toBe('Curso de prueba')
  })

  it('strips numeric prefix from chapter and lesson slugs', () => {
    const course = getCourse(FIXTURE)
    expect(course).not.toBeNull()
    expect(course!.chapters.map(c => c.slug)).toEqual(['cap-uno', 'cap-dos'])
    expect(course!.chapters[0].lessons.map(l => l.slug)).toEqual(['leccion-uno', 'leccion-dos'])
  })

  it('orders chapters and lessons by numeric prefix', () => {
    const course = getCourse(FIXTURE)!
    expect(course.chapters[0].order).toBe(1)
    expect(course.chapters[1].order).toBe(2)
    expect(course.chapters[0].lessons[0].order).toBe(1)
    expect(course.chapters[0].lessons[1].order).toBe(2)
  })

  it('returns null for missing course', () => {
    expect(getCourse('does-not-exist')).toBeNull()
  })

  it('loads a single lesson with all 4 tabs and navigation', () => {
    const lesson = getLesson(FIXTURE, 'cap-uno', 'leccion-uno')
    expect(lesson).not.toBeNull()
    expect(lesson!.meta.title).toBe('Lección uno')
    expect(lesson!.meta.youtubeId).toBe('abc123')
    expect(lesson!.tabs).toHaveProperty('resumen')
    expect(lesson!.tabs).toHaveProperty('ejercicios')
    expect(lesson!.tabs).toHaveProperty('diagramas')
    expect(lesson!.tabs).toHaveProperty('ejemplos')
    expect(lesson!.navigation.prev).toBeNull()
    expect(lesson!.navigation.next?.lessonSlug).toBe('leccion-dos')
  })

  it('navigation crosses chapter boundaries', () => {
    const last = getLesson(FIXTURE, 'cap-uno', 'leccion-dos')!
    expect(last.navigation.next?.chapterSlug).toBe('cap-dos')
    expect(last.navigation.next?.lessonSlug).toBe('leccion-tres')

    const first = getLesson(FIXTURE, 'cap-dos', 'leccion-tres')!
    expect(first.navigation.prev?.chapterSlug).toBe('cap-uno')
    expect(first.navigation.next).toBeNull()
  })

  it('returns null for missing lesson', () => {
    expect(getLesson(FIXTURE, 'cap-uno', 'no-existe')).toBeNull()
  })
})
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
npx vitest run lib/content.test.ts
```

Expected: FAIL with "Cannot find module './content'" or similar.

- [ ] **Step 5: Implement the scanner**

Create `lib/content.ts`:

```ts
import fs from 'node:fs'
import path from 'node:path'
import type { Course, Chapter, LessonMeta, LessonContent, CourseMeta, ChapterMeta } from './types'

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'courses')

const PREFIX_RE = /^(\d+)-(.+)$/

function parsePrefixed(name: string): { order: number; slug: string } | null {
  const m = name.match(PREFIX_RE)
  if (!m) return null
  return { order: parseInt(m[1], 10), slug: m[2] }
}

function readJSON<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(n => !n.startsWith('.'))
}

function loadLesson(courseSlug: string, chapterDir: string, lessonDirName: string): LessonMeta | null {
  const parsed = parsePrefixed(lessonDirName)
  if (!parsed) return null
  const lessonPath = path.join(CONTENT_ROOT, courseSlug, chapterDir, lessonDirName)
  const metaPath = path.join(lessonPath, 'lesson.json')
  if (!fs.existsSync(metaPath)) return null
  const raw = readJSON<Omit<LessonMeta, 'slug' | 'order'>>(metaPath)
  return { ...raw, slug: parsed.slug, order: parsed.order }
}

function loadChapter(courseSlug: string, chapterDirName: string): Chapter | null {
  const parsed = parsePrefixed(chapterDirName)
  if (!parsed) return null
  const chapterPath = path.join(CONTENT_ROOT, courseSlug, chapterDirName)
  const metaPath = path.join(chapterPath, 'chapter.json')
  if (!fs.existsSync(metaPath)) return null
  const raw = readJSON<Omit<ChapterMeta, 'slug' | 'order'>>(metaPath)
  const lessons = listDirs(chapterPath)
    .map(d => loadLesson(courseSlug, chapterDirName, d))
    .filter((l): l is LessonMeta => l !== null)
    .sort((a, b) => a.order - b.order)
  return { ...raw, slug: parsed.slug, order: parsed.order, lessons }
}

function loadCourse(courseSlug: string): Course | null {
  const coursePath = path.join(CONTENT_ROOT, courseSlug)
  const metaPath = path.join(coursePath, 'course.json')
  if (!fs.existsSync(metaPath)) return null
  const raw = readJSON<Omit<CourseMeta, 'slug'>>(metaPath)
  const chapters = listDirs(coursePath)
    .map(d => loadChapter(courseSlug, d))
    .filter((c): c is Chapter => c !== null)
    .sort((a, b) => a.order - b.order)
  return { ...raw, slug: courseSlug, chapters }
}

export function getAllCourses(): Course[] {
  return listDirs(CONTENT_ROOT)
    .map(loadCourse)
    .filter((c): c is Course => c !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function getCourse(slug: string): Course | null {
  return loadCourse(slug)
}

function readTab(lessonDir: string, name: string): string {
  const filePath = path.join(lessonDir, `${name}.mdx`)
  if (!fs.existsSync(filePath)) return ''
  return fs.readFileSync(filePath, 'utf-8')
}

export function getLesson(courseSlug: string, chapterSlug: string, lessonSlug: string): LessonContent | null {
  const course = loadCourse(courseSlug)
  if (!course) return null

  const chapterIdx = course.chapters.findIndex(c => c.slug === chapterSlug)
  if (chapterIdx === -1) return null
  const chapter = course.chapters[chapterIdx]

  const lessonIdx = chapter.lessons.findIndex(l => l.slug === lessonSlug)
  if (lessonIdx === -1) return null
  const lesson = chapter.lessons[lessonIdx]

  const chapterDirName = `${String(chapter.order).padStart(2, '0')}-${chapter.slug}`
  const lessonDirName = `${String(lesson.order).padStart(2, '0')}-${lesson.slug}`
  const lessonDir = path.join(CONTENT_ROOT, courseSlug, chapterDirName, lessonDirName)

  const tabs = {
    resumen: readTab(lessonDir, 'resumen'),
    ejercicios: readTab(lessonDir, 'ejercicios'),
    diagramas: readTab(lessonDir, 'diagramas'),
    ejemplos: readTab(lessonDir, 'ejemplos'),
  }

  const flat = course.chapters.flatMap(c =>
    c.lessons.map(l => ({ courseSlug, chapterSlug: c.slug, lessonSlug: l.slug, title: l.title }))
  )
  const here = flat.findIndex(x => x.chapterSlug === chapterSlug && x.lessonSlug === lessonSlug)
  const prev = here > 0 ? flat[here - 1] : null
  const next = here < flat.length - 1 ? flat[here + 1] : null

  const { chapters: _ignored, ...courseMeta } = course
  const { lessons: _ignored2, ...chapterMeta } = chapter
  return { meta: lesson, course: courseMeta, chapter: chapterMeta, tabs, navigation: { prev, next } }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx vitest run lib/content.test.ts
```

Expected: all 7 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/content.ts lib/content.test.ts content/courses/_test-fixture
git commit -m "feat(content): filesystem-based content scanner with tests"
```

---

## Task 7: Build `<Ejercicio>` and `<Solucion>` MDX components

**Files:**
- Create: `components/mdx/Ejercicio.tsx`
- Create: `components/mdx/Solucion.tsx`
- Test: `components/mdx/Ejercicio.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `components/mdx/Ejercicio.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Ejercicio } from './Ejercicio'
import { Solucion } from './Solucion'

describe('Ejercicio', () => {
  it('renders content and dificultad badge', () => {
    render(
      <Ejercicio dificultad="medio">
        <p>Calculá el dominio de f(x)</p>
      </Ejercicio>
    )
    expect(screen.getByText('Calculá el dominio de f(x)')).toBeInTheDocument()
    expect(screen.getByText(/medio/i)).toBeInTheDocument()
  })

  it('defaults dificultad to facil', () => {
    render(<Ejercicio><p>x</p></Ejercicio>)
    expect(screen.getByText(/facil/i)).toBeInTheDocument()
  })
})

describe('Solucion', () => {
  it('starts collapsed', () => {
    render(
      <Solucion>
        <p>la respuesta es 42</p>
      </Solucion>
    )
    const details = screen.getByText(/ver solución/i).closest('details')
    expect(details).not.toBeNull()
    expect(details).not.toHaveAttribute('open')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run components/mdx/Ejercicio.test.tsx
```

Expected: FAIL — modules don't exist.

- [ ] **Step 3: Implement `Ejercicio.tsx`**

```tsx
import type { ReactNode } from 'react'

type Dificultad = 'facil' | 'medio' | 'dificil'

const COLORS: Record<Dificultad, string> = {
  facil: 'border-emerald-500/40 bg-emerald-500/5',
  medio: 'border-amber-500/40 bg-amber-500/5',
  dificil: 'border-rose-500/40 bg-rose-500/5',
}

const LABEL: Record<Dificultad, string> = {
  facil: 'Fácil',
  medio: 'Medio',
  dificil: 'Difícil',
}

export function Ejercicio({
  dificultad = 'facil',
  children,
}: {
  dificultad?: Dificultad
  children: ReactNode
}) {
  return (
    <div className={`my-5 rounded-lg border ${COLORS[dificultad]} p-4`}>
      <div className="mb-2 text-xs uppercase tracking-wide text-ink-dim">
        Ejercicio — <span data-difficulty>{LABEL[dificultad]}</span>
      </div>
      <div className="prose-aprende">{children}</div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `Solucion.tsx`**

```tsx
import type { ReactNode } from 'react'

export function Solucion({ children }: { children: ReactNode }) {
  return (
    <details className="mt-3 rounded border border-ink-muted/30 bg-bg-soft">
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-brand">
        Ver solución
      </summary>
      <div className="prose-aprende px-3 pb-3 pt-1">{children}</div>
    </details>
  )
}
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run components/mdx/Ejercicio.test.tsx
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add components/mdx/Ejercicio.tsx components/mdx/Solucion.tsx components/mdx/Ejercicio.test.tsx
git commit -m "feat(mdx): Ejercicio + Solucion components"
```

---

## Task 8: Build `<Ejemplo>` and `<Definicion>` MDX components

**Files:**
- Create: `components/mdx/Ejemplo.tsx`
- Create: `components/mdx/Definicion.tsx`

- [ ] **Step 1: Create `Ejemplo.tsx`**

```tsx
import type { ReactNode } from 'react'

export function Ejemplo({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <figure className="my-5 rounded-lg border-l-4 border-brand bg-brand/5 p-4">
      {titulo && (
        <figcaption className="mb-2 text-sm font-semibold text-brand">{titulo}</figcaption>
      )}
      <div className="prose-aprende">{children}</div>
    </figure>
  )
}
```

- [ ] **Step 2: Create `Definicion.tsx`**

```tsx
import type { ReactNode } from 'react'

export function Definicion({ termino, children }: { termino: string; children: ReactNode }) {
  return (
    <aside className="my-5 rounded-lg border border-ink-muted/30 bg-bg-card p-4">
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-dim">
        Definición: <span className="text-ink">{termino}</span>
      </h4>
      <div className="prose-aprende">{children}</div>
    </aside>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/mdx/Ejemplo.tsx components/mdx/Definicion.tsx
git commit -m "feat(mdx): Ejemplo + Definicion components"
```

---

## Task 9: Build `<Diagrama>` (client-side Mermaid)

Mermaid needs a browser. We render the wrapper server-side and hydrate Mermaid on the client.

**Files:**
- Create: `components/mdx/Diagrama.tsx`

- [ ] **Step 1: Create `Diagrama.tsx`**

```tsx
'use client'
import { useEffect, useId, useRef, useState } from 'react'

export function Diagrama({ children }: { children: string }) {
  const id = useId().replace(/:/g, '')
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' })
        const source = (children ?? '').toString().trim()
        const { svg } = await mermaid.render(`m-${id}`, source)
        if (!cancelled) setSvg(svg)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => { cancelled = true }
  }, [children, id])

  if (error) {
    return (
      <div className="my-5 rounded border border-rose-500/50 bg-rose-500/5 p-3 text-sm text-rose-300">
        Error renderizando diagrama: {error}
      </div>
    )
  }
  return (
    <div
      ref={ref}
      className="my-5 flex justify-center overflow-x-auto rounded border border-ink-muted/30 bg-bg-soft p-4"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {!svg ? <div className="text-xs text-ink-dim">Renderizando diagrama…</div> : null}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/mdx/Diagrama.tsx
git commit -m "feat(mdx): client-side Mermaid Diagrama component"
```

---

## Task 10: Wire up MDX component mapping

**Files:**
- Create: `components/mdx/MDXComponents.tsx`
- Create: `mdx-components.tsx` (Next.js convention, root of project)

- [ ] **Step 1: Create the mapping**

`components/mdx/MDXComponents.tsx`:

```tsx
import { Ejercicio } from './Ejercicio'
import { Solucion } from './Solucion'
import { Ejemplo } from './Ejemplo'
import { Definicion } from './Definicion'
import { Diagrama } from './Diagrama'

export const mdxComponents = {
  Ejercicio,
  Solucion,
  Ejemplo,
  Definicion,
  Diagrama,
}
```

- [ ] **Step 2: Hook into Next.js MDX**

`mdx-components.tsx`:

```tsx
import type { MDXComponents } from 'mdx/types'
import { mdxComponents } from '@/components/mdx/MDXComponents'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ...mdxComponents }
}
```

- [ ] **Step 3: Commit**

```bash
git add components/mdx/MDXComponents.tsx mdx-components.tsx
git commit -m "feat(mdx): wire custom components into MDX pipeline"
```

---

## Task 11: Build `<YouTubePlayer>` (lazy-loaded)

**Files:**
- Create: `components/video/YouTubePlayer.tsx`
- Test: `components/video/YouTubePlayer.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YouTubePlayer } from './YouTubePlayer'

describe('YouTubePlayer', () => {
  it('renders poster (no iframe) by default', () => {
    render(<YouTubePlayer videoId="abc123" title="Lección X" />)
    expect(screen.getByRole('button', { name: /reproducir/i })).toBeInTheDocument()
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('loads iframe after user clicks play', async () => {
    const user = userEvent.setup()
    render(<YouTubePlayer videoId="abc123" title="Lección X" />)
    await user.click(screen.getByRole('button', { name: /reproducir/i }))
    expect(document.querySelector('iframe')).not.toBeNull()
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    expect(iframe.src).toContain('youtube.com/embed/abc123')
  })

  it('passes startSec and endSec to embed URL', async () => {
    const user = userEvent.setup()
    render(<YouTubePlayer videoId="xyz" title="t" startSec={30} endSec={120} />)
    await user.click(screen.getByRole('button', { name: /reproducir/i }))
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    expect(iframe.src).toContain('start=30')
    expect(iframe.src).toContain('end=120')
  })
})
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
npx vitest run components/video/YouTubePlayer.test.tsx
```

- [ ] **Step 3: Implement the component**

```tsx
'use client'
import { useState } from 'react'

export function YouTubePlayer({
  videoId,
  title,
  startSec,
  endSec,
}: {
  videoId: string
  title: string
  startSec?: number
  endSec?: number
}) {
  const [loaded, setLoaded] = useState(false)

  const params = new URLSearchParams({ rel: '0', modestbranding: '1', autoplay: '1' })
  if (startSec !== undefined) params.set('start', String(startSec))
  if (endSec !== undefined) params.set('end', String(endSec))
  const src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`

  if (loaded) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      aria-label={`Reproducir ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/95 text-white shadow-lg transition group-hover:scale-110">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </span>
      </span>
      <span className="absolute bottom-2 left-2 right-2 truncate text-xs text-white/80">{title}</span>
    </button>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run components/video/YouTubePlayer.test.tsx
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/video/YouTubePlayer.tsx components/video/YouTubePlayer.test.tsx
git commit -m "feat(video): lazy-loaded YouTubePlayer with poster-then-iframe"
```

---

## Task 12: Build `<TabPanel>`

**Files:**
- Create: `components/lesson/TabPanel.tsx`
- Test: `components/lesson/TabPanel.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabPanel } from './TabPanel'

const TABS = [
  { id: 'a', label: 'Alfa', content: <p>contenido alfa</p> },
  { id: 'b', label: 'Beta', content: <p>contenido beta</p> },
]

describe('TabPanel', () => {
  it('renders first tab by default', () => {
    render(<TabPanel tabs={TABS} />)
    expect(screen.getByText('contenido alfa')).toBeInTheDocument()
    expect(screen.queryByText('contenido beta')).toBeNull()
  })

  it('switches tab on click', async () => {
    const user = userEvent.setup()
    render(<TabPanel tabs={TABS} />)
    await user.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(screen.getByText('contenido beta')).toBeInTheDocument()
    expect(screen.queryByText('contenido alfa')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

- [ ] **Step 3: Implement TabPanel**

```tsx
'use client'
import { useState, type ReactNode } from 'react'

export type Tab = { id: string; label: string; content: ReactNode }

export function TabPanel({ tabs, initialId }: { tabs: Tab[]; initialId?: string }) {
  const [active, setActive] = useState(initialId ?? tabs[0]?.id)
  const current = tabs.find(t => t.id === active) ?? tabs[0]

  return (
    <div className="rounded-lg border border-ink-muted/30 bg-bg-card">
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-ink-muted/30 p-1">
        {tabs.map(tab => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={
                'rounded px-3 py-1.5 text-sm font-medium transition ' +
                (isActive
                  ? 'bg-brand text-white'
                  : 'text-ink-dim hover:bg-bg-soft hover:text-ink')
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" className="prose-aprende max-h-[70vh] overflow-y-auto p-4">
        {current?.content}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/lesson/TabPanel.tsx components/lesson/TabPanel.test.tsx
git commit -m "feat(lesson): TabPanel component with keyboard-accessible tabs"
```

---

## Task 13: Build LessonNav (prev/next)

**Files:**
- Create: `components/lesson/LessonNav.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from 'next/link'
import type { LessonContent } from '@/lib/types'

export function LessonNav({ navigation }: { navigation: LessonContent['navigation'] }) {
  return (
    <nav className="mt-6 flex flex-col gap-2 border-t border-ink-muted/20 pt-4 sm:flex-row sm:justify-between">
      {navigation.prev ? (
        <Link
          href={`/cursos/${navigation.prev.courseSlug}/${navigation.prev.chapterSlug}/${navigation.prev.lessonSlug}`}
          className="rounded-md border border-ink-muted/30 px-4 py-2 text-sm hover:bg-bg-soft"
        >
          ← <span className="text-ink-dim">Anterior:</span> {navigation.prev.title}
        </Link>
      ) : (
        <span />
      )}
      {navigation.next ? (
        <Link
          href={`/cursos/${navigation.next.courseSlug}/${navigation.next.chapterSlug}/${navigation.next.lessonSlug}`}
          className="rounded-md border border-brand bg-brand/10 px-4 py-2 text-sm hover:bg-brand/20"
        >
          <span className="text-ink-dim">Siguiente:</span> {navigation.next.title} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/lesson/LessonNav.tsx
git commit -m "feat(lesson): LessonNav with prev/next links"
```

---

## Task 14: Build root layout + landing page

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Aprende', template: '%s — Aprende' },
  description: 'Cursos enriquecidos: video + material premium para entender de verdad.',
  metadataBase: new URL('https://aprende.app'),
  openGraph: { type: 'website', siteName: 'Aprende', locale: 'es_AR' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b border-ink-muted/20">
          <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">Aprende</Link>
            <nav className="flex gap-4 text-sm text-ink-dim">
              <Link href="/cursos" className="hover:text-ink">Cursos</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <footer className="mt-16 border-t border-ink-muted/20">
          <div className="mx-auto max-w-6xl p-4 text-xs text-ink-muted">
            © {new Date().getFullYear()} Aprende. Videos embebidos con atribución a sus creadores.
          </div>
        </footer>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create `app/page.tsx`**

```tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Aprende mejor con video <span className="text-brand">+ material</span>.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-ink-dim">
        Tomamos los mejores cursos públicos y los enriquecemos con ejercicios, ejemplos y diagramas
        originales — todo en una página.
      </p>
      <div className="mt-8">
        <Link
          href="/cursos"
          className="inline-block rounded-lg bg-brand px-6 py-3 text-white shadow hover:bg-brand-soft"
        >
          Ver cursos
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat(app): root layout + landing page"
```

---

## Task 15: Build `/cursos` catalog page

**Files:**
- Create: `app/cursos/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllCourses } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Catálogo de cursos disponibles en Aprende.',
}

export default function CoursesPage() {
  const courses = getAllCourses().filter(c => !c.slug.startsWith('_'))

  return (
    <section className="py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Cursos</h1>
      {courses.length === 0 ? (
        <p className="mt-6 text-ink-dim">Todavía no hay cursos publicados.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <li key={course.slug}>
              <Link
                href={`/cursos/${course.slug}`}
                className="block rounded-lg border border-ink-muted/30 bg-bg-card p-5 transition hover:border-brand/50 hover:bg-bg-soft"
              >
                <div className="text-xs uppercase tracking-wide text-ink-muted">{course.level}</div>
                <h2 className="mt-2 text-lg font-semibold">{course.title}</h2>
                <p className="mt-2 text-sm text-ink-dim">{course.description}</p>
                <div className="mt-3 text-xs text-ink-muted">
                  {course.chapters.length} capítulos · {course.chapters.reduce((n, c) => n + c.lessons.length, 0)} lecciones
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/cursos/page.tsx
git commit -m "feat(app): /cursos catalog page"
```

---

## Task 16: Build `/cursos/[curso]` course detail page

**Files:**
- Create: `app/cursos/[curso]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllCourses, getCourse } from '@/lib/content'

type Params = { curso: string }

export function generateStaticParams(): Params[] {
  return getAllCourses()
    .filter(c => !c.slug.startsWith('_'))
    .map(c => ({ curso: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { curso } = await params
  const c = getCourse(curso)
  if (!c) return {}
  return { title: c.title, description: c.description }
}

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const { curso } = await params
  const course = getCourse(curso)
  if (!course || course.slug.startsWith('_')) notFound()

  return (
    <section className="py-8">
      <Link href="/cursos" className="text-sm text-ink-dim hover:text-ink">← Cursos</Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{course.title}</h1>
      <p className="mt-2 text-ink-dim">{course.description}</p>

      <div className="mt-8 space-y-6">
        {course.chapters.map(ch => (
          <article key={ch.slug}>
            <h2 className="text-xl font-semibold">{ch.title}</h2>
            {ch.summary && <p className="mt-1 text-sm text-ink-dim">{ch.summary}</p>}
            <ol className="mt-3 space-y-2">
              {ch.lessons.map(l => (
                <li key={l.slug}>
                  <Link
                    href={`/cursos/${course.slug}/${ch.slug}/${l.slug}`}
                    className="flex items-center justify-between rounded-md border border-ink-muted/20 bg-bg-card p-3 hover:border-brand/40 hover:bg-bg-soft"
                  >
                    <span className="text-sm">{l.order}. {l.title}</span>
                    <span className="text-xs text-ink-muted">{Math.round(l.durationSec / 60)} min</span>
                  </Link>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/cursos/[curso]/page.tsx
git commit -m "feat(app): course detail page"
```

---

## Task 17: Build the lesson page (video + tabs + nav)

This is the centerpiece. The MDX strings from the scanner need to be compiled to React. We use `next-mdx-remote` for runtime MDX compilation since the content lives outside `app/`.

**Files:**
- Modify: `package.json` (add `next-mdx-remote`)
- Create: `app/cursos/[curso]/[capitulo]/[leccion]/page.tsx`
- Create: `components/lesson/CompiledMDX.tsx`

- [ ] **Step 1: Install `next-mdx-remote`**

```bash
npm install next-mdx-remote@^5
```

- [ ] **Step 2: Create `components/lesson/CompiledMDX.tsx`**

```tsx
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { mdxComponents } from '@/components/mdx/MDXComponents'

export function CompiledMDX({ source }: { source: string }) {
  if (!source.trim()) {
    return <p className="text-ink-muted italic">(Sin contenido todavía.)</p>
  }
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [[rehypeKatex, { strict: false, output: 'mathml' }]],
        },
      }}
    />
  )
}
```

- [ ] **Step 3: Create the lesson page**

`app/cursos/[curso]/[capitulo]/[leccion]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllCourses, getLesson } from '@/lib/content'
import { YouTubePlayer } from '@/components/video/YouTubePlayer'
import { TabPanel, type Tab } from '@/components/lesson/TabPanel'
import { LessonNav } from '@/components/lesson/LessonNav'
import { CompiledMDX } from '@/components/lesson/CompiledMDX'

type Params = { curso: string; capitulo: string; leccion: string }

export function generateStaticParams(): Params[] {
  const out: Params[] = []
  for (const course of getAllCourses()) {
    if (course.slug.startsWith('_')) continue
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        out.push({ curso: course.slug, capitulo: chapter.slug, leccion: lesson.slug })
      }
    }
  }
  return out
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { curso, capitulo, leccion } = await params
  const data = getLesson(curso, capitulo, leccion)
  if (!data) return {}
  return {
    title: `${data.meta.title} — ${data.course.title}`,
    description: `${data.chapter.title} · ${data.course.title}`,
  }
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { curso, capitulo, leccion } = await params
  const data = getLesson(curso, capitulo, leccion)
  if (!data) notFound()

  const tabs: Tab[] = [
    { id: 'resumen', label: 'Resumen', content: <CompiledMDX source={data.tabs.resumen} /> },
    { id: 'ejercicios', label: 'Ejercicios', content: <CompiledMDX source={data.tabs.ejercicios} /> },
    { id: 'diagramas', label: 'Diagramas', content: <CompiledMDX source={data.tabs.diagramas} /> },
    { id: 'ejemplos', label: 'Ejemplos', content: <CompiledMDX source={data.tabs.ejemplos} /> },
  ]

  return (
    <section className="py-6">
      <nav className="text-sm text-ink-dim">
        <Link href="/cursos" className="hover:text-ink">Cursos</Link>{' / '}
        <Link href={`/cursos/${curso}`} className="hover:text-ink">{data.course.title}</Link>{' / '}
        <span>{data.chapter.title}</span>
      </nav>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{data.meta.title}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div>
          <YouTubePlayer
            videoId={data.meta.youtubeId}
            title={data.meta.title}
            startSec={data.meta.startSec}
            endSec={data.meta.endSec}
          />
          <p className="mt-2 text-xs text-ink-muted">
            Fuente: <a href={data.meta.sourceUrl} className="underline" target="_blank" rel="noopener">{data.meta.sourceAttribution}</a>
          </p>
        </div>
        <div>
          <TabPanel tabs={tabs} />
        </div>
      </div>

      <LessonNav navigation={data.navigation} />
    </section>
  )
}
```

- [ ] **Step 4: Verify the build compiles**

```bash
npx next build
```

Expected: build succeeds. Pages prerendered. (Catalog will be empty until we add real content in Task 19, but the build should not error.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app/cursos components/lesson/CompiledMDX.tsx
git commit -m "feat(app): lesson page with video + tabs + nav + MDX runtime"
```

---

## Task 18: Add sitemap and robots

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { getAllCourses } from '@/lib/content'

const BASE = 'https://aprende.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/cursos`, priority: 0.9 },
  ]
  for (const course of getAllCourses()) {
    if (course.slug.startsWith('_')) continue
    out.push({ url: `${BASE}/cursos/${course.slug}`, priority: 0.8 })
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        out.push({
          url: `${BASE}/cursos/${course.slug}/${chapter.slug}/${lesson.slug}`,
          priority: 0.7,
        })
      }
    }
  }
  return out
}
```

- [ ] **Step 2: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://aprende.app/sitemap.xml',
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat(seo): sitemap + robots"
```

---

## Task 19: Create the first hand-crafted sample lesson

A real lesson proving the entire pipeline works: scanner → page → render. Picks a publicly embeddable YouTube math video. Content is hand-written original material attributed back to the source.

**Files:**
- Create: `content/courses/matematicas-i/course.json`
- Create: `content/courses/matematicas-i/01-funciones/chapter.json`
- Create: `content/courses/matematicas-i/01-funciones/01-que-es-una-funcion/lesson.json`
- Create: 4 MDX files in that lesson dir

- [ ] **Step 1: Create course metadata**

`content/courses/matematicas-i/course.json`:
```json
{
  "title": "Matemáticas I",
  "description": "Curso introductorio: funciones, límites, derivadas e integrales. Material premium sobre cursos abiertos de YouTube.",
  "level": "inicial"
}
```

- [ ] **Step 2: Create chapter metadata**

`content/courses/matematicas-i/01-funciones/chapter.json`:
```json
{
  "title": "Funciones",
  "summary": "Concepto de función, dominio, rango, tipos de funciones."
}
```

- [ ] **Step 3: Create lesson metadata**

`content/courses/matematicas-i/01-funciones/01-que-es-una-funcion/lesson.json`:

> The implementer should pick a real, embeddable YouTube math video about "qué es una función" in Spanish. Suggested process: ask the project owner for a specific URL. As placeholder for plan execution, use a known-good public math channel video; the project owner will swap the `youtubeId` and `sourceAttribution` before merging.

```json
{
  "title": "¿Qué es una función?",
  "youtubeId": "REPLACE_WITH_REAL_ID",
  "durationSec": 600,
  "sourceUrl": "https://youtube.com/watch?v=REPLACE_WITH_REAL_ID",
  "sourceAttribution": "REPLACE_WITH_CHANNEL_NAME",
  "freeTier": true
}
```

**Note for executor:** Before committing, prompt the project owner to provide the actual YouTube URL and channel name for a Spanish-language math video explaining "qué es una función". Update these three fields. The plan considers this task incomplete until those values are real.

- [ ] **Step 4: Create `resumen.mdx`**

```mdx
Una **función** es una relación entre dos conjuntos donde a cada elemento del primer conjunto (el **dominio**) le corresponde exactamente un elemento del segundo conjunto (el **codominio**).

<Definicion termino="función">
Sea $A$ el dominio y $B$ el codominio. Una función $f: A \to B$ asigna a cada $x \in A$ un único $f(x) \in B$.
</Definicion>

## Lo esencial

- A cada entrada le toca **una sola** salida — esa es la diferencia entre función y "relación cualquiera".
- El **dominio** es el conjunto de entradas válidas.
- La **imagen** (o rango) es el conjunto de salidas que realmente se producen.
- El **codominio** es el conjunto donde "viven" las posibles salidas (puede ser más grande que la imagen).

## Notación

Se escribe $f(x) = \text{expresión}$. La $x$ es la variable independiente. El valor $f(x)$ es lo que la función "devuelve" para esa $x$.

Ejemplos rápidos:
- $f(x) = x^2$ — toma un número, devuelve su cuadrado.
- $g(x) = 2x + 3$ — función lineal.
- $h(x) = \sqrt{x}$ — solo definida para $x \geq 0$.
```

- [ ] **Step 5: Create `ejemplos.mdx`**

```mdx
<Ejemplo titulo="Ejemplo 1: función lineal">
Sea $f(x) = 2x + 3$.

| $x$ | $f(x)$ |
|---|---|
| 0 | 3 |
| 1 | 5 |
| -2 | -1 |

A cada valor de $x$ le corresponde un único $f(x)$ → es una función.
</Ejemplo>

<Ejemplo titulo="Ejemplo 2: NO es función">
Considerá la relación $y^2 = x$.

Para $x = 4$, $y$ puede ser $2$ o $-2$. Una misma entrada produce dos salidas → no es una función (de $x$ a $y$).
</Ejemplo>

<Ejemplo titulo="Ejemplo 3: dominio restringido">
$f(x) = \frac{1}{x - 2}$.

El denominador no puede ser cero, entonces $x \neq 2$. El dominio es $\mathbb{R} \setminus \{2\}$.
</Ejemplo>
```

- [ ] **Step 6: Create `ejercicios.mdx`**

```mdx
<Ejercicio dificultad="facil">
Indicá si la siguiente relación es función o no, y justificá: para cada persona del aula, su altura en cm.

<Solucion>
Sí, es función. Cada persona tiene una única altura en un momento dado.
</Solucion>
</Ejercicio>

<Ejercicio dificultad="facil">
Calculá $f(-1)$, $f(0)$, $f(3)$ para $f(x) = x^2 - 2x + 1$.

<Solucion>
- $f(-1) = 1 + 2 + 1 = 4$
- $f(0) = 0 - 0 + 1 = 1$
- $f(3) = 9 - 6 + 1 = 4$
</Solucion>
</Ejercicio>

<Ejercicio dificultad="medio">
Encontrá el dominio de $g(x) = \sqrt{x - 5}$.

<Solucion>
El radicando debe ser $\geq 0$:
$$x - 5 \geq 0 \implies x \geq 5$$
**Dominio:** $[5, \infty)$.
</Solucion>
</Ejercicio>

<Ejercicio dificultad="medio">
¿Es $h(x) = \frac{x^2 - 4}{x - 2}$ igual a $h(x) = x + 2$? Justificá.

<Solucion>
Factorizando: $\frac{(x-2)(x+2)}{x-2}$. Para $x \neq 2$, esto es $x+2$. **Pero** $h(2)$ no está definida (división por cero), mientras que $x+2$ en $x=2$ vale $4$. Son funciones distintas porque tienen dominios distintos.
</Solucion>
</Ejercicio>

<Ejercicio dificultad="dificil">
Definí una función a tramos que valga $x^2$ para $x < 0$, $0$ para $x = 0$, y $\sqrt{x}$ para $x > 0$. ¿Está bien definida como función?

<Solucion>
$$f(x) = \begin{cases} x^2 & \text{si } x < 0 \\ 0 & \text{si } x = 0 \\ \sqrt{x} & \text{si } x > 0 \end{cases}$$

Sí, está bien definida: cada $x \in \mathbb{R}$ cae en exactamente uno de los tres casos, así que tiene una única imagen.
</Solucion>
</Ejercicio>
```

- [ ] **Step 7: Create `diagramas.mdx`**

```mdx
La idea de función como "máquina" que transforma entradas en salidas:

<Diagrama>
{`graph LR
  A["x (entrada)"] --> F["f (regla)"]
  F --> B["f(x) (salida)"]
  style F fill:#2563eb,color:#fff,stroke:#1e3a8a`}
</Diagrama>

Relación entre dominio, codominio e imagen:

<Diagrama>
{`graph LR
  subgraph Dominio
    A1[x1]
    A2[x2]
    A3[x3]
  end
  subgraph Codominio
    B1[y1]
    B2[y2]
    B3[y3]
    B4[y4]
  end
  A1 --> B1
  A2 --> B2
  A3 --> B2
  classDef imagen fill:#059669,color:#fff
  class B1,B2 imagen`}
</Diagrama>

La **imagen** es el subconjunto del codominio que efectivamente "recibe" alguna entrada (en verde).
```

- [ ] **Step 8: Verify the build still works**

```bash
npx next build
```

Expected: build succeeds. The new route appears in the build output.

- [ ] **Step 9: Verify by running dev and visiting the URL**

```bash
npm run dev
```

Open `http://localhost:3000/cursos/matematicas-i/01-funciones/01-que-es-una-funcion` and confirm:
- Video poster shows (or iframe if you click).
- 4 tabs render their content.
- Math formulas render with KaTeX.
- Mermaid diagrams render after a brief flash.
- Prev/Next nav appears (Prev=null since first lesson, Next=null since only lesson).

Stop dev server (`Ctrl+C`).

- [ ] **Step 10: Commit**

```bash
git add content/courses/matematicas-i
git commit -m "content: first sample lesson (Funciones — ¿Qué es una función?)"
```

---

## Task 20: Production build verification and deploy prep

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run a full production build locally**

```bash
npm run build && npm run start
```

Expected: build succeeds; production server starts on port 3000. Visit `http://localhost:3000` and confirm the home page and lesson page render. Stop the server.

- [ ] **Step 2: Run typecheck and tests**

```bash
npm run typecheck && npm test
```

Expected: 0 type errors. All tests pass.

- [ ] **Step 3: Create `README.md`**

```markdown
# Aprende

Plataforma de cursos enriquecidos: video de YouTube + material premium (resúmenes, ejercicios, diagramas, ejemplos).

## Desarrollo

```bash
npm install
npm run dev
```

Visitar `http://localhost:3000`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build estático de producción |
| `npm run start` | Sirve el build de producción |
| `npm test` | Corre los tests con Vitest |
| `npm run typecheck` | Verificación de tipos sin emitir |

## Estructura

- `app/` — rutas de Next.js (App Router)
- `components/` — componentes React (`mdx/`, `lesson/`, `video/`)
- `content/courses/` — contenido del sitio (MDX + JSON metadata)
- `lib/` — scanner de contenido, tipos
- `docs/superpowers/specs/` — specs de diseño
- `docs/superpowers/plans/` — planes de implementación

## Deploy

Push a `main` → Vercel hace deploy automático del build estático.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push -u origin main
```

Expected: branch tracking set, all commits pushed.

- [ ] **Step 6: Connect Vercel**

Manually (out of code scope):
1. Go to vercel.com, import `loctime/aprende`.
2. Framework: Next.js (auto-detected).
3. Deploy.
4. Verify the deployed URL loads the home page and the lesson page.

---

## Self-review notes (for the planner)

Spec coverage:
- §2 (alcance): foundation tasks deliver everything in the "incluido" list **except** the 10-15 lecciones — only 1 sample is in this plan. Producing the other 9-14 is a separate workstream (manual content production with Claude assistance).
- §3 (arquitectura): build-time + runtime + SSG all implemented.
- §4 (stack): all dependencies pinned in Tasks 1-2.
- §5 (estructura del proyecto): matches spec.
- §6 (modelo de contenido): types + scanner + fixtures cover all schemas.
- §7 (pipeline): **NOT in this plan** — covered by Plan 2 (`aprende-ingest-pipeline`).
- §8 (componentes UI): all 4 custom MDX components + YouTubePlayer + TabPanel + LessonNav implemented.
- §9 (DoD): tasks cover everything except Lighthouse score validation (manual after deploy).
- §10 (testing): unit tests on scanner + components per spec; manual E2E checklist in Task 19 Step 9.
- §11 (futuras): noted as deferred, no code in this plan.
- §12 (riesgos): the `sourceAttribution` field + Task 19 explicit attribution mitigates "creador revoca embed".

Open items requiring user input before/during execution:
- Task 19 Step 3: real YouTube URL + channel name (project owner must supply or approve).

Type/signature consistency: spot-checked. `LessonContent`, `Course`, `Chapter`, `LessonMeta` all match between `lib/types.ts`, `lib/content.ts`, and the page components.
