import { TaskFilter } from './task-domain';
import { ComposerKey } from './interactions';

export type ComponentId = 'inputBar' | 'todoItem' | 'itemActions' | 'footer';

export interface TextFieldPart {
  kind: 'textField';
  id: string;
  submitKeys: ComposerKey[];
  pairedButtonId?: string;
}

export interface ButtonPart {
  kind: 'button';
  id: string;
  action: 'add' | 'edit' | 'delete';
  iconOnly: boolean;
}

export interface CheckboxPart {
  kind: 'checkbox';
  id: string;
  togglesCompletion: boolean;
}

export interface TitlePart {
  kind: 'title';
  id: string;
  inlineEditable: boolean;
}

export interface FooterCountPart {
  kind: 'metadata';
  id: string;
  displays: 'itemCount';
}

export interface FilterPillPart {
  kind: 'filterPill';
  id: string;
  filter: TaskFilter;
}

export type ComponentPart =
  | TextFieldPart
  | ButtonPart
  | CheckboxPart
  | TitlePart
  | FooterCountPart
  | FilterPillPart;

export interface ComponentBlueprint<TPart extends ComponentPart = ComponentPart> {
  id: ComponentId;
  label: string;
  parts: TPart[];
}

const ADD_BUTTON_ID = 'composer-add-button';
const COMPOSER_FIELD_ID = 'composer-text-field';
const TODO_CHECKBOX_ID = 'todo-item-checkbox';
const TODO_TITLE_ID = 'todo-item-title';
const EDIT_BUTTON_ID = 'todo-item-edit';
const DELETE_BUTTON_ID = 'todo-item-delete';
const FOOTER_COUNT_ID = 'footer-count-label';

const FILTERS: TaskFilter[] = ['all', 'active', 'completed'];

export function getInputBarBlueprint(): ComponentBlueprint {
  const field: TextFieldPart = {
    kind: 'textField',
    id: COMPOSER_FIELD_ID,
    submitKeys: ['Enter'],
    pairedButtonId: ADD_BUTTON_ID,
  };

  const addButton: ButtonPart = {
    kind: 'button',
    id: ADD_BUTTON_ID,
    action: 'add',
    iconOnly: false,
  };

  return { id: 'inputBar', label: 'Input bar', parts: [field, addButton] };
}

export function getTodoItemBlueprint(): ComponentBlueprint {
  const checkbox: CheckboxPart = {
    kind: 'checkbox',
    id: TODO_CHECKBOX_ID,
    togglesCompletion: true,
  };

  const title: TitlePart = {
    kind: 'title',
    id: TODO_TITLE_ID,
    inlineEditable: true,
  };

  return { id: 'todoItem', label: 'Todo item', parts: [checkbox, title] };
}

export function getItemActionsBlueprint(): ComponentBlueprint {
  const editButton: ButtonPart = {
    kind: 'button',
    id: EDIT_BUTTON_ID,
    action: 'edit',
    iconOnly: true,
  };

  const deleteButton: ButtonPart = {
    kind: 'button',
    id: DELETE_BUTTON_ID,
    action: 'delete',
    iconOnly: true,
  };

  return { id: 'itemActions', label: 'Item actions', parts: [editButton, deleteButton] };
}

export function getFooterBlueprint(): ComponentBlueprint {
  const countPart: FooterCountPart = {
    kind: 'metadata',
    id: FOOTER_COUNT_ID,
    displays: 'itemCount',
  };

  const pills: FilterPillPart[] = FILTERS.map((filter) => ({
    kind: 'filterPill',
    id: `filter-pill-${filter}`,
    filter,
  }));

  return { id: 'footer', label: 'Footer', parts: [countPart, ...pills] };
}
