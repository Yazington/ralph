import { User, UserPreferences } from './user';

export function validateUser(user: Partial<User>): string[] {
  const errors: string[] = [];
  if (!user.id) errors.push('User must have an id');
  if (!user.email || !isValidEmail(user.email)) errors.push('User must have a valid email');
  if (!user.name || user.name.trim().length === 0) errors.push('User must have a name');
  if (user.preferences) {
    errors.push(...validateUserPreferences(user.preferences));
  }
  return errors;
}

export function validateUserPreferences(prefs: Partial<UserPreferences>): string[] {
  const errors: string[] = [];
  if (prefs.theme && !['light', 'dark', 'auto'].includes(prefs.theme)) {
    errors.push('Theme must be light, dark, or auto');
  }
  if (prefs.language && typeof prefs.language !== 'string') {
    errors.push('Language must be a string');
  }
  if (prefs.defaultView && !['list', 'calendar', 'kanban'].includes(prefs.defaultView)) {
    errors.push('Default view must be list, calendar, or kanban');
  }
  if (prefs.weekStartDay !== undefined && prefs.weekStartDay !== 0 && prefs.weekStartDay !== 1) {
    errors.push('Week start day must be 0 (Sunday) or 1 (Monday)');
  }
  if (prefs.timeZone && typeof prefs.timeZone !== 'string') {
    errors.push('Time zone must be a string');
  }
  if (prefs.enableNotifications !== undefined && typeof prefs.enableNotifications !== 'boolean') {
    errors.push('Enable notifications must be a boolean');
  }
  if (prefs.dailyReminderTime && !(prefs.dailyReminderTime instanceof Date) && isNaN(Date.parse(prefs.dailyReminderTime as string))) {
    errors.push('Daily reminder time must be a valid date');
  }
  return errors;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}