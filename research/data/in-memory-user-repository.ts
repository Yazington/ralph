import { User } from '../domain_types/user';
import { UserRepository, ListOptions } from '../domain_types/repository';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private idCounter = 1;

  async create(user: User): Promise<string> {
    const id = user.id || `user-${this.idCounter++}`;
    const userWithId = { ...user, id };
    this.users.set(id, userWithId);
    return id;
  }

  async read(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async update(id: string, updates: Partial<User>): Promise<void> {
    const existing = await this.read(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, id };
    this.users.set(id, updated);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async list(options?: ListOptions): Promise<User[]> {
    let users = Array.from(this.users.values());
    if (options?.sortBy) {
      const { sortBy, sortOrder = 'asc' } = options;
      users.sort((a, b) => {
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
      users = users.slice(options.offset);
    }
    if (options?.limit) {
      users = users.slice(0, options.limit);
    }
    return users;
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }

  async searchByName(keyword: string): Promise<User[]> {
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(this.users.values()).filter(user =>
      user.name.toLowerCase().includes(lowerKeyword)
    );
  }
}