import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  beforeEach(() => {
    document.title = 'app'
  })

  it('should render without crashing', () => {
    render(<App />)
    expect(screen.getByText('Vite + React')).toBeInTheDocument()
  })

  it('should have correct document title', () => {
    render(<App />)
    expect(document.title).toBe('app')
  })

  it('should render count button', () => {
    render(<App />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
