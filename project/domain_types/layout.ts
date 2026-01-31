export type LayoutSectionId = 'header' | 'input' | 'list' | 'footer';

export interface LayoutSection {
  id: LayoutSectionId;
  order: number;
}

export interface SurfaceLayer {
  kind: 'surface';
  fillsViewport: boolean;
  background: 'baseSurface';
}

export type PanelAlignment = 'center' | 'fullWidth';

export interface PanelPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PanelBorder {
  widthPx: number;
  colorHex: string;
  opacity: number;
}

export interface PanelLayout {
  alignment: PanelAlignment;
  padding: PanelPadding;
  radiusPx: number;
  border: PanelBorder;
}

export interface ResponsiveRule {
  breakpoint: 'mobile';
  maxViewportWidthPx: number;
  applies: boolean;
  sidePaddingPx: number;
}

export interface LayoutPlan {
  surface: SurfaceLayer;
  panel: PanelLayout;
  sections: LayoutSection[];
  responsive: ResponsiveRule;
}

const SECTION_ORDER: LayoutSectionId[] = ['header', 'input', 'list', 'footer'];
const GENEROUS_PANEL_PADDING = 32;
const MOBILE_SIDE_PADDING = 16;
const PANEL_RADIUS_PX = 16;
const PANEL_BORDER: PanelBorder = {
  widthPx: 1,
  colorHex: '#2B2C2D',
  opacity: 0.4,
};

export const MOBILE_BREAKPOINT_PX = 640;

export function createLayoutPlan(viewportWidthPx: number): LayoutPlan {
  const isMobile = viewportWidthPx <= MOBILE_BREAKPOINT_PX;
  return {
    surface: createSurfaceLayer(),
    panel: createPanelLayout(isMobile),
    sections: createSections(),
    responsive: createResponsiveRule(isMobile),
  };
}

function createSurfaceLayer(): SurfaceLayer {
  return {
    kind: 'surface',
    fillsViewport: true,
    background: 'baseSurface',
  };
}

function createPanelLayout(isMobile: boolean): PanelLayout {
  const padding: PanelPadding = isMobile
    ? {
        top: GENEROUS_PANEL_PADDING,
        right: MOBILE_SIDE_PADDING,
        bottom: GENEROUS_PANEL_PADDING,
        left: MOBILE_SIDE_PADDING,
      }
    : {
        top: GENEROUS_PANEL_PADDING,
        right: GENEROUS_PANEL_PADDING,
        bottom: GENEROUS_PANEL_PADDING,
        left: GENEROUS_PANEL_PADDING,
      };

  return {
    alignment: isMobile ? 'fullWidth' : 'center',
    padding,
    radiusPx: PANEL_RADIUS_PX,
    border: PANEL_BORDER,
  };
}

function createSections(): LayoutSection[] {
  return SECTION_ORDER.map((id, index) => ({
    id,
    order: index + 1,
  }));
}

function createResponsiveRule(isMobile: boolean): ResponsiveRule {
  return {
    breakpoint: 'mobile',
    maxViewportWidthPx: MOBILE_BREAKPOINT_PX,
    applies: isMobile,
    sidePaddingPx: isMobile ? MOBILE_SIDE_PADDING : GENEROUS_PANEL_PADDING,
  };
}
