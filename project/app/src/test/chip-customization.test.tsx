import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Chip } from '@/components/ui/chip'

function getChipElement(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-slot="chip"]')
}

describe('Chip Customization for Design System', () => {
  describe('Chip Component', () => {
    it('should render with uppercase text', () => {
      const { container } = render(<Chip>TEST CHIP</Chip>)
      const chip = getChipElement(container)
      expect(chip).toBeInTheDocument()
      expect(chip?.className).toContain('uppercase')
    })

    it('should have rounded-full shape', () => {
      const { container } = render(<Chip>TEST</Chip>)
      const chip = getChipElement(container)
      expect(chip?.className).toContain('rounded-full')
    })

    it('should have correct default padding', () => {
      const { container } = render(<Chip>TEST</Chip>)
      const chip = getChipElement(container)
      expect(chip?.className).toContain('px-2')
      expect(chip?.className).toContain('py-0.5')
    })

    it('should apply default variant with correct classes', () => {
      const { container } = render(<Chip variant="default">DEFAULT</Chip>)
      const chip = getChipElement(container)
      expect(chip?.className).toContain('bg-primary')
      expect(chip?.className).toContain('text-primary-foreground')
    })

    it('should apply warning variant with correct classes', () => {
      const { container } = render(<Chip variant="warning">WARNING</Chip>)
      const chip = getChipElement(container)
      expect(chip?.className).toContain('bg-chart-3')
      expect(chip?.className).toContain('text-white')
    })

    it('should render without remove button by default', () => {
      render(<Chip>TEST</Chip>)
      const removeButton = screen.queryByRole('button')
      expect(removeButton).toBeNull()
    })

    it('should render with remove button when removable prop is true', () => {
      render(<Chip removable>TEST</Chip>)
      const removeButton = screen.getByRole('button')
      expect(removeButton).toBeInTheDocument()
      expect(removeButton).toHaveAttribute('aria-label', 'Remove TEST')
    })

    it('should call onRemove when remove button is clicked', () => {
      const handleRemove = vi.fn()
      render(
        <Chip removable onRemove={handleRemove}>
          TEST
        </Chip>
      )
      const removeButton = screen.getByRole('button')
      fireEvent.click(removeButton)
      expect(handleRemove).toHaveBeenCalledTimes(1)
    })

    it('should have extra padding when removable', () => {
      const { container } = render(<Chip removable>TEST</Chip>)
      const chip = getChipElement(container)
      expect(chip?.className).toContain('pr-1')
    })
  })
})
