# Authoring — cómo escribir contenido

Esta es la guía práctica para agregar lecciones y escribir material. Si querés entender por qué está diseñado así, mirá [architecture.md](architecture.md).

---

## Modelo mental

```
Curso          (matematicas-i)
  └─ Capítulo    (01-funciones)
      └─ Lección  (01-que-es-una-funcion)
          ├─ video de YouTube (referencia)
          └─ 4 tabs (resumen, ejercicios, diagramas, ejemplos)
```

Cada lección dura idealmente **10-15 minutos** de video. Si el video original es más largo, se "corta" con `startSec`/`endSec` en `lesson.json` (sin rehospedar — usamos los parámetros del iframe oficial de YouTube).

---

## Estructura de carpetas

```
content/courses/
└── <curso-slug>/
    ├── course.json              ← metadata del curso
    └── <NN-capitulo-slug>/
        ├── chapter.json         ← metadata del capítulo
        └── <NN-leccion-slug>/
            ├── lesson.json      ← metadata de la lección
            ├── resumen.mdx      ← tab 1
            ├── ejercicios.mdx   ← tab 2
            ├── diagramas.mdx    ← tab 3
            └── ejemplos.mdx     ← tab 4
```

**Reglas de nombres:**
- Cursos: sin prefijo numérico. Slug = nombre del directorio. Ej: `matematicas-i`, `programacion-web`, `cocina-basica`.
- Capítulos y lecciones: con prefijo `NN-` (2 dígitos preferido, 1 o 3 también funcionan). El número determina el orden; el slug expuesto al usuario es el resto. Ej: `01-funciones` → URL `/cursos/matematicas-i/funciones`.
- Slugs: minúsculas, sin tildes, palabras separadas con guiones. Ej: `que-es-una-funcion`, no `qué_es_una_función`.
- Directorios con nombre que empieza con `_` (ej: `_test-fixture`) se usan para tests y se ocultan de la lista pública.

---

## JSON schemas

### `course.json`

```json
{
  "title": "Matemáticas I",
  "description": "Curso introductorio: funciones, límites, derivadas e integrales.",
  "level": "inicial"
}
```

Campos:
- `title` (string, requerido)
- `description` (string, requerido) — texto corto, aparece en el catálogo
- `level` (`"inicial" | "intermedio" | "avanzado"`, requerido)
- `coverImage` (string, opcional) — path relativo a `public/` (no usado en v1)

### `chapter.json`

```json
{
  "title": "Funciones",
  "summary": "Concepto de función, dominio, rango, tipos de funciones."
}
```

Campos:
- `title` (string, requerido)
- `summary` (string, opcional) — texto corto en la página del curso

### `lesson.json`

```json
{
  "title": "¿Qué es una función?",
  "youtubeId": "GZJa82k__uo",
  "durationSec": 600,
  "sourceUrl": "https://www.youtube.com/watch?v=GZJa82k__uo",
  "sourceAttribution": "Pi-ensa Matematik",
  "freeTier": true
}
```

Campos:
- `title` (string, requerido)
- `youtubeId` (string, requerido) — el ID del video, NO la URL completa
- `durationSec` (number, requerido) — duración en segundos
- `startSec` (number, opcional) — si la lección es un chunk de un video más largo
- `endSec` (number, opcional) — fin del chunk
- `sourceUrl` (string, requerido) — URL completa de YouTube para atribución
- `sourceAttribution` (string, requerido) — nombre del canal/creador
- `freeTier` (boolean, requerido) — `true` en v1 para todas; `false` cuando agreguemos paywall

**De dónde sacás los datos del video:**

```bash
# Title + channel via oEmbed (público, sin auth):
curl "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json"

# Para duración exacta podés usar yt-dlp:
yt-dlp --print duration "https://www.youtube.com/watch?v=VIDEO_ID"
```

---

## Sintaxis MDX

Los archivos `.mdx` son Markdown estándar con la posibilidad de usar componentes React inline. Más todos los plugins configurados: math con `$...$`, diagramas con `<Diagrama>`, y los componentes custom de abajo.

### Markdown básico

```mdx
# Heading 1
## Heading 2

Párrafo normal con **negrita**, *cursiva*, `código inline`.

- Bullet
- Lista
  - Anidada

1. Numerada
2. Otra

> Cita

| Columna | Otra |
|---|---|
| valor | valor |

[Link](https://example.com)
```

### Math con KaTeX

**Inline:** rodeá la expresión con `$...$`:

```
La función $f(x) = x^2$ es una parábola.
```

**Display (centrado en su propia línea):** doble dólar `$$...$$`:

```
$$
f(x) = \frac{1}{1 + e^{-x}}
$$
```

