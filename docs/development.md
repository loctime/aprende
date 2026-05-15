# Development

Setup local, comandos, testing, y los gotchas que te vas a encontrar.

---

## Prerequisitos

- **Node.js ≥ 20.x** (el proyecto usa features de ES2022 + módulos modernos).
  ```bash
  node --version   # debería decir v20.x.x o superior
  ```
- **npm ≥ 10.x** (viene con Node 20).
- **Git** (cualquier versión reciente).

Opcionales pero recomendados para producción de contenido:
- **yt-dlp** — para bajar subtítulos y metadata de YouTube. Instalar:
  ```bash
  pip install yt-dlp
  # o en Windows con winget:
  winget install yt-dlp
  ```
- **ffmpeg** — para extraer frames de videos.
  ```bash
  # Windows:
  winget install ffmpeg
  # macOS:
  brew install ffmpeg
  ```

---

## Setup inicial

```bash
git clone https://github.com/loctime/aprende.git
cd aprende
npm install
```

`npm install` baja ~700 paquetes (incluye Next, React, Tailwind, MDX, KaTeX, Mermaid, Vitest, Testing Library). Toma 30-90 segundos.

Verificá que todo quedó bien:
```bash
npm run typecheck    # 0 errores
npm test             # 15/15 tests pasan
npm run build        # build limpio, 9 páginas estáticas
```

---

## Comandos detallados

### `npm run dev`

Levanta el servidor de desarrollo de Next.js en `http://localhost:3000` con hot reload. Editás un archivo y se actualiza solo.

**Cuándo lo uso:** mientras programo o escribo contenido. Es lo que tenés abierto el 90% del tiempo.

**Tip:** si el puerto 3000 está ocupado:
```bash
PORT=3001 npm run dev
```

### `npm run build`

Genera el build estático de producción en `.next/`. Internamente:
1. Compila TypeScript.
2. Procesa MDX con remark/rehype.
3. Llama a `generateStaticParams()` en cada ruta dinámica → enumera todas las URLs.
4. Prerenderea cada URL a HTML estático.
5. Genera `sitemap.xml` y `robots.txt`.

**Cuándo lo uso:** antes de un push importante para verificar que no hay errores que dev no detecta (hay diferencias sutiles entre dev y build con SSG).

### `npm run start`

Sirve el build de `.next/` en `http://localhost:3000` como lo haría Vercel. Necesitás haber corrido `npm run build` antes.

**Cuándo lo uso:** raramente — para reproducir un bug que solo aparece en producción. Vercel previews son más útiles para esto.

### `npm test`

Corre Vitest una vez. Output esperado:
```
Test Files  4 passed (4)
     Tests  15 passed (15)
```

Si algún test falla, Vitest imprime el archivo, la línea, y el diff esperado vs actual.

### `npm run test:watch`

Vitest en modo watch — relanza los tests automáticamente cuando cambia un archivo. Útil durante TDD.

### `npm run typecheck`

Corre `tsc --noEmit` para chequear tipos sin generar JS. Catches errores que el editor a veces no muestra. **Correr antes de cada commit** (ahorrar pre-commit hook para más adelante).

### `npm run lint`

Corre ESLint con la config de `next/core-web-vitals`. Captura cosas como `<img>` en vez de `<Image>`, accesibilidad, etc.

---

## Estructura del trabajo de día a día

### Caso A: agregás una lección

Es 99% trabajo de contenido, no de código. Ver [authoring.md](authoring.md) — todo lo que necesitás está ahí.

```bash
# 1. arrancás dev
npm run dev

# 2. creás la carpeta + 5 archivos en content/courses/...
# 3. recargás la página en el browser y verificás
# 4. commit + push
git add content/
git commit -m "content: ..."
git push
```

### Caso B: agregás un nuevo componente MDX custom

Ejemplo: querés sumar un `<Teorema>` para enunciar teoremas con un estilo específico.

