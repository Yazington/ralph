import { beforeEach, describe, expect, it } from 'vitest'

import { useTaskStore } from '@/store/task-store'
import { Priority, TaskStatus } from '@/types/tasks'
import type { Task } from '@/types/tasks'

const createTask = (overrides: Partial<Task>): Task => ({
  id: 'task-0',
  title: 'STATUS TASK',
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
  useTaskStore.getState().setTasks([])
}

describe('task store changeTaskStatus action', () => {
  beforeEach(() => {
    resetStore()
  })

  it('moves a task to the new status bucket', () => {
    const backlogTask = createTask({ id: 'task-1', status: TaskStatus.BACKLOG })
    const todoTask = createTask({ id: 'task-2', status: TaskStatus.TODO })
    const state = useTaskStore.getState()

    state.setTasks([backlogTask, todoTask])

    state.changeTaskStatus('task-1', TaskStatus.DONE)

    const nextState = useTaskStore.getState()

    expect(nextState.tasks.find(task => task.id === 'task-1')?.status).toBe(
      TaskStatus.DONE
    )
    expect(nextState.tasksByStatus[TaskStatus.BACKLOG]).toEqual([])
    expect(
      nextState.tasksByStatus[TaskStatus.DONE].map(task => task.id)
    ).toEqual(['task-1'])
    expect(
      nextState.tasksByStatus[TaskStatus.TODO].map(task => task.id)
    ).toEqual(['task-2'])
  })

  it('keeps state unchanged when task is missing', () => {
    const task = createTask({ id: 'task-3', status: TaskStatus.REVIEW })
    const state = useTaskStore.getState()

    state.setTasks([task])

    state.changeTaskStatus('missing-task', TaskStatus.DONE)

    const nextState = useTaskStore.getState()

    expect(nextState.tasks).toEqual([task])
    expect(
      nextState.tasksByStatus[TaskStatus.REVIEW].map(task => task.id)
    ).toEqual(['task-3'])
    expect(nextState.tasksByStatus[TaskStatus.DONE]).toEqual([])
  })
})
