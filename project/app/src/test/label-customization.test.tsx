import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label Customization for Design System', () => {
  describe('Label Component', () => {
    it('should render with uppercase text', () => {
      render(<Label>TEST LABEL</Label>)
      const label = screen.getByText('TEST LABEL')
      expect(label).toBeInTheDocument()
      // Check that uppercase class is present
      expect(label.className).toContain('uppercase')
    })

    it('should have correct typography classes', () => {
      render(<Label>TEST</Label>)
      const label = screen.getByText('TEST')
      // Should have text-sm, font-medium, leading-none
      expect(label.className).toContain('text-sm')
      expect(label.className).toContain('font-medium')
      expect(label.className).toContain('leading-none')
    })

    it('should have flex items-center gap-2', () => {
      render(<Label>TEST</Label>)
      const label = screen.getByText('TEST')
      expect(label.className).toContain('flex')
      expect(label.className).toContain('items-center')
      expect(label.className).toContain('gap-2')
    })
  })
})
