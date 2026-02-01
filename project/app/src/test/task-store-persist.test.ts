import { describe, expect, it } from 'vitest'
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
