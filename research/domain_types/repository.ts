import { Task } from './task';
import { User } from './user';
import { Category } from './category';
import { Comment } from './comment';
import { Notification } from './notification';

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

export interface UserRepository extends Repository<User, string> {
  findByEmail(email: string): Promise<User | null>;
  searchByName(keyword: string): Promise<User[]>;
}

export interface CategoryRepository extends Repository<Category, string> {
  findByName(name: string): Promise<Category | null>;
  searchByName(keyword: string): Promise<Category[]>;
}

export interface CommentRepository extends Repository<Comment, string> {
  findByTaskId(taskId: string): Promise<Comment[]>;
  findByUserId(userId: string): Promise<Comment[]>;
}

export interface NotificationRepository extends Repository<Notification, string> {
  findByUserId(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

// DataStore interface abstracts the underlying storage mechanism (IndexedDB, localStorage, mock, etc.)
export interface DataStore {
  tasks: TaskRepository;
  users: UserRepository;
  categories: CategoryRepository;
  comments: CommentRepository;
  notifications: NotificationRepository;
}