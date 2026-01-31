export type Timestamp = string;

export type TaskId = string;

export interface Task {
  id: TaskId;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  order: number;
}

export type TaskFilter = 'all' | 'active' | 'completed';

export interface TaskCreationInput {
  id: TaskId;
  title: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  order?: number;
  completed?: boolean;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  completed?: boolean;
  order?: number;
  updatedAt: Timestamp;
}

export function createTask(input: TaskCreationInput): Task {
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    completed: input.completed ?? false,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt ?? input.createdAt,
    order: input.order ?? 0,
  };
}

export function addTask(tasks: readonly Task[], nextTask: Task): Task[] {
  if (tasks.some((task) => task.id === nextTask.id)) {
    return tasks;
  }
  return [...tasks, nextTask];
}

export function removeTask(tasks: readonly Task[], taskId: TaskId): Task[] {
  return tasks.filter((task) => task.id !== taskId);
}

export function updateTask(
  tasks: readonly Task[],
  taskId: TaskId,
  updates: TaskUpdatePayload,
): Task[] {
  let mutated = false;
  const result = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }
    mutated = true;
    return { ...task, ...updates };
  });
  return mutated ? result : tasks.slice();
}

export function toggleTaskCompletion(
  tasks: readonly Task[],
  taskId: TaskId,
  updatedAt: Timestamp,
  completedOverride?: boolean,
): Task[] {
  const existing = tasks.find((task) => task.id === taskId);
  if (!existing) {
    return tasks.slice();
  }
  const nextCompleted = completedOverride ?? !existing.completed;
  return updateTask(tasks, taskId, { completed: nextCompleted, updatedAt });
}

export function filterTasks(tasks: readonly Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case 'completed':
      return tasks.filter((task) => task.completed);
    case 'active':
      return tasks.filter((task) => !task.completed);
    case 'all':
    default:
      return tasks.slice();
  }
}
