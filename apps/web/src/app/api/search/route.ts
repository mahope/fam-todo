import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { validate, APISchemas } from '@/lib/security/input-validation';

// GET /api/search - Global search across lists, tasks, and folders
export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    
    // Validate search parameters
    const searchData = validate(APISchemas.search, {
      q: searchParams.get('q'),
      type: searchParams.get('type') || 'all',
      limit: searchParams.get('limit') || '20',
    });

    const { q: query, type, limit } = searchData;

    const searchResults = {
      tasks: [],
      lists: [],
      folders: [],
      query,
      total: 0,
    };

    // Build access control conditions
    const accessCondition = {
      OR: [
        { visibility: 'FAMILY' },
        { visibility: 'PRIVATE', ownerId: sessionData.appUserId },
        ...(sessionData.role === 'ADULT' || sessionData.role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
      ],
    };

    // Search tasks
    if (!type || type === 'all' || type === 'tasks') {
      const tasks = await prisma.task.findMany({
        where: {
          familyId: sessionData.familyId,
          list: accessCondition,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } },
          ],
        },
        include: {
          list: {
            select: {
              id: true,
              name: true,
              color: true,
              listType: true,
            },
          },
          owner: {
            select: {
              id: true,
              displayName: true,
            },
          },
          assignee: {
            select: {
              id: true,
              displayName: true,
            },
          },
          _count: {
            select: {
              subtasks: true,
            },
          },
        },
        take: limit,
        orderBy: [
          { completed: 'asc' }, // Show incomplete tasks first
          { created_at: 'desc' },
        ],
      });

      searchResults.tasks = tasks.map(task => ({
        ...task,
        type: 'task',
        relevanceScore: calculateRelevance(query, task.title, task.description),
      }));
    }

    // Search lists
    if (!type || type === 'all' || type === 'lists') {
      const lists = await prisma.list.findMany({
        where: {
          familyId: sessionData.familyId,
          ...accessCondition,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tasks: {
                where: { completed: false },
              },
            },
          },
        },
        take: limit,
        orderBy: [
          { updated_at: 'desc' },
        ],
      });

      searchResults.lists = lists.map(list => ({
        ...list,
        type: 'list',
        relevanceScore: calculateRelevance(query, list.name, list.description),
      }));
    }

    // Search folders
    if (!type || type === 'all' || type === 'folders') {
      const folders = await prisma.folder.findMany({
        where: {
          familyId: sessionData.familyId,
          ...accessCondition,
          name: { contains: query, mode: 'insensitive' },
        },
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
            },
          },
          _count: {
            select: {
              lists: true,
            },
          },
        },
        take: limit,
        orderBy: [
          { updated_at: 'desc' },
        ],
      });

      searchResults.folders = folders.map(folder => ({
        ...folder,
        type: 'folder',
        relevanceScore: calculateRelevance(query, folder.name, null),
      }));
    }

    // Calculate total results
    searchResults.total = searchResults.tasks.length + 
                         searchResults.lists.length + 
                         searchResults.folders.length;

    // Sort all results by relevance if searching across all types
    if (!type || type === 'all') {
      const allResults = [
        ...searchResults.tasks,
        ...searchResults.lists,
        ...searchResults.folders,
      ].sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);

      // Reorganize results by type but maintain overall relevance ordering
      searchResults.tasks = allResults.filter(r => (r as any).type === 'task');
      searchResults.lists = allResults.filter(r => (r as any).type === 'list');
      searchResults.folders = allResults.filter(r => (r as any).type === 'folder');
    }

    return NextResponse.json(searchResults);
  },
  {
    requireAuth: true,
    rateLimitRule: 'search',
    allowedMethods: ['GET'],
  }
);

// Calculate relevance score for search results
function calculateRelevance(query: string, title: string, description?: string | null): number {
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  const descriptionLower = description?.toLowerCase() || '';

  let score = 0;

  // Exact title match gets highest score
  if (titleLower === queryLower) {
    score += 100;
  }
  // Title starts with query
  else if (titleLower.startsWith(queryLower)) {
    score += 80;
  }
  // Title contains query
  else if (titleLower.includes(queryLower)) {
    score += 60;
  }

  // Description matches
  if (description && descriptionLower.includes(queryLower)) {
    score += 20;
  }

  // Boost score for shorter titles (more likely to be relevant)
  if (title.length <= 50) {
    score += 10;
  }

  return score;
}