KaTeX soporta la mayoría de LaTeX matemático. Algunos ejemplos útiles:

| LaTeX | Render |
|---|---|
| `\frac{a}{b}` | fracción |
| `\sqrt{x}`, `\sqrt[3]{x}` | raíz cuadrada, cúbica |
| `x^2`, `x_i` | superíndice, subíndice |
| `\sum_{i=1}^n`, `\prod`, `\int` | sumatoria, productoria, integral |
| `\lim_{x \to 0}` | límite |
| `\mathbb{R}`, `\mathbb{N}` | conjuntos blackboard |
| `\to`, `\in`, `\subset`, `\cup`, `\cap` | flechas, conjuntos |
| `\leq`, `\geq`, `\neq`, `\approx` | comparadores |
| `\alpha, \beta, \gamma, \pi, \theta` | griegas |
| `\begin{cases} ... \end{cases}` | función a tramos |

**Lista completa de símbolos soportados:** https://katex.org/docs/supported.html

### Componentes MDX custom

Los siguientes componentes están disponibles globalmente en cualquier `.mdx` — no hay que importarlos.

#### `<Definicion>`

Caja resaltada para definir un término clave. Usada típicamente en `resumen.mdx`.

```mdx
<Definicion termino="función">
Sea $A$ el dominio y $B$ el codominio. Una función $f: A \to B$ asigna a cada $x \in A$ un único $f(x) \in B$.
</Definicion>
```

Props:
- `termino` (string, requerido) — el término a definir

#### `<Ejemplo>`

Caja para un ejemplo trabajado. Usada típicamente en `ejemplos.mdx`.

```mdx
<Ejemplo titulo="Ejemplo 1: función lineal">
Sea $f(x) = 2x + 3$.

| $x$ | $f(x)$ |
|---|---|
| 0 | 3 |
| 1 | 5 |

A cada $x$ le corresponde un único $f(x)$.
</Ejemplo>
```

Props:
- `titulo` (string, opcional)

#### `<Ejercicio>` + `<Solucion>`

Bloque de ejercicio con solución colapsable. Usado en `ejercicios.mdx`. El nivel de dificultad cambia el color del borde (verde / ámbar / rosa).

```mdx
<Ejercicio dificultad="medio">
Encontrá el dominio de $g(x) = \sqrt{x - 5}$.

<Solucion>
El radicando debe ser $\geq 0$:
$$x - 5 \geq 0 \implies x \geq 5$$
**Dominio:** $[5, \infty)$.
</Solucion>
</Ejercicio>
```

`<Ejercicio>` props:
- `dificultad` (`"facil" | "medio" | "dificil"`, opcional, default `"facil"`)

`<Solucion>` props: ninguna. Empieza cerrada (`<details>` sin `open`). El usuario hace click para revelarla.

#### `<Diagrama>` — Mermaid

Renderiza un diagrama de Mermaid. **El contenido tiene que ser un template literal** (entre llaves y backticks) porque el parser de MDX se confunde con caracteres especiales si lo escribís como texto plano.

```mdx
<Diagrama>
{`graph LR
  A[Dominio] --> B[f]
  B --> C[Codominio]
  style B fill:#2563eb,color:#fff`}
</Diagrama>
```

Soporta todos los tipos de Mermaid: flowcharts, sequence diagrams, class diagrams, state diagrams, gantt, etc. Tema configurado: `dark`.

**Documentación de Mermaid:** https://mermaid.js.org/intro/

**Tip de estilo:** para resaltar nodos con la paleta del sitio, usá `fill:#2563eb` (brand), `fill:#059669` (success/imagen), `fill:#dc2626` (alerta).

---

## Paso a paso: agregar una lección nueva

Asumiendo que el curso (`matematicas-i`) y el capítulo (`01-funciones`) ya existen.

### 1. Conseguí el video y los datos

```bash
# Reemplazá VIDEO_ID con el ID real (lo que va después de ?v= en la URL)
curl "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json"
```

Anotá: título, nombre del canal (`author_name`).

Para la duración, si tenés `yt-dlp` instalado:
```bash
yt-dlp --print duration "https://www.youtube.com/watch?v=VIDEO_ID"
```

### 2. Creá la carpeta de la lección

Numerá la lección según donde va en el orden del capítulo. Si ya hay `01-` y `02-`, la nueva es `03-`.

```bash
mkdir -p content/courses/matematicas-i/01-funciones/03-dominio-y-rango
cd content/courses/matematicas-i/01-funciones/03-dominio-y-rango
```

### 3. Creá `lesson.json`

```json
{
  "title": "Dominio y rango",
  "youtubeId": "VIDEO_ID_AQUI",
  "durationSec": 720,
  "sourceUrl": "https://www.youtube.com/watch?v=VIDEO_ID_AQUI",
  "sourceAttribution": "Nombre del canal",
  "freeTier": true
}
```

