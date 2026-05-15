# Deployment

Cómo desplegar Aprende a producción y mantener el deploy saludable.

---

## Plataforma: Vercel

Aprende se despliega en Vercel. Es la opción natural por compatibilidad con Next.js, free tier amplio (suficiente para validar el producto), y deploys automáticos en cada push.

**Alternativas posibles** (no usadas en v1):
- **Cloudflare Pages** — más barato si el tráfico crece mucho, pero requiere configuración manual para Next.js App Router.
- **Netlify** — comparable a Vercel pero peor integración con Next.
- **Self-hosted** (VPS + Node) — más control, pero requiere mantenimiento manual.

---

## Setup inicial (one-time)

### 1. Conectar el repo a Vercel

1. Ir a [vercel.com](https://vercel.com) y loguearse con la cuenta de GitHub.
2. **New Project** → **Import Git Repository**.
3. Seleccionar `loctime/aprende`.
4. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detectado)
   - **Root Directory:** `.` (default)
   - **Build Command:** `npm run build` (default, no tocar)
   - **Output Directory:** `.next` (default, no tocar)
   - **Install Command:** `npm install` (default)
   - **Node.js Version:** 20.x o superior
5. **Environment Variables:** ninguna en v1 — todo es estático. Si llegamos a agregar Stripe, NextAuth, o DB, vamos a configurarlas acá.
6. **Deploy.**

Primer deploy toma 2-3 minutos. Te queda una URL tipo `aprende-xxxx.vercel.app`.

### 2. Verificación post-deploy

Abrir la URL de Vercel y testear el golden path:

1. **Landing (`/`)** — debe cargar con el hero y un botón "Ver cursos".
2. **Catálogo (`/cursos`)** — debe mostrar el curso "Matemáticas I".
3. **Curso (`/cursos/matematicas-i`)** — debe mostrar el capítulo "Funciones" con la lección "¿Qué es una función?".
4. **Lección (`/cursos/matematicas-i/funciones/que-es-una-funcion`)** — debe:
   - Mostrar el video con poster (NO el iframe todavía).
   - Click en el poster → carga el iframe de YouTube y empieza a reproducir.
   - Las 4 tabs cambian al hacer click. Resumen activa por default.
   - Fórmulas LaTeX renderizan (KaTeX).
   - Diagramas Mermaid se dibujan (puede tardar 1-2 seg en la primera carga del bundle).
5. **404** — entrar a `/cursos/no-existe` debe mostrar el not-found, no crashear.
6. **Mobile** — DevTools → responsive mode. El video y las tabs se apilan vertical.

### 3. Custom domain (cuando esté listo)

1. Comprar el dominio donde sea (Namecheap, Cloudflare Registrar, etc.).
2. En Vercel → Project Settings → **Domains** → **Add**.
3. Vercel te dice qué registros DNS configurar — típicamente:
   - `A` record apuntando a `76.76.21.21`, o
   - `CNAME` apuntando a `cname.vercel-dns.com`.
4. Vercel auto-provisiona el certificado SSL via Let's Encrypt.
5. Una vez propagado (5-30 min), actualizar:
   - `app/layout.tsx` — `metadataBase` para que OG images usen el dominio real.
   - `app/sitemap.ts` — la constante `BASE`.
   - `app/robots.ts` — la URL del sitemap.

```ts
// Cambiar de:
const BASE = 'https://aprende.app'
// a tu dominio real, ej:
const BASE = 'https://aprende.com.ar'
```

Commit + push → Vercel redeploya con la nueva URL canónica.

---

## Workflow de deploy continuo

Cada push a `main` desencadena un deploy de producción. Cada PR genera un **preview deployment** con su propia URL temporaria.

### Branch strategy

- **`main`** → producción (deploy automático)
- **`feat/*`** → branches de feature (cada uno genera preview deploy automáticamente al pushear)

Para v1 estamos pusheando directo a `main`. A medida que crezca el equipo o que haya tráfico real, conviene pasar a:
- PR obligatoria
- Branch protection en `main`
- Review approvals antes de merge

### Rollback rápido

Si un deploy rompe producción:

