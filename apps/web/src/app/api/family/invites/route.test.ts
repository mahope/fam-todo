import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from './route';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth-config', () => ({
  authOptions: {},
}));
jest.mock('uuid', () => ({
  v4: () => 'mock-invite-token-123',
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/family/invites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/family/invites', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/family/invites');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if user is not admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT', // Not admin
        },
      } as any);

      const request = new NextRequest('http://localhost/api/family/invites');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only administrators can view family invites');
    });

    it('should return family invites for admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      const mockInvites = [
        {
          id: 'invite1',
          email: 'test@example.com',
          role: 'ADULT',
          accepted: false,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          created_at: new Date(),
          inviter: {
            id: 'appuser1',
            displayName: 'Admin User',
            email: 'admin@example.com',
          },
        },
      ];

      mockPrisma.familyInvite.findMany.mockResolvedValue(mockInvites as any);

      const request = new NextRequest('http://localhost/api/family/invites');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockInvites);
    });

    it('should filter by status parameter', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      mockPrisma.familyInvite.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/family/invites?status=ACCEPTED');
      await GET(request);

      expect(mockPrisma.familyInvite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            familyId: 'family1',
            accepted: false,
            expires_at: expect.objectContaining({
              gt: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('POST /api/family/invites', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if user is not admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT',
        },
      } as any);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only administrators can send family invites');
    });

    it('should return 400 if email is missing', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email is required');
    });

    it('should return 400 if role is invalid', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'test@example.com', 
          role: 'INVALID_ROLE' 
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid role');
    });

    it('should return 400 if user is already a family member', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      // Mock existing user
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existinguser',
        email: 'test@example.com',
        appUser: {
          familyId: 'family1',
        },
      } as any);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User is already a member of this family');
    });

    it('should return 400 if pending invite already exists', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      // No existing user
      mockPrisma.user.findFirst.mockResolvedValue(null);

      // Existing pending invite
      mockPrisma.familyInvite.findFirst.mockResolvedValue({
        id: 'existinginvite',
        email: 'test@example.com',
        familyId: 'family1',
        accepted: false,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } as any);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('There is already a pending invite for this email');
    });

    it('should create family invite successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      // No existing user
      mockPrisma.user.findFirst.mockResolvedValue(null);

      // No existing invite
      mockPrisma.familyInvite.findFirst.mockResolvedValue(null);

      // Family exists
      mockPrisma.family.findUnique.mockResolvedValue({
        id: 'family1',
        name: 'Test Family',
      } as any);

      // Created invite
      const mockCreatedInvite = {
        id: 'invite1',
        email: 'test@example.com',
        role: 'ADULT',
        token: 'mock-invite-token-123',
        familyId: 'family1',
        inviterId: 'appuser1',
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000),
        accepted: false,
        inviter: {
          displayName: 'Admin User',
        },
        family: {
          name: 'Test Family',
        },
      };

      mockPrisma.familyInvite.create.mockResolvedValue(mockCreatedInvite as any);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'test@example.com',
          role: 'ADULT',
          expiresInHours: 72,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Family invite sent successfully');
      expect(data.invite.email).toBe('test@example.com');
      expect(data.invite.role).toBe('ADULT');

      // Verify invite was created with correct data
      expect(mockPrisma.familyInvite.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          role: 'ADULT',
          token: 'mock-invite-token-123',
          familyId: 'family1',
          inviterId: 'appuser1',
          expires_at: expect.any(Date),
          accepted: false,
        },
        include: {
          inviter: {
            select: {
              displayName: true,
            },
          },
          family: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    it('should use default role and expiration', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.familyInvite.findFirst.mockResolvedValue(null);
      mockPrisma.family.findUnique.mockResolvedValue({
        id: 'family1',
        name: 'Test Family',
      } as any);

      const mockCreatedInvite = {
        id: 'invite1',
        email: 'test@example.com',
        role: 'ADULT',
        token: 'mock-invite-token-123',
        familyId: 'family1',
        inviterId: 'appuser1',
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000),
        accepted: false,
        inviter: { displayName: 'Admin User' },
        family: { name: 'Test Family' },
      };

      mockPrisma.familyInvite.create.mockResolvedValue(mockCreatedInvite as any);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }), // No role or expiration specified
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invite.role).toBe('ADULT'); // Default role

      // Verify default values were used
      const createCall = mockPrisma.familyInvite.create.mock.calls[0][0];
      expect(createCall.data.role).toBe('ADULT');
      // Expiration should be approximately 72 hours from now (default)
      const expirationTime = new Date(createCall.data.expires_at).getTime();
      const expectedTime = Date.now() + (72 * 60 * 60 * 1000);
      expect(Math.abs(expirationTime - expectedTime)).toBeLessThan(5000); // Within 5 seconds
    });
  });

  describe('DELETE /api/family/invites', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/family/invites?id=invite1', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if user is not admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT',
        },
      } as any);

      const request = new NextRequest('http://localhost/api/family/invites?id=invite1', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    it('should return 400 if invite ID is missing', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      const request = new NextRequest('http://localhost/api/family/invites', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invite ID is required');
    });

    it('should return 404 if invite not found', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      mockPrisma.familyInvite.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/family/invites?id=nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invite not found or already accepted');
    });

    it('should cancel invite successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADMIN',
        },
      } as any);

      const mockInvite = {
        id: 'invite1',
        email: 'test@example.com',
        familyId: 'family1',
        accepted: false,
      };

      mockPrisma.familyInvite.findFirst.mockResolvedValue(mockInvite as any);
      mockPrisma.familyInvite.delete.mockResolvedValue(mockInvite as any);

      const request = new NextRequest('http://localhost/api/family/invites?id=invite1', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Invite cancelled successfully');

      // Verify invite was deleted
      expect(mockPrisma.familyInvite.delete).toHaveBeenCalledWith({
        where: { id: 'invite1' },
      });
    });
  });
});