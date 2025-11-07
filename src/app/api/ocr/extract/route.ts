// API endpoint for extracting text from images using OCR
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { OCRService } from '@/lib/services/ocr';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds for OCR processing

interface ExtractRequest {
  image: string; // Base64 encoded image
  listType: 'TODO' | 'SHOPPING';
}

// POST /api/ocr/extract - Extract text from image using OCR
export const POST = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    logger.info('POST /api/ocr/extract');

    try {
      // User is already authenticated via withAuth
    
    // Parse request body
    const body: ExtractRequest = await request.json();
    
    if (!body.image) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Image is required', field: 'image' },
        { status: 400 }
      );
    }
    
    if (!body.listType || !['TODO', 'SHOPPING'].includes(body.listType)) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Valid list type is required', field: 'listType' },
        { status: 400 }
      );
    }
    
    // Convert base64 to buffer
    const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    logger.info('Extracting text from image', { 
      listType: body.listType,
      imageSize: imageBuffer.length 
    });
    
    // Extract items based on list type
    const extractedItems = body.listType === 'SHOPPING' 
      ? await OCRService.extractShoppingList(imageBuffer)
      : await OCRService.extractTodoList(imageBuffer);
    
    // Also get the raw OCR result for confidence scoring
    const fullResult = await OCRService.extractText(imageBuffer);
    
    logger.info('OCR extraction completed', { 
      itemCount: extractedItems.length,
      confidence: fullResult.confidence,
      lines: fullResult.lines.length
    });
    
    // Clean up OCR worker
    await OCRService.cleanup();
    
    // Return the extracted items for review
    return NextResponse.json({
      items: extractedItems,
      confidence: fullResult.confidence,
      lines: fullResult.lines,
    });
    
  } catch (error) {
    logger.error('POST /api/ocr/extract failed', { error });

    // Clean up OCR worker on error
    await OCRService.cleanup();

    if (error instanceof Error) {
      if (error.message.includes('OCR') || error.message.includes('extract')) {
        return NextResponse.json(
          { error: 'OCR error', message: error.message },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to extract text from image' },
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