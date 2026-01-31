import { Task, TaskId, TaskUpdatePayload, Timestamp } from './task-domain';

export interface ComposerState {
  value: string;
  isFocused: boolean;
  showHint: boolean;
  isActive: boolean;
}

export function createInitialComposerState(): ComposerState {
  return {
    value: '',
    isFocused: true,
    showHint: true,
    isActive: false,
  };
}

export function updateComposerValue(state: ComposerState, nextValue: string): ComposerState {
  const trimmed = nextValue.trim();
  const isActive = trimmed.length > 0;
  const showHint = nextValue.length === 0;
  return {
    ...state,
    value: nextValue,
    isActive,
    showHint,
    isFocused: true,
  };
}

export function completeComposerSubmit(state: ComposerState): ComposerState {
  return {
    ...state,
    value: '',
    isActive: false,
    showHint: false,
    isFocused: true,
  };
}

export interface EditSession {
  taskId: TaskId;
  originalTitle: string;
  draftTitle: string;
  isEditing: boolean;
}

export type EditResolution =
  | { kind: 'save'; taskId: TaskId; update: TaskUpdatePayload }
  | { kind: 'cancel'; taskId: TaskId; update: TaskUpdatePayload };

export function beginEditSession(task: Task): EditSession {
  return {
    taskId: task.id,
    originalTitle: task.title,
    draftTitle: task.title,
    isEditing: true,
  };
}

export function updateEditDraft(session: EditSession, nextValue: string): EditSession {
  return {
    ...session,
    draftTitle: nextValue,
  };
}

export function resolveEditAction(
  session: EditSession,
  key: 'Enter' | 'Escape',
  updatedAt: Timestamp,
): EditResolution {
  if (key === 'Enter') {
    const trimmedTitle = session.draftTitle.trim();
    const title = trimmedTitle.length > 0 ? trimmedTitle : session.originalTitle;
    return {
      kind: 'save',
      taskId: session.taskId,
      update: { title, updatedAt },
    };
  }

  return {
    kind: 'cancel',
    taskId: session.taskId,
    update: { title: session.originalTitle, updatedAt },
  };
}

export interface DisplayTask extends Task {
  dimmed: boolean;
}

export function deriveDisplayTasks(tasks: readonly Task[]): DisplayTask[] {
  const active: DisplayTask[] = [];
  const completed: DisplayTask[] = [];

  tasks.forEach((task) => {
    const displayTask: DisplayTask = {
      ...task,
      dimmed: task.completed,
    };

    if (task.completed) {
      completed.push(displayTask);
    } else {
      active.push(displayTask);
    }
  });

  return [...active, ...completed];
}
