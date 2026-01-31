import { describe, expect, test } from 'vitest';
import {
  InteractiveControl,
  auditAccessibility,
  isControlCompliant,
  AccessibilityViolation,
} from '../domain_types/accessibility';

const accessibleButton: InteractiveControl = {
  id: 'add-task',
  label: 'Add task',
  keyboardAction: {
    key: 'Enter',
    description: 'Submit the composer and add a task',
  },
  focusRingVisible: true,
  hitTarget: { width: 48, height: 44 },
  stateIndicators: ['color', 'label', 'aria'],
};

describe('Accessibility spec 0010', () => {
  test('compliant controls pass the audit without violations', () => {
    const violations = auditAccessibility([accessibleButton]);
    expect(violations).toHaveLength(0);
    expect(isControlCompliant(accessibleButton)).toBe(true);
  });

  test('missing requirements are reported for each control', () => {
    const failingControl: InteractiveControl = {
      ...accessibleButton,
      id: 'mouse-only',
      keyboardAction: null,
      focusRingVisible: false,
      hitTarget: { width: 32, height: 36 },
    };

    const violations: AccessibilityViolation[] = auditAccessibility([failingControl]);
    expect(violations).toHaveLength(3);
    expect(violations.map((v) => v.requirement)).toEqual([
      'keyboard',
      'focusRing',
      'hitTarget',
    ]);
  });

  test('color-only indicators trigger the state indicator violation', () => {
    const colorOnly: InteractiveControl = {
      ...accessibleButton,
      id: 'color-pill',
      stateIndicators: ['color'],
    };

    const violations = auditAccessibility([colorOnly]);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      controlId: 'color-pill',
      requirement: 'stateIndicator',
    });
  });

  test('audit surfaces multiple controls with issues to guide remediation', () => {
    const focusOnly: InteractiveControl = {
      ...accessibleButton,
      id: 'focus-trap',
      hitTarget: { width: 60, height: 24 },
    };
    const poorlyLabeled: InteractiveControl = {
      ...accessibleButton,
      id: 'color-chip',
      stateIndicators: ['color'],
    };

    const violations = auditAccessibility([focusOnly, poorlyLabeled]);
    expect(violations).toHaveLength(2);
    expect(violations).toEqual([
      expect.objectContaining({ controlId: 'focus-trap', requirement: 'hitTarget' }),
      expect.objectContaining({ controlId: 'color-chip', requirement: 'stateIndicator' }),
    ]);
  });
});
