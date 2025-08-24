import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export class PushNotificationService {
  private vapidPublicKey: string;
  private vapidPrivateKey: string;

  constructor() {
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    
    if (!this.vapidPublicKey || !this.vapidPrivateKey || 
        this.vapidPrivateKey === 'your_vapid_private_key_here' ||
        this.vapidPublicKey === 'your_vapid_public_key_here') {
      console.warn('VAPID keys not configured. Push notifications will not work.');
    } else {
      try {
        // Configure web-push with VAPID keys only if they are valid
        webpush.setVapidDetails(
          'mailto:support@nestlist.com',
          this.vapidPublicKey,
          this.vapidPrivateKey
        );
      } catch (error) {
        console.warn('Invalid VAPID keys provided. Push notifications will not work.', error);
      }
    }
  }

  // Save push subscription for a user
  async saveSubscription(appUserId: string, subscription: PushSubscription): Promise<void> {
    // TODO: Temporarily disabled until database migration is run
    return;
    /* await prisma.pushSubscription.upsert({
      where: {
        appUserId_endpoint: {
          appUserId,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        isActive: true,
        updated_at: new Date(),
      },
      create: {
        appUserId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        isActive: true,
      },
    }); */
  }

  // Remove push subscription
  async removeSubscription(appUserId: string, endpoint: string): Promise<void> {
    // TODO: Temporarily disabled until database migration is run
    return;
  }

  // Get all active subscriptions for a user
  async getUserSubscriptions(appUserId: string): Promise<PushSubscription[]> {
    // TODO: Temporarily disabled until database migration is run
    return [];
  }

  // Send push notification to specific user
  async sendToUser(appUserId: string, payload: NotificationPayload): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    // TODO: Temporarily disabled until database migration is run
    return { successful: 0, failed: 0, errors: [] };
  }

  // Send push notification to multiple users
  async sendToUsers(appUserIds: string[], payload: NotificationPayload): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    // TODO: Temporarily disabled until database migration is run
    return { successful: 0, failed: 0, errors: [] };
  }

  // Send push notification to all family members
  async sendToFamily(familyId: string, payload: NotificationPayload, excludeUserId?: string): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    // TODO: Temporarily disabled until database migration is run
    return { successful: 0, failed: 0, errors: [] };
  }

  // Send push notification to family adults only
  async sendToFamilyAdults(familyId: string, payload: NotificationPayload, excludeUserId?: string): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    // TODO: Temporarily disabled until database migration is run
    return { successful: 0, failed: 0, errors: [] };
  }

  // Send push notifications to multiple subscriptions
  private async sendToSubscriptions(subscriptions: PushSubscription[], payload: NotificationPayload): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      return {
        successful: 0,
        failed: subscriptions.length,
        errors: ['VAPID keys not configured'],
      };
    }

    // For now, we'll use a simple HTTP-based implementation
    // In production, you'd use web-push library
    const results = await Promise.allSettled(
      subscriptions.map(subscription => this.sendSingleNotification(subscription, payload))
    );

    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful++;
      } else {
        failed++;
        errors.push(`Subscription ${index}: ${result.reason}`);
      }
    });

    return { successful, failed, errors };
  }

  // Send notification to a single subscription
  private async sendSingleNotification(subscription: PushSubscription, payload: NotificationPayload): Promise<void> {
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    try {
      await webpush.sendNotification(
        subscription as any, // web-push expects slightly different interface
        JSON.stringify(payload),
        {
          TTL: 86400, // 24 hours
        }
      );
    } catch (error) {
      throw new Error(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate VAPID keys (for setup)
  static generateVapidKeys(): { publicKey: string; privateKey: string } {
    const vapidKeys = webpush.generateVAPIDKeys();
    return {
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey,
    };
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  taskAssigned: (taskTitle: string, assignerName: string): NotificationPayload => ({
    title: 'Ny opgave tildelt',
    body: `${assignerName} har tildelt dig opgaven "${taskTitle}"`,
    icon: '/icons/task-assigned.png',
    tag: 'task-assigned',
    data: { type: 'task-assigned' },
    actions: [
      { action: 'view', title: 'Se opgave' },
      { action: 'dismiss', title: 'Afvis' },
    ],
  }),

  taskCompleted: (taskTitle: string, completedByName: string): NotificationPayload => ({
    title: 'Opgave fuldført',
    body: `${completedByName} har fuldført opgaven "${taskTitle}"`,
    icon: '/icons/task-completed.png',
    tag: 'task-completed',
    data: { type: 'task-completed' },
  }),

  taskDeadlineReminder: (taskTitle: string, deadlineDate: string): NotificationPayload => ({
    title: 'Påmindelse: Opgave deadline',
    body: `Opgaven "${taskTitle}" skal være færdig ${deadlineDate}`,
    icon: '/icons/deadline-reminder.png',
    tag: 'deadline-reminder',
    data: { type: 'deadline-reminder' },
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Se opgave' },
      { action: 'snooze', title: 'Påmind senere' },
    ],
  }),

  listShared: (listName: string, sharedByName: string): NotificationPayload => ({
    title: 'Liste delt med dig',
    body: `${sharedByName} har delt listen "${listName}" med dig`,
    icon: '/icons/list-shared.png',
    tag: 'list-shared',
    data: { type: 'list-shared' },
    actions: [
      { action: 'view', title: 'Se liste' },
    ],
  }),

  familyInvite: (familyName: string, inviterName: string): NotificationPayload => ({
    title: 'Familie invitation',
    body: `${inviterName} har inviteret dig til familien "${familyName}"`,
    icon: '/icons/family-invite.png',
    tag: 'family-invite',
    data: { type: 'family-invite' },
    requireInteraction: true,
    actions: [
      { action: 'accept', title: 'Acceptér' },
      { action: 'decline', title: 'Afvis' },
    ],
  }),

  shoppingItemAdded: (itemName: string, addedByName: string, listName: string): NotificationPayload => ({
    title: 'Ny vare på indkøbsliste',
    body: `${addedByName} har tilføjet "${itemName}" til ${listName}`,
    icon: '/icons/shopping-item.png',
    tag: 'shopping-item-added',
    data: { type: 'shopping-item-added' },
  }),

  commentAdded: (taskTitle: string, commenterName: string): NotificationPayload => ({
    title: 'Ny kommentar',
    body: `${commenterName} har kommenteret på opgaven "${taskTitle}"`,
    icon: '/icons/comment.png',
    tag: 'comment-added',
    data: { type: 'comment-added' },
    actions: [
      { action: 'view', title: 'Se kommentar' },
    ],
  }),
};

// Export singleton instance
export const pushNotificationService = new PushNotificationService();