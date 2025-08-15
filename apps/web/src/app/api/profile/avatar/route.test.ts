import { NextRequest } from 'next/server';
import { POST, DELETE } from './route';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { writeFile, unlink } from 'fs/promises';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth-config', () => ({
  authOptions: {},
}));
jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;
const mockUnlink = unlink as jest.MockedFunction<typeof unlink>;

describe('/api/profile/avatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/profile/avatar', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const formData = new FormData();
      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if no file is provided', async () => {
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
        image: null,
      } as any);

      const formData = new FormData();
      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file provided');
    });

    it('should return 400 if file is not an image', async () => {
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
        image: null,
      } as any);

      const formData = new FormData();
      const textFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      formData.append('avatar', textFile);

      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File must be an image');
    });

    it('should return 400 if file is too large', async () => {
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
        image: null,
      } as any);

      const formData = new FormData();
      // Create a large file (6MB)
      const largeBuffer = new ArrayBuffer(6 * 1024 * 1024);
      const largeFile = new File([largeBuffer], 'large-image.jpg', { type: 'image/jpeg' });
      formData.append('avatar', largeFile);

      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('File size must be less than 5MB');
    });

    it('should upload avatar successfully', async () => {
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
        image: null,
      } as any);

      mockPrisma.user.update.mockResolvedValue({
        id: 'user1',
        image: '/uploads/avatars/mock-uuid-123.jpg',
      } as any);

      mockWriteFile.mockResolvedValue(undefined);

      const formData = new FormData();
      const imageBuffer = new ArrayBuffer(1024); // 1KB image
      const imageFile = new File([imageBuffer], 'avatar.jpg', { type: 'image/jpeg' });
      formData.append('avatar', imageFile);

      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.avatarUrl).toBe('/uploads/avatars/mock-uuid-123.jpg');
      expect(data.message).toBe('Avatar uploaded successfully');

      // Verify file was written
      expect(mockWriteFile).toHaveBeenCalled();

      // Verify database was updated
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { image: '/uploads/avatars/mock-uuid-123.jpg' },
      });
    });

    it('should clean up old avatar when uploading new one', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      } as any);

      const oldAvatarPath = '/uploads/avatars/old-avatar.jpg';
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        appUser: {
          id: 'appuser1',
          familyId: 'family1',
          role: 'ADULT',
        },
        image: oldAvatarPath,
      } as any);

      mockPrisma.user.update.mockResolvedValue({
        id: 'user1',
        image: '/uploads/avatars/mock-uuid-123.jpg',
      } as any);

      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);

      const formData = new FormData();
      const imageBuffer = new ArrayBuffer(1024);
      const imageFile = new File([imageBuffer], 'new-avatar.jpg', { type: 'image/jpeg' });
      formData.append('avatar', imageFile);

      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify old file was deleted
      expect(mockUnlink).toHaveBeenCalled();
    });

    it('should handle file write errors', async () => {
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
        image: null,
      } as any);

      // Mock file write to fail
      mockWriteFile.mockRejectedValue(new Error('Disk full'));

      const formData = new FormData();
      const imageBuffer = new ArrayBuffer(1024);
      const imageFile = new File([imageBuffer], 'avatar.jpg', { type: 'image/jpeg' });
      formData.append('avatar', imageFile);

      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save file');
    });
  });

  describe('DELETE /api/profile/avatar', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should remove avatar successfully', async () => {
      const currentAvatar = '/uploads/avatars/current-avatar.jpg';
      
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
        image: currentAvatar,
      } as any);

      mockPrisma.user.update.mockResolvedValue({
        id: 'user1',
        image: null,
      } as any);

      mockUnlink.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Avatar removed successfully');

      // Verify database was updated
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { image: null },
      });

      // Verify file was deleted
      expect(mockUnlink).toHaveBeenCalled();
    });

    it('should handle missing avatar gracefully', async () => {
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
        image: null,
      } as any);

      mockPrisma.user.update.mockResolvedValue({
        id: 'user1',
        image: null,
      } as any);

      const request = new NextRequest('http://localhost/api/profile/avatar', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify database was still updated
      expect(mockPrisma.user.update).toHaveBeenCalled();

      // Verify unlink was not called since there was no avatar
      expect(mockUnlink).not.toHaveBeenCalled();
    });
  });
});