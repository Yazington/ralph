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

describe('task store deleteTask action', () => {
  beforeEach(() => {
    resetStore()
  })

  it('deletes task subtree when cascade is true', () => {
    const parent = createTask({ id: 'task-1', status: TaskStatus.BACKLOG })
    const child = createTask({
      id: 'task-2',
      status: TaskStatus.TODO,
      parentId: 'task-1',
    })
    const grandchild = createTask({
      id: 'task-3',
      status: TaskStatus.REVIEW,
      parentId: 'task-2',
    })
    const sibling = createTask({ id: 'task-4', status: TaskStatus.IN_PROGRESS })

    useTaskStore.getState().setTasks([parent, child, grandchild, sibling])

    useTaskStore.getState().deleteTask('task-1', true)

    const nextState = useTaskStore.getState()

    expect(nextState.tasks.map((task) => task.id)).toEqual(['task-4'])
    expect(nextState.tasksByStatus[TaskStatus.BACKLOG]).toEqual([])
    expect(nextState.tasksByStatus[TaskStatus.TODO]).toEqual([])
    expect(nextState.tasksByStatus[TaskStatus.REVIEW]).toEqual([])
    expect(nextState.tasksByStatus[TaskStatus.IN_PROGRESS].map((task) => task.id)).toEqual([
      'task-4',
    ])
    expect(nextState.tasksByParent).toEqual({})
  })

  it('promotes direct subtasks when cascade is false', () => {
    const parent = createTask({ id: 'task-1', status: TaskStatus.BACKLOG })
    const child = createTask({
      id: 'task-2',
      status: TaskStatus.TODO,
      parentId: 'task-1',
    })
    const grandchild = createTask({
      id: 'task-3',
      status: TaskStatus.REVIEW,
      parentId: 'task-2',
    })

    useTaskStore.getState().setTasks([parent, child, grandchild])

    useTaskStore.getState().deleteTask('task-1', false)

    const nextState = useTaskStore.getState()
    const promotedChild = nextState.tasks.find((task) => task.id === 'task-2')
    const nestedGrandchild = nextState.tasks.find((task) => task.id === 'task-3')

    expect(nextState.tasks.map((task) => task.id)).toEqual(['task-2', 'task-3'])
    expect(promotedChild?.parentId).toBeNull()
    expect(nestedGrandchild?.parentId).toBe('task-2')
    expect(nextState.tasksByParent['task-1']).toBeUndefined()
    expect(nextState.tasksByParent['task-2'].map((task) => task.id)).toEqual(['task-3'])
  })

  it('ignores delete when task is missing', () => {
    const task = createTask({ id: 'task-1', status: TaskStatus.TODO })

    useTaskStore.getState().setTasks([task])

    useTaskStore.getState().deleteTask('missing-task', true)

    const nextState = useTaskStore.getState()

    expect(nextState.tasks.map((candidate) => candidate.id)).toEqual(['task-1'])
  })
})
