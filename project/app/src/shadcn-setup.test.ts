import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Shadcn/UI Setup', () => {
  describe('Configuration Files', () => {
    it('should have components.json file with correct configuration', () => {
      const componentsJsonPath = resolve(__dirname, '../components.json')
      expect(
        existsSync(componentsJsonPath),
        'components.json should exist'
      ).toBe(true)

      const componentsJson = JSON.parse(
        readFileSync(componentsJsonPath, 'utf-8')
      )
      expect(componentsJson.style, 'Style should be new-york').toBe('new-york')
      expect(componentsJson.rsc, 'RSC should be false').toBe(false)
      expect(componentsJson.tsx, 'TSX should be true').toBe(true)
      expect(componentsJson.iconLibrary, 'Icon library should be lucide').toBe(
        'lucide'
      )
    })

    it('should have correct alias configuration in tsconfig.json', () => {
      const tsconfigJsonPath = resolve(__dirname, '../tsconfig.json')
      expect(existsSync(tsconfigJsonPath), 'tsconfig.json should exist').toBe(
        true
      )

      const tsconfigJson = JSON.parse(readFileSync(tsconfigJsonPath, 'utf-8'))
      expect(tsconfigJson.compilerOptions.baseUrl, 'baseUrl should be .').toBe(
        '.'
      )
      expect(
        tsconfigJson.compilerOptions.paths,
        'paths should exist'
      ).toBeDefined()
      expect(
        tsconfigJson.compilerOptions.paths['@/*'],
        '@/* alias should point to ./src/*'
      ).toEqual(['./src/*'])
    })

    it('should have correct alias configuration in tsconfig.app.json', () => {
      const tsconfigAppJsonPath = resolve(__dirname, '../tsconfig.app.json')
      expect(
        existsSync(tsconfigAppJsonPath),
        'tsconfig.app.json should exist'
      ).toBe(true)

      const tsconfigAppJsonContent = readFileSync(tsconfigAppJsonPath, 'utf-8')
      expect(
        tsconfigAppJsonContent,
        'tsconfig.app.json should contain baseUrl'
      ).toContain('"baseUrl": "."')
      expect(
        tsconfigAppJsonContent,
        'tsconfig.app.json should contain paths'
      ).toContain('"paths"')
      expect(
        tsconfigAppJsonContent,
        'tsconfig.app.json should contain @/* alias'
      ).toContain('"@/*":')
    })

    it('should have alias configuration in vite.config.ts', () => {
      const viteConfigPath = resolve(__dirname, '../vite.config.ts')
      expect(existsSync(viteConfigPath), 'vite.config.ts should exist').toBe(
        true
      )

      const viteConfig = readFileSync(viteConfigPath, 'utf-8')
      expect(viteConfig, 'vite.config.ts should contain path alias').toContain(
        '"@": path.resolve(__dirname, "./src")'
      )
    })
  })

  describe('Utility Files', () => {
    it('should have lib/utils.ts with cn function', () => {
      const utilsPath = resolve(__dirname, '../src/lib/utils.ts')
      expect(existsSync(utilsPath), 'lib/utils.ts should exist').toBe(true)

      const utils = readFileSync(utilsPath, 'utf-8')
      expect(utils, 'utils.ts should export cn function').toContain(
        'export function cn'
      )
      expect(utils, 'utils.ts should import clsx').toContain('from "clsx"')
      expect(utils, 'utils.ts should import tailwind-merge').toContain(
        'from "tailwind-merge"'
      )
    })
  })

  describe('Dependencies', () => {
    it('should have class-variance-authority in dependencies', () => {
      const packageJsonPath = resolve(__dirname, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      expect(
        packageJson.dependencies['class-variance-authority'],
        'class-variance-authority should be installed'
      ).toBeDefined()
    })

    it('should have clsx in dependencies', () => {
      const packageJsonPath = resolve(__dirname, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      expect(
        packageJson.dependencies['clsx'],
        'clsx should be installed'
      ).toBeDefined()
    })

    it('should have lucide-react in dependencies', () => {
      const packageJsonPath = resolve(__dirname, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      expect(
        packageJson.dependencies['lucide-react'],
        'lucide-react should be installed'
      ).toBeDefined()
    })

    it('should have tailwind-merge in dependencies', () => {
      const packageJsonPath = resolve(__dirname, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      expect(
        packageJson.dependencies['tailwind-merge'],
        'tailwind-merge should be installed'
      ).toBeDefined()
    })

    it('should have tw-animate-css in devDependencies', () => {
      const packageJsonPath = resolve(__dirname, '../package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      expect(
        packageJson.devDependencies['tw-animate-css'],
        'tw-animate-css should be installed'
      ).toBeDefined()
    })
  })

  describe('CSS Variables', () => {
    it('should have CSS variables in index.css', () => {
      const indexCssPath = resolve(__dirname, '../src/index.css')
      expect(existsSync(indexCssPath), 'src/index.css should exist').toBe(true)

      const indexCss = readFileSync(indexCssPath, 'utf-8')
      expect(indexCss, 'index.css should have CSS variables').toContain(
        '--background:'
      )
      expect(indexCss, 'index.css should have foreground variable').toContain(
        '--foreground:'
      )
      expect(indexCss, 'indexCss should have primary variable').toContain(
        '--primary:'
      )
      expect(indexCss, 'indexCss should have border variable').toContain(
        '--border:'
      )
    })

    it('should have shadcn/ui @theme inline section', () => {
      const indexCssPath = resolve(__dirname, '../src/index.css')
      const indexCss = readFileSync(indexCssPath, 'utf-8')
      expect(indexCss, 'index.css should have @theme inline section').toContain(
        '@theme inline'
      )
    })
  })
})
