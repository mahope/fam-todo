import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

async function getSessionData() {
  const session = await getServerSession(authOptions);
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

// GET /api/search - Global search across lists, tasks, and folders
export async function GET(request: NextRequest) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'all', 'tasks', 'lists', 'folders'
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

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
        { visibility: 'PRIVATE', ownerId: appUserId },
        ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
      ],
    };

    // Search tasks
    if (!type || type === 'all' || type === 'tasks') {
      const tasks = await prisma.task.findMany({
        where: {
          familyId,
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
          familyId,
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
          familyId,
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
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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