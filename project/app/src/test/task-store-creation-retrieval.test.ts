import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, cleanup, act } from '@testing-library/react'

import { useTaskStore } from '@/store/task-store'
import { createTaskStoreState } from '@/store/task-store'
import { Priority, TaskStatus } from '@/types/tasks'
import type { Task } from '@/types/tasks'

describe('task store creation and retrieval', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()

    act(() => {
      useTaskStore.getState().reset()
    })
  })

  const createTask = (overrides: Partial<Task>): Task => ({
    id: 'task-0',
    title: 'TEST TASK',
    description: '{"type":"doc","content":[]}',
    status: TaskStatus.TODO,
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

  it('creates store with initial empty state', () => {
    const { result } = renderHook(() => useTaskStore())

    expect(result.current.tasks).toEqual([])
    expect(result.current.tasksByStatus).toBeDefined()
    expect(result.current.tasksByParent).toEqual({})
  })

  it('retrieves all tasks from store', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask(createTask({ id: 'task-1', title: 'FIRST TASK' }))
      result.current.addTask(createTask({ id: 'task-2', title: 'SECOND TASK' }))
    })

    expect(result.current.tasks).toHaveLength(2)
    expect(result.current.tasks[0].id).toBe('task-1')
    expect(result.current.tasks[1].id).toBe('task-2')
  })

  it('retrieves tasks grouped by status', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask(
        createTask({
          id: 'task-1',
          title: 'BACKLOG TASK',
          status: TaskStatus.BACKLOG,
        })
      )
      result.current.addTask(
        createTask({
          id: 'task-2',
          title: 'TODO TASK',
          status: TaskStatus.TODO,
        })
      )
      result.current.addTask(
        createTask({
          id: 'task-3',
          title: 'IN PROGRESS TASK',
          status: TaskStatus.IN_PROGRESS,
        })
      )
    })

    expect(result.current.tasksByStatus[TaskStatus.BACKLOG]).toHaveLength(1)
    expect(result.current.tasksByStatus[TaskStatus.TODO]).toHaveLength(1)
    expect(result.current.tasksByStatus[TaskStatus.IN_PROGRESS]).toHaveLength(1)
    expect(result.current.tasksByStatus[TaskStatus.BACKLOG][0].title).toBe(
      'BACKLOG TASK'
    )
    expect(result.current.tasksByStatus[TaskStatus.TODO][0].title).toBe(
      'TODO TASK'
    )
  })

  it('retrieves tasks grouped by parent', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask(
        createTask({
          id: 'parent-1',
          title: 'PARENT TASK',
        })
      )
      result.current.addTask(
        createTask({
          id: 'child-1',
          title: 'CHILD TASK 1',
          parentId: 'parent-1',
        })
      )
      result.current.addTask(
        createTask({
          id: 'child-2',
          title: 'CHILD TASK 2',
          parentId: 'parent-1',
        })
      )
    })

    expect(result.current.tasksByParent['parent-1']).toHaveLength(2)
    expect(result.current.tasksByParent['parent-1'][0].id).toBe('child-1')
    expect(result.current.tasksByParent['parent-1'][1].id).toBe('child-2')
  })

  it('retrieves individual task by id via array find', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask(
        createTask({ id: 'task-1', title: 'SEARCH TARGET' })
      )
      result.current.addTask(createTask({ id: 'task-2', title: 'OTHER TASK' }))
    })

    const task = result.current.tasks.find(t => t.id === 'task-1')
    expect(task).toBeDefined()
    expect(task?.title).toBe('SEARCH TARGET')
  })

  it('returns empty state for non-existent task retrieval', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask(createTask({ id: 'task-1' }))
    })

    const task = result.current.tasks.find(t => t.id === 'non-existent')
    expect(task).toBeUndefined()
  })

  it('retrieves updated state after task modification', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask(
        createTask({ id: 'task-1', title: 'ORIGINAL TITLE' })
      )
    })

    expect(result.current.tasks[0].title).toBe('ORIGINAL TITLE')

    act(() => {
      result.current.updateTask('task-1', { title: 'UPDATED TITLE' })
    })

    expect(result.current.tasks[0].title).toBe('UPDATED TITLE')
  })

  it('retrieves updated state after task deletion', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask(createTask({ id: 'task-1' }))
      result.current.addTask(createTask({ id: 'task-2' }))
    })

    expect(result.current.tasks).toHaveLength(2)

    act(() => {
      result.current.deleteTask('task-1', false)
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBe('task-2')
  })

  it('creates initial state via utility function', () => {
    const tasks = [
      createTask({ id: 'task-1', title: 'UTILITY TEST' }),
      createTask({ id: 'task-2', title: 'ANOTHER TASK' }),
    ]

    const state = createTaskStoreState(tasks)

    expect(state.tasks).toEqual(tasks)
    expect(state.tasks).toHaveLength(2)
    expect(state.tasksByStatus).toBeDefined()
    expect(state.tasksByParent).toBeDefined()
  })

  it('creates empty state via utility function', () => {
    const state = createTaskStoreState()

    expect(state.tasks).toEqual([])
    expect(Object.keys(state.tasksByParent)).toHaveLength(0)
    expect(
      Object.values(state.tasksByStatus).every(bucket => bucket.length === 0)
    ).toBe(true)
  })

  it('retrieves tasks in insertion order', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask(createTask({ id: 'task-1', position: 2 }))
      result.current.addTask(createTask({ id: 'task-2', position: 0 }))
      result.current.addTask(createTask({ id: 'task-3', position: 1 }))
    })

    expect(result.current.tasks[0].id).toBe('task-1')
    expect(result.current.tasks[1].id).toBe('task-2')
    expect(result.current.tasks[2].id).toBe('task-3')
  })
})
