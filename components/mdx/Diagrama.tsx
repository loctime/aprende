'use client'
import { useEffect, useId, useState, type ReactNode } from 'react'

function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && 'props' in node) {
    const props = (node as { props: { children?: ReactNode } }).props
    return extractText(props.children)
  }
  return ''
}

export function Diagrama({
  children,
  source,
}: {
  children?: ReactNode
  source?: string
}) {
  const id = useId().replace(/:/g, '')
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const code = (source ?? extractText(children)).trim()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!code) {
        if (!cancelled) setError('Diagrama vacío — no se recibió código Mermaid.')
        return
      }
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' })
        const { svg } = await mermaid.render(`m-${id}`, code)
        if (!cancelled) setSvg(svg)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => { cancelled = true }
  }, [code, id])

  if (error) {
    return (
      <div className="my-5 rounded border border-rose-500/50 bg-rose-500/5 p-3 text-sm text-rose-300">
        <div className="font-medium">Error renderizando diagrama: {error}</div>
        {code && (
          <pre className="mt-2 overflow-x-auto rounded bg-black/30 p-2 text-xs text-rose-200">{code}</pre>
        )}
      </div>
    )
  }
  return (
    <div
      className="my-5 flex justify-center overflow-x-auto rounded border border-ink-muted/30 bg-bg-soft p-4"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {!svg ? <div className="text-xs text-ink-dim">Renderizando diagrama…</div> : null}
    </div>
  )
}
