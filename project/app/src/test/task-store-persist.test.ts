import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, cleanup, act } from '@testing-library/react'

import { useTaskStore } from '@/store/task-store'
import { TaskStatus } from '@/types/tasks'

describe('task-store-persist', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()

    act(() => {
      useTaskStore.getState().reset()
    })
  })

  it('should store data in localStorage with correct key', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask({
        id: 'test-1',
        title: 'TEST TASK',
        description: '',
        status: TaskStatus.TODO,
        priority: 'medium',
        dueDate: null,
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
        dependencies: [],
        position: 0,
      })
    })

    const storedData = localStorage.getItem('ralph-tasks')

    expect(storedData).not.toBeNull()
    const parsed = JSON.parse(storedData!)
    expect(parsed.state.tasks).toHaveLength(1)
    expect(parsed.state.tasks[0].id).toBe('test-1')
  })

  it('should load data from localStorage on hydration', () => {
    const mockTasks = [
      {
        id: 'existing-1',
        title: 'EXISTING TASK',
        description: '',
        status: TaskStatus.BACKLOG,
        priority: 'low',
        dueDate: null,
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
        dependencies: [],
        position: 0,
      },
    ]

    localStorage.setItem(
      'ralph-tasks',
      JSON.stringify({
        state: {
          tasks: mockTasks,
          tasksByStatus: { [TaskStatus.BACKLOG]: mockTasks },
          tasksByParent: {},
        },
        version: 0,
      })
    )

    const { result } = renderHook(() => useTaskStore())

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBe('existing-1')
    expect(result.current.tasks[0].title).toBe('EXISTING TASK')
  })

  it('should persist derived state on initial load', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask({
        id: 'test-2',
        title: 'ANOTHER TASK',
        description: '',
        status: TaskStatus.TODO,
        priority: 'high',
        dueDate: null,
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
        dependencies: [],
        position: 0,
      })
    })

    const storedData = localStorage.getItem('ralph-tasks')
    const parsed = JSON.parse(storedData!)

    expect(parsed.state.tasksByStatus).toBeDefined()
    expect(parsed.state.tasksByParent).toBeDefined()
    expect(parsed.state.tasksByStatus[TaskStatus.TODO]).toHaveLength(1)
  })

  it('should update localStorage on state changes', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask({
        id: 'test-3',
        title: 'TASK TO UPDATE',
        description: '',
        status: TaskStatus.TODO,
        priority: 'medium',
        dueDate: null,
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
        dependencies: [],
        position: 0,
      })
    })

    const initialData = JSON.parse(localStorage.getItem('ralph-tasks')!)
    expect(initialData.state.tasks).toHaveLength(1)

    act(() => {
      result.current.updateTask('test-3', { priority: 'high' })
    })

    const updatedData = JSON.parse(localStorage.getItem('ralph-tasks')!)
    expect(updatedData.state.tasks[0].priority).toBe('high')
  })

  it('should persist deletions to localStorage', () => {
    const { result } = renderHook(() => useTaskStore())

    act(() => {
      result.current.addTask({
        id: 'test-4',
        title: 'TASK TO DELETE',
        description: '',
        status: TaskStatus.TODO,
        priority: 'medium',
        dueDate: null,
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parentId: null,
        dependencies: [],
        position: 0,
      })
    })

    const initialData = JSON.parse(localStorage.getItem('ralph-tasks')!)
    expect(initialData.state.tasks).toHaveLength(1)

    act(() => {
      result.current.deleteTask('test-4', false)
    })

    const afterDeleteData = JSON.parse(localStorage.getItem('ralph-tasks')!)
    expect(afterDeleteData.state.tasks).toHaveLength(0)
  })
})
