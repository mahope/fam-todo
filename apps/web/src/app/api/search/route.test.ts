import { NextRequest } from 'next/server';
import { GET } from './route';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth-config', () => ({
  authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if query is too short', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT',
        },
      } as any);

      const request = new NextRequest('http://localhost/api/search?q=a');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('at least 2 characters');
    });

    it('should search tasks successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT',
        },
      } as any);

      const mockTasks = [
        {
          id: 'task1',
          title: 'Test Task',
          description: 'Test Description',
          list: {
            id: 'list1',
            name: 'Test List',
            color: '#blue',
            listType: 'TODO',
          },
          owner: {
            id: 'appuser1',
            displayName: 'Test User',
          },
          assignee: null,
          _count: {
            subtasks: 0,
          },
          completed: false,
          created_at: new Date(),
        },
      ];

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks as any);
      (mockPrisma.list.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.folder.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search?q=test&type=tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].title).toBe('Test Task');
      expect(data.tasks[0].type).toBe('task');
      expect(data.tasks[0].relevanceScore).toBeGreaterThan(0);
    });

    it('should search lists successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT',
        },
      } as any);

      const mockLists = [
        {
          id: 'list1',
          name: 'Test List',
          description: 'Test List Description',
          visibility: 'FAMILY',
          owner: {
            id: 'appuser1',
            displayName: 'Test User',
          },
          folder: {
            id: 'folder1',
            name: 'Test Folder',
          },
          _count: {
            tasks: 5,
          },
          updated_at: new Date(),
        },
      ];

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.list.findMany as jest.Mock).mockResolvedValue(mockLists as any);
      (mockPrisma.folder.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search?q=test&type=lists');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lists).toHaveLength(1);
      expect(data.lists[0].name).toBe('Test List');
      expect(data.lists[0].type).toBe('list');
      expect(data.total).toBe(1);
    });

    it('should search folders successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      const mockFolders = [
        {
          id: 'folder1',
          name: 'Test Folder',
          visibility: 'ADULT',
          owner: {
            id: 'appuser1',
            displayName: 'Test User',
          },
          _count: {
            lists: 3,
          },
          updated_at: new Date(),
        },
      ];

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.list.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.folder.findMany as jest.Mock).mockResolvedValue(mockFolders as any);

      const request = new NextRequest('http://localhost/api/search?q=test&type=folders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.folders).toHaveLength(1);
      expect(data.folders[0].name).toBe('Test Folder');
      expect(data.folders[0].type).toBe('folder');
      expect(data.total).toBe(1);
    });

    it('should respect access control for ADULT visibility', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      // Test as CHILD user
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'CHILD',
        },
      } as any);

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.list.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.folder.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);

      // Verify that the query includes access control
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            list: expect.objectContaining({
              OR: expect.arrayContaining([
                { visibility: 'FAMILY' },
                { visibility: 'PRIVATE', ownerId: 'appuser1' },
                // Should NOT include ADULT visibility for CHILD role
              ]),
            }),
          }),
        })
      );
    });

    it('should calculate relevance scores correctly', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT',
        },
      } as any);

      const mockTasks = [
        {
          id: 'task1',
          title: 'exact match',
          description: 'some description',
          list: { id: 'list1', name: 'List', color: '#blue', listType: 'TODO' },
          owner: { id: 'appuser1', displayName: 'User' },
          assignee: null,
          _count: { subtasks: 0 },
          completed: false,
          created_at: new Date(),
        },
        {
          id: 'task2',
          title: 'exact match starts here',
          description: 'some description',
          list: { id: 'list1', name: 'List', color: '#blue', listType: 'TODO' },
          owner: { id: 'appuser1', displayName: 'User' },
          assignee: null,
          _count: { subtasks: 0 },
          completed: false,
          created_at: new Date(),
        },
        {
          id: 'task3',
          title: 'contains exact match somewhere',
          description: 'some description',
          list: { id: 'list1', name: 'List', color: '#blue', listType: 'TODO' },
          owner: { id: 'appuser1', displayName: 'User' },
          assignee: null,
          _count: { subtasks: 0 },
          completed: false,
          created_at: new Date(),
        },
      ];

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks as any);
      (mockPrisma.list.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.folder.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search?q=exact match');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(3);

      // Check that relevance scores are assigned correctly
      const exactMatchTask = data.tasks.find((t: any) => t.title === 'exact match');
      const startsWithTask = data.tasks.find((t: any) => t.title === 'exact match starts here');
      const containsTask = data.tasks.find((t: any) => t.title === 'contains exact match somewhere');

      expect(exactMatchTask.relevanceScore).toBe(110); // 100 (exact) + 10 (short title)
      expect(startsWithTask.relevanceScore).toBe(80); // 80 (starts with)
      expect(containsTask.relevanceScore).toBe(60); // 60 (contains)
    });

    it('should handle search with limit parameter', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT',
        },
      } as any);

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.list.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.folder.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search?q=test&limit=5');
      await GET(request);

      // Verify that limit is passed to database queries
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
      expect(mockPrisma.list.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
      expect(mockPrisma.folder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });
});
