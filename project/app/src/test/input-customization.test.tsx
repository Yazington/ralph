import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/input'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Input Customization for Design System', () => {
  describe('CSS Variables', () => {
    it('should have design system colors in index.css', () => {
      const indexCssPath = resolve(__dirname, './index.css')
      expect(existsSync(indexCssPath), 'index.css should exist').toBe(true)

      const indexCss = readFileSync(indexCssPath, 'utf-8')

      // Check input-specific colors (note: CSS uses lowercase hex values)
      expect(indexCss).toContain('--input: #101d1e')
      expect(indexCss).toContain('--border: #2b2c2d')
      expect(indexCss).toContain('--muted-foreground: #a1a1aa')

      // Check uppercase text transform in root
      expect(indexCss).toContain('text-transform: uppercase')
    })
  })

  describe('Input Component', () => {
    it('should render with uppercase text', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      // Check that uppercase class is present
      expect(input.className).toContain('uppercase')
    })

    it('should have uppercase placeholder', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      // Check that placeholder:uppercase class is present
      expect(input.className).toContain('placeholder:uppercase')
    })

    it('should have panel alt background color', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      // Should have bg-input class (panel alt background: #101D1E)
      expect(input.className).toContain('bg-input')
    })

    it('should have border with 20% opacity', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      // Should have border-border/20 class
      expect(input.className).toContain('border-border/20')
    })

    it('should have medium border radius', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      // rounded-md class corresponds to medium border radius
      expect(input.className).toContain('rounded-md')
    })

    it('should have correct padding and height', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      // Default input classes: h-9 px-3 py-1
      expect(input.className).toContain('h-9')
      expect(input.className).toContain('px-3')
      expect(input.className).toContain('py-1')
    })

    it('should have proper focus styles with design system colors', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      // Should have focus-visible:border-ring and focus-visible:ring-ring/50
      expect(input.className).toContain('focus-visible:border-ring')
      expect(input.className).toContain('focus-visible:ring-ring/50')
    })
  })
})
