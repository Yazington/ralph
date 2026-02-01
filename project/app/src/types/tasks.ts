export const TaskStatus = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done',
} as const

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type Priority = (typeof Priority)[keyof typeof Priority]

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  labels: string[]
  createdAt: string
  updatedAt: string
  parentId: string | null
  dependencies: string[]
  position: number
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: Priority[]
  labels?: string[]
  dueDateRange?: {
    start: string
    end: string
  }
  includeCompleted?: boolean
  excludeCompleted?: boolean
}
