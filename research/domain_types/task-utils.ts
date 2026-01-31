import { Task, Priority, RecurrenceRule, Reminder } from './task';
import { validateRecurrenceRule } from './recurrence';

export function validateTask(task: Partial<Task>): string[] {
  const errors: string[] = [];
  if (!task.id) errors.push('Task must have an id');
  if (!task.title || task.title.trim().length === 0) errors.push('Task must have a title');
  if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
    errors.push('Priority must be low, medium, or high');
  }
  if (task.dueDate && !(task.dueDate instanceof Date) && isNaN(Date.parse(task.dueDate as string))) {
    errors.push('Due date must be a valid date');
  }
  // Validate subtasks
  if (task.subtasks) {
    for (let i = 0; i < task.subtasks.length; i++) {
      const subtask = task.subtasks[i];
      if (!subtask.id) errors.push(`Subtask ${i} must have an id`);
      if (!subtask.title || subtask.title.trim().length === 0) errors.push(`Subtask ${i} must have a title`);
    }
  }
  // Validate recurrence rule
  if (task.recurrence) {
    errors.push(...validateRecurrenceRule(task.recurrence));
  }
  // Validate reminders
  if (task.reminders) {
    for (let i = 0; i < task.reminders.length; i++) {
      const reminder = task.reminders[i];
      if (!reminder.id) errors.push(`Reminder ${i} must have an id`);
      if (!reminder.triggerAt || !(reminder.triggerAt instanceof Date) && isNaN(Date.parse(reminder.triggerAt as string))) {
        errors.push(`Reminder ${i} must have a valid trigger date`);
      }
    }
  }
  return errors;
}

export function isTaskComplete(task: Task): boolean {
  if (!task.completed) return false;
  // Check if all subtasks are complete
  return task.subtasks.every(st => st.completed);
}

export function getTaskCompletionPercentage(task: Task): number {
  if (task.subtasks.length === 0) return task.completed ? 100 : 0;
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  return Math.round((completedSubtasks / task.subtasks.length) * 100);
}