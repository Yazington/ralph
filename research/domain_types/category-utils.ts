import { Category } from './category';

export function validateCategory(category: Partial<Category>): string[] {
  const errors: string[] = [];
  if (!category.id) errors.push('Category must have an id');
  if (!category.name || category.name.trim().length === 0) errors.push('Category must have a name');
  if (category.color && !isValidColor(category.color)) {
    errors.push('Color must be a valid CSS color hex (#RRGGBB or #RGB) or named color');
  }
  return errors;
}

function isValidColor(color: string): boolean {
  // Simple validation: accept hex or named colors (basic check)
  const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'purple', 'orange', 'gray', 'pink', 'brown'
  ];
  return hexRegex.test(color) || namedColors.includes(color.toLowerCase());
}