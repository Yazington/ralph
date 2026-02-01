import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('shadcn/ui Button Component Installation', () => {
  const appRoot = resolve(__dirname, '..')
  const buttonComponentPath = resolve(appRoot, 'src/components/ui/button.tsx')

  describe('File existence', () => {
    it('should have button.tsx file in components/ui directory', () => {
      expect(existsSync(buttonComponentPath)).toBe(true)
    })

    it('should export Button component', () => {
      expect(Button).toBeDefined()
      expect(typeof Button).toBe('function')
    })

    it('should export buttonVariants', async () => {
      const module = await import('@/components/ui/button')
      expect(module).toHaveProperty('buttonVariants')
    })
  })

  describe('Component rendering', () => {
    it('should render button with default props', () => {
      render(<Button>Test Button</Button>)
      const button = screen.getByRole('button', { name: 'Test Button' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('inline-flex')
    })

    it('should apply variant classes', () => {
      const { container } = render(
        <Button variant="destructive">Delete</Button>
      )
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('should apply size classes', () => {
      const { container } = render(<Button size="lg">Large</Button>)
      const button = container.querySelector('button')
      expect(button).toHaveClass('h-10')
    })

    it('should support asChild prop', () => {
      const { container } = render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveClass('inline-flex')
    })
  })

  describe('Dependencies', () => {
    it('should import cn utility from lib/utils', () => {
      const content = readFileSync(buttonComponentPath, 'utf-8')
      // Button component uses single quotes: from '@/lib/utils'
      expect(content).toContain("from '@/lib/utils'")
    })

    it('should import class-variance-authority', () => {
      const content = readFileSync(buttonComponentPath, 'utf-8')
      expect(content).toContain('class-variance-authority')
    })

    it('should import @radix-ui/react-slot', () => {
      const content = readFileSync(buttonComponentPath, 'utf-8')
      expect(content).toContain('@radix-ui/react-slot')
    })
  })
})
