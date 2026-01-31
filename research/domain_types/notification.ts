export type NotificationType = 'reminder' | 'assigned' | 'mention' | 'due_soon' | 'overdue' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  data?: any; // additional payload
  createdAt: Date;
  readAt?: Date;
}