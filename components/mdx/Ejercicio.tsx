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
