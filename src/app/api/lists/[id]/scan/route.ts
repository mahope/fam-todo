// API endpoint for scanning images and adding items to lists
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { ListService } from '@/lib/services/lists';
import { OCRService } from '@/lib/services/ocr';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds for OCR processing

interface ScanRequest {
  image: string; // Base64 encoded image
  mode?: 'append' | 'replace';
  autoCategories?: boolean;
}

// POST /api/lists/[id]/scan - Scan image and add items to list
export const POST = withAuth(
  async (
    request: NextRequest,
    sessionData: SessionData,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> => {
    logger.info('POST /api/lists/[id]/scan');

    try {
      const { appUserId: userId, familyId, role } = sessionData;
      const listId = params.id;
    
    // Parse request body
    const body: ScanRequest = await request.json();
    
    if (!body.image) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Image is required', field: 'image' },
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
    
    // Convert base64 to buffer
    const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    logger.info('Scanning image for list items', { 
      listId, 
      listType: list.listType,
      imageSize: imageBuffer.length 
    });
    
    // Extract items based on list type
    const extractedItems = list.listType === 'SHOPPING' 
      ? await OCRService.extractShoppingList(imageBuffer)
      : await OCRService.extractTodoList(imageBuffer);
    
    logger.info('OCR extraction completed', { 
      itemCount: extractedItems.length,
      items: extractedItems.map(i => ({ text: i.text, confidence: i.confidence }))
    });
    
    if (extractedItems.length === 0) {
      return NextResponse.json(
        { error: 'No items detected', message: 'Could not extract any items from the image' },
        { status: 400 }
      );
    }
    
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
      const shoppingItemsData = extractedItems.map(item => ({
        name: item.text,
        quantity: item.quantity || undefined,
        unit: item.unit || undefined,
        category: body.autoCategories ? item.category : undefined,
        purchased: false,
        familyId,
        listId,
      }));
      
      // Batch create shopping items
      await prisma.shoppingItem.createMany({
        data: shoppingItemsData,
      });
      
      // Fetch created items
      createdItems = await prisma.shoppingItem.findMany({
        where: { 
          listId,
          name: { in: extractedItems.map(i => i.text) }
        },
        orderBy: { created_at: 'desc' },
        take: extractedItems.length,
      });
      
      logger.info('Created shopping items', { count: createdItems.length });
      
    } else {
      // Create tasks
      const tasksData = extractedItems.map((item, index) => ({
        title: item.text,
        description: null,
        familyId,
        listId,
        ownerId: userId,
        completed: false,
        priority: 'MEDIUM' as const,
        tags: [],
      }));
      
      // Batch create tasks
      for (const taskData of tasksData) {
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
      
      logger.info('Created tasks', { count: createdItems.length });
    }
    
    // Clean up OCR worker
    await OCRService.cleanup();
    
    // Return the results
    return NextResponse.json({
      success: true,
      listId,
      listType: list.listType,
      mode: body.mode || 'append',
      extracted: extractedItems.length,
      created: createdItems.length,
      items: createdItems,
      confidence: extractedItems.reduce((sum, item) => sum + item.confidence, 0) / extractedItems.length,
    });
    
  } catch (error) {
    logger.error('POST /api/lists/[id]/scan failed', { error });

    // Clean up OCR worker on error
    await OCRService.cleanup();

    if (error instanceof Error) {
      if (error.message.includes('OCR')) {
        return NextResponse.json(
          { error: 'OCR error', message: error.message },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process image' },
      { status: 500 }
    );
  }
},
{
  requireAuth: true,
  rateLimitRule: 'upload',
  allowedMethods: ['POST'],
}
);