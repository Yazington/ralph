import { describe, expect, test } from 'vitest';
import {
  AccentUsage,
  SurfaceTokenId,
  TextTokenId,
  getColorPalette,
} from '../domain_types/color-palette';

describe('Color palette (spec 0002)', () => {
  test('lists every surface layer with the mandated hex values and intents', () => {
    const palette = getColorPalette();
    const expectedSurfaceHexes: Record<SurfaceTokenId, string> = {
      baseSurface: '#090B0D',
      deepPanel: '#0B1013',
      panelAlt: '#101D1E',
      panelTeal: '#132E2C',
    };

    (Object.keys(expectedSurfaceHexes) as SurfaceTokenId[]).forEach((token) => {
      const surface = palette.surfaces[token];
      expect(surface.hex).toBe(expectedSurfaceHexes[token]);
      if (token === 'baseSurface') {
        expect(surface.intent).toBe('appBackground');
      } else {
        expect(surface.intent).toBe('panel');
        expect(surface.depth).toBeGreaterThan(0);
      }
    });

    expect(palette.divider.hex).toBe('#2B2C2D');
    expect(palette.divider.recommendedOpacity).toBeCloseTo(0.4, 5);
  });

  test('exposes the mint primary and muted text tones for dark surfaces', () => {
    const palette = getColorPalette();
    const expectedTextHexes: Record<TextTokenId, string> = {
      primaryText: '#B5D7CD',
      mutedText: '#6A8F96',
      mutedAltText: '#588391',
    };

    (Object.keys(expectedTextHexes) as TextTokenId[]).forEach((token) => {
      const text = palette.text[token];
      expect(text.hex).toBe(expectedTextHexes[token]);
      expect(text.contrastTargets).toContain('deepPanel');
      expect(text.tone).toMatch(/primary|muted/);
    });
  });

  test('keeps the accent cyan shared across links, focus rings, and active states', () => {
    const palette = getColorPalette();
    const accentUses: AccentUsage[] = ['link', 'focusRing', 'activeState'];

    expect(palette.accent.hex).toBe('#7299A2');
    accentUses.forEach((usage) => {
      expect(palette.accent.supports).toContain(usage);
    });
    expect(new Set(palette.accent.supports).size).toBe(accentUses.length);
  });
});
