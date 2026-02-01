import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { createTasksByParent, createTasksByStatus } from '@/store/task-store.utils'
import type { Task } from '@/types/tasks'
import { TaskStatus } from '@/types/tasks'

export interface TaskStoreState {
  tasks: Task[]
  tasksByStatus: Record<TaskStatus, Task[]>
  tasksByParent: Record<string, Task[]>
}

export interface TaskStoreActions {
  setTasks: (tasks: Task[]) => void
}

export type TaskStore = TaskStoreState & TaskStoreActions

export const createTaskStoreState = (tasks: Task[] = []): TaskStoreState => ({
  tasks,
  tasksByStatus: createTasksByStatus(tasks),
  tasksByParent: createTasksByParent(tasks),
})

export const useTaskStore = create<TaskStore>()(
  immer((set) => ({
    ...createTaskStoreState(),
    setTasks: (tasks) =>
      set((state) => {
        state.tasks = tasks
        state.tasksByStatus = createTasksByStatus(tasks)
        state.tasksByParent = createTasksByParent(tasks)
      }),
  })),
)
