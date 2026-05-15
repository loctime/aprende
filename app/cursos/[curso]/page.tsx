import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllCourses, getCourse } from '@/lib/content'

type Params = { curso: string }

export function generateStaticParams(): Params[] {
  return getAllCourses()
    .filter(c => !c.slug.startsWith('_'))
    .map(c => ({ curso: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { curso } = await params
  const c = getCourse(curso)
  if (!c) return {}
  return { title: c.title, description: c.description }
}

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const { curso } = await params
  const course = getCourse(curso)
  if (!course || course.slug.startsWith('_')) notFound()

  return (
    <section className="py-8">
      <Link href="/cursos" className="text-sm text-ink-dim hover:text-ink">← Cursos</Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{course.title}</h1>
      <p className="mt-2 text-ink-dim">{course.description}</p>

      <div className="mt-8 space-y-6">
        {course.chapters.map(ch => (
          <article key={ch.slug}>
            <h2 className="text-xl font-semibold">{ch.title}</h2>
            {ch.summary && <p className="mt-1 text-sm text-ink-dim">{ch.summary}</p>}
            <ol className="mt-3 space-y-2">
              {ch.lessons.map(l => (
                <li key={l.slug}>
                  <Link
                    href={`/cursos/${course.slug}/${ch.slug}/${l.slug}`}
                    className="flex items-center justify-between rounded-md border border-ink-muted/20 bg-bg-card p-3 hover:border-brand/40 hover:bg-bg-soft"
                  >
                    <span className="text-sm">{l.order}. {l.title}</span>
                    <span className="text-xs text-ink-muted">{Math.round(l.durationSec / 60)} min</span>
                  </Link>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  )
}
