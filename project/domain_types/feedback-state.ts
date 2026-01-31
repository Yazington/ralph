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
  return {
    kind: 'idle',
    borderTone: 'none',
    canSubmit: value.trim().length > 0,
  };
}

export function planOptimisticSave(
  tasks: readonly Task[],
  updatedTask: Task,
  requestId: string,
): OptimisticSavePlan {
  return {
    nextTasks: tasks.slice() as Task[],
    feedback: {
      kind: 'saving',
      optimistic: false,
      blocking: true,
      showSpinner: true,
      requestId,
    },
  };
}

export function scheduleDeletionWithUndo(
  tasks: readonly Task[],
  taskId: TaskId,
  now: Timestamp,
): DeletionPlan {
  return {
    nextTasks: tasks.slice() as Task[],
    toast: {
      kind: 'undoToast',
      message: 'Task deleted',
      durationMs: 0,
      expiresAt: now,
    },
  };
}
