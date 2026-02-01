import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('IBM Plex Mono Font Configuration', () => {
  it('should have IBM Plex Mono installed in package.json', () => {
    const packageJsonPath = resolve(__dirname, '../package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

    expect(packageJson.dependencies).toBeDefined()
    expect(packageJson.dependencies['@fontsource/ibm-plex-mono']).toBeDefined()
    expect(packageJson.dependencies['@fontsource/ibm-plex-mono']).toMatch(
      /^[\d.]+$/
    )
  })

  it('should import IBM Plex Mono font in main.tsx', () => {
    const mainTsPath = resolve(__dirname, '../src/main.tsx')
    const mainTsContent = readFileSync(mainTsPath, 'utf-8')

    expect(mainTsContent).toContain('@fontsource/ibm-plex-mono')
    expect(mainTsContent).toContain('import')
  })

  it('should configure IBM Plex Mono font in index.css', () => {
    const indexCssPath = resolve(__dirname, '../src/index.css')
    const indexCssContent = readFileSync(indexCssPath, 'utf-8')

    expect(indexCssContent).toContain("'IBM Plex Mono'")
    expect(indexCssContent).toContain('font-family')
  })

  it('should apply text-transform uppercase in index.css', () => {
    const indexCssPath = resolve(__dirname, '../src/index.css')
    const indexCssContent = readFileSync(indexCssPath, 'utf-8')

    expect(indexCssContent).toContain('text-transform: uppercase')
  })

  it('should configure font-family-sans in Tailwind theme', () => {
    const indexCssPath = resolve(__dirname, '../src/index.css')
    const indexCssContent = readFileSync(indexCssPath, 'utf-8')

    expect(indexCssContent).toContain('--font-family-sans')
    expect(indexCssContent).toContain("'IBM Plex Mono'")
    expect(indexCssContent).toContain('monospace')
  })

  it('should have IBM Plex Mono font configuration in root selector', () => {
    const indexCssPath = resolve(__dirname, '../src/index.css')
    const indexCssContent = readFileSync(indexCssPath, 'utf-8')

    const rootMatch = indexCssContent.match(/:root\s*{([^}]+)}/)
    expect(rootMatch).toBeDefined()

    const rootContent = rootMatch ? rootMatch[1] : ''
    expect(rootContent).toContain("'IBM Plex Mono'")
    expect(rootContent).toContain('text-transform: uppercase')
  })

  it('should include monospace as fallback font', () => {
    const indexCssPath = resolve(__dirname, '../src/index.css')
    const indexCssContent = readFileSync(indexCssPath, 'utf-8')

    expect(indexCssContent).toMatch(/'IBM Plex Mono'.*monospace/)
  })
})
