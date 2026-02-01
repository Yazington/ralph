import { describe, it, expect } from 'vitest'
import { TaskStatus, Priority } from '@/types/tasks'
import type { Task, TaskFilters } from '@/types/tasks'

describe('Task type definitions', () => {
  it('exports TaskStatus enum values', () => {
    expect(TaskStatus.BACKLOG).toBe('backlog')
    expect(TaskStatus.TODO).toBe('todo')
    expect(TaskStatus.IN_PROGRESS).toBe('in-progress')
    expect(TaskStatus.REVIEW).toBe('review')
    expect(TaskStatus.DONE).toBe('done')
  })

  it('exports Priority enum values', () => {
    expect(Priority.LOW).toBe('low')
    expect(Priority.MEDIUM).toBe('medium')
    expect(Priority.HIGH).toBe('high')
    expect(Priority.CRITICAL).toBe('critical')
  })

  it('supports the Task interface shape', () => {
    const task = {
      id: 'task-1',
      title: 'DEFINE TASK TYPES',
      description: '{"type":"doc","content":[]}',
      status: TaskStatus.BACKLOG,
      priority: Priority.MEDIUM,
      dueDate: null,
      labels: ['foundation'],
      createdAt: '2026-01-31T00:00:00.000Z',
      updatedAt: '2026-01-31T00:00:00.000Z',
      parentId: null,
      dependencies: [],
      position: 0,
    } satisfies Task

    expect(task.status).toBe(TaskStatus.BACKLOG)
    expect(task.priority).toBe(Priority.MEDIUM)
    expect(task.labels).toEqual(['foundation'])
  })

  it('supports optional TaskFilters fields', () => {
    const filters: TaskFilters = {
      status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
      priority: [Priority.HIGH],
      labels: ['frontend'],
      includeCompleted: false,
    }

    expect(filters.status).toEqual([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
    expect(filters.priority).toEqual([Priority.HIGH])
    expect(filters.labels).toEqual(['frontend'])
    expect(filters.includeCompleted).toBe(false)
  })
})
