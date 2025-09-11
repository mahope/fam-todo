// OCR Service for extracting text from images
import { createWorker, Worker } from 'tesseract.js';
import sharp from 'sharp';
import { logger } from '@/lib/logger';

export interface OCRResult {
  text: string;
  confidence: number;
  lines: string[];
  items: ParsedListItem[];
}

export interface ParsedListItem {
  text: string;
  quantity?: number;
  unit?: string;
  category?: string;
  confidence: number;
}

export class OCRService {
  private static worker: Worker | null = null;

  /**
   * Initialize the Tesseract worker
   */
  private static async initializeWorker(): Promise<Worker> {
    if (this.worker) return this.worker;
    
    logger.info('OCRService: Initializing Tesseract worker');
    
    try {
      this.worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            logger.info('OCRService: Recognition progress', { progress: m.progress });
          }
        },
      });
      
      logger.info('OCRService: Worker initialized successfully');
      return this.worker;
    } catch (error) {
      logger.error('OCRService: Failed to initialize worker', { error });
      throw new Error('Failed to initialize OCR service');
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  static async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    logger.info('OCRService: Preprocessing image');
    
    try {
      // Apply image enhancements for better OCR
      const processedImage = await sharp(imageBuffer)
        .resize(2000, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .grayscale()
        .normalize()
        .sharpen()
        .threshold(128) // Convert to black and white
        .toBuffer();
      
      logger.info('OCRService: Image preprocessing completed');
      return processedImage;
    } catch (error) {
      logger.error('OCRService: Image preprocessing failed', { error });
      throw new Error('Failed to process image');
    }
  }

  /**
   * Extract text from image using OCR
   */
  static async extractText(imageBuffer: Buffer): Promise<OCRResult> {
    logger.info('OCRService: Starting text extraction');
    
    try {
      // Preprocess the image
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Initialize worker if needed
      const worker = await this.initializeWorker();
      
      // Perform OCR
      const { data } = await worker.recognize(processedImage);
      
      logger.info('OCRService: OCR completed', { 
        confidence: data.confidence,
        textLength: data.text.length 
      });
      
      // Extract lines of text
      const lines = data.lines.map(line => line.text.trim()).filter(text => text.length > 0);
      
      // Parse items from the text
      const items = this.parseListItems(lines, data.confidence);
      
      return {
        text: data.text,
        confidence: data.confidence,
        lines,
        items
      };
    } catch (error) {
      logger.error('OCRService: Text extraction failed', { error });
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Parse text lines into structured list items
   */
  private static parseListItems(lines: string[], overallConfidence: number): ParsedListItem[] {
    logger.info('OCRService: Parsing list items', { lineCount: lines.length });
    
    const items: ParsedListItem[] = [];
    
    for (const line of lines) {
      // Skip empty lines and very short ones
      if (line.trim().length < 2) continue;
      
      // Try to parse structured formats
      const parsedItem = this.parseItemLine(line, overallConfidence);
      if (parsedItem) {
        items.push(parsedItem);
      }
    }
    
    logger.info('OCRService: Parsed items', { itemCount: items.length });
    return items;
  }

  /**
   * Parse a single line into a list item
   */
  private static parseItemLine(line: string, confidence: number): ParsedListItem | null {
    // Clean the line
    const cleanedLine = line
      .replace(/^[\s\-\*\•\◦\▪\▫\□\☐\☑\✓\✔\✗\✘]+/, '') // Remove bullet points
      .replace(/^[\d]+[\.\)]\s*/, '') // Remove numbered list markers
      .trim();
    
    if (!cleanedLine) return null;
    
    // Try to extract quantity and unit
    const quantityPattern = /^(\d+(?:\.\d+)?)\s*(kg|g|mg|l|ml|oz|lb|lbs|cup|cups|tbsp|tsp|piece|pieces|pcs|pack|packs|box|boxes|can|cans|bottle|bottles|jar|jars|bag|bags|dozen|doz)?\s+(.+)/i;
    const match = cleanedLine.match(quantityPattern);
    
    if (match) {
      return {
        text: match[3].trim(),
        quantity: parseFloat(match[1]),
        unit: match[2]?.toLowerCase(),
        confidence,
        category: this.inferCategory(match[3])
      };
    }
    
    // Return as plain text item
    return {
      text: cleanedLine,
      confidence,
      category: this.inferCategory(cleanedLine)
    };
  }

  /**
   * Infer category from item text
   */
  private static inferCategory(text: string): string | undefined {
    const lowerText = text.toLowerCase();
    
    // Food categories
    if (/milk|cheese|yogurt|butter|cream|dairy/.test(lowerText)) return 'Dairy';
    if (/bread|pasta|rice|cereal|flour|grain/.test(lowerText)) return 'Grains';
    if (/apple|banana|orange|fruit|berry|grape/.test(lowerText)) return 'Fruits';
    if (/carrot|potato|onion|tomato|vegetable|lettuce|spinach/.test(lowerText)) return 'Vegetables';
    if (/chicken|beef|pork|fish|meat|turkey|bacon/.test(lowerText)) return 'Meat & Fish';
    if (/water|juice|soda|coffee|tea|drink|beverage/.test(lowerText)) return 'Beverages';
    if (/snack|chip|cookie|candy|chocolate/.test(lowerText)) return 'Snacks';
    
    // Household categories
    if (/soap|shampoo|toothpaste|detergent|cleaner/.test(lowerText)) return 'Household';
    if (/paper|tissue|towel|napkin/.test(lowerText)) return 'Paper Products';
    
    return undefined;
  }

  /**
   * Clean up the worker when done
   */
  static async cleanup(): Promise<void> {
    if (this.worker) {
      logger.info('OCRService: Terminating worker');
      await this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Extract items from a handwritten or printed shopping list
   */
  static async extractShoppingList(imageBuffer: Buffer): Promise<ParsedListItem[]> {
    logger.info('OCRService: Extracting shopping list from image');
    
    try {
      const result = await this.extractText(imageBuffer);
      
      // Filter out items with very low confidence
      const confidentItems = result.items.filter(item => item.confidence > 50);
      
      // If we didn't get good structured results, fall back to line-by-line
      if (confidentItems.length === 0 && result.lines.length > 0) {
        logger.info('OCRService: Falling back to simple line extraction');
        return result.lines.map(line => ({
          text: line,
          confidence: result.confidence,
        }));
      }
      
      return confidentItems;
    } catch (error) {
      logger.error('OCRService: Shopping list extraction failed', { error });
      throw error;
    }
  }

  /**
   * Extract items from a TODO list
   */
  static async extractTodoList(imageBuffer: Buffer): Promise<ParsedListItem[]> {
    logger.info('OCRService: Extracting TODO list from image');
    
    try {
      const result = await this.extractText(imageBuffer);
      
      // For TODO lists, we want to preserve the full text of each line
      return result.lines.map(line => {
        // Remove common TODO markers
        const cleanedText = line
          .replace(/^[\s\-\*\•\◦\▪\▫\□\☐\☑\✓\✔\✗\✘]+/, '')
          .replace(/^(TODO|DONE|PENDING|IN PROGRESS)[\s:\-]*/i, '')
          .replace(/^[\d]+[\.\)]\s*/, '')
          .trim();
        
        if (!cleanedText) return null;
        
        return {
          text: cleanedText,
          confidence: result.confidence,
        };
      }).filter((item): item is ParsedListItem => item !== null);
    } catch (error) {
      logger.error('OCRService: TODO list extraction failed', { error });
      throw error;
    }
  }
}