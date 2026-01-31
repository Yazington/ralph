import { describe, it, expect } from 'vitest';
import { validateRecurrenceRule, nextOccurrence } from '../domain_types/recurrence';
import { RecurrenceRule } from '../domain_types/task';

describe('Recurrence rule validation', () => {
  it('should accept valid daily rule', () => {
    const rule: RecurrenceRule = {
      frequency: 'daily',
      interval: 1,
    };
    expect(validateRecurrenceRule(rule)).toEqual([]);
  });

  it('should accept valid weekly rule with end date', () => {
    const rule: RecurrenceRule = {
      frequency: 'weekly',
      interval: 2,
      endDate: new Date('2026-12-31'),
    };
    expect(validateRecurrenceRule(rule)).toEqual([]);
  });

  it('should reject missing frequency', () => {
    const rule = {} as Partial<RecurrenceRule>;
    expect(validateRecurrenceRule(rule)).toContain('Recurrence rule must have a frequency');
  });

  it('should reject invalid frequency', () => {
    const rule = { frequency: 'invalid' } as Partial<RecurrenceRule>;
    expect(validateRecurrenceRule(rule)).toContain('Frequency must be daily, weekly, monthly, yearly, or custom');
  });

  it('should reject non-positive interval', () => {
    const rule: Partial<RecurrenceRule> = { frequency: 'daily', interval: 0 };
    expect(validateRecurrenceRule(rule)).toContain('Interval must be a positive number');
  });

  it('should reject invalid end date', () => {
    const rule = { frequency: 'daily', endDate: 'invalid' } as Partial<RecurrenceRule>;
    expect(validateRecurrenceRule(rule)).toContain('End date must be a valid date');
  });

  it('should reject negative occurrences', () => {
    const rule: Partial<RecurrenceRule> = { frequency: 'daily', occurrences: -1 };
    expect(validateRecurrenceRule(rule)).toContain('Occurrences must be a non-negative number');
  });
});

describe('Next occurrence calculation', () => {
  const startDate = new Date('2026-01-01T10:00:00');

  it('should return next daily occurrence', () => {
    const rule: RecurrenceRule = { frequency: 'daily', interval: 1 };
    const reference = new Date('2026-01-02T09:00:00'); // before next occurrence
    const next = nextOccurrence(startDate, rule, reference);
    expect(next).toEqual(new Date('2026-01-02T10:00:00'));
  });

  it('should return next weekly occurrence', () => {
    const rule: RecurrenceRule = { frequency: 'weekly', interval: 1 };
    const reference = new Date('2026-01-08T09:00:00');
    const next = nextOccurrence(startDate, rule, reference);
    expect(next).toEqual(new Date('2026-01-08T10:00:00'));
  });

  it('should return next monthly occurrence', () => {
    const rule: RecurrenceRule = { frequency: 'monthly', interval: 1 };
    const reference = new Date('2026-02-01T09:00:00');
    const next = nextOccurrence(startDate, rule, reference);
    expect(next).toEqual(new Date('2026-02-01T10:00:00'));
  });

  it('should return next yearly occurrence', () => {
    const rule: RecurrenceRule = { frequency: 'yearly', interval: 1 };
    const reference = new Date('2027-01-01T09:00:00');
    const next = nextOccurrence(startDate, rule, reference);
    expect(next).toEqual(new Date('2027-01-01T10:00:00'));
  });

  it('should respect interval', () => {
    const rule: RecurrenceRule = { frequency: 'daily', interval: 2 };
    const reference = new Date('2026-01-02T11:00:00'); // after first interval, before second
    const next = nextOccurrence(startDate, rule, reference);
    expect(next).toEqual(new Date('2026-01-03T10:00:00'));
  });

  it('should return null if end date passed', () => {
    const rule: RecurrenceRule = {
      frequency: 'daily',
      interval: 1,
      endDate: new Date('2026-01-01T11:00:00'),
    };
    const reference = new Date('2026-01-02T12:00:00');
    const next = nextOccurrence(startDate, rule, reference);
    expect(next).toBeNull();
  });

  it('should return null for custom frequency', () => {
    const rule: RecurrenceRule = { frequency: 'custom', interval: 1 };
    const next = nextOccurrence(startDate, rule);
    expect(next).toBeNull();
  });
});