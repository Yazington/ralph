import { describe, expect, test } from 'vitest';
import { createLayoutPlan, LayoutSectionId, MOBILE_BREAKPOINT_PX } from '../domain_types/layout';

describe('Layout plan (spec 0004)', () => {
  test('fills the viewport surface and centers a padded panel on wide screens', () => {
    const plan = createLayoutPlan(1280);
    expect(plan.surface.fillsViewport).toBe(true);
    expect(plan.surface.background).toBe('baseSurface');

    expect(plan.panel.alignment).toBe('center');
    expect(plan.panel.padding.left).toBe(32);
    expect(plan.panel.padding.right).toBe(32);
    expect(plan.panel.padding.top).toBe(32);
    expect(plan.panel.padding.bottom).toBe(32);
    expect(plan.panel.radiusPx).toBe(16);
    expect(plan.panel.border).toMatchObject({ widthPx: 1, colorHex: '#2B2C2D', opacity: 0.4 });
  });

  test('orders the header, input, list, and footer sections', () => {
    const plan = createLayoutPlan(1024);
    const ids: LayoutSectionId[] = plan.sections.map((section) => section.id);
    expect(ids).toEqual(['header', 'input', 'list', 'footer']);
    plan.sections.forEach((section, index) => {
      expect(section.order).toBe(index + 1);
    });
  });

  test('switches to full-width panel with 16px gutters at the mobile breakpoint', () => {
    const mobileWidth = MOBILE_BREAKPOINT_PX - 1;
    const plan = createLayoutPlan(mobileWidth);

    expect(plan.panel.alignment).toBe('fullWidth');
    expect(plan.panel.padding.left).toBe(16);
    expect(plan.panel.padding.right).toBe(16);
    expect(plan.responsive.breakpoint).toBe('mobile');
    expect(plan.responsive.maxViewportWidthPx).toBe(MOBILE_BREAKPOINT_PX);
    expect(plan.responsive.applies).toBe(true);
    expect(plan.responsive.sidePaddingPx).toBe(16);
  });
});
