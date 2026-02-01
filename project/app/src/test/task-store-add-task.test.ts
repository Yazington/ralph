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

describe('task store addTask action', () => {
  beforeEach(() => {
    resetStore()
  })

  it('adds tasks and rebuilds derived maps', () => {
    const backlogTask = createTask({ id: 'task-1', status: TaskStatus.BACKLOG })
    const subtask = createTask({
      id: 'task-2',
      status: TaskStatus.TODO,
      parentId: 'task-1',
    })

    const state = useTaskStore.getState()

    state.addTask(backlogTask)
    state.addTask(subtask)

    const nextState = useTaskStore.getState()

    expect(nextState.tasks.map(task => task.id)).toEqual(['task-1', 'task-2'])
    expect(
      nextState.tasksByStatus[TaskStatus.BACKLOG].map(task => task.id)
    ).toEqual(['task-1'])
    expect(
      nextState.tasksByStatus[TaskStatus.TODO].map(task => task.id)
    ).toEqual(['task-2'])
    expect(nextState.tasksByParent['task-1'].map(task => task.id)).toEqual([
      'task-2',
    ])
  })

  it('keeps previous state snapshots unchanged', () => {
    const previousState = useTaskStore.getState()
    const task = createTask({ id: 'task-3', status: TaskStatus.REVIEW })

    previousState.addTask(task)

    expect(previousState.tasks).toEqual([])
    expect(previousState.tasksByStatus[TaskStatus.REVIEW]).toEqual([])
  })
})
