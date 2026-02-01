import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('pnpm Configuration', () => {
  const appRoot = resolve(__dirname, '..');
  const npmrcPath = resolve(appRoot, '.npmrc');
  const packageJsonPath = resolve(appRoot, 'package.json');

  describe('.npmrc File', () => {
    it('should exist in the app directory', () => {
      expect(existsSync(npmrcPath)).toBe(true);
    });

    it('should contain save-prefix configuration', () => {
      const npmrcContent = readFileSync(npmrcPath, 'utf-8');
      expect(npmrcContent).toContain("save-prefix=''");
    });

    it('should contain strict-peer-dependencies configuration', () => {
      const npmrcContent = readFileSync(npmrcPath, 'utf-8');
      expect(npmrcContent).toContain('strict-peer-dependencies=false');
    });

    it('should contain prefer-frozen-lockfile configuration', () => {
      const npmrcContent = readFileSync(npmrcPath, 'utf-8');
      expect(npmrcContent).toContain('prefer-frozen-lockfile=true');
    });
  });

  describe('package.json Scripts', () => {
    it('should have dev script configured', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts.dev).toBe('vite');
    });

    it('should have build script configured', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts.build).toBe('tsc -b && vite build');
    });

    it('should have test script configured', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts.test).toBe('vitest');
    });

    it('should have test:run script configured', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('test:run');
      expect(packageJson.scripts['test:run']).toBe('vitest run');
    });

    it('should have lint script configured', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('lint');
      expect(packageJson.scripts.lint).toBe('eslint .');
    });
  });

  describe('pnpm Lockfile', () => {
    it('should have pnpm-lock.yaml file', () => {
      const lockfilePath = resolve(appRoot, 'pnpm-lock.yaml');
      expect(existsSync(lockfilePath)).toBe(true);
    });
  });

  describe('pnpm Commands', () => {
    it('should return pnpm version', () => {
      const output = execSync('pnpm --version', { encoding: 'utf-8', cwd: appRoot });
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should list installed packages', () => {
      const output = execSync('pnpm list --depth=0', { encoding: 'utf-8', cwd: appRoot });
      expect(output).toContain('app@');
      expect(output).toContain('react');
    });
  });
});
