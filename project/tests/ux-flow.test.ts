import { describe, expect, test } from 'vitest';
import { createTask, Task, Timestamp } from '../domain_types/task-domain';
import {
  ComposerState,
  createInitialComposerState,
  updateComposerValue,
  completeComposerSubmit,
  beginEditSession,
  updateEditDraft,
  resolveEditAction,
  deriveDisplayTasks,
  DisplayTask,
} from '../domain_types/ux-flow';

const baseTimestamp: Timestamp = '2026-01-31T08:00:00.000Z';

const activeTask: Task = createTask({
  id: 'capture-flow',
  title: 'Describe first-run focus',
  createdAt: baseTimestamp,
  order: 1,
});

const completedTask: Task = createTask({
  id: 'dim-completed',
  title: 'Dim and reorder done tasks',
  createdAt: '2026-01-31T09:00:00.000Z',
  completed: true,
  order: 2,
});

describe('Composer state (spec 0008)', () => {
  test('initial composer focuses input with a visible hint', () => {
    const composer: ComposerState = createInitialComposerState();
    expect(composer.value).toBe('');
    expect(composer.isFocused).toBe(true);
    expect(composer.showHint).toBe(true);
    expect(composer.isActive).toBe(false);
  });

  test('typing activates the composer and hides the hint while preserving focus', () => {
    const initial = createInitialComposerState();
    const withValue = updateComposerValue(initial, 'Plan calm tasks');

    expect(withValue.value).toBe('Plan calm tasks');
    expect(withValue.isActive).toBe(true);
    expect(withValue.showHint).toBe(false);
    expect(withValue.isFocused).toBe(true);

    const cleared = updateComposerValue(withValue, '');
    expect(cleared.isActive).toBe(false);
    expect(cleared.showHint).toBe(true);
  });

  test('submitting clears the composer value but keeps the input focused', () => {
    const withValue = updateComposerValue(createInitialComposerState(), 'Write tests');
    const afterSubmit = completeComposerSubmit(withValue);

    expect(afterSubmit.value).toBe('');
    expect(afterSubmit.isActive).toBe(false);
    expect(afterSubmit.isFocused).toBe(true);
    expect(afterSubmit.showHint).toBe(false);
  });
});

describe('Edit flow (spec 0008)', () => {
  test('beginEditSession copies the current title and stays active until resolved', () => {
    const session = beginEditSession(activeTask);
    expect(session.taskId).toBe(activeTask.id);
    expect(session.originalTitle).toBe(activeTask.title);
    expect(session.draftTitle).toBe(activeTask.title);
    expect(session.isEditing).toBe(true);
  });

  test('resolveEditAction saves on Enter and cancels on Escape', () => {
    const session = updateEditDraft(beginEditSession(activeTask), 'Describe enter to save');
    const saveAction = resolveEditAction(session, 'Enter', '2026-01-31T10:00:00.000Z');
    expect(saveAction.kind).toBe('save');
    expect(saveAction.update.title).toBe('Describe enter to save');
    expect(saveAction.update.updatedAt).toBe('2026-01-31T10:00:00.000Z');

    const cancelAction = resolveEditAction(session, 'Escape', '2026-01-31T10:00:00.000Z');
    expect(cancelAction.kind).toBe('cancel');
    expect(cancelAction.update.title).toBe(session.originalTitle);
  });
});

describe('Complete flow ordering (spec 0008)', () => {
  test('deriveDisplayTasks dims completed tasks and sorts them after active ones', () => {
    const tasks: Task[] = [completedTask, activeTask];
    const display: DisplayTask[] = deriveDisplayTasks(tasks);

    expect(display.map((task) => task.id)).toEqual([activeTask.id, completedTask.id]);
    expect(display[0].dimmed).toBe(false);
    expect(display[1].dimmed).toBe(true);
    expect(tasks[0].id).toBe(completedTask.id);
  });
});
