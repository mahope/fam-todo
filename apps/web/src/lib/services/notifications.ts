import { prisma } from '@/lib/prisma';
import { socketService } from '@/lib/socket/server';

export type NotificationType = 
  | 'TASK_ASSIGNED' 
  | 'TASK_COMPLETED' 
  | 'TASK_OVERDUE' 
  | 'DEADLINE_REMINDER'
  | 'LIST_SHARED'
  | 'FOLDER_SHARED'
  | 'FAMILY_INVITE'
  | 'RECURRING_TASK_GENERATED'
  | 'SHOPPING_ITEM_ADDED';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  sendAt?: Date;
  familyId: string;
  userId: string;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async create(data: NotificationData) {
    const notification = await prisma.notification.create({
      data: {
        familyId: data.familyId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        sendAt: data.sendAt || new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    // Send real-time notification if it should be sent immediately
    if (!data.sendAt || data.sendAt <= new Date()) {
      socketService.broadcastToUser(data.userId, 'notification_created', notification);
    }

    return notification;
  }

  /**
   * Create notifications for multiple users
   */
  static async createBulk(notifications: NotificationData[]) {
    const results = await Promise.all(
      notifications.map(notification => this.create(notification))
    );
    return results;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  /**
   * Get notifications for a user
   */
  static async getForUser(userId: string, options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;

    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Delete old notifications (cleanup)
   */
  static async cleanup(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return prisma.notification.deleteMany({
      where: {
        created_at: { lt: cutoffDate },
        read: true,
      },
    });
  }

  // Specific notification creators for common use cases

  /**
   * Notify when a task is assigned
   */
  static async notifyTaskAssigned(
    taskId: string,
    taskTitle: string,
    assigneeId: string,
    assignerId: string,
    familyId: string
  ) {
    const assigner = await prisma.appUser.findUnique({
      where: { id: assignerId },
      select: { displayName: true },
    });

    return this.create({
      type: 'TASK_ASSIGNED',
      title: 'Ny opgave tildelt',
      message: `${assigner?.displayName || 'En familiemedlem'} har tildelt dig opgaven "${taskTitle}"`,
      entityType: 'task',
      entityId: taskId,
      familyId,
      userId: assigneeId,
    });
  }

  /**
   * Notify when a task is completed
   */
  static async notifyTaskCompleted(
    taskId: string,
    taskTitle: string,
    completerId: string,
    ownerId: string,
    familyId: string
  ) {
    if (completerId === ownerId) return; // Don't notify yourself

    const completer = await prisma.appUser.findUnique({
      where: { id: completerId },
      select: { displayName: true },
    });

    return this.create({
      type: 'TASK_COMPLETED',
      title: 'Opgave fuldført',
      message: `${completer?.displayName || 'En familiemedlem'} har fuldført opgaven "${taskTitle}"`,
      entityType: 'task',
      entityId: taskId,
      familyId,
      userId: ownerId,
    });
  }

  /**
   * Notify about upcoming deadlines
   */
  static async notifyDeadlineReminder(
    taskId: string,
    taskTitle: string,
    assigneeId: string,
    familyId: string,
    deadline: Date
  ) {
    const hoursUntilDeadline = Math.round((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60));
    
    let timeText = '';
    if (hoursUntilDeadline <= 1) {
      timeText = 'mindre end 1 time';
    } else if (hoursUntilDeadline <= 24) {
      timeText = `${hoursUntilDeadline} timer`;
    } else {
      const days = Math.round(hoursUntilDeadline / 24);
      timeText = `${days} dage`;
    }

    return this.create({
      type: 'DEADLINE_REMINDER',
      title: 'Opgave deadline nærmer sig',
      message: `Opgaven "${taskTitle}" skal fuldføres om ${timeText}`,
      entityType: 'task',
      entityId: taskId,
      familyId,
      userId: assigneeId,
    });
  }

  /**
   * Notify when a task is overdue
   */
  static async notifyTaskOverdue(
    taskId: string,
    taskTitle: string,
    assigneeId: string,
    familyId: string
  ) {
    return this.create({
      type: 'TASK_OVERDUE',
      title: 'Opgave er overskredet',
      message: `Opgaven "${taskTitle}" er overskredet og skal fuldføres hurtigst muligt`,
      entityType: 'task',
      entityId: taskId,
      familyId,
      userId: assigneeId,
    });
  }

  /**
   * Notify when a list is shared
   */
  static async notifyListShared(
    listId: string,
    listName: string,
    sharerId: string,
    recipientIds: string[],
    familyId: string
  ) {
    const sharer = await prisma.appUser.findUnique({
      where: { id: sharerId },
      select: { displayName: true },
    });

    const notifications = recipientIds.map(recipientId => ({
      type: 'LIST_SHARED' as NotificationType,
      title: 'Liste delt med dig',
      message: `${sharer?.displayName || 'En familiemedlem'} har delt listen "${listName}" med dig`,
      entityType: 'list',
      entityId: listId,
      familyId,
      userId: recipientId,
    }));

    return this.createBulk(notifications);
  }

  /**
   * Notify about family invite
   */
  static async notifyFamilyInvite(
    familyName: string,
    inviterName: string,
    inviteeEmail: string,
    familyId: string,
    userId: string
  ) {
    return this.create({
      type: 'FAMILY_INVITE',
      title: 'Invitation til familie',
      message: `${inviterName} har inviteret dig til at blive medlem af familien "${familyName}"`,
      entityType: 'family',
      entityId: familyId,
      familyId,
      userId,
    });
  }

  /**
   * Schedule deadline reminders for a task
   */
  static async scheduleDeadlineReminders(
    taskId: string,
    taskTitle: string,
    assigneeId: string,
    familyId: string,
    deadline: Date
  ) {
    const now = new Date();
    const timeUntilDeadline = deadline.getTime() - now.getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const oneHourInMs = 60 * 60 * 1000;

    const reminders = [];

    // 24 hours before
    if (timeUntilDeadline > oneDayInMs) {
      const reminderTime = new Date(deadline.getTime() - oneDayInMs);
      reminders.push({
        type: 'DEADLINE_REMINDER' as NotificationType,
        title: 'Opgave deadline i morgen',
        message: `Opgaven "${taskTitle}" skal fuldføres i morgen`,
        entityType: 'task',
        entityId: taskId,
        sendAt: reminderTime,
        familyId,
        userId: assigneeId,
      });
    }

    // 1 hour before
    if (timeUntilDeadline > oneHourInMs) {
      const reminderTime = new Date(deadline.getTime() - oneHourInMs);
      reminders.push({
        type: 'DEADLINE_REMINDER' as NotificationType,
        title: 'Opgave deadline om 1 time',
        message: `Opgaven "${taskTitle}" skal fuldføres om 1 time`,
        entityType: 'task',
        entityId: taskId,
        sendAt: reminderTime,
        familyId,
        userId: assigneeId,
      });
    }

    return this.createBulk(reminders);
  }

  /**
   * Process pending notifications (to be called by a cron job)
   */
  static async processPendingNotifications() {
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        sendAt: { lte: new Date() },
        read: false,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    for (const notification of pendingNotifications) {
      // Send real-time notification
      socketService.broadcastToUser(notification.userId, 'notification_created', notification);
    }

    return pendingNotifications.length;
  }
}