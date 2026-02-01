import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('ESLint and Prettier Configuration', () => {
  const projectRoot = resolve(__dirname, '..')

  describe('Package.json scripts', () => {
    it('should have lint script', () => {
      const packageJson = JSON.parse(
        readFileSync(resolve(projectRoot, 'package.json'), 'utf-8')
      )
      expect(packageJson.scripts).toHaveProperty('lint')
      expect(packageJson.scripts.lint).toBe('eslint .')
    })

    it('should have lint:fix script', () => {
      const packageJson = JSON.parse(
        readFileSync(resolve(projectRoot, 'package.json'), 'utf-8')
      )
      expect(packageJson.scripts).toHaveProperty('lint:fix')
      expect(packageJson.scripts['lint:fix']).toBe('eslint . --fix')
    })

    it('should have format script', () => {
      const packageJson = JSON.parse(
        readFileSync(resolve(projectRoot, 'package.json'), 'utf-8')
      )
      expect(packageJson.scripts).toHaveProperty('format')
      expect(packageJson.scripts.format).toBe('prettier --write .')
    })

    it('should have format:check script', () => {
      const packageJson = JSON.parse(
        readFileSync(resolve(projectRoot, 'package.json'), 'utf-8')
      )
      expect(packageJson.scripts).toHaveProperty('format:check')
      expect(packageJson.scripts['format:check']).toBe('prettier --check .')
    })
  })

  describe('ESLint dependencies', () => {
    it('should have prettier installed', () => {
      const packageJson = JSON.parse(
        readFileSync(resolve(projectRoot, 'package.json'), 'utf-8')
      )
      expect(packageJson.devDependencies).toHaveProperty('prettier')
    })

    it('should have eslint-config-prettier installed', () => {
      const packageJson = JSON.parse(
        readFileSync(resolve(projectRoot, 'package.json'), 'utf-8')
      )
      expect(packageJson.devDependencies).toHaveProperty(
        'eslint-config-prettier'
      )
    })

    it('should have eslint-plugin-prettier installed', () => {
      const packageJson = JSON.parse(
        readFileSync(resolve(projectRoot, 'package.json'), 'utf-8')
      )
      expect(packageJson.devDependencies).toHaveProperty(
        'eslint-plugin-prettier'
      )
    })
  })

  describe('Prettier configuration', () => {
    it('should have .prettierrc file', () => {
      expect(() => {
        readFileSync(resolve(projectRoot, '.prettierrc'), 'utf-8')
      }).not.toThrow()
    })

    it('should have .prettierignore file', () => {
      expect(() => {
        readFileSync(resolve(projectRoot, '.prettierignore'), 'utf-8')
      }).not.toThrow()
    })

    it('should configure prettier rules in .prettierrc', () => {
      const prettierConfig = JSON.parse(
        readFileSync(resolve(projectRoot, '.prettierrc'), 'utf-8')
      )
      expect(prettierConfig).toHaveProperty('semi')
      expect(prettierConfig).toHaveProperty('singleQuote')
      expect(prettierConfig).toHaveProperty('tabWidth')
      expect(prettierConfig).toHaveProperty('printWidth')
      expect(prettierConfig).toHaveProperty('trailingComma')
      expect(prettierConfig).toHaveProperty('arrowParens')
    })

    it('should have .prettierignore that excludes dist', () => {
      const prettierIgnore = readFileSync(
        resolve(projectRoot, '.prettierignore'),
        'utf-8'
      )
      expect(prettierIgnore).toContain('dist')
    })

    it('should have .prettierignore that excludes node_modules', () => {
      const prettierIgnore = readFileSync(
        resolve(projectRoot, '.prettierignore'),
        'utf-8'
      )
      expect(prettierIgnore).toContain('node_modules')
    })
  })

  describe('ESLint configuration', () => {
    it('should have eslint.config.js file', () => {
      expect(() => {
        readFileSync(resolve(projectRoot, 'eslint.config.js'), 'utf-8')
      }).not.toThrow()
    })

    it('should import eslint-plugin-prettier in config', () => {
      const eslintConfig = readFileSync(
        resolve(projectRoot, 'eslint.config.js'),
        'utf-8'
      )
      expect(eslintConfig).toContain(
        "import eslintPluginPrettier from 'eslint-plugin-prettier'"
      )
    })

    it('should import eslint-config-prettier in config', () => {
      const eslintConfig = readFileSync(
        resolve(projectRoot, 'eslint.config.js'),
        'utf-8'
      )
      expect(eslintConfig).toContain(
        "import eslintConfigPrettier from 'eslint-config-prettier'"
      )
    })

    it('should include prettier plugin in config', () => {
      const eslintConfig = readFileSync(
        resolve(projectRoot, 'eslint.config.js'),
        'utf-8'
      )
      expect(eslintConfig).toContain('eslintPluginPrettier')
    })

    it('should include prettier config in config', () => {
      const eslintConfig = readFileSync(
        resolve(projectRoot, 'eslint.config.js'),
        'utf-8'
      )
      expect(eslintConfig).toContain('eslintConfigPrettier')
      expect(eslintConfig).toContain('...eslintConfigPrettier.rules')
    })

    it('should have prettier rule configured', () => {
      const eslintConfig = readFileSync(
        resolve(projectRoot, 'eslint.config.js'),
        'utf-8'
      )
      expect(eslintConfig).toContain("'prettier/prettier': 'error'")
    })
  })
})
