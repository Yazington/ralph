import { describe, it, expect } from 'vitest';
import { validateCategory } from '../domain_types/category-utils';
import { Category } from '../domain_types/category';

describe('Category validation', () => {
  it('should pass valid category', () => {
    const category: Partial<Category> = {
      id: 'cat1',
      name: 'Work',
      color: '#FF5733',
      icon: 'briefcase',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const errors = validateCategory(category);
    expect(errors).toEqual([]);
  });

  it('should reject category without id', () => {
    const category: Partial<Category> = {
      name: 'Work',
    };
    const errors = validateCategory(category);
    expect(errors).toContain('Category must have an id');
  });

  it('should reject category without name', () => {
    const category: Partial<Category> = {
      id: 'cat1',
      name: '',
    };
    const errors = validateCategory(category);
    expect(errors).toContain('Category must have a name');
  });

  it('should accept named color', () => {
    const category: Partial<Category> = {
      id: 'cat1',
      name: 'Work',
      color: 'red',
    };
    const errors = validateCategory(category);
    expect(errors).not.toContain('Color must be a valid CSS color hex (#RRGGBB or #RGB) or named color');
  });

  it('should accept hex color with 3 digits', () => {
    const category: Partial<Category> = {
      id: 'cat1',
      name: 'Work',
      color: '#F00',
    };
    const errors = validateCategory(category);
    expect(errors).toEqual([]);
  });

  it('should accept hex color with 6 digits', () => {
    const category: Partial<Category> = {
      id: 'cat1',
      name: 'Work',
      color: '#FF5733',
    };
    const errors = validateCategory(category);
    expect(errors).toEqual([]);
  });

  it('should reject invalid color', () => {
    const category: Partial<Category> = {
      id: 'cat1',
      name: 'Work',
      color: 'notacolor',
    };
    const errors = validateCategory(category);
    expect(errors).toContain('Color must be a valid CSS color hex (#RRGGBB or #RGB) or named color');
  });
});