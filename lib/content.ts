import fs from 'node:fs'
import path from 'node:path'
import type { Course, Chapter, LessonMeta, LessonContent, CourseMeta, ChapterMeta } from './types'

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'courses')

const PREFIX_RE = /^(\d+)-(.+)$/

function parsePrefixed(name: string): { order: number; slug: string } | null {
  const m = name.match(PREFIX_RE)
  if (!m) return null
  return { order: parseInt(m[1], 10), slug: m[2] }
}

function readJSON<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(n => !n.startsWith('.'))
}

function loadLesson(courseSlug: string, chapterDir: string, lessonDirName: string): LessonMeta | null {
  const parsed = parsePrefixed(lessonDirName)
  if (!parsed) return null
  const lessonPath = path.join(CONTENT_ROOT, courseSlug, chapterDir, lessonDirName)
  const metaPath = path.join(lessonPath, 'lesson.json')
  if (!fs.existsSync(metaPath)) return null
  const raw = readJSON<Omit<LessonMeta, 'slug' | 'order'>>(metaPath)
  return { ...raw, slug: parsed.slug, order: parsed.order }
}

function loadChapter(courseSlug: string, chapterDirName: string): Chapter | null {
  const parsed = parsePrefixed(chapterDirName)
  if (!parsed) return null
  const chapterPath = path.join(CONTENT_ROOT, courseSlug, chapterDirName)
  const metaPath = path.join(chapterPath, 'chapter.json')
  if (!fs.existsSync(metaPath)) return null
  const raw = readJSON<Omit<ChapterMeta, 'slug' | 'order'>>(metaPath)
  const lessons = listDirs(chapterPath)
    .map(d => loadLesson(courseSlug, chapterDirName, d))
    .filter((l): l is LessonMeta => l !== null)
    .sort((a, b) => a.order - b.order)
  return { ...raw, slug: parsed.slug, order: parsed.order, lessons }
}

function loadCourse(courseSlug: string): Course | null {
  const coursePath = path.join(CONTENT_ROOT, courseSlug)
  const metaPath = path.join(coursePath, 'course.json')
  if (!fs.existsSync(metaPath)) return null
  const raw = readJSON<Omit<CourseMeta, 'slug'>>(metaPath)
  const chapters = listDirs(coursePath)
    .map(d => loadChapter(courseSlug, d))
    .filter((c): c is Chapter => c !== null)
    .sort((a, b) => a.order - b.order)
  return { ...raw, slug: courseSlug, chapters }
}

export function getAllCourses(): Course[] {
  return listDirs(CONTENT_ROOT)
    .map(loadCourse)
    .filter((c): c is Course => c !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function getCourse(slug: string): Course | null {
  return loadCourse(slug)
}

function findDirNameBySlug(parent: string, slug: string): string | null {
  for (const name of listDirs(parent)) {
    const parsed = parsePrefixed(name)
    if (parsed?.slug === slug) return name
  }
  return null
}

function readTab(lessonDir: string, name: string): string {
  const filePath = path.join(lessonDir, `${name}.mdx`)
  if (!fs.existsSync(filePath)) return ''
  return fs.readFileSync(filePath, 'utf-8')
}

export function getLesson(courseSlug: string, chapterSlug: string, lessonSlug: string): LessonContent | null {
  const course = loadCourse(courseSlug)
  if (!course) return null

  const chapterIdx = course.chapters.findIndex(c => c.slug === chapterSlug)
  if (chapterIdx === -1) return null
  const chapter = course.chapters[chapterIdx]

  const lessonIdx = chapter.lessons.findIndex(l => l.slug === lessonSlug)
  if (lessonIdx === -1) return null
  const lesson = chapter.lessons[lessonIdx]

  const chapterDirName = findDirNameBySlug(path.join(CONTENT_ROOT, courseSlug), chapterSlug)
  if (!chapterDirName) return null
  const lessonDirName = findDirNameBySlug(path.join(CONTENT_ROOT, courseSlug, chapterDirName), lessonSlug)
  if (!lessonDirName) return null
  const lessonDir = path.join(CONTENT_ROOT, courseSlug, chapterDirName, lessonDirName)

  const tabs = {
    resumen: readTab(lessonDir, 'resumen'),
    ejercicios: readTab(lessonDir, 'ejercicios'),
    diagramas: readTab(lessonDir, 'diagramas'),
    ejemplos: readTab(lessonDir, 'ejemplos'),
  }

  const flat = course.chapters.flatMap(c =>
    c.lessons.map(l => ({ courseSlug, chapterSlug: c.slug, lessonSlug: l.slug, title: l.title }))
  )
  const here = flat.findIndex(x => x.chapterSlug === chapterSlug && x.lessonSlug === lessonSlug)
  const prev = here > 0 ? flat[here - 1] : null
  const next = here < flat.length - 1 ? flat[here + 1] : null

  const { chapters: _ignored, ...courseMeta } = course
  const { lessons: _ignored2, ...chapterMeta } = chapter
  return { meta: lesson, course: courseMeta, chapter: chapterMeta, tabs, navigation: { prev, next } }
}
