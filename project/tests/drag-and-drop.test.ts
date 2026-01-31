import { describe, expect, test } from 'vitest';
import { reorderTasksByDrag, getDragVisualPlan, deriveStackedTaskPlan } from '../domain_types/drag-and-drop';
import { createTask, Task } from '../domain_types/task-domain';

function buildTasks(): Task[] {
  return [
    createTask({ id: 'a', title: 'Write calm task', createdAt: '2026-01-01T08:00:00.000Z', order: 0 }),
    createTask({ id: 'b', title: 'Review notes', createdAt: '2026-01-01T09:00:00.000Z', order: 1 }),
    createTask({ id: 'c', title: 'Share update', createdAt: '2026-01-01T10:00:00.000Z', order: 2 }),
  ];
}

describe('Drag reorder helper (drag-and-drop spec)', () => {
  test('moves the dragged task to the requested index and normalizes order tokens', () => {
    const tasks = buildTasks();
    const result = reorderTasksByDrag(tasks, 'a', 2);

    expect(result.changed).toBe(true);
    expect(result.fromIndex).toBe(0);
    expect(result.toIndex).toBe(2);
    expect(result.tasks.map((task) => task.id)).toEqual(['b', 'c', 'a']);
    expect(result.tasks.map((task) => task.order)).toEqual([0, 1, 2]);
    expect(tasks[0].order).toBe(0);
  });

  test('clamps invalid destination indexes and skips work when the task is missing', () => {
    const tasks = buildTasks();
    const clamped = reorderTasksByDrag(tasks, 'c', 99);
    expect(clamped.changed).toBe(false);
    expect(clamped.toIndex).toBe(2);
    expect(clamped.tasks.map((task) => task.id)).toEqual(['a', 'b', 'c']);

    const missing = reorderTasksByDrag(tasks, 'missing', Number.NaN);
    expect(missing.changed).toBe(false);
    expect(missing.fromIndex).toBe(-1);
    expect(missing.tasks.map((task) => task.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('Drag visual plan (drag-and-drop spec)', () => {
  test('reuses the calm palette so drag states do not add new styling variations', () => {
    const plan = getDragVisualPlan();
    const ids = [plan.restingSurface.id, plan.draggingSurface.id, plan.placeholderSurface.id];
    ids.forEach((id) => {
      expect(plan.allowedSurfaceIds).toContain(id);
    });
    expect(new Set(ids).size).toBeLessThanOrEqual(plan.allowedSurfaceIds.length);
    expect(plan.allowedSurfaceIds).toEqual(['deepPanel', 'panelAlt', 'panelTeal']);
    expect(plan.accentHex).toBe('#7299A2');
  });
});

describe('Stacked task plan (drag-and-drop spec)', () => {
  test('keeps active tasks on top and offsets completed tasks so they feel tucked below', () => {
    const tasks = [
      createTask({ id: 'active-1', title: 'First', createdAt: '2026-01-01T08:00:00.000Z', order: 0 }),
      createTask({ id: 'done-1', title: 'Second', createdAt: '2026-01-01T09:00:00.000Z', order: 1, completed: true }),
      createTask({ id: 'active-2', title: 'Third', createdAt: '2026-01-01T10:00:00.000Z', order: 2 }),
      createTask({ id: 'done-2', title: 'Fourth', createdAt: '2026-01-01T11:00:00.000Z', order: 3, completed: true }),
    ];

    const plan = deriveStackedTaskPlan(tasks);
    expect(plan.descriptors.map((descriptor) => descriptor.id)).toEqual([
      'active-1',
      'active-2',
      'done-1',
      'done-2',
    ]);
    const completed = plan.descriptors.filter((descriptor) => descriptor.stackRole === 'completed');
    expect(completed.map((descriptor) => descriptor.offsetPx)).toEqual([12, 24]);
    expect(plan.completedOffsetStepPx).toBe(12);
  });
});