**Opción A — desde Vercel UI** (más rápido):
1. Project → **Deployments**
2. Encontrar el último deployment bueno
3. Click en `...` → **Promote to Production**

**Opción B — desde git** (limpio):
```bash
git revert <commit-sha-malo>
git push origin main
```

Vercel redeploya en 60-90 seg con el cambio revertido.

---

## Build process en detalle

Lo que Vercel corre cuando hacés push:

1. `npm install` → restaura `node_modules` (usa cache si nada cambió).
2. `npm run build` → ejecuta `next build`, que:
   - Compila TypeScript.
   - Procesa los `.mdx` con remark/rehype.
   - Llama a `generateStaticParams()` para enumerar todas las URLs.
   - Prerenderea cada URL a HTML estático (SSG).
   - Genera `sitemap.xml` y `robots.txt`.
   - Empaqueta JS, CSS, fuentes.
3. Vercel sube los archivos estáticos a su CDN global.
4. Vercel también deploya las **route handlers** y **server components** que son SSR (en v1 no hay — todo es SSG).

**Tiempo total típico:** 60-90 segundos para un build completo. Si solo cambian archivos de `content/`, Vercel usa cache y baja a 30-45 seg.

---

## Monitoreo

### Lo que viene gratis con Vercel

- **Build logs:** acceso completo desde el dashboard.
- **Runtime logs:** consola para errores en SSR/route handlers (en v1 vacío porque todo es SSG).
- **Web Analytics** (free tier): pageviews básicas, Core Web Vitals.

### Lo que conviene agregar cuando haya tráfico

- **Plausible o Umami** (open source, privacy-first) — analytics propios sin Google.
- **Sentry** (free hobby tier) — error tracking client-side.
- **Lighthouse CI** — Vercel ya corre Lighthouse en previews; podríamos publicar los scores en cada PR.

---

## Costos esperados

**Vercel free tier (Hobby):**
- 100GB de bandwidth por mes.
- 100GB-h de serverless functions (no usamos en v1).
- Build minutes ilimitadas.
- HTTPS automático.

**Estimación:** un sitio estático de 100 lecciones servido a 10.000 visitantes/mes ronda los 5-10 GB de bandwidth. Free tier sobra para validar el producto.

**Cuándo se cobra:**
- Pro plan ($20/mes/usuario) cuando se pasa el bandwidth, se necesita team collaboration, o se quieren analytics avanzados.
- A escala mayor (100k+ usuarios/mes), evaluar Cloudflare Pages que tiene bandwidth ilimitado en su free tier.

---

## Seguridad

### En v1 (sin auth, sin pagos)

- **No hay datos sensibles** — todo el contenido es público.
- **No hay env vars** — nada que filtrar.
- **HTTPS automático** via Vercel.
- **Headers de seguridad** vienen por default razonables; si querés endurecer:
  ```js
  // next.config.mjs
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }]
  }
  ```

### Cuando agreguemos auth + pagos

Vendrá un capítulo entero. Por ahora notas:
- Stripe keys → env vars en Vercel (NUNCA en código).
- NextAuth secrets → mismo lugar.
- DB connection string → mismo lugar, y considerar IP allowlisting.
- Rate limiting → Vercel Edge Functions o Upstash Redis.

---

## Checklist pre-launch (cuando vayas a producción "de verdad")

- [ ] Custom domain configurado.
- [ ] `metadataBase`, `sitemap.ts` BASE, `robots.ts` sitemap URL actualizados al dominio real.
- [ ] OG images visibles en Twitter/Facebook (probar con [opengraph.xyz](https://www.opengraph.xyz)).
- [ ] Google Search Console: agregar el sitio, submit del sitemap.
- [ ] Lighthouse score > 90 en las 4 categorías (Performance, A11y, Best Practices, SEO).
- [ ] Probado en mobile real (no solo DevTools responsive).
- [ ] Probado en Safari, Chrome, Firefox.
- [ ] Política de privacidad publicada (si vas a recolectar datos en el futuro).
- [ ] Términos de uso publicados.
- [ ] Plan de contingencia para takedowns de videos (un creador pide que saques su contenido — proceso documentado).
