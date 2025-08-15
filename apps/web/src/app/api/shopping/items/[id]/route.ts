import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// Shopping categories enum for validation
const SHOPPING_CATEGORIES = [
  'bakery', 'produce', 'meat', 'fish', 'dairy', 'frozen', 'pantry', 
  'beverages', 'snacks', 'household', 'personal_care', 'baby', 'pets', 'other'
] as const;

type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];

async function getSessionData() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { appUser: true },
  });

  if (!user?.appUser) {
    throw new Error('App user not found');
  }

  return {
    userId: user.id,
    appUserId: user.appUser.id,
    familyId: user.appUser.familyId,
    role: user.appUser.role,
  };
}

async function findShoppingItem(id: string, familyId: string, appUserId: string, role: string) {
  return await prisma.shoppingItem.findFirst({
    where: {
      id,
      familyId,
      list: {
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
    },
    include: {
      list: {
        select: {
          id: true,
          name: true,
          color: true,
          listType: true,
          visibility: true,
        },
      },
    },
  });
}

async function smartCategorizeItem(name: string, familyId: string): Promise<ShoppingCategory> {
  // First check family-specific dictionary
  const familyDictEntry = await prisma.shoppingDictionary.findFirst({
    where: {
      familyId,
      OR: [
        { key: name.toLowerCase() },
        { synonyms: { has: name.toLowerCase() } }
      ]
    }
  });

  if (familyDictEntry) {
    return familyDictEntry.category as ShoppingCategory;
  }

  // Check global dictionary
  const globalDictEntry = await prisma.shoppingDictionary.findFirst({
    where: {
      familyId: null,
      OR: [
        { key: name.toLowerCase() },
        { synonyms: { has: name.toLowerCase() } }
      ]
    }
  });

  if (globalDictEntry) {
    return globalDictEntry.category as ShoppingCategory;
  }

  // Simple keyword-based categorization as fallback
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') || lowerName.includes('butter')) {
    return 'dairy';
  }
  if (lowerName.includes('bread') || lowerName.includes('bagel') || lowerName.includes('croissant')) {
    return 'bakery';
  }
  if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('lettuce') || lowerName.includes('tomato')) {
    return 'produce';
  }
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || lowerName.includes('turkey')) {
    return 'meat';
  }
  if (lowerName.includes('salmon') || lowerName.includes('tuna') || lowerName.includes('fish')) {
    return 'fish';
  }
  if (lowerName.includes('frozen') || lowerName.includes('ice cream')) {
    return 'frozen';
  }
  if (lowerName.includes('soap') || lowerName.includes('detergent') || lowerName.includes('paper towel')) {
    return 'household';
  }
  if (lowerName.includes('shampoo') || lowerName.includes('toothpaste') || lowerName.includes('deodorant')) {
    return 'personal_care';
  }

  return 'other';
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;
    
    const shoppingItem = await findShoppingItem(params.id, familyId, appUserId, role);

    if (!shoppingItem) {
      return NextResponse.json(
        { error: 'Shopping item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shoppingItem);
  } catch (error) {
    console.error('Get shopping item error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;
    const data = await request.json();

    // Find the shopping item
    const existingItem = await findShoppingItem(params.id, familyId, appUserId, role);

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Shopping item not found' },
        { status: 404 }
      );
    }

    // Validate category if provided
    if (data.category && !SHOPPING_CATEGORIES.includes(data.category)) {
      return NextResponse.json(
        { error: 'Invalid category value' },
        { status: 400 }
      );
    }

    // Validate quantity if provided
    let quantity: number | null = existingItem.quantity;
    if (data.quantity !== undefined) {
      if (data.quantity === null) {
        quantity = null;
      } else {
        quantity = parseFloat(data.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          return NextResponse.json(
            { error: 'Quantity must be a positive number or null' },
            { status: 400 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
      updateData.normalizedName = data.name.trim().toLowerCase();
      
      // Smart re-categorization if name changed but category not explicitly provided
      if (!data.category && data.name.trim() !== existingItem.name) {
        updateData.category = await smartCategorizeItem(data.name, familyId);
      }
    }
    
    if (data.category !== undefined) {
      updateData.category = data.category;
    }
    
    if (data.quantity !== undefined) {
      updateData.quantity = quantity;
    }
    
    if (data.unit !== undefined) {
      updateData.unit = data.unit?.trim() || null;
    }
    
    if (data.isPurchased !== undefined) {
      updateData.isPurchased = Boolean(data.isPurchased);
      
      // Set purchase timestamp when marking as purchased
      if (data.isPurchased && !existingItem.isPurchased) {
        updateData.lastPurchasedAt = new Date();
      }
    }
    
    if (data.sortIndex !== undefined) {
      updateData.sortIndex = parseInt(data.sortIndex);
    }

    // Update the shopping item
    const updatedItem = await prisma.shoppingItem.update({
      where: { id: params.id },
      data: updateData,
      include: {
        list: {
          select: {
            id: true,
            name: true,
            color: true,
            listType: true,
            visibility: true,
          },
        },
      },
    });

    // Update dictionary suggestion hits if item exists in dictionary and name was updated
    if (updateData.normalizedName) {
      await prisma.shoppingDictionary.updateMany({
        where: {
          OR: [
            { familyId, key: updateData.normalizedName },
            { familyId: null, key: updateData.normalizedName }
          ]
        },
        data: {
          suggestionHits: { increment: 1 }
        }
      });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Update shopping item error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;

    // Find the shopping item
    const existingItem = await findShoppingItem(params.id, familyId, appUserId, role);

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Shopping item not found' },
        { status: 404 }
      );
    }

    // Delete the shopping item
    await prisma.shoppingItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Shopping item deleted successfully' });
  } catch (error) {
    console.error('Delete shopping item error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}