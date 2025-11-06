import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionData } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

// Shopping categories enum for validation
const SHOPPING_CATEGORIES = [
  'bakery', 'produce', 'meat', 'fish', 'dairy', 'frozen', 'pantry', 
  'beverages', 'snacks', 'household', 'personal_care', 'baby', 'pets', 'other'
] as const;

type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];

interface DictionaryFilters {
  category?: ShoppingCategory;
  search?: string;
  scope?: 'family' | 'global' | 'all';
  sortBy?: 'key' | 'category' | 'suggestion_hits' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

function parseDictionaryFilters(searchParams: URLSearchParams): DictionaryFilters {
  return {
    category: (searchParams.get('category') as ShoppingCategory) || undefined,
    search: searchParams.get('search') || undefined,
    scope: (searchParams.get('scope') as 'family' | 'global' | 'all') || 'all',
    sortBy: (searchParams.get('sortBy') as 'key' | 'category' | 'suggestion_hits' | 'created_at') || 'key',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
  };
}

function buildDictionaryWhereClause(familyId: string, filters: DictionaryFilters) {
  const where: any = {};

  // Scope filtering (family vs global entries)
  if (filters.scope === 'family') {
    where.familyId = familyId;
  } else if (filters.scope === 'global') {
    where.familyId = null;
  } else {
    // 'all' - include both family and global
    where.OR = [
      { familyId },
      { familyId: null }
    ];
  }

  // Category filtering
  if (filters.category) {
    where.category = filters.category;
  }

  // Search filtering
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    where.OR = [
      { key: { contains: searchLower, mode: 'insensitive' } },
      { synonyms: { has: searchLower } },
      ...(where.OR || [])
    ];
  }

  return where;
}

export async function GET(request: NextRequest) {
  try {
    const { familyId } = await getSessionData();
    const { searchParams } = new URL(request.url);
    const filters = parseDictionaryFilters(searchParams);

    // Validate pagination limits
    if (filters.limit && filters.limit > 1000) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 1000' }, 
        { status: 400 }
      );
    }

    const where = buildDictionaryWhereClause(familyId, filters);
    
    // Build order by clause
    const orderBy: any = {};
    if (filters.sortBy === 'suggestion_hits') {
      orderBy.suggestionHits = filters.sortOrder;
    } else {
      orderBy[filters.sortBy!] = filters.sortOrder;
    }

    const dictionaryEntries = await prisma.shoppingDictionary.findMany({
      where,
      orderBy,
      take: filters.limit,
      skip: filters.offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.shoppingDictionary.count({ where });

    // Add computed fields
    const entriesWithComputed = dictionaryEntries.map(entry => ({
      ...entry,
      scope: entry.familyId ? 'family' : 'global',
      synonymsCount: entry.synonyms?.length || 0,
    }));

    return NextResponse.json({
      entries: entriesWithComputed,
      pagination: {
        total: totalCount,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
        hasMore: (filters.offset || 0) + (filters.limit || 100) < totalCount,
      },
      filters: {
        availableCategories: SHOPPING_CATEGORIES,
        availableScopes: ['family', 'global', 'all'],
      },
    });
  } catch (error) {
    logger.error('Get dictionary entries error', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { familyId, role } = await getSessionData();
    const data = await request.json();

    // Validate required fields
    if (!data.key || !data.category) {
      return NextResponse.json(
        { error: 'Key and category are required' },
        { status: 400 }
      );
    }

    // Validate category
    if (!SHOPPING_CATEGORIES.includes(data.category)) {
      return NextResponse.json(
        { error: 'Invalid category value' },
        { status: 400 }
      );
    }

    // Only admins can create global dictionary entries
    const isGlobal = data.scope === 'global';
    if (isGlobal && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can create global dictionary entries' },
        { status: 403 }
      );
    }

    // Normalize key
    const key = data.key.trim().toLowerCase();
    
    // Validate synonyms if provided
    const synonyms = Array.isArray(data.synonyms) 
      ? data.synonyms
          .filter((synonym: any) => typeof synonym === 'string')
          .map((synonym: string) => synonym.trim().toLowerCase())
          .filter((synonym: string) => synonym.length > 0)
          .slice(0, 20) // Limit to 20 synonyms
      : [];

    // Check if entry already exists
    const existingEntry = await prisma.shoppingDictionary.findUnique({
      where: {
        familyId_key: {
          familyId: isGlobal ? (null as any) : familyId,
          key
        }
      }
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Dictionary entry already exists for this key' },
        { status: 409 }
      );
    }

    // Create dictionary entry
    const dictionaryEntry = await prisma.shoppingDictionary.create({
      data: {
        key,
        category: data.category,
        defaultUnit: data.defaultUnit?.trim() || null,
        synonyms: synonyms.length > 0 ? synonyms : null,
        familyId: isGlobal ? null : familyId,
        suggestionHits: 0,
      },
    });

    // Add computed fields
    const entryWithComputed = {
      ...dictionaryEntry,
      scope: dictionaryEntry.familyId ? 'family' : 'global',
      synonymsCount: dictionaryEntry.synonyms?.length || 0,
    };

    return NextResponse.json(entryWithComputed, { status: 201 });
  } catch (error) {
    logger.error('Create dictionary entry error', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}