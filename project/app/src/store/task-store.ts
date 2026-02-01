import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

import {
  collectTaskSubtreeIds,
  createTasksByParent,
  createTasksByStatus,
} from '@/store/task-store.utils'
import type { Task } from '@/types/tasks'
import { TaskStatus } from '@/types/tasks'

export interface TaskStoreState {
  tasks: Task[]
  tasksByStatus: Record<TaskStatus, Task[]>
  tasksByParent: Record<string, Task[]>
}

export interface TaskStoreActions {
  addTask: (task: Task) => void
  changeTaskStatus: (id: string, newStatus: TaskStatus) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string, cascade: boolean) => void
  duplicateTask: (id: string) => void
  setTasks: (tasks: Task[]) => void
  reset: () => void
}

export type TaskStore = TaskStoreState & TaskStoreActions

const rebuildDerivedState = (state: TaskStoreState) => {
  state.tasksByStatus = createTasksByStatus(state.tasks)
  state.tasksByParent = createTasksByParent(state.tasks)
}

const duplicateTaskRecursive = (
  tasks: Task[],
  taskId: string,
  newParentId: string | null = null,
  idMap: Map<string, string> = new Map()
): Task | null => {
  const task = tasks.find(t => t.id === taskId)

  if (!task) {
    return null
  }

  const newId = nanoid()
  const now = new Date().toISOString()

  idMap.set(task.id, newId)

  const duplicatedTask: Task = {
    ...task,
    id: newId,
    title: `${task.title} - COPY`,
    createdAt: now,
    updatedAt: now,
    parentId: newParentId,
    dependencies: [],
    position: 0,
  }

  const subtasks = tasks.filter(t => t.parentId === taskId)

  for (const subtask of subtasks) {
    const duplicatedSubtask = duplicateTaskRecursive(
      tasks,
      subtask.id,
      newId,
      idMap
    )

    if (duplicatedSubtask) {
      tasks.push(duplicatedSubtask)
    }
  }

  return duplicatedTask
}

export const useTaskStore = create<TaskStore>()(
  persist(
    immer(set => ({
      tasks: [],
      tasksByStatus: createTasksByStatus([]),
      tasksByParent: createTasksByParent([]),
      addTask: task =>
        set(state => {
          state.tasks.push(task)
          rebuildDerivedState(state)
        }),
      changeTaskStatus: (id, newStatus) =>
        set(state => {
          const task = state.tasks.find(candidate => candidate.id === id)

          if (!task) {
            return
          }

          if (task.status === newStatus) {
            return
          }

          task.status = newStatus
          rebuildDerivedState(state)
        }),
      updateTask: (id, updates) =>
        set(state => {
          const task = state.tasks.find(candidate => candidate.id === id)

          if (!task) {
            return
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _ignoredId, ...safeUpdates } = updates

          Object.assign(task, safeUpdates)
          rebuildDerivedState(state)
        }),
      deleteTask: (id, cascade) =>
        set(state => {
          const hasTask = state.tasks.some(task => task.id === id)

          if (!hasTask) {
            return
          }

          if (cascade) {
            const idsToDelete = collectTaskSubtreeIds(state.tasks, id)
            state.tasks = state.tasks.filter(task => !idsToDelete.has(task.id))
          } else {
            state.tasks.forEach(task => {
              if (task.parentId === id) {
                task.parentId = null
              }
            })

            state.tasks = state.tasks.filter(task => task.id !== id)
          }

          rebuildDerivedState(state)
        }),
      duplicateTask: id =>
        set(state => {
          const task = state.tasks.find(candidate => candidate.id === id)

          if (!task) {
            return
          }

          const duplicatedTask = duplicateTaskRecursive(state.tasks, id)

          if (duplicatedTask) {
            state.tasks.push(duplicatedTask)
            rebuildDerivedState(state)
          }
        }),
      setTasks: tasks =>
        set(state => {
          state.tasks = tasks
          rebuildDerivedState(state)
        }),
      reset: () =>
        set(state => {
          state.tasks = []
          state.tasksByStatus = createTasksByStatus([])
          state.tasksByParent = createTasksByParent([])
        }),
    })),
    {
      name: 'ralph-tasks',
    }
  )
)
