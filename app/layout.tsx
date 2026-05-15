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
