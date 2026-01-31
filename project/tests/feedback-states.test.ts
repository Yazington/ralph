import { describe, expect, test } from 'vitest';
import { createTask, Task, Timestamp } from '../domain_types/task-domain';
import {
  deriveInputFeedback,
  planOptimisticSave,
  scheduleDeletionWithUndo,
  OptimisticSavePlan,
  DeletionPlan,
} from '../domain_types/feedback-state';

const baseTimestamp: Timestamp = '2026-01-31T12:00:00.000Z';

const sampleTask: Task = createTask({
  id: 'sample-task',
  title: 'Draft calm todo copy',
  createdAt: baseTimestamp,
  order: 1,
});

const replacementTask: Task = {
  ...sampleTask,
  title: 'Updated calm copy',
  updatedAt: '2026-01-31T12:05:00.000Z',
};

describe('Input feedback (spec 0011)', () => {
  test('empty submission surfaces a subtle border with helper guidance', () => {
    const state = deriveInputFeedback('   ', true);
    expect(state.kind).toBe('inputError');
    expect(state.borderTone).toBe('subtle');
    expect(state.canSubmit).toBe(false);
    expect(state.helperText).toContain('Add');
  });

  test('non-empty value stays calm and keeps helper hidden', () => {
    const state = deriveInputFeedback('Write friendly copy', true);
    expect(state.kind).toBe('idle');
    expect(state.borderTone).toBe('none');
    expect(state.canSubmit).toBe(true);
    expect(state.helperText).toBeUndefined();
  });
});

describe('Saving feedback (spec 0011)', () => {
  test('planOptimisticSave updates tasks immediately and avoids blocking indicators', () => {
    const plan: OptimisticSavePlan = planOptimisticSave([sampleTask], replacementTask, 'req-optimistic');

    expect(plan.nextTasks[0].title).toBe('Updated calm copy');
    expect(plan.feedback.optimistic).toBe(true);
    expect(plan.feedback.blocking).toBe(false);
    expect(plan.feedback.showSpinner).toBe(false);
    expect(plan.feedback.requestId).toBe('req-optimistic');
  });
});

describe('Deletion feedback (spec 0011)', () => {
  test('scheduleDeletionWithUndo removes instantly while configuring a 5s undo toast', () => {
    const deletionTimestamp: Timestamp = '2026-01-31T12:10:00.000Z';
    const secondaryTask: Task = createTask({
      id: 'secondary',
      title: 'Gently confirm removal copy',
      createdAt: '2026-01-31T12:02:00.000Z',
      order: 2,
    });

    const plan: DeletionPlan = scheduleDeletionWithUndo(
      [sampleTask, secondaryTask],
      sampleTask.id,
      deletionTimestamp,
    );

    expect(plan.nextTasks.map((task) => task.id)).toEqual([secondaryTask.id]);
    expect(plan.toast.durationMs).toBe(5000);
    expect(plan.toast.expiresAt).not.toBe(deletionTimestamp);
    expect(plan.toast.taskSnapshot?.id).toBe(sampleTask.id);
  });
});
