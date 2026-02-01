import { TaskStatus } from '@/types/tasks'
import type { Task } from '@/types/tasks'

export const createTasksByStatus = (tasks: Task[]): Record<TaskStatus, Task[]> => ({
  [TaskStatus.BACKLOG]: tasks.filter((task) => task.status === TaskStatus.BACKLOG),
  [TaskStatus.TODO]: tasks.filter((task) => task.status === TaskStatus.TODO),
  [TaskStatus.IN_PROGRESS]: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS),
  [TaskStatus.REVIEW]: tasks.filter((task) => task.status === TaskStatus.REVIEW),
  [TaskStatus.DONE]: tasks.filter((task) => task.status === TaskStatus.DONE),
})

export const createTasksByParent = (tasks: Task[]): Record<string, Task[]> =>
  tasks.reduce<Record<string, Task[]>>((grouped, task) => {
    if (!task.parentId) {
      return grouped
    }

    if (!grouped[task.parentId]) {
      grouped[task.parentId] = []
    }

    grouped[task.parentId].push(task)

    return grouped
  }, {})
