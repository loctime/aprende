import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllCourses, getLesson } from '@/lib/content'
import { YouTubePlayer } from '@/components/video/YouTubePlayer'
import { TabPanel, type Tab } from '@/components/lesson/TabPanel'
import { LessonNav } from '@/components/lesson/LessonNav'
import { CompiledMDX } from '@/components/lesson/CompiledMDX'

type Params = { curso: string; capitulo: string; leccion: string }

export function generateStaticParams(): Params[] {
  const out: Params[] = []
  for (const course of getAllCourses()) {
    if (course.slug.startsWith('_')) continue
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        out.push({ curso: course.slug, capitulo: chapter.slug, leccion: lesson.slug })
      }
    }
  }
  return out
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { curso, capitulo, leccion } = await params
  const data = getLesson(curso, capitulo, leccion)
  if (!data) return {}
  return {
    title: `${data.meta.title} — ${data.course.title}`,
    description: `${data.chapter.title} · ${data.course.title}`,
  }
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { curso, capitulo, leccion } = await params
  const data = getLesson(curso, capitulo, leccion)
  if (!data) notFound()

  const tabs: Tab[] = [
    { id: 'resumen', label: 'Resumen', content: <CompiledMDX source={data.tabs.resumen} /> },
    { id: 'ejercicios', label: 'Ejercicios', content: <CompiledMDX source={data.tabs.ejercicios} /> },
    { id: 'diagramas', label: 'Diagramas', content: <CompiledMDX source={data.tabs.diagramas} /> },
    { id: 'ejemplos', label: 'Ejemplos', content: <CompiledMDX source={data.tabs.ejemplos} /> },
  ]

  return (
    <section className="py-6">
      <nav className="text-sm text-ink-dim">
        <Link href="/cursos" className="hover:text-ink">Cursos</Link>{' / '}
        <Link href={`/cursos/${curso}`} className="hover:text-ink">{data.course.title}</Link>{' / '}
        <span>{data.chapter.title}</span>
      </nav>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{data.meta.title}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div>
          <YouTubePlayer
            videoId={data.meta.youtubeId}
            title={data.meta.title}
            startSec={data.meta.startSec}
            endSec={data.meta.endSec}
          />
          <p className="mt-2 text-xs text-ink-muted">
            Fuente: <a href={data.meta.sourceUrl} className="underline" target="_blank" rel="noopener">{data.meta.sourceAttribution}</a>
          </p>
        </div>
        <div>
          <TabPanel tabs={tabs} />
        </div>
      </div>

      <LessonNav navigation={data.navigation} />
    </section>
  )
}
