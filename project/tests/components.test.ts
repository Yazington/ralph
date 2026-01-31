import { describe, expect, test } from 'vitest';
import { TaskFilter } from '../domain_types/task-domain';
import {
  getInputBarBlueprint,
  getItemActionsBlueprint,
  getFooterBlueprint,
  getTodoItemBlueprint,
  ComponentBlueprint,
  ComponentPart,
  ButtonPart,
  FilterPillPart,
  TextFieldPart,
  TitlePart,
  CheckboxPart,
} from '../domain_types/components';

function getPart<T extends ComponentPart>(blueprint: ComponentBlueprint, kind: T['kind']): T {
  const part = blueprint.parts.find((candidate) => candidate.kind === kind);
  if (!part) {
    throw new Error(`Missing part kind: ${kind}`);
  }
  return part as T;
}

describe('Input bar blueprint (spec 0006)', () => {
  test('pairs the text field with an Add button and Enter submit', () => {
    const blueprint = getInputBarBlueprint();
    const field = getPart<TextFieldPart>(blueprint, 'textField');
    expect(field.submitKeys).toContain('Enter');
    expect(field.pairedButtonId).toContain('add');

    const addButton = blueprint.parts.find(
      (part): part is ButtonPart => part.kind === 'button' && part.action === 'add',
    );
    expect(addButton).toBeDefined();
    expect(addButton?.iconOnly).toBe(false);
    expect(addButton?.id).toBe(field.pairedButtonId);
  });
});

describe('Todo item blueprint (spec 0006)', () => {
  test('exposes a checkbox and inline-editable title', () => {
    const blueprint = getTodoItemBlueprint();
    const checkbox = getPart<CheckboxPart>(blueprint, 'checkbox');
    expect(checkbox.togglesCompletion).toBe(true);

    const title = getPart<TitlePart>(blueprint, 'title');
    expect(title.inlineEditable).toBe(true);
  });
});

describe('Item action blueprint (spec 0006)', () => {
  test('includes icon-only edit and delete buttons', () => {
    const blueprint = getItemActionsBlueprint();
    const editButton = blueprint.parts.find(
      (part): part is ButtonPart => part.kind === 'button' && part.action === 'edit',
    );
    const deleteButton = blueprint.parts.find(
      (part): part is ButtonPart => part.kind === 'button' && part.action === 'delete',
    );

    expect(editButton).toBeDefined();
    expect(deleteButton).toBeDefined();
    expect(editButton?.iconOnly).toBe(true);
    expect(deleteButton?.iconOnly).toBe(true);
  });
});

describe('Footer blueprint (spec 0006)', () => {
  test('presents the count plus filter pills for every task filter', () => {
    const blueprint = getFooterBlueprint();
    const metadata = blueprint.parts.find((part) => part.kind === 'metadata');
    expect(metadata).toBeDefined();
    expect(metadata?.displays).toBe('itemCount');

    const pills = blueprint.parts.filter((part): part is FilterPillPart => part.kind === 'filterPill');
    const filters = pills.map((pill) => pill.filter);
    const expectedFilters: TaskFilter[] = ['all', 'active', 'completed'];
    expect(filters).toEqual(expectedFilters);
  });
});
