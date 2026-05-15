import Link from 'next/link'
import type { LessonContent } from '@/lib/types'

export function LessonNav({ navigation }: { navigation: LessonContent['navigation'] }) {
  return (
    <nav className="mt-6 flex flex-col gap-2 border-t border-ink-muted/20 pt-4 sm:flex-row sm:justify-between">
      {navigation.prev ? (
        <Link
          href={`/cursos/${navigation.prev.courseSlug}/${navigation.prev.chapterSlug}/${navigation.prev.lessonSlug}`}
          className="rounded-md border border-ink-muted/30 px-4 py-2 text-sm hover:bg-bg-soft"
        >
          ← <span className="text-ink-dim">Anterior:</span> {navigation.prev.title}
        </Link>
      ) : (
        <span />
      )}
      {navigation.next ? (
        <Link
          href={`/cursos/${navigation.next.courseSlug}/${navigation.next.chapterSlug}/${navigation.next.lessonSlug}`}
          className="rounded-md border border-brand bg-brand/10 px-4 py-2 text-sm hover:bg-brand/20"
        >
          <span className="text-ink-dim">Siguiente:</span> {navigation.next.title} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
