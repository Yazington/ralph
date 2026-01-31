import { Category } from '../domain_types/category';
import { CategoryRepository, ListOptions } from '../domain_types/repository';

export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Map<string, Category> = new Map();
  private idCounter = 1;

  async create(category: Category): Promise<string> {
    const id = category.id || `category-${this.idCounter++}`;
    const categoryWithId = { ...category, id };
    this.categories.set(id, categoryWithId);
    return id;
  }

  async read(id: string): Promise<Category | null> {
    return this.categories.get(id) || null;
  }

  async update(id: string, updates: Partial<Category>): Promise<void> {
    const existing = await this.read(id);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, id };
    this.categories.set(id, updated);
  }

  async delete(id: string): Promise<void> {
    this.categories.delete(id);
  }

  async list(options?: ListOptions): Promise<Category[]> {
    let categories = Array.from(this.categories.values());
    if (options?.sortBy) {
      const { sortBy, sortOrder = 'asc' } = options;
      categories.sort((a, b) => {
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
      categories = categories.slice(options.offset);
    }
    if (options?.limit) {
      categories = categories.slice(0, options.limit);
    }
    return categories;
  }

  async findByName(name: string): Promise<Category | null> {
    return Array.from(this.categories.values()).find(cat => cat.name === name) || null;
  }

  async searchByName(keyword: string): Promise<Category[]> {
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(this.categories.values()).filter(cat =>
      cat.name.toLowerCase().includes(lowerKeyword)
    );
  }
}