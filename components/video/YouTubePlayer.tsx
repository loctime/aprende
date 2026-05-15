'use client'
import { useState } from 'react'

export function YouTubePlayer({
  videoId,
  title,
  startSec,
  endSec,
}: {
  videoId: string
  title: string
  startSec?: number
  endSec?: number
}) {
  const [loaded, setLoaded] = useState(false)

  const params = new URLSearchParams({ rel: '0', modestbranding: '1', autoplay: '1' })
  if (startSec !== undefined) params.set('start', String(startSec))
  if (endSec !== undefined) params.set('end', String(endSec))
  const src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`

  if (loaded) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      aria-label={`Reproducir ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/95 text-white shadow-lg transition group-hover:scale-110">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </span>
      </span>
      <span className="absolute bottom-2 left-2 right-2 truncate text-xs text-white/80">{title}</span>
    </button>
  )
}
