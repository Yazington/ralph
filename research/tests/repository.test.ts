import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTaskRepository } from '../data/in-memory-task-repository';
import { Task, Priority } from '../domain_types/task';

describe('InMemoryTaskRepository', () => {
  let repo: InMemoryTaskRepository;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
  });

  const sampleTask: Task = {
    id: '1',
    title: 'Test task',
    description: 'Test description',
    dueDate: new Date('2026-12-31'),
    priority: 'medium',
    tags: ['work', 'urgent'],
    subtasks: [],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    reminders: [],
  };

  it('should create and read a task', async () => {
    const id = await repo.create(sampleTask);
    expect(id).toBe('1');
    const retrieved = await repo.read('1');
    expect(retrieved).toEqual(sampleTask);
  });

  it('should update a task', async () => {
    await repo.create(sampleTask);
    await repo.update('1', { completed: true });
    const updated = await repo.read('1');
    expect(updated?.completed).toBe(true);
    // ensure other fields unchanged
    expect(updated?.title).toBe(sampleTask.title);
  });

  it('should delete a task', async () => {
    await repo.create(sampleTask);
    await repo.delete('1');
    const deleted = await repo.read('1');
    expect(deleted).toBeNull();
  });

  it('should list tasks', async () => {
    await repo.create(sampleTask);
    await repo.create({ ...sampleTask, id: '2', title: 'Task 2' });
    const tasks = await repo.list();
    expect(tasks).toHaveLength(2);
    expect(tasks[0].id).toBe('1');
    expect(tasks[1].id).toBe('2');
  });

  it('should list tasks with sorting', async () => {
    const task1 = { ...sampleTask, id: '1', dueDate: new Date('2026-01-02') };
    const task2 = { ...sampleTask, id: '2', dueDate: new Date('2026-01-01') };
    await repo.create(task1);
    await repo.create(task2);
    const tasks = await repo.list({ sortBy: 'dueDate', sortOrder: 'asc' });
    expect(tasks[0].id).toBe('2');
    expect(tasks[1].id).toBe('1');
  });

  it('should list tasks with limit and offset', async () => {
    for (let i = 1; i <= 5; i++) {
      await repo.create({ ...sampleTask, id: String(i) });
    }
    const tasks = await repo.list({ limit: 2, offset: 1 });
    expect(tasks).toHaveLength(2);
    expect(tasks[0].id).toBe('2');
    expect(tasks[1].id).toBe('3');
  });

  it('should find tasks by due date range', async () => {
    const task1 = { ...sampleTask, id: '1', dueDate: new Date('2026-01-15') };
    const task2 = { ...sampleTask, id: '2', dueDate: new Date('2026-02-15') };
    await repo.create(task1);
    await repo.create(task2);
    const found = await repo.findByDueDate({
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
    });
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe('1');
  });

  it('should find tasks by priority', async () => {
    const task1 = { ...sampleTask, id: '1', priority: 'high' as Priority };
    const task2 = { ...sampleTask, id: '2', priority: 'low' as Priority };
    await repo.create(task1);
    await repo.create(task2);
    const highTasks = await repo.findByPriority('high');
    expect(highTasks).toHaveLength(1);
    expect(highTasks[0].id).toBe('1');
  });

  it('should find tasks by tags', async () => {
    const task1 = { ...sampleTask, id: '1', tags: ['work', 'home'] };
    const task2 = { ...sampleTask, id: '2', tags: ['work'] };
    await repo.create(task1);
    await repo.create(task2);
    const found = await repo.findByTags(['home']);
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe('1');
  });

  it('should find completed tasks', async () => {
    const task1 = { ...sampleTask, id: '1', completed: true };
    const task2 = { ...sampleTask, id: '2', completed: false };
    await repo.create(task1);
    await repo.create(task2);
    const completed = await repo.findCompleted();
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe('1');
  });

  it('should find incomplete tasks', async () => {
    const task1 = { ...sampleTask, id: '1', completed: true };
    const task2 = { ...sampleTask, id: '2', completed: false };
    await repo.create(task1);
    await repo.create(task2);
    const incomplete = await repo.findIncomplete();
    expect(incomplete).toHaveLength(1);
    expect(incomplete[0].id).toBe('2');
  });

  it('should search tasks by title keyword', async () => {
    const task1 = { ...sampleTask, id: '1', title: 'Buy groceries' };
    const task2 = { ...sampleTask, id: '2', title: 'Clean house' };
    await repo.create(task1);
    await repo.create(task2);
    const results = await repo.searchByTitle('groceries');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });
});