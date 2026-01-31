const SUPPORTED_WEIGHTS = [400, 500, 600] as const;

export type FontWeight = (typeof SUPPORTED_WEIGHTS)[number];

export type FontRole = 'primary' | 'fallback';

export interface FontFamilySpec {
  role: FontRole;
  name: string;
  description: string;
  weights: readonly FontWeight[];
}

export interface TypographySystem {
  families: readonly [FontFamilySpec, FontFamilySpec];
  stack: readonly string[];
  genericFamily: 'monospace';
}

export interface FontLoadingPlan {
  family: string;
  weights: readonly FontWeight[];
  display: 'swap';
}

const PRIMARY_FONT: FontFamilySpec = {
  role: 'primary',
  name: 'IBM Plex Mono',
  description: 'Primary UI font for the calm todo experience.',
  weights: SUPPORTED_WEIGHTS,
};

const FALLBACK_FONT: FontFamilySpec = {
  role: 'fallback',
  name: 'JetBrains Mono',
  description: 'Fallback mono face that pairs well with IBM Plex Mono.',
  weights: SUPPORTED_WEIGHTS,
};

export const TYPOGRAPHY_SYSTEM: TypographySystem = {
  families: [PRIMARY_FONT, FALLBACK_FONT],
  stack: [PRIMARY_FONT.name, FALLBACK_FONT.name, 'monospace'],
  genericFamily: 'monospace',
};

export function getTypographySystem(): TypographySystem {
  return TYPOGRAPHY_SYSTEM;
}

export function formatFontStack(): string {
  return TYPOGRAPHY_SYSTEM.stack
    .map((name) => (name.includes(' ') ? `'${name}'` : name))
    .join(', ');
}

export function isSupportedFontWeight(weight: number): weight is FontWeight {
  return SUPPORTED_WEIGHTS.includes(weight as FontWeight);
}

export function planFontLoading(): readonly FontLoadingPlan[] {
  return TYPOGRAPHY_SYSTEM.families.map((family) => ({
    family: family.name,
    weights: family.weights,
    display: 'swap',
  }));
}
