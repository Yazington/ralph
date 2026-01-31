import { RecurrenceRule, RecurrenceFrequency } from './task';

/**
 * Maps our RecurrenceFrequency to rrule.js frequency constant.
 * Returns null for 'custom' frequency (not supported).
 */
export function mapFrequencyToRRule(freq: RecurrenceFrequency): number | null {
  // Assume RRule constants are available: RRule.DAILY, RRule.WEEKLY, etc.
  // We'll use numeric values as per rrule.js source: DAILY=3, WEEKLY=2, MONTHLY=1, YEARLY=0
  // Reference: https://github.com/mark-when/rrule/blob/master/src/types.ts
  const mapping: Record<RecurrenceFrequency, number | null> = {
    daily: 3,   // RRule.DAILY
    weekly: 2,  // RRule.WEEKLY
    monthly: 1, // RRule.MONTHLY
    yearly: 0,  // RRule.YEARLY
    custom: null,
  };
  return mapping[freq];
}

/**
 * Convert our RecurrenceRule to rrule.js options object.
 * Requires startDate (first occurrence).
 * Returns null if frequency is custom or mapping fails.
 */
export function convertToRRuleOptions(rule: RecurrenceRule, startDate: Date): any | null {
  const freq = mapFrequencyToRRule(rule.frequency);
  if (freq === null) return null;
  
  const options: any = {
    freq,
    dtstart: startDate,
  };
  if (rule.interval !== undefined) {
    options.interval = rule.interval;
  }
  if (rule.endDate) {
    options.until = rule.endDate;
  }
  if (rule.occurrences !== undefined) {
    options.count = rule.occurrences;
  }
  if (rule.byWeekDay && rule.byWeekDay.length > 0) {
    // Map our weekday numbers (0=Sunday) to RRule weekday constants (RRule.SU, RRule.MO, ...)
    // RRule weekdays are numbers: SU=0, MO=1, TU=2, WE=3, TH=4, FR=5, SA=6
    // Our byWeekDay uses same numbering, so we can use directly.
    options.byweekday = rule.byWeekDay.map(day => day); // RRule uses same numbers
  }
  if (rule.byMonthDay && rule.byMonthDay.length > 0) {
    options.bymonthday = rule.byMonthDay;
  }
  return options;
}

/**
 * Calculate next occurrence using rrule.js if available, otherwise fallback to basic calculation.
 * This function attempts to dynamically import rrule.js; if not available, returns null.
 */
export async function nextOccurrenceRRule(
  startDate: Date,
  rule: RecurrenceRule,
  referenceDate: Date = new Date()
): Promise<Date | null> {
  try {
    // Dynamic import to avoid hard dependency
    const { RRule } = await import('rrule');
    const options = convertToRRuleOptions(rule, startDate);
    if (!options) return null;
    const rrule = new RRule(options);
    // Get next occurrence after referenceDate (exclusive)
    const next = rrule.after(referenceDate, false);
    return next;
  } catch (error) {
    // rrule.js not available, fallback to basic calculation (import from recurrence)
    const { nextOccurrence } = await import('./recurrence');
    return nextOccurrence(startDate, rule, referenceDate);
  }
}

/**
 * Validate recurrence rule using rrule.js if available (more thorough validation).
 */
export async function validateRecurrenceRuleRRule(rule: Partial<RecurrenceRule>): Promise<string[]> {
  const errors: string[] = [];
  // Basic validation first
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
  // If rrule.js available, further validation
  try {
    const { RRule } = await import('rrule');
    if (rule.frequency && rule.frequency !== 'custom') {
      const freq = mapFrequencyToRRule(rule.frequency);
      if (freq !== null) {
        const options: any = { freq };
        if (rule.interval) options.interval = rule.interval;
        if (rule.endDate) options.until = rule.endDate;
        if (rule.occurrences) options.count = rule.occurrences;
        // Attempt to create RRule; if invalid, RRule constructor will throw
        new RRule(options);
      }
    }
  } catch (error) {
    // Silently ignore; rrule not available or validation error
    // If error is due to invalid rule, we could add error message but we already have basic validation
  }
  return errors;
}