export type Priority = 'low' | 'medium' | 'high';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks
  endDate?: Date;
  occurrences?: number;
  byWeekDay?: number[]; // 0 = Sunday, 6 = Saturday
  byMonthDay?: number[];
}

export interface Reminder {
  id: string;
  triggerAt: Date;
  notified: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  tags: string[];
  subtasks: Subtask[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  recurrence?: RecurrenceRule;
  reminders: Reminder[];
  parentTaskId?: string; // if subtask belongs to a parent task (redundant with subtasks array)
  assignedUserId?: string;
  completedAt?: Date;
}