```bash
# 1. crear el componente
# components/mdx/Teorema.tsx
# 2. (opcional) escribir tests
# components/mdx/Teorema.test.tsx
# 3. registrarlo en el mapeo central
# components/mdx/MDXComponents.tsx — agregar la importación + key
# 4. usarlo en algún .mdx para probar
# 5. typecheck + tests + lint
npm run typecheck && npm test && npm run lint
# 6. commit
```

Ver `components/mdx/Ejercicio.tsx` como ejemplo de referencia.

### Caso C: tocás el scanner o los tipos

`lib/content.ts` y `lib/types.ts` son el corazón del sistema. **Cambios acá afectan todo:**

```bash
# 1. arrancá Vitest en watch
npm run test:watch

# 2. modificá tipos / scanner
# 3. los tests existentes te dicen si rompiste algo
# 4. agregá tests nuevos para el comportamiento nuevo (TDD)
# 5. corré build completo para confirmar que las páginas siguen funcionando
npm run build
# 6. commit
```

**Regla:** nunca commitear cambios al scanner sin que `npm test` pase 15/15 (o más, si agregaste tests nuevos).

### Caso D: tocás páginas o componentes

```bash
# 1. dev server
npm run dev

# 2. modificás el componente / página
# 3. recargás browser, verificás visualmente
# 4. mobile: usá DevTools responsive mode (Ctrl+Shift+M en Chrome)
# 5. si el componente tiene test, corré npm test
# 6. typecheck antes de commit
npm run typecheck
# 7. commit
```

---

## Testing

### Filosofía

- **TDD obligatorio** para lógica pura (scanner, helpers que no toquen UI).
- **Render tests** para componentes con interacción (TabPanel, YouTubePlayer).
- **No tests** para componentes presentacionales puros (Ejemplo, Definicion, LessonNav).
- **No E2E automatizados en v1** — el catálogo es chico, costo de mantenimiento no se justifica todavía.

### Estructura

Los tests viven junto al código que testean, con sufijo `.test.ts` o `.test.tsx`:

```
lib/content.ts
lib/content.test.ts          ← tests del scanner
components/mdx/Ejercicio.tsx
components/mdx/Ejercicio.test.tsx
```

Vitest los encuentra solo via el glob `**/*.test.{ts,tsx}` en `vitest.config.ts`.

### Patrones útiles

**Test de lógica pura (scanner):**
```ts
import { describe, it, expect } from 'vitest'
import { getCourse } from './content'

describe('getCourse', () => {
  it('strips numeric prefix from slugs', () => {
    const c = getCourse('_test-fixture')!
    expect(c.chapters[0].slug).toBe('cap-uno')
  })
})
```

**Test de componente con interacción:**
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabPanel } from './TabPanel'

