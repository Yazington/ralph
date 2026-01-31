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

export function getInputBarBlueprint(): ComponentBlueprint {
  return { id: 'inputBar', label: 'Input bar', parts: [] };
}

export function getTodoItemBlueprint(): ComponentBlueprint {
  return { id: 'todoItem', label: 'Todo item', parts: [] };
}

export function getItemActionsBlueprint(): ComponentBlueprint {
  return { id: 'itemActions', label: 'Item actions', parts: [] };
}

export function getFooterBlueprint(): ComponentBlueprint {
  return { id: 'footer', label: 'Footer', parts: [] };
}
