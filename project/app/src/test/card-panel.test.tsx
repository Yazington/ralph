import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  Panel,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

describe('Card and Panel Components', () => {
  describe('Card Component', () => {
    it('should render with default styling', () => {
      render(<Card>Test Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('text-card-foreground')
      expect(card).toHaveClass('rounded-md')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('border-border/20')
      expect(card).toHaveClass('shadow-sm')
      expect(card).toHaveClass('py-4')
      expect(card).toHaveClass('flex')
      expect(card).toHaveClass('flex-col')
      expect(card).toHaveClass('gap-6')
    })

    it('should apply hover variant', () => {
      render(<Card variant="hover">Hover Card</Card>)
      const card = screen.getByText('Hover Card').closest('[data-slot="card"]')
      expect(card).toHaveClass('transition-colors')
      expect(card).toHaveClass('hover:border-primary')
    })

    it('should apply padding variant "none"', () => {
      render(<Card padding="none">No Padding</Card>)
      const card = screen.getByText('No Padding').closest('[data-slot="card"]')
      expect(card).not.toHaveClass('py-4')
      expect(card).not.toHaveClass('p-4')
    })

    it('should apply padding variant "panel"', () => {
      render(<Card padding="panel">Panel Padding</Card>)
      const card = screen
        .getByText('Panel Padding')
        .closest('[data-slot="card"]')
      expect(card).toHaveClass('p-4')
      expect(card).not.toHaveClass('py-4')
    })

    it('should combine variant and padding', () => {
      render(
        <Card variant="hover" padding="panel">
          Combined
        </Card>
      )
      const card = screen.getByText('Combined').closest('[data-slot="card"]')
      expect(card).toHaveClass('hover:border-primary')
      expect(card).toHaveClass('p-4')
    })
  })

  describe('Card Subcomponents', () => {
    it('should render CardHeader with correct padding', () => {
      render(<CardHeader>Header</CardHeader>)
      const header = screen.getByText('Header')
      expect(header).toHaveClass('px-4')
      // pb-4 only applies when .border-b is present
      expect(header).not.toHaveClass('pb-4')
    })

    it('should render CardTitle with uppercase', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByText('Title')
      expect(title).toHaveClass('uppercase')
      expect(title).toHaveClass('font-semibold')
    })

    it('should render CardDescription with uppercase and muted', () => {
      render(<CardDescription>Description</CardDescription>)
      const desc = screen.getByText('Description')
      expect(desc).toHaveClass('uppercase')
      expect(desc).toHaveClass('text-muted-foreground')
      expect(desc).toHaveClass('text-sm')
    })

    it('should render CardContent with padding', () => {
      render(<CardContent>Content</CardContent>)
      const content = screen.getByText('Content')
      expect(content).toHaveClass('px-4')
    })

    it('should render CardFooter with padding', () => {
      render(<CardFooter>Footer</CardFooter>)
      const footer = screen.getByText('Footer')
      expect(footer).toHaveClass('px-4')
      // pt-4 only applies when .border-t is present
      expect(footer).not.toHaveClass('pt-4')
    })
  })

  describe('Panel Component', () => {
    it('should render with panel styling', () => {
      render(<Panel>Test Panel</Panel>)
      const panel = screen.getByText('Test Panel')
      expect(panel).toBeInTheDocument()
      expect(panel).toHaveClass('bg-card')
      expect(panel).toHaveClass('text-card-foreground')
      expect(panel).toHaveClass('rounded-md')
      expect(panel).toHaveClass('border')
      expect(panel).toHaveClass('border-border/20')
      expect(panel).toHaveClass('p-4')
    })

    it('should accept custom className', () => {
      render(<Panel className="custom-class">Panel</Panel>)
      const panel = screen.getByText('Panel')
      expect(panel).toHaveClass('custom-class')
    })
  })

  describe('Design System Compliance', () => {
    it('should have border with 20% opacity', () => {
      render(<Card>Test</Card>)
      const card = screen.getByText('Test').closest('[data-slot="card"]')
      expect(card?.className).toContain('border-border/20')
    })

    it('should have medium border radius (rounded-md)', () => {
      render(<Card>Test</Card>)
      const card = screen.getByText('Test').closest('[data-slot="card"]')
      expect(card).toHaveClass('rounded-md')
    })

    it('should have deep panel background color', () => {
      render(<Card>Test</Card>)
      const card = screen.getByText('Test').closest('[data-slot="card"]')
      expect(card).toHaveClass('bg-card')
    })

    it('should have uppercase text in title and description', () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </Card>
      )
      expect(screen.getByText('Title')).toHaveClass('uppercase')
      expect(screen.getByText('Desc')).toHaveClass('uppercase')
    })
  })
})
