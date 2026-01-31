export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  defaultView: 'list' | 'calendar' | 'kanban';
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  timeZone: string;
  enableNotifications: boolean;
  dailyReminderTime?: Date;
}