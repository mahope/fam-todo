// Unified database service layer for List operations
// This centralizes all list-related database queries with proper RLS and error handling

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { 
  List, 
  ListWithRelations, 
  ListWithDetails, 
  ListQueryOptions, 
  ListPermissions,
  CreateListRequest,
  UpdateListRequest,
  ListVisibility,
  ListType
} from '@/lib/types/list';

export class ListService {
  /**
   * Get visibility filter based on user role and permissions
   */
  private static getVisibilityFilter(permissions: ListPermissions, ownerId?: string) {
    const baseFilter = {
      familyId: permissions.familyId,
      OR: [
        { visibility: 'FAMILY' as const },
        { visibility: 'PRIVATE' as const, ownerId: ownerId || permissions.userId },
        ...(permissions.role === 'ADULT' || permissions.role === 'ADMIN' 
          ? [{ visibility: 'ADULT' as const }] 
          : []
        ),
      ],
    };
    
    return baseFilter;
  }

  /**
   * Get lists with relations and computed fields
   */
  static async getLists(
    permissions: ListPermissions, 
    options: ListQueryOptions = {}
  ): Promise<ListWithRelations[]> {
    logger.info('ListService.getLists', { permissions, options });

    try {
      const where = {
        ...this.getVisibilityFilter(permissions),
        ...(options.listType && { listType: options.listType }),
        ...(options.folderId !== undefined && { folderId: options.folderId }),
        ...(options.visibility && { visibility: options.visibility }),
        ...(options.search && {
          OR: [
            { name: { contains: options.search, mode: 'insensitive' as const } },
            { description: { contains: options.search, mode: 'insensitive' as const } },
          ]
        }),
      };

      const lists = await prisma.list.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          _count: {
            select: {
              tasks: { where: { completed: false } },
              shoppingItems: { where: { purchased: false } },
            },
          },
        },
        orderBy: {
          [options.orderBy || 'updated_at']: options.orderDirection || 'desc',
        },
      });

      // Transform to include computed fields
      const result: ListWithRelations[] = lists.map(list => ({
        id: list.id,
        name: list.name,
        description: list.description,
        color: list.color,
        familyId: list.familyId,
        ownerId: list.ownerId,
        folderId: list.folderId,
        visibility: list.visibility as ListVisibility,
        listType: list.listType as ListType,
        created_at: list.created_at,
        updated_at: list.updated_at,
        owner: {
          id: list.owner.id,
          displayName: list.owner.displayName,
          email: list.owner.email,
        },
        folder: list.folder,
        taskCount: list._count.tasks,
        shoppingItemCount: list._count.shoppingItems,
        isOwner: list.ownerId === permissions.userId,
        canEdit: list.ownerId === permissions.userId || permissions.role === 'ADMIN',
        canDelete: list.ownerId === permissions.userId || permissions.role === 'ADMIN',
      }));

      logger.info('ListService.getLists completed', { count: result.length });
      return result;
    } catch (error) {
      logger.error('ListService.getLists failed', { error });
      throw error;
    }
  }

  /**
   * Get single list with full details
   */
  static async getListWithDetails(
    listId: string, 
    permissions: ListPermissions
  ): Promise<ListWithDetails | null> {
    logger.info('ListService.getListWithDetails', { listId, permissions });

    try {
      const list = await prisma.list.findFirst({
        where: {
          id: listId,
          ...this.getVisibilityFilter(permissions),
        },
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          tasks: {
            where: { completed: false },
            select: {
              id: true,
              title: true,
              completed: true,
              priority: true,
              deadline: true,
              assigneeId: true,
            },
            orderBy: { created_at: 'desc' },
            take: 50, // Limit for performance
          },
          shoppingItems: {
            where: { purchased: false },
            select: {
              id: true,
              name: true,
              purchased: true,
              quantity: true,
              unit: true,
            },
            orderBy: { created_at: 'desc' },
            take: 50, // Limit for performance
          },
          _count: {
            select: {
              tasks: { where: { completed: false } },
              shoppingItems: { where: { purchased: false } },
            },
          },
        },
      });

      if (!list) {
        return null;
      }

      // Transform to include computed fields
      const result: ListWithDetails = {
        id: list.id,
        name: list.name,
        description: list.description,
        color: list.color,
        familyId: list.familyId,
        ownerId: list.ownerId,
        folderId: list.folderId,
        visibility: list.visibility as ListVisibility,
        listType: list.listType as ListType,
        created_at: list.created_at,
        updated_at: list.updated_at,
        owner: {
          id: list.owner.id,
          displayName: list.owner.displayName,
          email: list.owner.email,
        },
        folder: list.folder,
        taskCount: list._count.tasks,
        shoppingItemCount: list._count.shoppingItems,
        isOwner: list.ownerId === permissions.userId,
        canEdit: list.ownerId === permissions.userId || permissions.role === 'ADMIN',
        canDelete: list.ownerId === permissions.userId || permissions.role === 'ADMIN',
        tasks: list.tasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
          priority: task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
          deadline: task.deadline,
          assigneeId: task.assigneeId,
        })),
        shoppingItems: list.shoppingItems.map(item => ({
          id: item.id,
          name: item.name,
          purchased: item.purchased,
          quantity: item.quantity,
          unit: item.unit,
        })),
      };

      logger.info('ListService.getListWithDetails completed', { listId });
      return result;
    } catch (error) {
      logger.error('ListService.getListWithDetails failed', { listId, error });
      throw error;
    }
  }

  /**
   * Create new list
   */
  static async createList(
    data: CreateListRequest, 
    permissions: ListPermissions
  ): Promise<ListWithRelations> {
    logger.info('ListService.createList', { data, permissions });

    try {
      // Validate folder access if folderId is provided
      if (data.folderId) {
        const folder = await prisma.folder.findFirst({
          where: {
            id: data.folderId,
            ...this.getVisibilityFilter(permissions),
          },
        });

        if (!folder) {
          throw new Error('Folder not found or access denied');
        }
      }

      const list = await prisma.list.create({
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          color: data.color || null,
          folderId: data.folderId || null,
          visibility: data.visibility || 'FAMILY',
          listType: data.listType || 'TODO',
          familyId: permissions.familyId,
          ownerId: permissions.userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              shoppingItems: true,
            },
          },
        },
      });

      const result: ListWithRelations = {
        id: list.id,
        name: list.name,
        description: list.description,
        color: list.color,
        familyId: list.familyId,
        ownerId: list.ownerId,
        folderId: list.folderId,
        visibility: list.visibility as ListVisibility,
        listType: list.listType as ListType,
        created_at: list.created_at,
        updated_at: list.updated_at,
        owner: {
          id: list.owner.id,
          displayName: list.owner.displayName,
          email: list.owner.email,
        },
        folder: list.folder,
        taskCount: list._count.tasks,
        shoppingItemCount: list._count.shoppingItems,
        isOwner: true, // Always true for creator
        canEdit: true,
        canDelete: true,
      };

      logger.info('ListService.createList completed', { listId: result.id });
      return result;
    } catch (error) {
      logger.error('ListService.createList failed', { data, error });
      throw error;
    }
  }

  /**
   * Update existing list
   */
  static async updateList(
    listId: string, 
    data: UpdateListRequest, 
    permissions: ListPermissions
  ): Promise<ListWithRelations> {
    logger.info('ListService.updateList', { listId, data, permissions });

    try {
      // First check if list exists and user has edit permissions
      const existingList = await prisma.list.findFirst({
        where: {
          id: listId,
          ...this.getVisibilityFilter(permissions),
        },
      });

      if (!existingList) {
        throw new Error('List not found or access denied');
      }

      if (existingList.ownerId !== permissions.userId && permissions.role !== 'ADMIN') {
        throw new Error('Only list owner or admin can modify list');
      }

      // Validate folder access if changing folderId
      if (data.folderId !== undefined && data.folderId) {
        const folder = await prisma.folder.findFirst({
          where: {
            id: data.folderId,
            ...this.getVisibilityFilter(permissions),
          },
        });

        if (!folder) {
          throw new Error('Folder not found or access denied');
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.description !== undefined) updateData.description = data.description?.trim() || null;
      if (data.color !== undefined) updateData.color = data.color || null;
      if (data.visibility !== undefined) updateData.visibility = data.visibility;
      if (data.folderId !== undefined) updateData.folderId = data.folderId || null;

      const list = await prisma.list.update({
        where: { id: listId },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          _count: {
            select: {
              tasks: { where: { completed: false } },
              shoppingItems: { where: { purchased: false } },
            },
          },
        },
      });

      const result: ListWithRelations = {
        id: list.id,
        name: list.name,
        description: list.description,
        color: list.color,
        familyId: list.familyId,
        ownerId: list.ownerId,
        folderId: list.folderId,
        visibility: list.visibility as ListVisibility,
        listType: list.listType as ListType,
        created_at: list.created_at,
        updated_at: list.updated_at,
        owner: {
          id: list.owner.id,
          displayName: list.owner.displayName,
          email: list.owner.email,
        },
        folder: list.folder,
        taskCount: list._count.tasks,
        shoppingItemCount: list._count.shoppingItems,
        isOwner: list.ownerId === permissions.userId,
        canEdit: list.ownerId === permissions.userId || permissions.role === 'ADMIN',
        canDelete: list.ownerId === permissions.userId || permissions.role === 'ADMIN',
      };

      logger.info('ListService.updateList completed', { listId });
      return result;
    } catch (error) {
      logger.error('ListService.updateList failed', { listId, data, error });
      throw error;
    }
  }

  /**
   * Delete list
   */
  static async deleteList(listId: string, permissions: ListPermissions): Promise<void> {
    logger.info('ListService.deleteList', { listId, permissions });

    try {
      // Check if list exists and user has delete permissions
      const existingList = await prisma.list.findFirst({
        where: {
          id: listId,
          ...this.getVisibilityFilter(permissions),
        },
      });

      if (!existingList) {
        throw new Error('List not found or access denied');
      }

      if (existingList.ownerId !== permissions.userId && permissions.role !== 'ADMIN') {
        throw new Error('Only list owner or admin can delete list');
      }

      // Delete list (cascade will handle tasks and shopping items)
      await prisma.list.delete({
        where: { id: listId },
      });

      logger.info('ListService.deleteList completed', { listId });
    } catch (error) {
      logger.error('ListService.deleteList failed', { listId, error });
      throw error;
    }
  }

  /**
   * Duplicate list (clone with new name)
   */
  static async duplicateList(
    listId: string, 
    newName: string, 
    permissions: ListPermissions
  ): Promise<ListWithRelations> {
    logger.info('ListService.duplicateList', { listId, newName, permissions });

    try {
      // Get source list
      const sourceList = await this.getListWithDetails(listId, permissions);
      if (!sourceList) {
        throw new Error('Source list not found or access denied');
      }

      // Create duplicate list
      const duplicateList = await this.createList({
        name: newName,
        description: sourceList.description,
        color: sourceList.color,
        folderId: sourceList.folderId,
        visibility: sourceList.visibility,
        listType: sourceList.listType,
      }, permissions);

      // Copy tasks if TODO list
      if (sourceList.listType === 'TODO' && sourceList.tasks.length > 0) {
        await prisma.task.createMany({
          data: sourceList.tasks.map(task => ({
            title: task.title,
            completed: false, // Reset completion status
            priority: task.priority,
            deadline: task.deadline,
            familyId: permissions.familyId,
            listId: duplicateList.id,
            ownerId: permissions.userId,
            assigneeId: null, // Reset assignee
          })),
        });
      }

      // Copy shopping items if SHOPPING list
      if (sourceList.listType === 'SHOPPING' && sourceList.shoppingItems.length > 0) {
        await prisma.shoppingItem.createMany({
          data: sourceList.shoppingItems.map(item => ({
            name: item.name,
            quantity: item.quantity || undefined,
            unit: item.unit || undefined,
            purchased: false, // Reset purchased status
            familyId: permissions.familyId,
            listId: duplicateList.id,
          })),
        });
      }

      logger.info('ListService.duplicateList completed', { originalId: listId, newId: duplicateList.id });
      return duplicateList;
    } catch (error) {
      logger.error('ListService.duplicateList failed', { listId, newName, error });
      throw error;
    }
  }

  /**
   * Move list to different folder
   */
  static async moveList(
    listId: string, 
    folderId: string | null, 
    permissions: ListPermissions
  ): Promise<ListWithRelations> {
    logger.info('ListService.moveList', { listId, folderId, permissions });

    try {
      return await this.updateList(listId, { folderId }, permissions);
    } catch (error) {
      logger.error('ListService.moveList failed', { listId, folderId, error });
      throw error;
    }
  }
}