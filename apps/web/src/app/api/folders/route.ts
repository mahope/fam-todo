import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api-error-handler';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';

// GET /api/folders - Get all folders for the family
export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { familyId, appUserId, role } = sessionData;

    const folders = await prisma.folder.findMany({
      where: {
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
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
      orderBy: {
        name: 'asc',
      },
    });

      return NextResponse.json(folders);
    } catch (error) {
      return handleApiError(error, { operation: 'get_folders' });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

// POST /api/folders - Create a new folder
export const POST = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { familyId, appUserId } = sessionData;
    const data = await request.json();

    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    if (data.visibility && !['PRIVATE', 'FAMILY', 'ADULT'].includes(data.visibility)) {
      return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 });
    }

    if (data.color && (typeof data.color !== 'string' || !/^#[0-9A-F]{6}$/i.test(data.color))) {
      return NextResponse.json({ error: 'Invalid color format' }, { status: 400 });
    }

    const folder = await prisma.folder.create({
      data: {
        name: data.name.trim(),
        color: data.color || null,
        familyId,
        ownerId: appUserId,
        visibility: data.visibility || 'FAMILY',
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
    });

      logger.info('Folder created', { folderId: folder.id, name: folder.name, ownerId: appUserId });

      return NextResponse.json(folder, { status: 201 });
    } catch (error) {
      return handleApiError(error, { operation: 'create_folder' });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['POST'],
  }
);