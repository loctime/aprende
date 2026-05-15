import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YouTubePlayer } from './YouTubePlayer'

describe('YouTubePlayer', () => {
  it('renders poster (no iframe) by default', () => {
    render(<YouTubePlayer videoId="abc123" title="Lección X" />)
    expect(screen.getByRole('button', { name: /reproducir/i })).toBeInTheDocument()
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('loads iframe after user clicks play', async () => {
    const user = userEvent.setup()
    render(<YouTubePlayer videoId="abc123" title="Lección X" />)
    await user.click(screen.getByRole('button', { name: /reproducir/i }))
    expect(document.querySelector('iframe')).not.toBeNull()
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    expect(iframe.src).toContain('youtube.com/embed/abc123')
  })

  it('passes startSec and endSec to embed URL', async () => {
    const user = userEvent.setup()
    render(<YouTubePlayer videoId="xyz" title="t" startSec={30} endSec={120} />)
    await user.click(screen.getByRole('button', { name: /reproducir/i }))
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    expect(iframe.src).toContain('start=30')
    expect(iframe.src).toContain('end=120')
  })
})
