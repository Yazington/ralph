import { describe, expect, test } from 'vitest';
import { createTask, Task, Timestamp } from '../domain_types/task-domain';
import {
  ACCENT_CYAN_HEX,
  deriveEditKeyDecision,
  deriveFocusRing,
  deriveMotionTiming,
  planCheckboxToggle,
  planComposerKeyAction,
} from '../domain_types/interactions';

describe('Composer key handling (spec 0007)', () => {
  test('planComposerKeyAction submits on Enter when the composer has content', () => {
    const result = planComposerKeyAction('Enter', 'Write spec-driven helper');
    expect(result.shouldSubmit).toBe(true);
    expect(result.trimmedValue).toBe('Write spec-driven helper');
  });

  test('planComposerKeyAction refuses Enter submits for empty or whitespace-only values', () => {
    const result = planComposerKeyAction('Enter', '   ');
    expect(result.shouldSubmit).toBe(false);
    expect(result.reason).toContain('ignores Enter');
  });
});

describe('Edit cancellation via Escape (spec 0007)', () => {
  test('deriveEditKeyDecision returns cancel action for Escape', () => {
    const decision = deriveEditKeyDecision('Escape');
    expect(decision.action).toBe('cancel');
    expect(decision.description).toContain('Escape');
  });
});

describe('Checkbox toggles completion (spec 0007)', () => {
  const timestamp: Timestamp = '2026-01-31T12:00:00.000Z';

  test('planCheckboxToggle flips completion state for the clicked task', () => {
    const task: Task = createTask({
      id: 'checkbox-toggle',
      title: 'Toggle through click',
      createdAt: timestamp,
      completed: false,
    });

    const firstPlan = planCheckboxToggle(task, timestamp);
    expect(firstPlan.nextCompleted).toBe(true);
    expect(firstPlan.currentCompleted).toBe(false);

    const completedTask: Task = { ...task, completed: true, updatedAt: timestamp };
    const secondPlan = planCheckboxToggle(completedTask, timestamp);
    expect(secondPlan.nextCompleted).toBe(false);
  });
});

describe('Focus ring styling (spec 0007)', () => {
  test('deriveFocusRing keeps the accent cyan color whenever focus is visible', () => {
    const focused = deriveFocusRing(true);
    expect(focused.color).toBe(ACCENT_CYAN_HEX);
    expect(focused.widthPx).toBeGreaterThan(0);

    const blurred = deriveFocusRing(false);
    expect(blurred.color).toBe(ACCENT_CYAN_HEX);
    expect(blurred.visible).toBe(false);
    expect(blurred.widthPx).toBe(0);
  });
});

describe('Motion timing (spec 0007)', () => {
  test('panel load stays within 140-200ms and uses the easing curve', () => {
    const motion = deriveMotionTiming('panelLoad', false);
    expect(motion.durationMs).toBeGreaterThanOrEqual(140);
    expect(motion.durationMs).toBeLessThanOrEqual(200);
    expect(motion.easing).toContain('cubic-bezier');
  });

  test('reduced-motion requests zero-duration interactions', () => {
    const motion = deriveMotionTiming('listAdd', true);
    expect(motion.durationMs).toBe(0);
    expect(motion.respectReducedMotion).toBe(true);
  });
});
