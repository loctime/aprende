import { describe, it, expect } from 'vitest'
import { getAllCourses, getCourse, getLesson } from './content'

const FIXTURE = '_test-fixture'

describe('content scanner', () => {
  it('lists all courses', () => {
    const courses = getAllCourses()
    const fixture = courses.find(c => c.slug === FIXTURE)
    expect(fixture).toBeDefined()
    expect(fixture!.title).toBe('Curso de prueba')
  })

  it('strips numeric prefix from chapter and lesson slugs', () => {
    const course = getCourse(FIXTURE)
    expect(course).not.toBeNull()
    expect(course!.chapters.map(c => c.slug)).toEqual(['cap-uno', 'cap-dos'])
    expect(course!.chapters[0].lessons.map(l => l.slug)).toEqual(['leccion-uno', 'leccion-dos'])
  })

  it('orders chapters and lessons by numeric prefix', () => {
    const course = getCourse(FIXTURE)!
    expect(course.chapters[0].order).toBe(1)
    expect(course.chapters[1].order).toBe(2)
    expect(course.chapters[0].lessons[0].order).toBe(1)
    expect(course.chapters[0].lessons[1].order).toBe(2)
  })

  it('returns null for missing course', () => {
    expect(getCourse('does-not-exist')).toBeNull()
  })

  it('loads a single lesson with all 4 tabs and navigation', () => {
    const lesson = getLesson(FIXTURE, 'cap-uno', 'leccion-uno')
    expect(lesson).not.toBeNull()
    expect(lesson!.meta.title).toBe('Lección uno')
    expect(lesson!.meta.youtubeId).toBe('abc123')
    expect(lesson!.tabs).toHaveProperty('resumen')
    expect(lesson!.tabs).toHaveProperty('ejercicios')
    expect(lesson!.tabs).toHaveProperty('diagramas')
    expect(lesson!.tabs).toHaveProperty('ejemplos')
    expect(lesson!.navigation.prev).toBeNull()
    expect(lesson!.navigation.next?.lessonSlug).toBe('leccion-dos')
  })

  it('navigation crosses chapter boundaries', () => {
    const last = getLesson(FIXTURE, 'cap-uno', 'leccion-dos')!
    expect(last.navigation.next?.chapterSlug).toBe('cap-dos')
    expect(last.navigation.next?.lessonSlug).toBe('leccion-tres')

    const first = getLesson(FIXTURE, 'cap-dos', 'leccion-tres')!
    expect(first.navigation.prev?.chapterSlug).toBe('cap-uno')
    expect(first.navigation.next).toBeNull()
  })

  it('returns null for missing lesson', () => {
    expect(getLesson(FIXTURE, 'cap-uno', 'no-existe')).toBeNull()
  })
})
