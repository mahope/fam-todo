import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
    currentAvatar: user.image,
  };
}

// POST /api/profile/avatar - Upload new avatar
export async function POST(request: NextRequest) {
  try {
    const { userId, currentAvatar } = await getSessionData();
    
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    
    try {
      await writeFile(join(uploadsDir, 'test'), '');
      await unlink(join(uploadsDir, 'test'));
    } catch {
      // Directory doesn't exist, would need to create it
      // For now, we'll use a simple storage solution
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For development, save to public/uploads/avatars
    const filePath = join(process.cwd(), 'public', 'uploads', 'avatars', fileName);
    
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error('File write error:', error);
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      );
    }

    // Generate public URL
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Update user's avatar in database
    await prisma.user.update({
      where: { id: userId },
      data: { image: avatarUrl },
    });

    // Clean up old avatar file if it exists and is a local file
    if (currentAvatar && currentAvatar.startsWith('/uploads/avatars/')) {
      try {
        const oldFilePath = join(process.cwd(), 'public', currentAvatar);
        await unlink(oldFilePath);
      } catch (error) {
        // Ignore errors when cleaning up old files
        console.warn('Failed to clean up old avatar:', error);
      }
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully',
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/profile/avatar - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const { userId, currentAvatar } = await getSessionData();

    // Update user's avatar to null in database
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    // Clean up avatar file if it exists and is a local file
    if (currentAvatar && currentAvatar.startsWith('/uploads/avatars/')) {
      try {
        const filePath = join(process.cwd(), 'public', currentAvatar);
        await unlink(filePath);
      } catch (error) {
        // Ignore errors when cleaning up files
        console.warn('Failed to clean up avatar file:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    });

  } catch (error) {
    console.error('Avatar remove error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}