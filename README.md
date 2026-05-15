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
