import { describe, expect, it, beforeEach } from 'vitest'

import { useTaskStore } from '@/store/task-store'
import type { Task } from '@/types/tasks'
import { TaskStatus } from '@/types/tasks'

describe('duplicateTask', () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      tasksByStatus: createTasksByStatus([]),
      tasksByParent: createTasksByParent([]),
    })
  })

  it('should create a copy of an existing task with a new ID', () => {
    const originalTask: Task = {
      id: 'task-1',
      title: 'ORIGINAL TASK',
      description: '',
      status: TaskStatus.TODO,
      priority: 'medium',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: null,
      dependencies: [],
      position: 0,
    }

    useTaskStore.getState().setTasks([originalTask])
    useTaskStore.getState().duplicateTask('task-1')

    const state = useTaskStore.getState()

    expect(state.tasks).toHaveLength(2)

    const original = state.tasks.find(t => t.id === 'task-1')
    const duplicate = state.tasks.find(t => t.id !== 'task-1')

    expect(original).toBeDefined()
    expect(duplicate).toBeDefined()
    expect(duplicate?.id).not.toBe('task-1')
  })

  it('should create a copy with " - COPY" suffix on title', () => {
    const originalTask: Task = {
      id: 'task-1',
      title: 'ORIGINAL TASK',
      description: '',
      status: TaskStatus.TODO,
      priority: 'medium',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: null,
      dependencies: [],
      position: 0,
    }

    useTaskStore.getState().setTasks([originalTask])
    useTaskStore.getState().duplicateTask('task-1')

    const state = useTaskStore.getState()
    const duplicate = state.tasks.find(t => t.id !== 'task-1')

    expect(duplicate?.title).toBe('ORIGINAL TASK - COPY')
  })

  it('should create a copy with new timestamps', () => {
    const oldTimestamp = '2026-01-01T00:00:00.000Z'

    const originalTask: Task = {
      id: 'task-1',
      title: 'ORIGINAL TASK',
      description: '',
      status: TaskStatus.TODO,
      priority: 'medium',
      dueDate: null,
      labels: [],
      createdAt: oldTimestamp,
      updatedAt: oldTimestamp,
      parentId: null,
      dependencies: [],
      position: 0,
    }

    useTaskStore.getState().setTasks([originalTask])

    const now = new Date().getTime()

    useTaskStore.getState().duplicateTask('task-1')

    const state = useTaskStore.getState()
    const duplicate = state.tasks.find(t => t.id !== 'task-1')

    expect(duplicate?.createdAt).not.toBe(oldTimestamp)
    expect(duplicate?.updatedAt).not.toBe(oldTimestamp)

    const duplicateTimestamp = new Date(duplicate?.createdAt || '').getTime()

    expect(duplicateTimestamp).toBeGreaterThanOrEqual(now)
  })

  it('should not copy dependencies', () => {
    const originalTask: Task = {
      id: 'task-1',
      title: 'ORIGINAL TASK',
      description: '',
      status: TaskStatus.TODO,
      priority: 'medium',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: null,
      dependencies: ['dep-1', 'dep-2'],
      position: 0,
    }

    useTaskStore.getState().setTasks([originalTask])
    useTaskStore.getState().duplicateTask('task-1')

    const state = useTaskStore.getState()
    const duplicate = state.tasks.find(t => t.id !== 'task-1')

    expect(duplicate?.dependencies).toEqual([])
  })

  it('should copy other task properties', () => {
    const originalTask: Task = {
      id: 'task-1',
      title: 'ORIGINAL TASK',
      description: 'DESCRIPTION',
      status: TaskStatus.IN_PROGRESS,
      priority: 'high',
      dueDate: '2026-02-01T00:00:00.000Z',
      labels: ['label1', 'label2'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: null,
      dependencies: [],
      position: 5,
    }

    useTaskStore.getState().setTasks([originalTask])
    useTaskStore.getState().duplicateTask('task-1')

    const state = useTaskStore.getState()
    const duplicate = state.tasks.find(t => t.id !== 'task-1')

    expect(duplicate?.description).toBe('DESCRIPTION')
    expect(duplicate?.status).toBe(TaskStatus.IN_PROGRESS)
    expect(duplicate?.priority).toBe('high')
    expect(duplicate?.dueDate).toBe('2026-02-01T00:00:00.000Z')
    expect(duplicate?.labels).toEqual(['label1', 'label2'])
  })

  it('should duplicate subtasks recursively', () => {
    const parentTask: Task = {
      id: 'task-1',
      title: 'PARENT TASK',
      description: '',
      status: TaskStatus.TODO,
      priority: 'medium',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: null,
      dependencies: [],
      position: 0,
    }

    const subtask1: Task = {
      id: 'sub-1',
      title: 'SUBTASK 1',
      description: '',
      status: TaskStatus.TODO,
      priority: 'low',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: 'task-1',
      dependencies: [],
      position: 0,
    }

    const subtask2: Task = {
      id: 'sub-2',
      title: 'SUBTASK 2',
      description: '',
      status: TaskStatus.TODO,
      priority: 'low',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: 'task-1',
      dependencies: [],
      position: 1,
    }

    useTaskStore.getState().setTasks([parentTask, subtask1, subtask2])
    useTaskStore.getState().duplicateTask('task-1')

    const state = useTaskStore.getState()

    expect(state.tasks).toHaveLength(6)

    const originalParent = state.tasks.find(t => t.id === 'task-1')
    const duplicateParent = state.tasks.find(
      t => t.title === 'PARENT TASK - COPY'
    )

    expect(originalParent).toBeDefined()
    expect(duplicateParent).toBeDefined()

    const duplicateSubtasks = state.tasks.filter(
      t => t.parentId === duplicateParent?.id
    )

    expect(duplicateSubtasks).toHaveLength(2)

    const duplicateSubtask1 = duplicateSubtasks.find(
      t => t.title === 'SUBTASK 1 - COPY'
    )
    const duplicateSubtask2 = duplicateSubtasks.find(
      t => t.title === 'SUBTASK 2 - COPY'
    )

    expect(duplicateSubtask1).toBeDefined()
    expect(duplicateSubtask2).toBeDefined()

    expect(duplicateSubtask1?.parentId).toBe(duplicateParent?.id)
    expect(duplicateSubtask2?.parentId).toBe(duplicateParent?.id)

    expect(duplicateSubtask1?.id).not.toBe('sub-1')
    expect(duplicateSubtask2?.id).not.toBe('sub-2')
  })

  it('should duplicate nested subtasks recursively', () => {
    const parentTask: Task = {
      id: 'task-1',
      title: 'PARENT TASK',
      description: '',
      status: TaskStatus.TODO,
      priority: 'medium',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: null,
      dependencies: [],
      position: 0,
    }

    const subtask1: Task = {
      id: 'sub-1',
      title: 'SUBTASK 1',
      description: '',
      status: TaskStatus.TODO,
      priority: 'low',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: 'task-1',
      dependencies: [],
      position: 0,
    }

    const subsubtask1: Task = {
      id: 'subsub-1',
      title: 'SUBSUBTASK 1',
      description: '',
      status: TaskStatus.TODO,
      priority: 'low',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: 'sub-1',
      dependencies: [],
      position: 0,
    }

    useTaskStore.getState().setTasks([parentTask, subtask1, subsubtask1])
    useTaskStore.getState().duplicateTask('task-1')

    const state = useTaskStore.getState()

    expect(state.tasks).toHaveLength(6)

    const duplicateParent = state.tasks.find(
      t => t.title === 'PARENT TASK - COPY'
    )
    const duplicateSubtask = state.tasks.find(
      t => t.title === 'SUBTASK 1 - COPY'
    )
    const duplicateSubsubtask = state.tasks.find(
      t => t.title === 'SUBSUBTASK 1 - COPY'
    )

    expect(duplicateParent).toBeDefined()
    expect(duplicateSubtask).toBeDefined()
    expect(duplicateSubsubtask).toBeDefined()

    expect(duplicateSubtask?.parentId).toBe(duplicateParent?.id)
    expect(duplicateSubsubtask?.parentId).toBe(duplicateSubtask?.id)
  })

  it('should do nothing when task does not exist', () => {
    useTaskStore.getState().setTasks([])
    useTaskStore.getState().duplicateTask('nonexistent-id')

    const state = useTaskStore.getState()

    expect(state.tasks).toHaveLength(0)
  })

  it('should rebuild derived state after duplication', () => {
    const originalTask: Task = {
      id: 'task-1',
      title: 'ORIGINAL TASK',
      description: '',
      status: TaskStatus.TODO,
      priority: 'medium',
      dueDate: null,
      labels: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      parentId: null,
      dependencies: [],
      position: 0,
    }

    useTaskStore.getState().setTasks([originalTask])
    useTaskStore.getState().duplicateTask('task-1')

    const state = useTaskStore.getState()

    expect(state.tasksByStatus[TaskStatus.TODO]).toHaveLength(2)
    expect(state.tasksByParent).toBeDefined()
  })
})

function createTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const result: Record<TaskStatus, Task[]> = {
    [TaskStatus.BACKLOG]: [],
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.REVIEW]: [],
    [TaskStatus.DONE]: [],
  }

  for (const task of tasks) {
    result[task.status].push(task)
  }

  return result
}

function createTasksByParent(tasks: Task[]): Record<string, Task[]> {
  const result: Record<string, Task[]> = {}

  for (const task of tasks) {
    const parentId = task.parentId ?? 'root'

    if (!result[parentId]) {
      result[parentId] = []
    }

    result[parentId].push(task)
  }

  return result
}
