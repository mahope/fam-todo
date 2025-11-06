import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export type ActivityAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'COMPLETE' | 'ASSIGN' | 'SHARE' | 'ARCHIVE' | 'RESTORE';

export type EntityType = 
  | 'task' | 'list' | 'folder' | 'family' | 'user' | 'shopping_item' | 'notification';

export interface ActivityLogData {
  familyId: string;
  userId: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  metadata?: Record<string, any>;
}

export class ActivityLogService {
  /**
   * Log an activity
   */
  static async log(data: ActivityLogData) {
    try {
      return await prisma.activityLog.create({
        data: {
          familyId: data.familyId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          entityName: data.entityName,
          metadata: data.metadata,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to log activity', { error: error instanceof Error ? error.message : String(error) });
      // Don't throw error to avoid breaking the main operation
      return null;
    }
  }

  /**
   * Get activity logs for a family
   */
  static async getForFamily(
    familyId: string,
    options: {
      entityType?: EntityType;
      entityId?: string;
      userId?: string;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const {
      entityType,
      entityId,
      userId,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
    } = options;

    const whereClause: any = { familyId };

    if (entityType) whereClause.entityType = entityType;
    if (entityId) whereClause.entityId = entityId;
    if (userId) whereClause.userId = userId;

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at.gte = startDate;
      if (endDate) whereClause.created_at.lte = endDate;
    }

    return prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get activity logs for a specific entity
   */
  static async getForEntity(
    familyId: string,
    entityType: EntityType,
    entityId: string,
    limit: number = 20
  ) {
    return this.getForFamily(familyId, {
      entityType,
      entityId,
      limit,
    });
  }

  /**
   * Get activity summary for a family
   */
  static async getFamilySummary(
    familyId: string,
    days: number = 7
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await prisma.activityLog.findMany({
      where: {
        familyId,
        created_at: { gte: startDate },
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

    // Group by action and entity type
    const summary = {
      totalActivities: activities.length,
      byAction: {} as Record<string, number>,
      byEntityType: {} as Record<string, number>,
      byUser: {} as Record<string, { name: string; count: number }>,
      mostActiveUsers: [] as Array<{ userId: string; displayName: string; count: number }>,
      recentActivities: activities.slice(0, 10),
    };

    activities.forEach(activity => {
      // Count by action
      summary.byAction[activity.action] = (summary.byAction[activity.action] || 0) + 1;
      
      // Count by entity type
      summary.byEntityType[activity.entityType] = (summary.byEntityType[activity.entityType] || 0) + 1;
      
      // Count by user
      const userId = activity.userId;
      if (!summary.byUser[userId]) {
        summary.byUser[userId] = {
          name: activity.user.displayName || 'Unknown User',
          count: 0,
        };
      }
      summary.byUser[userId].count++;
    });

    // Get most active users
    summary.mostActiveUsers = Object.entries(summary.byUser)
      .map(([userId, data]) => ({
        userId,
        displayName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return summary;
  }

  /**
   * Cleanup old activity logs
   */
  static async cleanup(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return prisma.activityLog.deleteMany({
      where: {
        created_at: { lt: cutoffDate },
      },
    });
  }

  // Convenience methods for common activities

  static async logTaskCreated(
    familyId: string,
    userId: string,
    taskId: string,
    taskTitle: string,
    metadata?: Record<string, any>
  ) {
    return this.log({
      familyId,
      userId,
      action: 'CREATE',
      entityType: 'task',
      entityId: taskId,
      entityName: taskTitle,
      metadata,
    });
  }

  static async logTaskCompleted(
    familyId: string,
    userId: string,
    taskId: string,
    taskTitle: string,
    metadata?: Record<string, any>
  ) {
    return this.log({
      familyId,
      userId,
      action: 'COMPLETE',
      entityType: 'task',
      entityId: taskId,
      entityName: taskTitle,
      metadata,
    });
  }

  static async logTaskAssigned(
    familyId: string,
    userId: string,
    taskId: string,
    taskTitle: string,
    assigneeId: string,
    metadata?: Record<string, any>
  ) {
    return this.log({
      familyId,
      userId,
      action: 'ASSIGN',
      entityType: 'task',
      entityId: taskId,
      entityName: taskTitle,
      metadata: { assigneeId, ...metadata },
    });
  }

  static async logListCreated(
    familyId: string,
    userId: string,
    listId: string,
    listName: string,
    metadata?: Record<string, any>
  ) {
    return this.log({
      familyId,
      userId,
      action: 'CREATE',
      entityType: 'list',
      entityId: listId,
      entityName: listName,
      metadata,
    });
  }

  static async logListShared(
    familyId: string,
    userId: string,
    listId: string,
    listName: string,
    sharedWithIds: string[],
    metadata?: Record<string, any>
  ) {
    return this.log({
      familyId,
      userId,
      action: 'SHARE',
      entityType: 'list',
      entityId: listId,
      entityName: listName,
      metadata: { sharedWithIds, ...metadata },
    });
  }

  static async logFolderCreated(
    familyId: string,
    userId: string,
    folderId: string,
    folderName: string,
    metadata?: Record<string, any>
  ) {
    return this.log({
      familyId,
      userId,
      action: 'CREATE',
      entityType: 'folder',
      entityId: folderId,
      entityName: folderName,
      metadata,
    });
  }

  static async logUserJoinedFamily(
    familyId: string,
    userId: string,
    newUserId: string,
    metadata?: Record<string, any>
  ) {
    return this.log({
      familyId,
      userId,
      action: 'CREATE',
      entityType: 'user',
      entityId: newUserId,
      entityName: 'New family member',
      metadata,
    });
  }
}