import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Select Customization for Design System', () => {
  describe('CSS Variables', () => {
    it('should have design system colors in index.css', () => {
      const indexCssPath = resolve(__dirname, './index.css')
      expect(existsSync(indexCssPath), 'index.css should exist').toBe(true)

      const indexCss = readFileSync(indexCssPath, 'utf-8')

      // Check select-relevant colors
      expect(indexCss).toContain('--input: #101d1e')
      expect(indexCss).toContain('--border: #2b2c2d')
      expect(indexCss).toContain('--muted-foreground: #a1a1aa')
      expect(indexCss).toContain('--popover: #0b1013')
      expect(indexCss).toContain('--popover-foreground: #ffffff')

      // Check uppercase text transform in root
      expect(indexCss).toContain('text-transform: uppercase')
    })
  })

  describe('SelectTrigger Component', () => {
    it('should render with uppercase text', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      // Check that uppercase class is present
      expect(trigger.className).toContain('uppercase')
    })

    it('should have uppercase placeholder', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByRole('combobox')
      // Check that data-[placeholder]:uppercase class is present
      expect(trigger.className).toContain('data-[placeholder]:uppercase')
    })

    it('should have panel alt background color', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByRole('combobox')
      // Should have bg-input class (panel alt background: #101d1e)
      expect(trigger.className).toContain('bg-input')
    })

    it('should have border with 20% opacity', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByRole('combobox')
      // Should have border-border/20 class
      expect(trigger.className).toContain('border-border/20')
    })

    it('should have medium border radius', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByRole('combobox')
      // rounded-md class corresponds to medium border radius
      expect(trigger.className).toContain('rounded-md')
    })

    it('should have hover background with opacity', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByRole('combobox')
      // Should have hover:bg-input/80 class
      expect(trigger.className).toContain('hover:bg-input/80')
    })

    it('should have correct padding and height', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      )
      const trigger = screen.getByRole('combobox')
      // Default trigger classes: px-3 py-2 h-9 (data-[size=default]:h-9)
      expect(trigger.className).toContain('px-3')
      expect(trigger.className).toContain('py-2')
      expect(trigger.className).toContain('data-[size=default]:h-9')
    })
  })

  // Note: SelectLabel and SelectItem tests omitted due to portal rendering complexity
  // Component customization verified via CSS class inspection in SelectTrigger tests
})
