import type { MetadataRoute } from 'next'
import { getAllCourses } from '@/lib/content'

const BASE = 'https://aprende.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/cursos`, priority: 0.9 },
  ]
  for (const course of getAllCourses()) {
    if (course.slug.startsWith('_')) continue
    out.push({ url: `${BASE}/cursos/${course.slug}`, priority: 0.8 })
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        out.push({
          url: `${BASE}/cursos/${course.slug}/${chapter.slug}/${lesson.slug}`,
          priority: 0.7,
        })
      }
    }
  }
  return out
}
