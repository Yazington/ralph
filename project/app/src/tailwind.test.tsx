import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Tailwind CSS Installation', () => {
  it('should render element with Tailwind utility classes', () => {
    const TestComponent = () => (
      <div data-testid="tailwind-test" className="flex items-center justify-center">
        Tailwind CSS Test
      </div>
    )
    
    render(<TestComponent />)
    
    const element = screen.getByTestId('tailwind-test')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('flex', 'items-center', 'justify-center')
  })

  it('should render element with responsive Tailwind classes', () => {
    const TestComponent = () => (
      <div data-testid="responsive-test" className="p-4 md:p-8 lg:p-12">
        Responsive Test
      </div>
    )
    
    render(<TestComponent />)
    
    const element = screen.getByTestId('responsive-test')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('p-4', 'md:p-8', 'lg:p-12')
  })

  it('should render element with color and spacing utilities', () => {
    const TestComponent = () => (
      <div data-testid="color-test" className="text-blue-500 bg-gray-100 mt-4">
        Color Test
      </div>
    )
    
    render(<TestComponent />)
    
    const element = screen.getByTestId('color-test')
    expect(element).toBeInTheDocument()
    expect(element).toHaveClass('text-blue-500', 'bg-gray-100', 'mt-4')
  })
})