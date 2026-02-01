import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

describe('App Component', () => {
  beforeEach(() => {
    document.title = 'app'
  })

  it('should render the command center header and primary action', () => {
    render(<App />)
    expect(screen.getByText('TASK COMMAND CENTER')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /NEW TASK/i })
    ).toBeInTheDocument()
  })

  it('should render all status columns', () => {
    render(<App />)
    const statuses = ['BACKLOG', 'TODO', 'IN PROGRESS', 'REVIEW', 'DONE']
    statuses.forEach(status => {
      expect(screen.getAllByText(status).length).toBeGreaterThan(0)
    })
  })

  it('should render seeded tasks and filter controls', async () => {
    render(<App />)
    expect(screen.getByLabelText('SEARCH')).toBeInTheDocument()
    expect(screen.getByLabelText('STATUS FILTER')).toBeInTheDocument()
    expect(screen.getByLabelText('VIEW MODE')).toBeInTheDocument()
    expect(await screen.findByText('ALIGN DESIGN TOKENS')).toBeInTheDocument()
  })

  it('should set the document title', async () => {
    render(<App />)
    await waitFor(() => {
      expect(document.title).toBe('RALPH TASKS')
    })
  })
})
