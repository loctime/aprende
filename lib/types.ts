export type LessonMeta = {
  slug: string
  title: string
  order: number
  youtubeId: string
  startSec?: number
  endSec?: number
  durationSec: number
  sourceUrl: string
  sourceAttribution: string
  freeTier: boolean
}

export type ChapterMeta = {
  slug: string
  title: string
  order: number
  summary?: string
}

export type CourseMeta = {
  slug: string
  title: string
  description: string
  level: 'inicial' | 'intermedio' | 'avanzado'
  coverImage?: string
}

export type Chapter = ChapterMeta & {
  lessons: LessonMeta[]
}

export type Course = CourseMeta & {
  chapters: Chapter[]
}

export type LessonContent = {
  meta: LessonMeta
  course: CourseMeta
  chapter: ChapterMeta
  tabs: {
    resumen: string
    ejercicios: string
    diagramas: string
    ejemplos: string
  }
  navigation: {
    prev: { courseSlug: string; chapterSlug: string; lessonSlug: string; title: string } | null
    next: { courseSlug: string; chapterSlug: string; lessonSlug: string; title: string } | null
  }
}
