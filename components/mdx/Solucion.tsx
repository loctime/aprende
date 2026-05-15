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
