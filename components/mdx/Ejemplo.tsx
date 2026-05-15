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
