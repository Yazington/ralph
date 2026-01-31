import { getColorPalette, SurfaceColorToken, SurfaceTokenId } from './color-palette';
import { Task, TaskId } from './task-domain';
import { SpacingToken } from './spacing-shape';

export interface DragVisualPlan {
  restingSurface: SurfaceColorToken;
  draggingSurface: SurfaceColorToken;
  placeholderSurface: SurfaceColorToken;
  accentHex: string;
  allowedSurfaceIds: SurfaceTokenId[];
  rationale: string;
}

export interface DragReorderResult {
  movedTaskId: TaskId;
  fromIndex: number;
  toIndex: number;
  tasks: Task[];
  changed: boolean;
}

export interface StackedTaskDescriptor {
  id: TaskId;
  order: number;
  stackRole: 'active' | 'completed';
  offsetPx: number;
}

export interface StackedTaskPlan {
  descriptors: StackedTaskDescriptor[];
  completedOffsetStepPx: SpacingToken;
  description: string;
}

const LIMITED_SURFACE_IDS: SurfaceTokenId[] = ['deepPanel', 'panelAlt', 'panelTeal'];
const COMPLETED_STACK_OFFSET: SpacingToken = 12;

function clampIndex(index: number, length: number): number {
  if (length === 0) {
    return 0;
  }
  return Math.min(Math.max(index, 0), Math.max(0, length - 1));
}

export function getDragVisualPlan(): DragVisualPlan {
  const palette = getColorPalette();
  return {
    restingSurface: palette.surfaces.deepPanel,
    draggingSurface: palette.surfaces.panelAlt,
    placeholderSurface: palette.surfaces.panelTeal,
    accentHex: palette.accent.hex,
    allowedSurfaceIds: LIMITED_SURFACE_IDS,
    rationale:
      'Drag/drop states reuse the deep/panel surfaces plus the accent cyan focus ring to avoid inventing new themes.',
  };
}

export function reorderTasksByDrag(
  tasks: readonly Task[],
  draggedTaskId: TaskId,
  destinationIndex: number,
): DragReorderResult {
  if (tasks.length === 0) {
    return {
      movedTaskId: draggedTaskId,
      fromIndex: -1,
      toIndex: -1,
      tasks: [],
      changed: false,
    };
  }

  const sorted = tasks.slice().sort((a, b) => a.order - b.order);
  const fromIndex = sorted.findIndex((task) => task.id === draggedTaskId);
  if (fromIndex === -1) {
    return {
      movedTaskId: draggedTaskId,
      fromIndex: -1,
      toIndex: -1,
      tasks: tasks.slice(),
      changed: false,
    };
  }

  const desiredIndex = Number.isFinite(destinationIndex) ? destinationIndex : fromIndex;
  const clampedIndex = clampIndex(desiredIndex, sorted.length);
  const normalizedDestination = clampedIndex;

  if (fromIndex !== normalizedDestination) {
    const [moved] = sorted.splice(fromIndex, 1);
    sorted.splice(normalizedDestination, 0, moved);
  }

  const reordered = sorted.map((task, index) => ({ ...task, order: index }));

  return {
    movedTaskId: draggedTaskId,
    fromIndex,
    toIndex: normalizedDestination,
    tasks: reordered,
    changed: fromIndex !== normalizedDestination,
  };
}

export function deriveStackedTaskPlan(tasks: readonly Task[]): StackedTaskPlan {
  if (tasks.length === 0) {
    return {
      descriptors: [],
      completedOffsetStepPx: COMPLETED_STACK_OFFSET,
      description: 'No tasks yet. Active slots stay ready while the completed stack stays empty.',
    };
  }

  const ordered = tasks.slice().sort((a, b) => a.order - b.order);
  const active = ordered.filter((task) => !task.completed);
  const completed = ordered.filter((task) => task.completed);
  let completedIndex = 0;

  const descriptors: StackedTaskDescriptor[] = [...active, ...completed].map((task, index) => {
    const stackRole: 'active' | 'completed' = task.completed ? 'completed' : 'active';
    const offsetPx = stackRole === 'completed' ? (++completedIndex) * COMPLETED_STACK_OFFSET : 0;
    return {
      id: task.id,
      order: index,
      stackRole,
      offsetPx,
    };
  });

  return {
    descriptors,
    completedOffsetStepPx: COMPLETED_STACK_OFFSET,
    description:
      'Active todos stay flush at the top while completed ones gain incremental offsets so the stack feels tucked under the panel.',
  };
}
