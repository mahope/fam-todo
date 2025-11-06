import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionData } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

// Shopping categories enum
const SHOPPING_CATEGORIES = [
  'bakery', 'produce', 'meat', 'fish', 'dairy', 'frozen', 'pantry', 
  'beverages', 'snacks', 'household', 'personal_care', 'baby', 'pets', 'other'
] as const;

type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];

interface SearchSuggestion {
  id: string;
  key: string;
  category: ShoppingCategory;
  defaultUnit?: string | null;
  scope: 'family' | 'global';
  suggestionHits: number;
  matchType: 'key' | 'synonym';
  matchedText: string;
}

export async function GET(request: NextRequest) {
  try {
    const { familyId } = await getSessionData();
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q')?.trim();
    const category = searchParams.get('category') as ShoppingCategory;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 results
    const includeGlobal = searchParams.get('includeGlobal') !== 'false'; // Default true

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required and must be at least 1 character' },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (category && !SHOPPING_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category value' },
        { status: 400 }
      );
    }

    const queryLower = query.toLowerCase();

    // Build where clause for dictionary search
    const baseWhere: any = {};
    
    if (category) {
      baseWhere.category = category;
    }

    // Search in both family and global dictionaries
    const familyWhere = {
      ...baseWhere,
      familyId,
      OR: [
        { key: { contains: queryLower, mode: 'insensitive' } },
        { synonyms: { has: queryLower } },
        { key: { startsWith: queryLower, mode: 'insensitive' } },
      ],
    };

    const globalWhere = includeGlobal ? {
      ...baseWhere,
      familyId: null,
      OR: [
        { key: { contains: queryLower, mode: 'insensitive' } },
        { synonyms: { has: queryLower } },
        { key: { startsWith: queryLower, mode: 'insensitive' } },
      ],
    } : null;

    // Execute searches
    const [familyResults, globalResults] = await Promise.all([
      prisma.shoppingDictionary.findMany({
        where: familyWhere,
        orderBy: [
          { suggestionHits: 'desc' }, // Most used first
          { key: 'asc' } // Then alphabetical
        ],
        take: limit,
      }),
      globalWhere ? prisma.shoppingDictionary.findMany({
        where: globalWhere,
        orderBy: [
          { suggestionHits: 'desc' },
          { key: 'asc' }
        ],
        take: limit,
      }) : [],
    ]);

    // Process results and create suggestions
    const suggestions: SearchSuggestion[] = [];
    const seenKeys = new Set<string>();

    // Process family results first (higher priority)
    for (const entry of familyResults) {
      if (seenKeys.has(entry.key) || suggestions.length >= limit) continue;
      
      let matchType: 'key' | 'synonym' = 'key';
      let matchedText = entry.key;

      // Check if query matches key or synonym
      if (entry.key.toLowerCase().includes(queryLower)) {
        matchType = 'key';
        matchedText = entry.key;
      } else if (entry.synonyms?.some(syn => syn.toLowerCase().includes(queryLower))) {
        matchType = 'synonym';
        matchedText = entry.synonyms.find(syn => syn.toLowerCase().includes(queryLower)) || entry.key;
      }

      suggestions.push({
        id: entry.id,
        key: entry.key,
        category: entry.category as ShoppingCategory,
        defaultUnit: entry.defaultUnit,
        scope: 'family',
        suggestionHits: entry.suggestionHits,
        matchType,
        matchedText,
      });

      seenKeys.add(entry.key);
    }

    // Process global results (lower priority, fill remaining slots)
    for (const entry of globalResults) {
      if (seenKeys.has(entry.key) || suggestions.length >= limit) continue;
      
      let matchType: 'key' | 'synonym' = 'key';
      let matchedText = entry.key;

      if (entry.key.toLowerCase().includes(queryLower)) {
        matchType = 'key';
        matchedText = entry.key;
      } else if (entry.synonyms?.some(syn => syn.toLowerCase().includes(queryLower))) {
        matchType = 'synonym';
        matchedText = entry.synonyms.find(syn => syn.toLowerCase().includes(queryLower)) || entry.key;
      }

      suggestions.push({
        id: entry.id,
        key: entry.key,
        category: entry.category as ShoppingCategory,
        defaultUnit: entry.defaultUnit,
        scope: 'global',
        suggestionHits: entry.suggestionHits,
        matchType,
        matchedText,
      });

      seenKeys.add(entry.key);
    }

    // Sort suggestions by relevance
    suggestions.sort((a, b) => {
      // Exact matches first
      const aExact = a.key.toLowerCase() === queryLower ? 1 : 0;
      const bExact = b.key.toLowerCase() === queryLower ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;

      // Then prefix matches
      const aPrefix = a.key.toLowerCase().startsWith(queryLower) ? 1 : 0;
      const bPrefix = b.key.toLowerCase().startsWith(queryLower) ? 1 : 0;
      if (aPrefix !== bPrefix) return bPrefix - aPrefix;

      // Family entries over global
      if (a.scope !== b.scope) {
        return a.scope === 'family' ? -1 : 1;
      }

      // Key matches over synonym matches
      if (a.matchType !== b.matchType) {
        return a.matchType === 'key' ? -1 : 1;
      }

      // Most used suggestions first
      if (a.suggestionHits !== b.suggestionHits) {
        return b.suggestionHits - a.suggestionHits;
      }

      // Finally alphabetical
      return a.key.localeCompare(b.key);
    });

    return NextResponse.json({
      query,
      suggestions: suggestions.slice(0, limit),
      meta: {
        total: suggestions.length,
        limit,
        familyResults: familyResults.length,
        globalResults: globalResults.length,
        hasMore: familyResults.length + globalResults.length > limit,
      },
    });
  } catch (error) {
    logger.error('Dictionary search error', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { familyId } = await getSessionData();
    const data = await request.json();

    // This endpoint can be used to record when a suggestion was used
    // to improve future suggestion rankings
    if (!data.key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    const key = data.key.trim().toLowerCase();

    // Increment suggestion hits for the used dictionary entry
    const updatedEntries = await prisma.shoppingDictionary.updateMany({
      where: {
        OR: [
          { familyId, key },
          { familyId: null, key }
        ]
      },
      data: {
        suggestionHits: { increment: 1 }
      }
    });

    if (updatedEntries.count === 0) {
      // Entry doesn't exist - maybe suggest creating it?
      return NextResponse.json(
        { 
          message: 'Dictionary entry not found',
          suggestion: 'Consider adding this item to the dictionary for better future suggestions'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Suggestion usage recorded successfully',
      updatedEntries: updatedEntries.count
    });
  } catch (error) {
    logger.error('Record suggestion usage error', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}