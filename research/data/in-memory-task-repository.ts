import { Task, Priority } from '../domain_types/task';
import { TaskRepository, ListOptions } from '../domain_types/repository';

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();
  private idCounter = 1;

  async create(task: Task): Promise<string> {
    const id = task.id || `task-${this.idCounter++}`;
    const taskWithId = { ...task, id };
    this.tasks.set(id, taskWithId);
    return id;
  }

  async read(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async update(id: string, updates: Partial<Task>): Promise<void> {
    const existing = await this.read(id);
    if (!existing) {
      throw new Error(`Task with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, id };
    this.tasks.set(id, updated);
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async list(options?: ListOptions): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    if (options?.sortBy) {
      const { sortBy, sortOrder = 'asc' } = options;
      tasks.sort((a, b) => {
        let aVal = (a as any)[sortBy];
        let bVal = (b as any)[sortBy];
        if (aVal instanceof Date) aVal = aVal.getTime();
        if (bVal instanceof Date) bVal = bVal.getTime();
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    if (options?.offset) {
      tasks = tasks.slice(options.offset);
    }
    if (options?.limit) {
      tasks = tasks.slice(0, options.limit);
    }
    return tasks;
  }

  async findByDueDate(range: { start?: Date; end?: Date }): Promise<Task[]> {
    const { start, end } = range;
    return Array.from(this.tasks.values()).filter(task => {
      if (!task.dueDate) return false;
      const dueTime = task.dueDate.getTime();
      if (start && dueTime < start.getTime()) return false;
      if (end && dueTime > end.getTime()) return false;
      return true;
    });
  }

  async findByPriority(priority: Priority): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.priority === priority);
  }

  async findByTags(tags: string[]): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task =>
      tags.every(tag => task.tags.includes(tag))
    );
  }

  async findCompleted(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.completed);
  }

  async findIncomplete(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => !task.completed);
  }

  async searchByTitle(keyword: string): Promise<Task[]> {
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(this.tasks.values()).filter(task =>
      task.title.toLowerCase().includes(lowerKeyword)
    );
  }
}