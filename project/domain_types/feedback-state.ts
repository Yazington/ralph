import { Task, TaskId, Timestamp } from './task-domain';

export type BorderTone = 'none' | 'subtle' | 'strong';

export interface InputFeedbackState {
  kind: 'idle' | 'inputError';
  borderTone: BorderTone;
  helperText?: string;
  canSubmit: boolean;
}

export interface SavingFeedbackState {
  kind: 'saving';
  optimistic: boolean;
  blocking: boolean;
  showSpinner: boolean;
  requestId: string;
}

export interface OptimisticSavePlan {
  nextTasks: Task[];
  feedback: SavingFeedbackState;
}

export interface UndoToast {
  kind: 'undoToast';
  message: string;
  durationMs: number;
  expiresAt: Timestamp;
  taskSnapshot?: Task;
}

export interface DeletionPlan {
  nextTasks: Task[];
  toast: UndoToast;
}

export function deriveInputFeedback(value: string, attemptedSubmit: boolean): InputFeedbackState {
  const trimmed = value.trim();
  const hasValue = trimmed.length > 0;
  if (!hasValue && attemptedSubmit) {
    return {
      kind: 'inputError',
      borderTone: 'subtle',
      helperText: 'Add a task title to continue.',
      canSubmit: false,
    };
  }

  return {
    kind: 'idle',
    borderTone: 'none',
    canSubmit: hasValue,
  };
}

export function planOptimisticSave(
  tasks: readonly Task[],
  updatedTask: Task,
  requestId: string,
): OptimisticSavePlan {
  const nextTasks = tasks.some((task) => task.id === updatedTask.id)
    ? (tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)) as Task[])
    : ([...tasks, updatedTask] as Task[]);

  return {
    nextTasks,
    feedback: {
      kind: 'saving',
      optimistic: true,
      blocking: false,
      showSpinner: false,
      requestId,
    },
  };
}

export function scheduleDeletionWithUndo(
  tasks: readonly Task[],
  taskId: TaskId,
  now: Timestamp,
): DeletionPlan {
  const taskSnapshot = tasks.find((task) => task.id === taskId);
  const nextTasks = tasks.filter((task) => task.id !== taskId) as Task[];
  const windowMs = 5000;
  const expiresAt = new Date(new Date(now).getTime() + windowMs).toISOString();

  return {
    nextTasks,
    toast: {
      kind: 'undoToast',
      message: 'Task removed. Undo?',
      durationMs: windowMs,
      expiresAt,
      taskSnapshot,
    },
  };
}
