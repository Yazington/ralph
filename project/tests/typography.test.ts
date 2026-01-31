import { describe, expect, test } from 'vitest';
import {
  getTypographySystem,
  formatFontStack,
  isSupportedFontWeight,
  planFontLoading,
  FontLoadingPlan,
  FontWeight,
} from '../domain_types/typography';

describe('Typography system (spec 0001)', () => {
  test('exposes IBM Plex Mono as the primary and JetBrains Mono as fallback', () => {
    const system = getTypographySystem();
    const [primary, fallback] = system.families;

    expect(primary.role).toBe('primary');
    expect(primary.name).toBe('IBM Plex Mono');
    expect(fallback.role).toBe('fallback');
    expect(fallback.name).toBe('JetBrains Mono');
    expect(system.genericFamily).toBe('monospace');
    expect(system.stack).toEqual(['IBM Plex Mono', 'JetBrains Mono', 'monospace']);
  });

  test('formats a CSS font stack string with quoted names when needed', () => {
    const stack = formatFontStack();
    expect(stack).toContain("'IBM Plex Mono'");
    expect(stack).toContain("'JetBrains Mono'");
    expect(stack.endsWith('monospace')).toBe(true);
  });

  test('only allows weights 400, 500, and 600 for loading', () => {
    const supported: FontWeight[] = [400, 500, 600];
    supported.forEach((weight) => {
      expect(isSupportedFontWeight(weight)).toBe(true);
    });

    expect(isSupportedFontWeight(300)).toBe(false);
    expect(isSupportedFontWeight(700)).toBe(false);
  });

  test('planFontLoading emits descriptors for each family and shared weights', () => {
    const plans: readonly FontLoadingPlan[] = planFontLoading();
    expect(plans).toHaveLength(2);
    plans.forEach((plan) => {
      expect(plan.display).toBe('swap');
      expect(plan.weights).toEqual([400, 500, 600]);
    });
  });
});
