import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Vite public assets
vi.mock('/vite.svg', () => ({
  default: 'mocked-vite.svg',
}))

vi.mock('./assets/react.svg', () => ({
  default: 'mocked-react.svg',
}))