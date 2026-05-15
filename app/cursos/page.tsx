import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllCourses } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Catálogo de cursos disponibles en Aprende.',
}

export default function CoursesPage() {
  const courses = getAllCourses().filter(c => !c.slug.startsWith('_'))

  return (
    <section className="py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Cursos</h1>
      {courses.length === 0 ? (
        <p className="mt-6 text-ink-dim">Todavía no hay cursos publicados.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <li key={course.slug}>
              <Link
                href={`/cursos/${course.slug}`}
                className="block rounded-lg border border-ink-muted/30 bg-bg-card p-5 transition hover:border-brand/50 hover:bg-bg-soft"
              >
                <div className="text-xs uppercase tracking-wide text-ink-muted">{course.level}</div>
                <h2 className="mt-2 text-lg font-semibold">{course.title}</h2>
                <p className="mt-2 text-sm text-ink-dim">{course.description}</p>
                <div className="mt-3 text-xs text-ink-muted">
                  {course.chapters.length} capítulos · {course.chapters.reduce((n, c) => n + c.lessons.length, 0)} lecciones
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
