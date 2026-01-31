import { describe, expect, test } from 'vitest';
import {
  Task,
  TaskFilter,
  addTask,
  createTask,
  filterTasks,
  removeTask,
  toggleTaskCompletion,
  updateTask,
} from '../domain_types/task-domain';

const baseTimestamp = '2026-01-31T08:00:00.000Z';

const activeTask: Task = createTask({
  id: 'use-specs',
  title: 'Catalog project specs',
  createdAt: baseTimestamp,
  description: 'Understand typography and interactions.',
  order: 1,
});

const completedTask: Task = createTask({
  id: 'write-tests',
  title: 'Write domain tests',
  createdAt: '2026-01-31T09:00:00.000Z',
  completed: true,
  order: 2,
});

describe('Task domain logic (spec 0003)', () => {
  test('createTask fills defaults expected by the metadata spec', () => {
    const timestamp: Task['createdAt'] = '2026-01-31T10:00:00.000Z';
    const task = createTask({
      id: 'new-task',
      title: 'Add TODO card',
      createdAt: timestamp,
    });

    expect(task.completed).toBe(false);
    expect(task.order).toBe(0);
    expect(task.updatedAt).toBe(timestamp);
  });

  test('addTask appends unique tasks and never duplicates ids', () => {
    const tasks: Task[] = [activeTask];
    const appended = addTask(tasks, completedTask);
    expect(appended).toHaveLength(2);
    expect(appended[1]).toEqual(completedTask);

    const deduped = addTask(appended, activeTask);
    expect(deduped).toHaveLength(2);
  });

  test('updateTask can edit mutable fields while preserving createdAt and id', () => {
    const updatedAt = '2026-01-31T11:00:00.000Z';
    const refreshed = updateTask([activeTask], activeTask.id, {
      title: 'Catalog specs and requirements',
      description: 'Capture the TODO scope and domain types.',
      updatedAt,
    });

    expect(refreshed[0].id).toBe(activeTask.id);
    expect(refreshed[0].createdAt).toBe(activeTask.createdAt);
    expect(refreshed[0].title).toBe('Catalog specs and requirements');
    expect(refreshed[0].description).toBe('Capture the TODO scope and domain types.');
    expect(refreshed[0].updatedAt).toBe(updatedAt);
  });

  test('toggleTaskCompletion flips completion state and respects explicit overrides', () => {
    const toggled = toggleTaskCompletion([activeTask], activeTask.id, '2026-01-31T12:00:00.000Z');
    expect(toggled[0].completed).toBe(true);

    const enforced = toggleTaskCompletion(toggled, activeTask.id, '2026-01-31T13:00:00.000Z', false);
    expect(enforced[0].completed).toBe(false);
  });

  test('filterTasks honors all, active, and completed filters', () => {
    const tasks: Task[] = [activeTask, completedTask];
    const allFilter: TaskFilter = 'all';
    const activeFilter: TaskFilter = 'active';
    const completedFilter: TaskFilter = 'completed';

    expect(filterTasks(tasks, allFilter)).toHaveLength(2);
    expect(filterTasks(tasks, activeFilter)).toEqual([activeTask]);
    expect(filterTasks(tasks, completedFilter)).toEqual([completedTask]);
  });

  test('removeTask drops the targeted task without mutating the rest', () => {
    const tasks: Task[] = [activeTask, completedTask];
    const pruned = removeTask(tasks, activeTask.id);
    expect(pruned).toEqual([completedTask]);
    expect(tasks).toEqual([activeTask, completedTask]);
  });
});
