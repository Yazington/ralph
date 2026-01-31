import { describe, it, expect } from 'vitest';
import { validateTask, isTaskComplete, getTaskCompletionPercentage } from '../domain_types/task-utils';
import { Task, Subtask } from '../domain_types/task';

describe('Task validation', () => {
  it('should pass valid task', () => {
    const task: Partial<Task> = {
      id: '1',
      title: 'Test task',
      priority: 'medium',
      dueDate: new Date('2025-12-31'),
      subtasks: [],
    };
    const errors = validateTask(task);
    expect(errors).toEqual([]);
  });

  it('should reject task without id', () => {
    const task: Partial<Task> = {
      title: 'Test task',
    };
    const errors = validateTask(task);
    expect(errors).toContain('Task must have an id');
  });

  it('should reject task without title', () => {
    const task: Partial<Task> = {
      id: '1',
      title: '',
    };
    const errors = validateTask(task);
    expect(errors).toContain('Task must have a title');
  });

  it('should reject invalid priority', () => {
    const task: Partial<Task> = {
      id: '1',
      title: 'Test',
      priority: 'invalid' as any,
    };
    const errors = validateTask(task);
    expect(errors).toContain('Priority must be low, medium, or high');
  });

  it('should reject invalid due date', () => {
    const task: Partial<Task> = {
      id: '1',
      title: 'Test',
      dueDate: 'not a date' as any,
    };
    const errors = validateTask(task);
    expect(errors).toContain('Due date must be a valid date');
  });

  it('should validate subtasks', () => {
    const task: Partial<Task> = {
      id: '1',
      title: 'Test',
      subtasks: [
        { id: '', title: '', completed: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'st2', title: 'Subtask 2', completed: true, createdAt: new Date(), updatedAt: new Date() },
      ],
    };
    const errors = validateTask(task);
    expect(errors).toContain('Subtask 0 must have an id');
    expect(errors).toContain('Subtask 0 must have a title');
    expect(errors).not.toContain('Subtask 1 must have an id');
  });
});

describe('Task completion', () => {
  it('should return true when task completed and no subtasks', () => {
    const task: Task = {
      id: '1',
      title: 'Test',
      priority: 'low',
      tags: [],
      subtasks: [],
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: [],
    };
    expect(isTaskComplete(task)).toBe(true);
  });

  it('should return false when task not completed', () => {
    const task: Task = {
      id: '1',
      title: 'Test',
      priority: 'low',
      tags: [],
      subtasks: [],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: [],
    };
    expect(isTaskComplete(task)).toBe(false);
  });

  it('should return true when all subtasks completed', () => {
    const subtask: Subtask = {
      id: 'st1',
      title: 'Subtask',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const task: Task = {
      id: '1',
      title: 'Test',
      priority: 'low',
      tags: [],
      subtasks: [subtask],
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: [],
    };
    expect(isTaskComplete(task)).toBe(true);
  });

  it('should return false when some subtasks incomplete', () => {
    const subtask1: Subtask = { id: 'st1', title: 'Subtask 1', completed: true, createdAt: new Date(), updatedAt: new Date() };
    const subtask2: Subtask = { id: 'st2', title: 'Subtask 2', completed: false, createdAt: new Date(), updatedAt: new Date() };
    const task: Task = {
      id: '1',
      title: 'Test',
      priority: 'low',
      tags: [],
      subtasks: [subtask1, subtask2],
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: [],
    };
    expect(isTaskComplete(task)).toBe(false);
  });
});

describe('Task completion percentage', () => {
  it('should return 100 for completed task with no subtasks', () => {
    const task: Task = {
      id: '1',
      title: 'Test',
      priority: 'low',
      tags: [],
      subtasks: [],
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: [],
    };
    expect(getTaskCompletionPercentage(task)).toBe(100);
  });

  it('should return 0 for incomplete task with no subtasks', () => {
    const task: Task = {
      id: '1',
      title: 'Test',
      priority: 'low',
      tags: [],
      subtasks: [],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: [],
    };
    expect(getTaskCompletionPercentage(task)).toBe(0);
  });

  it('should calculate percentage based on subtasks', () => {
    const subtask1: Subtask = { id: 'st1', title: 'Subtask 1', completed: true, createdAt: new Date(), updatedAt: new Date() };
    const subtask2: Subtask = { id: 'st2', title: 'Subtask 2', completed: false, createdAt: new Date(), updatedAt: new Date() };
    const task: Task = {
      id: '1',
      title: 'Test',
      priority: 'low',
      tags: [],
      subtasks: [subtask1, subtask2],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: [],
    };
    expect(getTaskCompletionPercentage(task)).toBe(50);
  });

  it('should round percentage', () => {
    const subtask1: Subtask = { id: 'st1', title: 'Subtask 1', completed: true, createdAt: new Date(), updatedAt: new Date() };
    const subtask2: Subtask = { id: 'st2', title: 'Subtask 2', completed: true, createdAt: new Date(), updatedAt: new Date() };
    const subtask3: Subtask = { id: 'st3', title: 'Subtask 3', completed: false, createdAt: new Date(), updatedAt: new Date() };
    const task: Task = {
      id: '1',
      title: 'Test',
      priority: 'low',
      tags: [],
      subtasks: [subtask1, subtask2, subtask3],
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: [],
    };
    expect(getTaskCompletionPercentage(task)).toBe(67); // 2/3 ≈ 66.666 -> rounded to 67
  });
});

describe('Task validation with recurrence and reminders', () => {
  it('should validate recurrence rule', () => {
    const task: Partial<Task> = {
      id: '1',
      title: 'Test',
      recurrence: { frequency: 'invalid' as any, interval: 1 },
    };
    const errors = validateTask(task);
    expect(errors).toContain('Frequency must be daily, weekly, monthly, yearly, or custom');
  });

  it('should validate reminder', () => {
    const task: Partial<Task> = {
      id: '1',
      title: 'Test',
      reminders: [
        { id: '', triggerAt: new Date(), notified: false },
      ],
    };
    const errors = validateTask(task);
    expect(errors).toContain('Reminder 0 must have an id');
  });

  it('should accept valid reminder', () => {
    const task: Partial<Task> = {
      id: '1',
      title: 'Test',
      reminders: [
        { id: 'rem1', triggerAt: new Date('2026-01-31T12:00:00'), notified: false },
      ],
    };
    const errors = validateTask(task);
    expect(errors).not.toContain('Reminder 0 must have an id');
    expect(errors).not.toContain('Reminder 0 must have a valid trigger date');
  });
});