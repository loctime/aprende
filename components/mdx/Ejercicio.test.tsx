import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Ejercicio } from './Ejercicio'
import { Solucion } from './Solucion'

describe('Ejercicio', () => {
  it('renders content and dificultad badge', () => {
    render(
      <Ejercicio dificultad="medio">
        <p>Calculá el dominio de f(x)</p>
      </Ejercicio>
    )
    expect(screen.getByText('Calculá el dominio de f(x)')).toBeInTheDocument()
    expect(screen.getByText(/medio/i)).toBeInTheDocument()
  })

  it('defaults dificultad to facil', () => {
    render(<Ejercicio><p>x</p></Ejercicio>)
    expect(screen.getByText(/fácil/i)).toBeInTheDocument()
  })
})

describe('Solucion', () => {
  it('starts collapsed', () => {
    render(
      <Solucion>
        <p>la respuesta es 42</p>
      </Solucion>
    )
    const details = screen.getByText(/ver solución/i).closest('details')
    expect(details).not.toBeNull()
    expect(details).not.toHaveAttribute('open')
  })
})
