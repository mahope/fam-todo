import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

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

// GET /api/shopping/autocomplete - Get autocomplete suggestions for shopping items
export async function GET(request: NextRequest) {
  try {
    const { familyId } = await getSessionData();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search in dictionary with fuzzy matching
    const dictionaryItems = await prisma.shoppingDictionary.findMany({
      where: {
        OR: [
          // Global entries
          { familyId: null },
          // Family-specific entries
          { familyId },
        ],
        AND: {
          OR: [
            // Direct key match
            { key: { contains: query, mode: 'insensitive' } },
            // Synonym match
            { synonyms: { has: query } },
          ],
        },
      },
      orderBy: [
        // Prioritize exact matches
        { suggestionHits: 'desc' },
        { key: 'asc' },
      ],
      take: limit,
    });

    // Also search recent family shopping items for additional suggestions
    const recentItems = await prisma.shoppingItem.findMany({
      where: {
        familyId,
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        name: true,
        category: true,
        unit: true,
      },
      distinct: ['name'],
      orderBy: {
        created_at: 'desc',
      },
      take: Math.min(5, limit),
    });

    // Combine and format suggestions
    const suggestions = [
      // Dictionary suggestions (higher priority)
      ...dictionaryItems.map(item => ({
        name: item.key,
        category: item.category,
        defaultUnit: item.defaultUnit,
        source: item.familyId ? 'family_dictionary' : 'global_dictionary',
        suggestionHits: item.suggestionHits,
      })),
      // Recent items (lower priority, only if not already in dictionary)
      ...recentItems
        .filter(recent => !dictionaryItems.some(dict => 
          dict.key.toLowerCase() === recent.name.toLowerCase()
        ))
        .map(item => ({
          name: item.name,
          category: item.category || 'other',
          defaultUnit: item.unit,
          source: 'recent_items',
          suggestionHits: 0,
        })),
    ];

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(s => s.name.toLowerCase() === item.name.toLowerCase())
      )
      .slice(0, limit);

    // Update suggestion hit counts for dictionary items
    if (dictionaryItems.length > 0) {
      await prisma.shoppingDictionary.updateMany({
        where: {
          id: { in: dictionaryItems.map(item => item.id) },
        },
        data: {
          suggestionHits: { increment: 1 },
        },
      });
    }

    return NextResponse.json(uniqueSuggestions);
  } catch (error) {
    console.error('Autocomplete error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/shopping/autocomplete - Learn from user input to improve suggestions
export async function POST(request: NextRequest) {
  try {
    const { familyId } = await getSessionData();
    const data = await request.json();

    if (!data.name || !data.category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const key = data.name.trim().toLowerCase();

    // Check if this item already exists in dictionary
    const existingItem = await prisma.shoppingDictionary.findFirst({
      where: {
        OR: [
          { familyId: null },
          { familyId },
        ],
        key,
      },
    });

    if (existingItem) {
      // Just increment hit count
      await prisma.shoppingDictionary.update({
        where: { id: existingItem.id },
        data: { suggestionHits: { increment: 1 } },
      });
    } else {
      // Create new family-specific dictionary entry
      await prisma.shoppingDictionary.create({
        data: {
          key,
          familyId,
          category: data.category,
          defaultUnit: data.unit || null,
          suggestionHits: 1,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Learn from input error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}