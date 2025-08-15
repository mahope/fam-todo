import { prisma } from '@/lib/prisma';
import { addDays, addWeeks, addMonths, startOfDay, isWeekend, format } from 'date-fns';

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface RepeatRuleData {
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
  maxOccurrences?: number;
  skipWeekends?: boolean;
}

export class RecurringTaskService {
  /**
   * Create a repeat rule for a task
   */
  static async createRepeatRule(taskId: string, ruleData: RepeatRuleData) {
    return prisma.repeatRule.create({
      data: {
        taskId,
        type: ruleData.type,
        interval: ruleData.interval,
        daysOfWeek: ruleData.daysOfWeek || [],
        dayOfMonth: ruleData.dayOfMonth,
        endDate: ruleData.endDate,
        maxOccurrences: ruleData.maxOccurrences,
        skipWeekends: ruleData.skipWeekends || false,
      },
    });
  }

  /**
   * Update a repeat rule
   */
  static async updateRepeatRule(taskId: string, ruleData: Partial<RepeatRuleData>) {
    return prisma.repeatRule.update({
      where: { taskId },
      data: {
        type: ruleData.type,
        interval: ruleData.interval,
        daysOfWeek: ruleData.daysOfWeek,
        dayOfMonth: ruleData.dayOfMonth,
        endDate: ruleData.endDate,
        maxOccurrences: ruleData.maxOccurrences,
        skipWeekends: ruleData.skipWeekends,
      },
    });
  }

  /**
   * Delete a repeat rule and stop recurring
   */
  static async deleteRepeatRule(taskId: string) {
    // Delete future occurrences
    await prisma.taskOccurrence.deleteMany({
      where: {
        taskId,
        occurrenceDate: { gte: new Date() },
        completed: false,
      },
    });

    // Delete the repeat rule
    return prisma.repeatRule.delete({
      where: { taskId },
    });
  }

  /**
   * Generate future occurrences for a recurring task
   */
  static async generateOccurrences(taskId: string, weeksAhead: number = 8) {
    const rule = await prisma.repeatRule.findUnique({
      where: { taskId },
      include: { task: true },
    });

    if (!rule) {
      throw new Error('No repeat rule found for task');
    }

    const startDate = startOfDay(new Date());
    const endDate = addWeeks(startDate, weeksAhead);
    
    // Check if we should stop generating (max occurrences or end date)
    if (rule.endDate && rule.endDate <= startDate) {
      return [];
    }

    const existingOccurrences = await prisma.taskOccurrence.findMany({
      where: {
        taskId,
        occurrenceDate: { gte: startDate },
      },
      select: { occurrenceDate: true },
    });

    const existingDates = new Set(
      existingOccurrences.map(occ => format(occ.occurrenceDate, 'yyyy-MM-dd'))
    );

    const newOccurrences: { taskId: string; occurrenceDate: Date }[] = [];
    let currentDate = startDate;
    let occurrenceCount = 0;

    // Count existing occurrences for max limit
    if (rule.maxOccurrences) {
      const totalExisting = await prisma.taskOccurrence.count({
        where: { taskId },
      });
      occurrenceCount = totalExisting;
    }

    while (currentDate <= endDate) {
      // Check max occurrences limit
      if (rule.maxOccurrences && occurrenceCount >= rule.maxOccurrences) {
        break;
      }

      // Check end date limit
      if (rule.endDate && currentDate > rule.endDate) {
        break;
      }

      let shouldCreateOccurrence = false;

      switch (rule.type) {
        case 'DAILY':
          shouldCreateOccurrence = true;
          break;

        case 'WEEKLY':
          if (rule.daysOfWeek.length > 0) {
            const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Convert Sunday from 0 to 7
            shouldCreateOccurrence = rule.daysOfWeek.includes(dayOfWeek);
          }
          break;

        case 'MONTHLY':
          if (rule.dayOfMonth) {
            shouldCreateOccurrence = currentDate.getDate() === rule.dayOfMonth;
          }
          break;

        case 'CUSTOM':
          // For custom rules, implement specific logic here
          // For now, treat as daily
          shouldCreateOccurrence = true;
          break;
      }

      // Skip weekends if specified
      if (shouldCreateOccurrence && rule.skipWeekends && isWeekend(currentDate)) {
        shouldCreateOccurrence = false;
      }

      // Create occurrence if needed and doesn't already exist
      if (shouldCreateOccurrence) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        if (!existingDates.has(dateKey)) {
          newOccurrences.push({
            taskId,
            occurrenceDate: new Date(currentDate),
          });
          occurrenceCount++;
        }
      }

      // Move to next date based on interval
      switch (rule.type) {
        case 'DAILY':
          currentDate = addDays(currentDate, rule.interval);
          break;
        case 'WEEKLY':
          currentDate = addDays(currentDate, 1); // Check each day for weekly patterns
          break;
        case 'MONTHLY':
          currentDate = addDays(currentDate, 1); // Check each day for monthly patterns
          break;
        default:
          currentDate = addDays(currentDate, rule.interval);
      }
    }

