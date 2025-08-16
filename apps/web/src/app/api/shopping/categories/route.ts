import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// Shopping categories enum
const SHOPPING_CATEGORIES = [
  'bakery', 'produce', 'meat', 'fish', 'dairy', 'frozen', 'pantry', 
  'beverages', 'snacks', 'household', 'personal_care', 'baby', 'pets', 'other'
] as const;

type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];

// Category display names and colors for better UI
const CATEGORY_INFO = {
  bakery: { 
    name: 'Bakery', 
    color: '#F59E0B',
    description: 'Bread, pastries, and baked goods'
  },
  produce: { 
    name: 'Produce', 
    color: '#10B981',
    description: 'Fresh fruits and vegetables'
  },
  meat: { 
    name: 'Meat', 
    color: '#EF4444',
    description: 'Fresh meat and poultry'
  },
  fish: { 
    name: 'Fish & Seafood', 
    color: '#06B6D4',
    description: 'Fresh fish and seafood'
  },
  dairy: { 
    name: 'Dairy', 
    color: '#F3F4F6',
    description: 'Milk, cheese, yogurt, and dairy products'
  },
  frozen: { 
    name: 'Frozen', 
    color: '#3B82F6',
    description: 'Frozen foods and ice cream'
  },
  pantry: { 
    name: 'Pantry', 
    color: '#8B5CF6',
    description: 'Dry goods, canned items, and staples'
  },
  beverages: { 
    name: 'Beverages', 
    color: '#06B6D4',
    description: 'Drinks, juices, and beverages'
  },
  snacks: { 
    name: 'Snacks', 
    color: '#F59E0B',
    description: 'Chips, cookies, and snack foods'
  },
  household: { 
    name: 'Household', 
    color: '#6B7280',
    description: 'Cleaning supplies and home essentials'
  },
  personal_care: { 
    name: 'Personal Care', 
    color: '#EC4899',
    description: 'Health, beauty, and personal hygiene'
  },
  baby: { 
    name: 'Baby', 
    color: '#F472B6',
    description: 'Baby food, diapers, and baby care'
  },
  pets: { 
    name: 'Pets', 
    color: '#84CC16',
    description: 'Pet food, toys, and pet care'
  },
  other: { 
    name: 'Other', 
    color: '#9CA3AF',
    description: 'Miscellaneous items'
  },
} as const;

async function getSessionData() {
  const session = await getServerSession(authOptions) as any;
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

export async function GET(request: NextRequest) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const { searchParams } = new URL(request.url);
    
    const includeStats = searchParams.get('includeStats') === 'true';
    const listId = searchParams.get('listId');

    // Build base categories array
    const categories = SHOPPING_CATEGORIES.map(category => ({
      id: category,
      name: CATEGORY_INFO[category].name,
      color: CATEGORY_INFO[category].color,
      description: CATEGORY_INFO[category].description,
    }));

    if (!includeStats) {
      return NextResponse.json({ categories });
    }

    // Build where clause for shopping items (family isolation)
    const itemsWhere: any = {
      familyId,
      list: {
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
    };

    // Filter by specific list if provided
    if (listId) {
      itemsWhere.listId = listId;
    }

    // Get item counts by category
    const categoryStats = await Promise.all(
      SHOPPING_CATEGORIES.map(async (category) => {
        const [total, purchased, unpurchased] = await Promise.all([
          prisma.shoppingItem.count({
            where: { ...itemsWhere, category }
          }),
          prisma.shoppingItem.count({
            where: { ...itemsWhere, category, isPurchased: true }
          }),
          prisma.shoppingItem.count({
            where: { ...itemsWhere, category, isPurchased: false }
          }),
        ]);

        return {
          id: category,
          name: CATEGORY_INFO[category].name,
          color: CATEGORY_INFO[category].color,
          description: CATEGORY_INFO[category].description,
          stats: {
            total,
            purchased,
            unpurchased,
            purchasedPercentage: total > 0 ? Math.round((purchased / total) * 100) : 0,
          },
        };
      })
    );

    // Sort categories by total item count (descending) for better UX
    categoryStats.sort((a, b) => b.stats.total - a.stats.total);

    return NextResponse.json({ 
      categories: categoryStats,
      summary: {
        totalCategories: SHOPPING_CATEGORIES.length,
        categoriesWithItems: categoryStats.filter(cat => cat.stats.total > 0).length,
      }
    });
  } catch (error) {
    console.error('Get shopping categories error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Note: This endpoint could be used in the future to create custom categories
    // For now, we use predefined categories, but this provides extensibility
    return NextResponse.json(
      { 
        error: 'Custom categories not supported yet. Use predefined categories.',
        availableCategories: SHOPPING_CATEGORIES
      }, 
      { status: 400 }
    );
  } catch (error) {
    console.error('Create shopping category error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}