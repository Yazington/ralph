import { Task } from './task';

export interface Repository<T, ID> {
  create(item: T): Promise<ID>;
  read(id: ID): Promise<T | null>;
  update(id: ID, updates: Partial<T>): Promise<void>;
  delete(id: ID): Promise<void>;
  list(options?: ListOptions): Promise<T[]>;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskRepository extends Repository<Task, string> {
  findByDueDate(range: { start?: Date; end?: Date }): Promise<Task[]>;
  findByPriority(priority: Task['priority']): Promise<Task[]>;
  findByTags(tags: string[]): Promise<Task[]>;
  findCompleted(): Promise<Task[]>;
  findIncomplete(): Promise<Task[]>;
  searchByTitle(keyword: string): Promise<Task[]>;
}

// DataStore interface abstracts the underlying storage mechanism (IndexedDB, localStorage, mock, etc.)
export interface DataStore {
  tasks: TaskRepository;
  // future: users, categories, etc.
}