### 4. Creá los 4 archivos MDX

**`resumen.mdx`** — qué se aprende en la lección, conceptos clave, notación. Texto + algunas fórmulas + 1-2 `<Definicion>`.

**`ejemplos.mdx`** — 2-4 ejemplos trabajados. Cada uno en un `<Ejemplo titulo="...">`. Mostrar cálculo paso a paso.

**`ejercicios.mdx`** — 5-8 ejercicios variados en dificultad. Cada uno en un `<Ejercicio dificultad="...">` con su `<Solucion>` colapsable. Mezclá fáciles (warm-up) y difíciles (consolidación).

**`diagramas.mdx`** — 1-3 diagramas visuales que aclaren conceptos. Usar `<Diagrama>` con Mermaid. Si no hay diagrama útil para la lección, dejá el archivo con una sola línea: `(Esta lección no requiere diagramas adicionales — el video los muestra.)`.

### 5. Verificá localmente

```bash
npm run dev
```

Visitá:
- `http://localhost:3000/cursos/matematicas-i` — la nueva lección debería aparecer en el capítulo.
- `http://localhost:3000/cursos/matematicas-i/funciones/dominio-y-rango` — la página de la lección.

Probá las 4 tabs. Verificá que el video carga al clickear el poster. Verificá que las fórmulas y diagramas renderizan bien.

### 6. Build de producción local (opcional pero recomendado)

```bash
npm run build
```

Debería terminar sin errores y prerenderar la nueva URL.

### 7. Commit y push

```bash
git checkout -b content/dominio-y-rango      # opcional, podés ir directo a main
git add content/
git commit -m "content: lección dominio y rango"
git push origin main                          # o abrí PR
```

Vercel deploya automáticamente.

---

## Guías de calidad para el contenido

### Resumen

- **Longitud:** 200-500 palabras. Si es más largo, partilo en secciones con `##`.
- **Tono:** directo, sin floritura. Decí qué es, no cómo lo vas a explicar.
- **Definiciones:** 1-2 por lección, máximo 3. No es un diccionario.
- **No copies el video.** El resumen es para alguien que ya vio (o va a ver) el video y quiere consolidar.

### Ejercicios

- **Variación de dificultad:** primero `facil` (aplicación directa de lo aprendido), después `medio` (combinar conceptos), uno o dos `dificil` (extender).
- **Soluciones completas:** no solo "x = 5". Mostrar el paso a paso. El usuario aprende del proceso, no del resultado.
- **Diversidad de tipos:** no sean todos "calculá esto". Mezclá conceptuales ("¿es función?"), de cálculo, de aplicación, de demostración.
- **5-8 ejercicios por lección.** Menos parece pobre, más cansa.

### Ejemplos

- **2-4 ejemplos por lección.**
- **Mostrar variación:** ejemplo positivo + contraejemplo + caso límite.
- **Paso a paso visible:** cada paso en una nueva línea, no condensado.

### Diagramas

- **Cuando ayudan, usalos.** Cuando no, no inflés.
- **1-3 por lección.** Más es ruido visual.
- **Etiquetas claras.** Usá math notation en los nodos si ayuda (`x_1`, `f(x)`).

### Atribución

- Siempre poné el nombre real del canal en `sourceAttribution`. Es lo correcto legal y éticamente, y aparece visible en la página de lección.
- Si en algún momento un creador pide que no usemos su video, sacalo (deshacé el commit del directorio de la lección y remové el slug de cualquier referencia).

---

## Workflow asistido por IA

El flujo intencionado para producir lecciones con calidad alta y velocidad razonable:

1. **Vos elegís el video.** Buscás en YouTube uno bueno para el tema que querés cubrir.
2. **Corrés el pipeline de ingesta** (cuando exista — pendiente):
   ```bash
   npm run ingest -- https://youtube.com/watch?v=XXX
   ```
   Eso baja transcript + frames + arma un BRIEF.md en `drafts/<id>/`.
3. **Le pasás el draft a Claude en chat:**
   > "Ingerí drafts/XXX — curso matematicas-i, capítulo funciones, lección dominio-y-rango"
4. **Claude genera los 4 MDX** leyendo el transcript y los frames. Te queda un primer borrador de calidad media-alta en `content/...`.
5. **Vos revisás** cada archivo. Ajustás tono, corregís errores matemáticos, agregás ejercicios propios.
6. **Commit + push.**

**Mientras no existe `npm run ingest`,** el paso 2 lo hacés a mano: copias el transcript (subtítulos auto-generados de YouTube) en un archivo, lo pegás en chat, y Claude trabaja con eso.
