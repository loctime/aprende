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
