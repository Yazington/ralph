import { describe, expect, test } from 'vitest';
import {
  SpacingToken,
  borderSpec,
  describeBorder,
  describeRadius,
  getRadius,
  getSpacingValue,
  isSpacingToken,
  radiusSystem,
  spacingScale,
} from '../domain_types/spacing-shape';

describe('Spacing + shape domain (spec 0005)', () => {
  test('spacing scale only exposes the approved calm increments', () => {
    expect(spacingScale).toEqual([4, 8, 12, 16, 24, 32]);

    const pxValues = spacingScale.map(getSpacingValue);
    expect(pxValues).toEqual(['4px', '8px', '12px', '16px', '24px', '32px']);
  });

  test('isSpacingToken guards usage of the canonical spacing values', () => {
    const valid: SpacingToken = 12;
    expect(isSpacingToken(valid)).toBe(true);
    expect(isSpacingToken(14)).toBe(false);
  });

  test('radius helpers enforce 16px panels and 10px controls', () => {
    expect(getRadius('panel')).toBe(16);
    expect(getRadius('control')).toBe(10);
    expect(radiusSystem.panel).toBe(16);
    expect(radiusSystem.control).toBe(10);
    expect(describeRadius('panel')).toBe('16px');
    expect(describeRadius('control')).toBe('10px');
  });

  test('border description stays at 1px #2B2C2D with 40% opacity', () => {
    expect(borderSpec).toMatchObject({
      widthPx: 1,
      colorHex: '#2B2C2D',
      opacity: 0.4,
    });
    expect(borderSpec.rgba).toBe('rgba(43, 44, 45, 0.4)');
    expect(describeBorder()).toBe('1px solid rgba(43, 44, 45, 0.4)');
  });
});