    // Batch create new occurrences
    if (newOccurrences.length > 0) {
      await prisma.taskOccurrence.createMany({
        data: newOccurrences,
      });
    }

    return newOccurrences;
  }

  /**
   * Mark an occurrence as completed
   */
  static async completeOccurrence(taskId: string, occurrenceDate: Date, completedBy: string) {
    const occurrence = await prisma.taskOccurrence.findUnique({
      where: {
        taskId_occurrenceDate: {
          taskId,
          occurrenceDate: startOfDay(occurrenceDate),
        },
      },
    });

    if (!occurrence) {
      // Create the occurrence if it doesn't exist
      await prisma.taskOccurrence.create({
        data: {
          taskId,
          occurrenceDate: startOfDay(occurrenceDate),
          completed: true,
          completedAt: new Date(),
          completedBy,
        },
      });
    } else {
      // Update existing occurrence
      await prisma.taskOccurrence.update({
        where: { id: occurrence.id },
        data: {
          completed: true,
          completedAt: new Date(),
          completedBy,
        },
      });
    }

    return true;
  }

  /**
   * Mark an occurrence as incomplete
   */
  static async uncompleteOccurrence(taskId: string, occurrenceDate: Date) {
    return prisma.taskOccurrence.updateMany({
      where: {
        taskId,
        occurrenceDate: startOfDay(occurrenceDate),
      },
      data: {
        completed: false,
        completedAt: null,
        completedBy: null,
      },
    });
  }

  /**
   * Skip an occurrence
   */
  static async skipOccurrence(taskId: string, occurrenceDate: Date) {
    const occurrence = await prisma.taskOccurrence.findUnique({
      where: {
        taskId_occurrenceDate: {
          taskId,
          occurrenceDate: startOfDay(occurrenceDate),
        },
      },
    });

    if (!occurrence) {
      // Create skipped occurrence
      await prisma.taskOccurrence.create({
        data: {
          taskId,
          occurrenceDate: startOfDay(occurrenceDate),
          skipped: true,
        },
      });
    } else {
      // Update existing occurrence
      await prisma.taskOccurrence.update({
        where: { id: occurrence.id },
        data: {
          skipped: true,
          completed: false,
          completedAt: null,
          completedBy: null,
        },
      });
    }

    return true;
  }

  /**
   * Get upcoming occurrences for a task
   */
  static async getUpcomingOccurrences(taskId: string, days: number = 30) {
    const endDate = addDays(new Date(), days);
    
    return prisma.taskOccurrence.findMany({
      where: {
        taskId,
        occurrenceDate: {
          gte: startOfDay(new Date()),
          lte: endDate,
        },
      },
      include: {
        completedByUser: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        occurrenceDate: 'asc',
      },
    });
  }

  /**
   * Get completion statistics for a recurring task
   */
  static async getCompletionStats(taskId: string, days: number = 30) {
    const startDate = addDays(new Date(), -days);
    const endDate = new Date();

    const occurrences = await prisma.taskOccurrence.findMany({
      where: {
        taskId,
        occurrenceDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = occurrences.length;
    const completed = occurrences.filter(occ => occ.completed).length;
    const skipped = occurrences.filter(occ => occ.skipped).length;
    const missed = occurrences.filter(occ => !occ.completed && !occ.skipped && occ.occurrenceDate < new Date()).length;

    return {
      total,
      completed,
      skipped,
      missed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  /**
   * Cleanup old occurrences (keep for history but remove very old ones)
   */
  static async cleanupOldOccurrences(daysToKeep: number = 90) {
    const cutoffDate = addDays(new Date(), -daysToKeep);
    
    return prisma.taskOccurrence.deleteMany({
      where: {
        occurrenceDate: { lt: cutoffDate },
      },
    });
  }
}