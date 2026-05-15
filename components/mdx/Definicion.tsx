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
