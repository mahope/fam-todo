// API endpoint for batch adding items to a list
import { NextRequest, NextResponse } from 'next/server';
import { getSessionData } from '@/lib/auth/session';
import { ListService } from '@/lib/services/lists';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { ParsedListItem } from '@/lib/services/ocr';

interface BatchItemsRequest {
  items: ParsedListItem[];
  mode?: 'append' | 'replace';
  autoCategories?: boolean;
}

// POST /api/lists/[id]/items/batch - Add multiple items to list
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  logger.info('POST /api/lists/[id]/items/batch');
  
  try {
    const { appUserId: userId, familyId, role } = await getSessionData();
    const params = await context.params;
    const listId = params.id;
    
    // Parse request body
    const body: BatchItemsRequest = await request.json();
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Items array is required', field: 'items' },
        { status: 400 }
      );
    }
    
    // Check if list exists and user has access
    const permissions = { userId, familyId, role };
    const list = await ListService.getListWithDetails(listId, permissions);
    
    if (!list) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }
    
    // Check if user can edit the list
    if (!list.canEdit) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to edit this list' },
        { status: 403 }
      );
    }
    
    logger.info('Adding batch items to list', { 
      listId, 
      listType: list.listType,
      itemCount: body.items.length,
      mode: body.mode || 'append'
    });
    
    // If replace mode, delete existing items first
    if (body.mode === 'replace') {
      logger.info('Replacing existing items', { listId });
      
      if (list.listType === 'SHOPPING') {
        await prisma.shoppingItem.deleteMany({
          where: { listId }
        });
      } else {
        await prisma.task.deleteMany({
          where: { listId }
        });
      }
    }
    
    // Add items to the list
    let createdItems: any[] = [];
    
    if (list.listType === 'SHOPPING') {
      // Create shopping items
      const shoppingItemsData = body.items.map(item => ({
        name: item.text.trim(),
        quantity: item.quantity || undefined,
        unit: item.unit || undefined,
        category: body.autoCategories ? item.category : undefined,
        purchased: false,
        familyId,
        listId,
      }));
      
      // Filter out empty items
      const validItems = shoppingItemsData.filter(item => item.name.length > 0);
      
      if (validItems.length > 0) {
        // Batch create shopping items
        await prisma.shoppingItem.createMany({
          data: validItems,
        });
        
        // Fetch created items
        createdItems = await prisma.shoppingItem.findMany({
          where: { 
            listId,
            name: { in: validItems.map(i => i.name) }
          },
          orderBy: { created_at: 'desc' },
          take: validItems.length,
        });
      }
      
      logger.info('Created shopping items', { count: createdItems.length });
      
    } else {
      // Create tasks
      const tasksData = body.items.map(item => ({
        title: item.text.trim(),
        description: null,
        familyId,
        listId,
        ownerId: userId,
        completed: false,
        priority: 'MEDIUM' as const,
        tags: [],
      }));
      
      // Filter out empty items
      const validTasks = tasksData.filter(task => task.title.length > 0);
      
      if (validTasks.length > 0) {
        // Create tasks one by one to get the created records
        for (const taskData of validTasks) {
          const task = await prisma.task.create({
            data: taskData,
            include: {
              assignee: {
                select: {
                  id: true,
                  displayName: true,
                  email: true,
                }
              },
              subtasks: true,
            }
          });
          createdItems.push(task);
        }
      }
      
      logger.info('Created tasks', { count: createdItems.length });
    }
    
    // Return the results
    return NextResponse.json({
      success: true,
      listId,
      listType: list.listType,
      mode: body.mode || 'append',
      created: createdItems.length,
      items: createdItems,
    });
    
  } catch (error) {
    logger.error('POST /api/lists/[id]/items/batch failed', { error });
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
      if (error.message === 'List not found or access denied') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to add items' },
      { status: 500 }
    );
  }
}