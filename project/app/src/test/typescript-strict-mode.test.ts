import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Simple comment stripper for JSONC (JSON with Comments)
function stripComments(jsonc: string): string {
  let inString = false
  let escapeNext = false
  let inLineComment = false
  let inBlockComment = false
  let result = ''

  for (let i = 0; i < jsonc.length; i++) {
    const char = jsonc[i]
    const nextChar = jsonc[i + 1] || ''

    if (escapeNext) {
      escapeNext = false
      result += char
      continue
    }

    if (inString) {
      if (char === '\\') {
        escapeNext = true
      } else if (char === '"') {
        inString = false
      }
      result += char
      continue
    }

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false
        result += char
      }
      continue
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false
        i++ // skip the '/'
      }
      continue
    }

    // Not in string or comment
    if (char === '"') {
      inString = true
      result += char
    } else if (char === '/' && nextChar === '/') {
      inLineComment = true
      i++ // skip second '/'
    } else if (char === '/' && nextChar === '*') {
      inBlockComment = true
      i++ // skip '*'
    } else {
      result += char
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJsonc(filePath: string): any {
  const content = readFileSync(filePath, 'utf-8')
  const stripped = stripComments(content)
  return JSON.parse(stripped)
}

describe('TypeScript Strict Mode Configuration', () => {
  const appRoot = resolve(__dirname, '..')
  const tsconfigAppPath = resolve(appRoot, 'tsconfig.app.json')
  const tsconfigPath = resolve(appRoot, 'tsconfig.json')
  const tsconfigNodePath = resolve(appRoot, 'tsconfig.node.json')

  describe('Configuration files', () => {
    it('should have tsconfig.app.json', () => {
      expect(existsSync(tsconfigAppPath)).toBe(true)
    })

    it('should have tsconfig.json', () => {
      expect(existsSync(tsconfigPath)).toBe(true)
    })

    it('should have tsconfig.node.json', () => {
      expect(existsSync(tsconfigNodePath)).toBe(true)
    })
  })

  describe('tsconfig.app.json strict mode settings', () => {
    let tsconfigApp: any // eslint-disable-line @typescript-eslint/no-explicit-any
    beforeAll(() => {
      tsconfigApp = parseJsonc(tsconfigAppPath)
    })

    it('should have strict: true', () => {
      expect(tsconfigApp.compilerOptions.strict).toBe(true)
    })

    it('should have noUnusedLocals: true', () => {
      expect(tsconfigApp.compilerOptions.noUnusedLocals).toBe(true)
    })

    it('should have noUnusedParameters: true', () => {
      expect(tsconfigApp.compilerOptions.noUnusedParameters).toBe(true)
    })

    it('should have noFallthroughCasesInSwitch: true', () => {
      expect(tsconfigApp.compilerOptions.noFallthroughCasesInSwitch).toBe(true)
    })

    it('should include src directory', () => {
      expect(tsconfigApp.include).toEqual(['src'])
    })

    it('should have path alias configured', () => {
      expect(tsconfigApp.compilerOptions.baseUrl).toBe('.')
      expect(tsconfigApp.compilerOptions.paths).toEqual({
        '@/*': ['./src/*'],
      })
    })
  })

  describe('tsconfig.json references', () => {
    let tsconfig: any // eslint-disable-line @typescript-eslint/no-explicit-any
    beforeAll(() => {
      tsconfig = parseJsonc(tsconfigPath)
    })

    it('should reference both app and node configs', () => {
      expect(tsconfig.references).toHaveLength(2)
      expect(tsconfig.references).toEqual(
        expect.arrayContaining([
          { path: './tsconfig.app.json' },
          { path: './tsconfig.node.json' },
        ])
      )
    })

    it('should have path alias configured', () => {
      expect(tsconfig.compilerOptions.baseUrl).toBe('.')
      expect(tsconfig.compilerOptions.paths).toEqual({
        '@/*': ['./src/*'],
      })
    })
  })

  describe('tsconfig.node.json strict mode', () => {
    let tsconfigNode: any // eslint-disable-line @typescript-eslint/no-explicit-any
    beforeAll(() => {
      tsconfigNode = parseJsonc(tsconfigNodePath)
    })

    it('should have strict: true', () => {
      expect(tsconfigNode.compilerOptions.strict).toBe(true)
    })
  })

  describe('TypeScript compilation', () => {
    it('should compile the project with strict mode enabled', () => {
      // Run tsc with --noEmit to check for type errors
      // Use npx to ensure we use the local TypeScript installation
      execSync('npx tsc --noEmit -p tsconfig.app.json', {
        cwd: appRoot,
        stdio: 'pipe',
        encoding: 'utf-8',
      })
      // If there are errors, execSync will throw, so reaching here means success
    })

    it('should compile the node config without errors', () => {
      execSync('npx tsc --noEmit -p tsconfig.node.json', {
        cwd: appRoot,
        stdio: 'pipe',
        encoding: 'utf-8',
      })
    })
  })
})
