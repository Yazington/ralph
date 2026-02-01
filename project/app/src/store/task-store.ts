import { create } from 'zustand'

import { createTasksByParent, createTasksByStatus } from '@/store/task-store.utils'
import type { Task } from '@/types/tasks'
import { TaskStatus } from '@/types/tasks'

export interface TaskStoreState {
  tasks: Task[]
  tasksByStatus: Record<TaskStatus, Task[]>
  tasksByParent: Record<string, Task[]>
}

export const createTaskStoreState = (tasks: Task[] = []): TaskStoreState => ({
  tasks,
  tasksByStatus: createTasksByStatus(tasks),
  tasksByParent: createTasksByParent(tasks),
})

export const useTaskStore = create<TaskStoreState>()(() => createTaskStoreState())
