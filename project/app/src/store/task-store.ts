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
  addTask: (task: Task) => void
  setTasks: (tasks: Task[]) => void
}

export type TaskStore = TaskStoreState & TaskStoreActions

export const createTaskStoreState = (tasks: Task[] = []): TaskStoreState => ({
  tasks,
  tasksByStatus: createTasksByStatus(tasks),
  tasksByParent: createTasksByParent(tasks),
})

const rebuildDerivedState = (state: TaskStoreState) => {
  state.tasksByStatus = createTasksByStatus(state.tasks)
  state.tasksByParent = createTasksByParent(state.tasks)
}

export const useTaskStore = create<TaskStore>()(
  immer((set) => ({
    ...createTaskStoreState(),
    addTask: (task) =>
      set((state) => {
        state.tasks.push(task)
        rebuildDerivedState(state)
      }),
    setTasks: (tasks) =>
      set((state) => {
        state.tasks = tasks
        rebuildDerivedState(state)
      }),
  })),
)
