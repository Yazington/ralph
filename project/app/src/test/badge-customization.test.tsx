import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Badge Customization for Design System', () => {
  describe('CSS Variables', () => {
    it('should have design system colors in index.css', () => {
      const indexCssPath = resolve(__dirname, './index.css')
      expect(existsSync(indexCssPath), 'index.css should exist').toBe(true)

      const indexCss = readFileSync(indexCssPath, 'utf-8')

      // Check badge-relevant colors
      expect(indexCss).toContain('--primary: #132e2c')
      expect(indexCss).toContain('--secondary: #0b1013')
      expect(indexCss).toContain('--destructive: #dc2626')
      expect(indexCss).toContain('--chart-1: #3b82f6')
      expect(indexCss).toContain('--chart-2: #10b981')
      expect(indexCss).toContain('--chart-3: #f59e0b')
      expect(indexCss).toContain('--border: #2b2c2d')

      // Check uppercase text transform in root
      expect(indexCss).toContain('text-transform: uppercase')
    })
  })

  describe('Badge Component', () => {
    it('should render with uppercase text', () => {
      render(<Badge>TEST BADGE</Badge>)
      const badge = screen.getByText('TEST BADGE')
      expect(badge).toBeInTheDocument()
      // Check that uppercase class is present
      expect(badge.className).toContain('uppercase')
    })

    it('should have rounded-full shape', () => {
      render(<Badge>TEST</Badge>)
      const badge = screen.getByText('TEST')
      // rounded-full class corresponds to pill shape
      expect(badge.className).toContain('rounded-full')
    })

    it('should have correct default padding', () => {
      render(<Badge>TEST</Badge>)
      const badge = screen.getByText('TEST')
      // Default padding: px-2 py-0.5
      expect(badge.className).toContain('px-2')
      expect(badge.className).toContain('py-0.5')
    })

    it('should apply default variant with correct classes', () => {
      render(<Badge variant="default">DEFAULT</Badge>)
      const badge = screen.getByText('DEFAULT')
      expect(badge.className).toContain('bg-primary')
      expect(badge.className).toContain('text-primary-foreground')
    })

    it('should apply secondary variant with correct classes', () => {
      render(<Badge variant="secondary">SECONDARY</Badge>)
      const badge = screen.getByText('SECONDARY')
      expect(badge.className).toContain('bg-secondary')
      expect(badge.className).toContain('text-secondary-foreground')
    })

    it('should apply destructive variant with correct classes', () => {
      render(<Badge variant="destructive">DESTRUCTIVE</Badge>)
      const badge = screen.getByText('DESTRUCTIVE')
      expect(badge.className).toContain('bg-destructive')
      expect(badge.className).toContain('text-white')
    })

    it('should apply warning variant with correct classes', () => {
      render(<Badge variant="warning">WARNING</Badge>)
      const badge = screen.getByText('WARNING')
      expect(badge.className).toContain('bg-chart-3')
      expect(badge.className).toContain('text-white')
    })

    it('should apply success variant with correct classes', () => {
      render(<Badge variant="success">SUCCESS</Badge>)
      const badge = screen.getByText('SUCCESS')
      expect(badge.className).toContain('bg-chart-2')
      expect(badge.className).toContain('text-white')
    })

    it('should apply info variant with correct classes', () => {
      render(<Badge variant="info">INFO</Badge>)
      const badge = screen.getByText('INFO')
      expect(badge.className).toContain('bg-chart-1')
      expect(badge.className).toContain('text-white')
    })
  })
})
