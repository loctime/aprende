import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { mdxComponents } from '@/components/mdx/MDXComponents'

export function CompiledMDX({ source }: { source: string }) {
  if (!source.trim()) {
    return <p className="text-ink-muted italic">(Sin contenido todavía.)</p>
  }
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [[rehypeKatex, { strict: false, output: 'mathml' }]],
        },
      }}
    />
  )
}
