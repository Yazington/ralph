import { Task, TaskId, Timestamp } from './task-domain';

export type ComposerKey = 'Enter' | 'Escape';

export interface ComposerKeyPlan {
  key: ComposerKey;
  trimmedValue: string;
  shouldSubmit: boolean;
  reason: string;
}

export function planComposerKeyAction(key: ComposerKey, value: string): ComposerKeyPlan {
  const trimmedValue = value.trim();
  const hasValue = trimmedValue.length > 0;
  const shouldSubmit = key === 'Enter' && hasValue;

  return {
    key,
    trimmedValue,
    shouldSubmit,
    reason: shouldSubmit
      ? 'Enter submits when the composer has content.'
      : key === 'Enter'
      ? 'Composer ignores Enter when empty to avoid blank tasks.'
      : 'Escape is reserved for cancelling edit sessions elsewhere.',
  };
}

export type EditKey = 'Enter' | 'Escape';

export interface EditKeyDecision {
  key: EditKey;
  action: 'commit' | 'cancel';
  description: string;
}

export function deriveEditKeyDecision(key: EditKey): EditKeyDecision {
  if (key === 'Enter') {
    return {
      key,
      action: 'commit',
      description: 'Enter confirms inline edits per interaction spec.',
    };
  }

  return {
    key,
    action: 'cancel',
    description: 'Escape backs out of the inline edit session.',
  };
}

export interface CheckboxTogglePlan {
  taskId: TaskId;
  currentCompleted: boolean;
  nextCompleted: boolean;
  updatedAt: Timestamp;
}

export function planCheckboxToggle(task: Task, updatedAt: Timestamp): CheckboxTogglePlan {
  return {
    taskId: task.id,
    currentCompleted: task.completed,
    nextCompleted: !task.completed,
    updatedAt,
  };
}

export interface FocusRingStyle {
  visible: boolean;
  color: string;
  widthPx: number;
  offsetPx: number;
}

export const ACCENT_CYAN_HEX = '#0FA9E6';

export function deriveFocusRing(isFocused: boolean): FocusRingStyle {
  return {
    visible: isFocused,
    color: ACCENT_CYAN_HEX,
    widthPx: isFocused ? 2 : 0,
    offsetPx: 2,
  };
}

export type MotionInteraction = 'panelLoad' | 'listAdd' | 'listRemove';

export interface MotionTimingPlan {
  interaction: MotionInteraction;
  durationMs: number;
  easing: string;
  respectReducedMotion: boolean;
}

const PANEL_LOAD_DURATION = 200;
const LIST_MUTATION_DURATION = 160;
const DEFAULT_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

export function deriveMotionTiming(
  interaction: MotionInteraction,
  prefersReducedMotion: boolean,
): MotionTimingPlan {
  if (prefersReducedMotion) {
    return {
      interaction,
      durationMs: 0,
      easing: 'linear',
      respectReducedMotion: true,
    };
  }

  const duration = interaction === 'panelLoad' ? PANEL_LOAD_DURATION : LIST_MUTATION_DURATION;

  return {
    interaction,
    durationMs: duration,
    easing: DEFAULT_EASING,
    respectReducedMotion: false,
  };
}
