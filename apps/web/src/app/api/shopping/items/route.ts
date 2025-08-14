import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// Shopping categories enum for validation
const SHOPPING_CATEGORIES = [
  'bakery', 'produce', 'meat', 'fish', 'dairy', 'frozen', 'pantry', 
  'beverages', 'snacks', 'household', 'personal_care', 'baby', 'pets', 'other'
] as const;

type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];

interface ShoppingItemFilters {
  listId?: string;
  category?: ShoppingCategory;
  purchased?: boolean;
  search?: string;
  sortBy?: 'name' | 'category' | 'created_at' | 'updated_at' | 'sort_index';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

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

function parseShoppingFilters(searchParams: URLSearchParams): ShoppingItemFilters {
  return {
    listId: searchParams.get('listId') || undefined,
    category: (searchParams.get('category') as ShoppingCategory) || undefined,
    purchased: searchParams.get('purchased') ? searchParams.get('purchased') === 'true' : undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as 'name' | 'category' | 'created_at' | 'updated_at' | 'sort_index') || 'sort_index',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
  };
}

function buildShoppingWhereClause(familyId: string, appUserId: string, role: string, filters: ShoppingItemFilters) {
  const where: any = {
    familyId,
    list: {
      OR: [
        { visibility: 'FAMILY' },
        { visibility: 'PRIVATE', ownerId: appUserId },
        ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
      ],
    },
  };

  if (filters.listId) {
    where.listId = filters.listId;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.purchased !== undefined) {
    where.isPurchased = filters.purchased;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { normalizedName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
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

export async function GET(request: NextRequest) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const { searchParams } = new URL(request.url);
    const filters = parseShoppingFilters(searchParams);

    // Validate pagination limits
    if (filters.limit && filters.limit > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100' }, 
        { status: 400 }
      );
    }

    const where = buildShoppingWhereClause(familyId, appUserId, role, filters);
    
    // Build order by clause
    const orderBy: any = {};
    if (filters.sortBy === 'sort_index') {
      orderBy.sortIndex = filters.sortOrder;
    } else {
      orderBy[filters.sortBy!] = filters.sortOrder;
    }

    const shoppingItems = await prisma.shoppingItem.findMany({
      where,
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
      orderBy,
      take: filters.limit,
      skip: filters.offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.shoppingItem.count({ where });

    return NextResponse.json({
      items: shoppingItems,
      pagination: {
        total: totalCount,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        hasMore: (filters.offset || 0) + (filters.limit || 50) < totalCount,
      },
      categories: SHOPPING_CATEGORIES,
    });
  } catch (error) {
    console.error('Get shopping items error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { familyId, appUserId } = await getSessionData();
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.listId) {
      return NextResponse.json(
        { error: 'Name and listId are required' },
        { status: 400 }
      );
    }

    // Verify the list exists, is a shopping list, and user has access
    const list = await prisma.list.findFirst({
      where: {
        id: data.listId,
        familyId,
        listType: 'SHOPPING',
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          // Only include adult visibility if user is adult or admin
          ...(await getSessionData()).role === 'ADULT' || (await getSessionData()).role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : [],
        ],
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'Shopping list not found or access denied' },
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
    let quantity: number | null = null;
    if (data.quantity !== undefined && data.quantity !== null) {
      quantity = parseFloat(data.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Smart categorization if category not provided
    const category = data.category || await smartCategorizeItem(data.name, familyId);

    // Create normalized name for better search
    const normalizedName = data.name.trim().toLowerCase();

    // Get next sort index
    const maxSortIndex = await prisma.shoppingItem.findFirst({
      where: { listId: data.listId },
      select: { sortIndex: true },
      orderBy: { sortIndex: 'desc' },
    });

    const shoppingItem = await prisma.shoppingItem.create({
      data: {
        name: data.name.trim(),
        normalizedName,
        quantity,
        unit: data.unit?.trim() || null,
        category,
        familyId,
        listId: data.listId,
        isPurchased: Boolean(data.isPurchased),
        sortIndex: (maxSortIndex?.sortIndex || 0) + 1,
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

    // Update dictionary suggestion hits if item exists in dictionary
    await prisma.shoppingDictionary.updateMany({
      where: {
        OR: [
          { familyId, key: normalizedName },
          { familyId: null, key: normalizedName }
        ]
      },
      data: {
        suggestionHits: { increment: 1 }
      }
    });

    return NextResponse.json(shoppingItem, { status: 201 });
  } catch (error) {
    console.error('Create shopping item error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}