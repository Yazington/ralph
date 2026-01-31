export const spacingScale = [4, 8, 12, 16, 24, 32] as const;

export type SpacingToken = (typeof spacingScale)[number];

export function isSpacingToken(value: number): value is SpacingToken {
  return (spacingScale as readonly number[]).includes(value as SpacingToken);
}

export function getSpacingValue(token: SpacingToken): string {
  return `${token}px`;
}

export interface RadiusSystem {
  panel: number;
  control: number;
}

export const radiusSystem: RadiusSystem = {
  panel: 16,
  control: 10,
};

export type RadiusKind = keyof RadiusSystem;

export function getRadius(kind: RadiusKind): number {
  return radiusSystem[kind];
}

export function describeRadius(kind: RadiusKind): string {
  return `${getRadius(kind)}px`;
}

export interface BorderSpec {
  widthPx: number;
  colorHex: string;
  opacity: number;
  rgba: string;
}

export const borderSpec: BorderSpec = {
  widthPx: 1,
  colorHex: '#2B2C2D',
  opacity: 0.4,
  rgba: 'rgba(43, 44, 45, 0.4)',
};

export function describeBorder(): string {
  return `${borderSpec.widthPx}px solid ${borderSpec.rgba}`;
}
