import { Notification } from '../domain_types/notification';
import { NotificationRepository, ListOptions } from '../domain_types/repository';

export class InMemoryNotificationRepository implements NotificationRepository {
  private notifications: Map<string, Notification> = new Map();
  private idCounter = 1;

  async create(notification: Notification): Promise<string> {
    const id = notification.id || `notification-${this.idCounter++}`;
    const notificationWithId = { ...notification, id };
    this.notifications.set(id, notificationWithId);
    return id;
  }

  async read(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  async update(id: string, updates: Partial<Notification>): Promise<void> {
    const existing = await this.read(id);
    if (!existing) {
      throw new Error(`Notification with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, id };
    this.notifications.set(id, updated);
  }

  async delete(id: string): Promise<void> {
    this.notifications.delete(id);
  }

  async list(options?: ListOptions): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values());
    if (options?.sortBy) {
      const { sortBy, sortOrder = 'asc' } = options;
      notifications.sort((a, b) => {
        let aVal = (a as any)[sortBy];
        let bVal = (b as any)[sortBy];
        if (aVal instanceof Date) aVal = aVal.getTime();
        if (bVal instanceof Date) bVal = bVal.getTime();
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    if (options?.offset) {
      notifications = notifications.slice(options.offset);
    }
    if (options?.limit) {
      notifications = notifications.slice(0, options.limit);
    }
    return notifications;
  }

  async findByUserId(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    let filtered = Array.from(this.notifications.values()).filter(n => n.userId === userId);
    if (unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }
    return filtered;
  }

  async markAsRead(id: string): Promise<void> {
    const existing = await this.read(id);
    if (!existing) {
      throw new Error(`Notification with id ${id} not found`);
    }
    await this.update(id, { read: true, readAt: new Date() });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = await this.findByUserId(userId, true);
    for (const notif of userNotifications) {
      await this.update(notif.id, { read: true, readAt: new Date() });
    }
  }
}