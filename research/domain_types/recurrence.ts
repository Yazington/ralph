import { RecurrenceRule, RecurrenceFrequency } from './task';

/**
 * Calculate the next occurrence date based on a recurrence rule starting from a given date.
 * Supports basic frequencies: daily, weekly, monthly, yearly.
 * Assumes the start date is the first occurrence.
 * For simplicity, ignores byWeekDay, byMonthDay, etc. for now.
 */
export function nextOccurrence(startDate: Date, rule: RecurrenceRule, referenceDate: Date = new Date()): Date | null {
  if (rule.endDate && referenceDate > rule.endDate) {
    return null;
  }
  if (rule.occurrences && rule.occurrences <= 0) {
    return null;
  }

  // For simplicity, we'll just calculate based on frequency and interval
  // This is a placeholder implementation; real implementation should use rrule.js
  const result = new Date(startDate);
  let count = 0;
  while (result <= referenceDate && count < 1000) {
    switch (rule.frequency) {
      case 'daily':
        result.setDate(result.getDate() + rule.interval);
        break;
      case 'weekly':
        result.setDate(result.getDate() + 7 * rule.interval);
        break;
      case 'monthly':
        result.setMonth(result.getMonth() + rule.interval);
        break;
      case 'yearly':
        result.setFullYear(result.getFullYear() + rule.interval);
        break;
      case 'custom':
        // Cannot compute
        return null;
    }
    count++;
  }
  if (rule.endDate && result > rule.endDate) {
    return null;
  }
  return result;
}

/**
 * Validate a recurrence rule.
 * Returns array of error messages, empty if valid.
 */
export function validateRecurrenceRule(rule: Partial<RecurrenceRule>): string[] {
  const errors: string[] = [];
  if (!rule.frequency) {
    errors.push('Recurrence rule must have a frequency');
  } else if (!['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(rule.frequency)) {
    errors.push('Frequency must be daily, weekly, monthly, yearly, or custom');
  }
  if (rule.interval !== undefined && (typeof rule.interval !== 'number' || rule.interval <= 0)) {
    errors.push('Interval must be a positive number');
  }
  if (rule.endDate && !(rule.endDate instanceof Date) && isNaN(Date.parse(rule.endDate as string))) {
    errors.push('End date must be a valid date');
  }
  if (rule.occurrences !== undefined && (typeof rule.occurrences !== 'number' || rule.occurrences < 0)) {
    errors.push('Occurrences must be a non-negative number');
  }
  return errors;
}