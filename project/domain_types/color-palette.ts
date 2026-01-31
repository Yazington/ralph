export type HexColor = `#${string}`;

export type SurfaceTokenId = 'baseSurface' | 'deepPanel' | 'panelAlt' | 'panelTeal';

export interface SurfaceColorToken {
  id: SurfaceTokenId;
  hex: HexColor;
  intent: 'appBackground' | 'panel';
  description: string;
  depth: number;
}

export type TextTokenId = 'primaryText' | 'mutedText' | 'mutedAltText';

export interface TextColorToken {
  id: TextTokenId;
  hex: HexColor;
  tone: 'primary' | 'muted' | 'mutedAlt';
  description: string;
  contrastTargets: readonly SurfaceTokenId[];
}

export interface DividerToken {
  id: 'borderDivider';
  hex: HexColor;
  recommendedOpacity: number;
  description: string;
}

export type AccentUsage = 'link' | 'focusRing' | 'activeState';

export interface AccentColorToken {
  id: 'accentCyan';
  hex: HexColor;
  description: string;
  supports: readonly AccentUsage[];
}

export interface ColorPalette {
  surfaces: Record<SurfaceTokenId, SurfaceColorToken>;
  text: Record<TextTokenId, TextColorToken>;
  divider: DividerToken;
  accent: AccentColorToken;
}

const SURFACE_TOKENS: Record<SurfaceTokenId, SurfaceColorToken> = {
  baseSurface: {
    id: 'baseSurface',
    hex: '#090B0D',
    intent: 'appBackground',
    description: 'Base app surface that fills the viewport behind the panel.',
    depth: 0,
  },
  deepPanel: {
    id: 'deepPanel',
    hex: '#0B1013',
    intent: 'panel',
    description: 'Primary todo panel background used for the task stack.',
    depth: 1,
  },
  panelAlt: {
    id: 'panelAlt',
    hex: '#101D1E',
    intent: 'panel',
    description: 'Muted panel variation that supports footer and filter groups.',
    depth: 2,
  },
  panelTeal: {
    id: 'panelTeal',
    hex: '#132E2C',
    intent: 'panel',
    description: 'Teal-tinted surface for accent blocks or highlighted states.',
    depth: 3,
  },
};

const TEXT_TOKENS: Record<TextTokenId, TextColorToken> = {
  primaryText: {
    id: 'primaryText',
    hex: '#B5D7CD',
    tone: 'primary',
    description: 'Mint copy color for primary task titles and counts.',
    contrastTargets: ['baseSurface', 'deepPanel', 'panelAlt', 'panelTeal'],
  },
  mutedText: {
    id: 'mutedText',
    hex: '#6A8F96',
    tone: 'muted',
    description: 'Muted cyan-gray for helper text or metadata.',
    contrastTargets: ['deepPanel', 'panelAlt', 'panelTeal'],
  },
  mutedAltText: {
    id: 'mutedAltText',
    hex: '#588391',
    tone: 'mutedAlt',
    description: 'Secondary muted tone for buttons, pills, and empty states.',
    contrastTargets: ['deepPanel', 'panelAlt', 'panelTeal'],
  },
};

const DIVIDER_TOKEN: DividerToken = {
  id: 'borderDivider',
  hex: '#2B2C2D',
  recommendedOpacity: 0.4,
  description: '1px translucent divider color shared by panels and outlines.',
};

const ACCENT_CYAN: AccentColorToken = {
  id: 'accentCyan',
  hex: '#7299A2',
  description: 'Cyan accent shared by links, focus rings, and active controls.',
  supports: ['link', 'focusRing', 'activeState'],
};

const COLOR_PALETTE: ColorPalette = {
  surfaces: SURFACE_TOKENS,
  text: TEXT_TOKENS,
  divider: DIVIDER_TOKEN,
  accent: ACCENT_CYAN,
};

export function getColorPalette(): ColorPalette {
  return COLOR_PALETTE;
}
