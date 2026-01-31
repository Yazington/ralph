import { describe, it, expect } from 'vitest';
import { validateUser, validateUserPreferences } from '../domain_types/user-utils';
import { User, UserPreferences } from '../domain_types/user';

describe('User validation', () => {
  it('should pass valid user', () => {
    const user: Partial<User> = {
      id: 'user1',
      email: 'test@example.com',
      name: 'John Doe',
      preferences: {
        theme: 'dark',
        language: 'en',
        defaultView: 'list',
        weekStartDay: 1,
        timeZone: 'UTC',
        enableNotifications: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const errors = validateUser(user);
    expect(errors).toEqual([]);
  });

  it('should reject user without id', () => {
    const user: Partial<User> = {
      email: 'test@example.com',
      name: 'John',
    };
    const errors = validateUser(user);
    expect(errors).toContain('User must have an id');
  });

  it('should reject user without email', () => {
    const user: Partial<User> = {
      id: 'user1',
      name: 'John',
    };
    const errors = validateUser(user);
    expect(errors).toContain('User must have a valid email');
  });

  it('should reject invalid email format', () => {
    const user: Partial<User> = {
      id: 'user1',
      email: 'invalid-email',
      name: 'John',
    };
    const errors = validateUser(user);
    expect(errors).toContain('User must have a valid email');
  });

  it('should reject user without name', () => {
    const user: Partial<User> = {
      id: 'user1',
      email: 'test@example.com',
      name: '',
    };
    const errors = validateUser(user);
    expect(errors).toContain('User must have a name');
  });

  it('should validate user preferences', () => {
    const user: Partial<User> = {
      id: 'user1',
      email: 'test@example.com',
      name: 'John',
      preferences: {
        theme: 'invalid' as any,
        defaultView: 'invalid' as any,
        weekStartDay: 5 as any,
        enableNotifications: 'yes' as any,
      },
    };
    const errors = validateUser(user);
    expect(errors).toContain('Theme must be light, dark, or auto');
    expect(errors).toContain('Default view must be list, calendar, or kanban');
    expect(errors).toContain('Week start day must be 0 (Sunday) or 1 (Monday)');
    expect(errors).toContain('Enable notifications must be a boolean');
  });
});

describe('UserPreferences validation', () => {
  it('should pass valid preferences', () => {
    const prefs: UserPreferences = {
      theme: 'light',
      language: 'en',
      defaultView: 'calendar',
      weekStartDay: 0,
      timeZone: 'America/New_York',
      enableNotifications: false,
    };
    const errors = validateUserPreferences(prefs);
    expect(errors).toEqual([]);
  });

  it('should reject invalid theme', () => {
    const prefs = { theme: 'invalid' } as Partial<UserPreferences>;
    const errors = validateUserPreferences(prefs);
    expect(errors).toContain('Theme must be light, dark, or auto');
  });

  it('should reject invalid defaultView', () => {
    const prefs = { defaultView: 'invalid' } as Partial<UserPreferences>;
    const errors = validateUserPreferences(prefs);
    expect(errors).toContain('Default view must be list, calendar, or kanban');
  });

  it('should reject invalid weekStartDay', () => {
    const prefs = { weekStartDay: 3 } as Partial<UserPreferences>;
    const errors = validateUserPreferences(prefs);
    expect(errors).toContain('Week start day must be 0 (Sunday) or 1 (Monday)');
  });

  it('should reject invalid dailyReminderTime', () => {
    const prefs = { dailyReminderTime: 'invalid' } as Partial<UserPreferences>;
    const errors = validateUserPreferences(prefs);
    expect(errors).toContain('Daily reminder time must be a valid date');
  });
});