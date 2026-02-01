import { beforeEach, describe, expect, it } from 'vitest'

import { createTaskStoreState, useTaskStore } from '@/store/task-store'
import { Priority, TaskStatus } from '@/types/tasks'
import type { Task } from '@/types/tasks'

const createTask = (overrides: Partial<Task>): Task => ({
  id: 'task-0',
  title: 'FOUNDATION TASK',
  description: '{"type":"doc","content":[]}',
  status: TaskStatus.BACKLOG,
  priority: Priority.MEDIUM,
  dueDate: null,
  labels: [],
  createdAt: '2026-01-31T00:00:00.000Z',
  updatedAt: '2026-01-31T00:00:00.000Z',
  parentId: null,
  dependencies: [],
  position: 0,
  ...overrides,
})

const resetStore = () => {
  useTaskStore.setState(createTaskStoreState())
}

describe('task store immer integration', () => {
  beforeEach(() => {
    resetStore()
  })

  it('updates tasks without mutating previous state', () => {
    const previousState = useTaskStore.getState()
    const tasks = [createTask({ id: 'task-1', status: TaskStatus.TODO })]

    previousState.setTasks(tasks)

    const nextState = useTaskStore.getState()

    expect(nextState.tasks).toEqual(tasks)
    expect(nextState.tasksByStatus[TaskStatus.TODO].map((task) => task.id)).toEqual([
      'task-1',
    ])
    expect(nextState.tasksByParent).toEqual({})
    expect(previousState.tasks).toEqual([])
    expect(previousState.tasksByStatus[TaskStatus.TODO]).toEqual([])
  })
})
