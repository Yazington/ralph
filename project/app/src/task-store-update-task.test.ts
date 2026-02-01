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

describe('task store updateTask action', () => {
  beforeEach(() => {
    resetStore()
  })

  it('updates task fields and rebuilds derived maps', () => {
    const parent = createTask({ id: 'parent-1', status: TaskStatus.BACKLOG })
    const child = createTask({
      id: 'child-1',
      status: TaskStatus.TODO,
      parentId: 'parent-1',
      title: 'CHILD TASK',
    })

    useTaskStore.getState().setTasks([parent, child])
    useTaskStore.getState().updateTask('child-1', {
      status: TaskStatus.REVIEW,
      parentId: 'parent-2',
      title: 'UPDATED CHILD',
    })

    const nextState = useTaskStore.getState()
    const updated = nextState.tasks.find((task) => task.id === 'child-1')

    expect(updated?.status).toBe(TaskStatus.REVIEW)
    expect(updated?.parentId).toBe('parent-2')
    expect(updated?.title).toBe('UPDATED CHILD')
    expect(nextState.tasksByStatus[TaskStatus.TODO]).toEqual([])
    expect(nextState.tasksByStatus[TaskStatus.REVIEW].map((task) => task.id)).toEqual([
      'child-1',
    ])
    expect(nextState.tasksByParent['parent-1']).toBeUndefined()
    expect(nextState.tasksByParent['parent-2'].map((task) => task.id)).toEqual([
      'child-1',
    ])
  })

  it('ignores updates when task is missing', () => {
    const task = createTask({ id: 'task-1', title: 'ORIGINAL' })

    useTaskStore.getState().setTasks([task])
    useTaskStore.getState().updateTask('missing-task', { title: 'SHOULD NOT APPLY' })

    const nextState = useTaskStore.getState()

    expect(nextState.tasks[0].title).toBe('ORIGINAL')
  })

  it('keeps previous state snapshot unchanged', () => {
    const task = createTask({ id: 'task-1', title: 'ORIGINAL' })

    useTaskStore.getState().setTasks([task])

    const previousState = useTaskStore.getState()

    previousState.updateTask('task-1', { title: 'UPDATED', id: 'task-2' })

    const nextState = useTaskStore.getState()

    expect(nextState.tasks[0].title).toBe('UPDATED')
    expect(nextState.tasks[0].id).toBe('task-1')
    expect(previousState.tasks[0].title).toBe('ORIGINAL')
    expect(previousState.tasks[0].id).toBe('task-1')
  })
})
