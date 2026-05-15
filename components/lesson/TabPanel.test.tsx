import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabPanel } from './TabPanel'

const TABS = [
  { id: 'a', label: 'Alfa', content: <p>contenido alfa</p> },
  { id: 'b', label: 'Beta', content: <p>contenido beta</p> },
]

describe('TabPanel', () => {
  it('renders first tab by default', () => {
    render(<TabPanel tabs={TABS} />)
    expect(screen.getByText('contenido alfa')).toBeInTheDocument()
    expect(screen.queryByText('contenido beta')).toBeNull()
  })

  it('switches tab on click', async () => {
    const user = userEvent.setup()
    render(<TabPanel tabs={TABS} />)
    await user.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(screen.getByText('contenido beta')).toBeInTheDocument()
    expect(screen.queryByText('contenido alfa')).toBeNull()
  })
})
