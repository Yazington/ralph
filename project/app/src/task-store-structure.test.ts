import { describe, expect, it } from 'vitest'

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

describe('task store structure', () => {
  it('initializes with empty task collections', () => {
    const state = useTaskStore.getState()

    expect(state.tasks).toEqual([])
    expect(Object.keys(state.tasksByStatus).sort()).toEqual(
      [
        TaskStatus.BACKLOG,
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.REVIEW,
        TaskStatus.DONE,
      ].sort(),
    )
    Object.values(state.tasksByStatus).forEach((bucket) => {
      expect(bucket).toEqual([])
    })
    expect(state.tasksByParent).toEqual({})
  })

  it('builds status and parent maps from provided tasks', () => {
    const tasks = [
      createTask({ id: 'task-1', title: 'BACKLOG TASK', status: TaskStatus.BACKLOG }),
      createTask({ id: 'task-2', title: 'TODO TASK', status: TaskStatus.TODO }),
      createTask({
        id: 'task-3',
        title: 'SUBTASK',
        status: TaskStatus.TODO,
        parentId: 'task-1',
      }),
    ]

    const state = createTaskStoreState(tasks)

    expect(state.tasks).toEqual(tasks)
    expect(state.tasksByStatus[TaskStatus.BACKLOG].map((task) => task.id)).toEqual(['task-1'])
    expect(state.tasksByStatus[TaskStatus.TODO].map((task) => task.id)).toEqual([
      'task-2',
      'task-3',
    ])
    expect(state.tasksByStatus[TaskStatus.IN_PROGRESS]).toEqual([])
    expect(state.tasksByStatus[TaskStatus.REVIEW]).toEqual([])
    expect(state.tasksByStatus[TaskStatus.DONE]).toEqual([])
    expect(state.tasksByParent['task-1'].map((task) => task.id)).toEqual(['task-3'])
    expect(state.tasksByParent['task-2']).toBeUndefined()
  })
})
