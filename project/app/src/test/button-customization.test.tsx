import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Button Customization for Design System', () => {
  describe('CSS Variables', () => {
    it('should have design system colors in index.css', () => {
      const indexCssPath = resolve(__dirname, './index.css')
      expect(existsSync(indexCssPath), 'index.css should exist').toBe(true)

      const indexCss = readFileSync(indexCssPath, 'utf-8')

      // Check background colors (note: CSS uses lowercase hex values)
      expect(indexCss).toContain('--background: #090b0d')
      expect(indexCss).toContain('--card: #0b1013')
      expect(indexCss).toContain('--primary: #132e2c')
      expect(indexCss).toContain('--secondary: #0b1013')
      expect(indexCss).toContain('--muted: #101d1e')
      expect(indexCss).toContain('--border: #2b2c2d')
      expect(indexCss).toContain('--input: #101d1e')

      // Check text colors (note: CSS uses lowercase hex values)
      expect(indexCss).toContain('--foreground: #ffffff')
      expect(indexCss).toContain('--primary-foreground: #ffffff')
      expect(indexCss).toContain('--secondary-foreground: #ffffff')
      expect(indexCss).toContain('--muted-foreground: #a1a1aa')

      // Check radius
      expect(indexCss).toContain('--radius: 0.375rem')
    })

    it('should have uppercase text transform in root selector', () => {
      const indexCssPath = resolve(__dirname, './index.css')
      const indexCss = readFileSync(indexCssPath, 'utf-8')
      expect(indexCss).toContain('text-transform: uppercase')
    })
  })

  describe('Button Component', () => {
    it('should render with uppercase text', () => {
      render(<Button>TEST BUTTON</Button>)
      const button = screen.getByRole('button', { name: /TEST BUTTON/i })
      expect(button).toBeInTheDocument()
      // Check that uppercase class is present in button
      expect(button.className).toContain('uppercase')
    })

    it('should have correct default size padding', () => {
      render(<Button>TEST</Button>)
      const button = screen.getByRole('button')
      // Default size classes: h-9 px-4 py-2
      expect(button.className).toContain('h-9')
      expect(button.className).toContain('px-4')
      expect(button.className).toContain('py-2')
    })

    it('should have medium border radius', () => {
      render(<Button>TEST</Button>)
      const button = screen.getByRole('button')
      // rounded-md class corresponds to medium border radius
      expect(button.className).toContain('rounded-md')
    })

    it('should apply primary variant with correct classes', () => {
      render(<Button variant="default">PRIMARY</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-primary')
      expect(button.className).toContain('text-primary-foreground')
    })

    it('should apply secondary variant with correct classes', () => {
      render(<Button variant="secondary">SECONDARY</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-secondary')
      expect(button.className).toContain('text-secondary-foreground')
    })
  })
})