it('switches tab on click', async () => {
  const user = userEvent.setup()
  render(<TabPanel tabs={[{ id: 'a', label: 'Alfa', content: <p>A</p> }]} />)
  // ... interactions + assertions
})
```

**Fixtures para el scanner:**
Hay un `content/courses/_test-fixture/` con datos mínimos. Está intencionalmente fuera del catálogo público (filtrado por prefijo `_` en `generateStaticParams`).

---

## Debugging

### Build falla en CI pero anda en dev

Causas comunes:
- Import casing inconsistente (Linux es case-sensitive, Windows no).
- Type error que dev silencia (`tsc --noEmit` lo detecta).
- Cliente vs servidor: un Client Component (`'use client'`) intentando importar algo server-only, o viceversa.

**Reproducir local:**
```bash
rm -rf .next
npm run build
```

### El video no carga / poster broken

- `youtubeId` mal escrito en `lesson.json`.
- El video es privado o fue eliminado.
- En dev en Windows, a veces el thumbnail tarda en cargar — esperar 2-3 segundos.

### Las fórmulas de KaTeX no se ven

- Verificá que `app/globals.css` tiene `@import 'katex/dist/katex.min.css';`.
- Sintaxis: inline es `$...$`, display es `$$...$$` con un blank line antes y después.
- Algunos comandos LaTeX no están soportados — chequear https://katex.org/docs/supported.html.

### Los diagramas Mermaid se ven como código

- Necesitás envolver el contenido en `{`...`}` (template literal):
  ```mdx
  <Diagrama>
  {`graph LR
    A --> B`}
  </Diagrama>
  ```
- Si lo escribís como texto plano, MDX se confunde con los caracteres especiales.

### Tests fallan con "ReferenceError: React is not defined"

`vitest.config.ts` tiene que tener `esbuild: { jsx: 'automatic' }`. Si lo sacaste por accidente, agregalo de nuevo.

### Cambié un componente Client y no se actualiza en dev

Hot reload a veces se queda colgado con componentes `'use client'`. Hacer un hard reload (Ctrl+Shift+R) suele resolver.

---

## Gotchas de Windows

- **CRLF vs LF:** git va a quejarse con warnings tipo "LF will be replaced by CRLF". Es cosmético, no afecta funcionalidad. Si te molesta:
  ```bash
  git config --global core.autocrlf input
  ```
- **Comandos `\` multi-línea:** funcionan en Git Bash y WSL, pero NO en PowerShell. En PowerShell usá backtick (`` ` ``) o ponelo todo en una línea.
- **Paths con espacios:** siempre entre comillas dobles. `cd "C:\Users\...\Proyectos\aprende"`.
- **Permisos:** evitar correr `npm install` desde `C:\Program Files\` o paths protegidos. Usar el directorio del usuario.

---

## Convenciones de código

- **TypeScript estricto.** Sin `any`. Si necesitás escape hatch, `unknown` + narrowing.
- **Sin comentarios redundantes.** El nombre de la función dice qué hace. Comentás solo el "por qué" si no es obvio.
- **Files chicos.** Si un archivo pasa de 200 líneas, considerar partirlo.
- **Imports absolutos con `@/`** para cualquier cosa fuera del directorio actual:
  ```ts
  import { getLesson } from '@/lib/content'    // ✓
  import { getLesson } from '../../../lib/content'  // ✗
  ```
- **CSS via Tailwind.** Evitar archivos `.css` separados salvo `globals.css`.
- **Server Components por default.** Solo agregar `'use client'` cuando se necesita interactividad o hooks.

---

## Workflow de commits

Estilo de mensaje:
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `chore:` config, dependencias, build
- `docs:` documentación
- `content:` lecciones nuevas o editadas
- `refactor:` reestructuración sin cambio funcional
- `test:` tests nuevos o cambios en tests

Ejemplos:
```
feat(mdx): agregar componente Teorema
fix(content): manejar lessons sin chapter.json
content: lección de límites
docs: actualizar guía de authoring
```

**Antes de cada commit (mientras no haya pre-commit hook):**
```bash
npm run typecheck && npm test
```

---

## Performance

Lighthouse target para v1: Performance > 90, Accessibility > 90, SEO > 95.

Cosas que ayudan:
- **YouTube lazy** (ya implementado) — el iframe no se carga hasta click.
- **next/font o system fonts** — usamos system fonts (config en `tailwind.config.ts`), sin descargas.
- **CSS pequeño** — Tailwind purga clases no usadas en build.
- **No bibliotecas runtime grandes** — Mermaid es la única excepción (~500kb), se carga dynamic en el componente Diagrama.

Si Lighthouse baja, primer sospechoso: imágenes (asegurarse que están optimizadas y usan `loading="lazy"`).

---

## Próximos cambios al sistema (post-v1)

Antes de tocar el código de áreas complejas, leer el spec original: `docs/superpowers/specs/2026-05-14-aprende-mvp-design.md`. Hay decisiones documentadas ahí que pueden no ser obvias del código.
