import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth/jwt';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface AuthenticatedSocket {
  userId: string;
  appUserId: string;
  familyId: string;
  role: string;
}

// Real-time event types
export interface RealtimeEvent {
  type: 'list_created' | 'list_updated' | 'list_deleted' |
        'task_created' | 'task_updated' | 'task_deleted' | 'task_completed' |
        'folder_created' | 'folder_updated' | 'folder_deleted' |
        'shopping_item_created' | 'shopping_item_updated' | 'shopping_item_deleted' |
        'user_joined' | 'user_left' | 'notification_created';
  data: any;
  familyId: string;
  userId?: string;
  timestamp: string;
}

class SocketService {
  private io: SocketIOServer | null = null;

  initialize(server: NetServer) {
    if (this.io) return this.io;

    this.io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupEventHandlers();
    return this.io;
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const payload = await verifyJwt(token);
        if (!payload) {
          return next(new Error('Invalid authentication token'));
        }

        // Get user details
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          include: { appUser: true },
        });

        if (!user?.appUser) {
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        (socket as any).auth = {
          userId: user.id,
          appUserId: user.appUser.id,
          familyId: user.appUser.familyId,
          role: user.appUser.role,
        } as AuthenticatedSocket;

        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      const auth = (socket as any).auth as AuthenticatedSocket;
      console.log(`User ${auth.appUserId} connected to family ${auth.familyId}`);

      // Join family room
      socket.join(`family:${auth.familyId}`);

      // Join user-specific room for notifications
      socket.join(`user:${auth.appUserId}`);

      // Broadcast user joined
      socket.to(`family:${auth.familyId}`).emit('user_presence', {
        type: 'user_joined',
        userId: auth.appUserId,
        timestamp: new Date().toISOString(),
      });

      // Handle presence updates
      socket.on('update_presence', (data) => {
        socket.to(`family:${auth.familyId}`).emit('user_presence', {
          type: 'presence_update',
          userId: auth.appUserId,
          data,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${auth.appUserId} disconnected from family ${auth.familyId}`);
        
        socket.to(`family:${auth.familyId}`).emit('user_presence', {
          type: 'user_left',
          userId: auth.appUserId,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle real-time collaboration events
      socket.on('task_editing', (data) => {
        socket.to(`family:${auth.familyId}`).emit('task_editing', {
          ...data,
          userId: auth.appUserId,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('list_editing', (data) => {
        socket.to(`family:${auth.familyId}`).emit('list_editing', {
          ...data,
          userId: auth.appUserId,
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  broadcast(event: RealtimeEvent) {
    if (!this.io) return;

    const room = `family:${event.familyId}`;
    
    // Broadcast to family room
    this.io.to(room).emit('realtime_update', event);

    // If it's a user-specific event, also send to user room
    if (event.userId) {
      this.io.to(`user:${event.userId}`).emit('realtime_update', event);
    }
  }

  broadcastToFamily(familyId: string, eventType: string, data: any) {
    if (!this.io) return;

    const event: RealtimeEvent = {
      type: eventType as any,
      data,
      familyId,
      timestamp: new Date().toISOString(),
    };

    this.broadcast(event);
  }

  broadcastToUser(userId: string, eventType: string, data: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('notification', {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectedUsers(familyId: string): Promise<string[]> {
    if (!this.io) return Promise.resolve([]);

    return new Promise((resolve) => {
      this.io!.in(`family:${familyId}`).fetchSockets().then(sockets => {
        const userIds = sockets.map(socket => (socket as any).auth?.appUserId).filter(Boolean);
        resolve([...new Set(userIds)]);
      });
    });
  }

  getInstance() {
    return this.io;
  }
}

export const socketService = new SocketService();

// Helper function to emit real-time events from API routes
export function emitRealtimeEvent(event: RealtimeEvent) {
  socketService.broadcast(event);
}

// Convenience functions for common events
export function emitListUpdate(familyId: string, listId: string, action: 'created' | 'updated' | 'deleted', data?: any) {
  emitRealtimeEvent({
    type: `list_${action}` as any,
    data: { listId, ...data },
    familyId,
    timestamp: new Date().toISOString(),
  });
}

export function emitTaskUpdate(familyId: string, taskId: string, action: 'created' | 'updated' | 'deleted' | 'completed', data?: any) {
  emitRealtimeEvent({
    type: `task_${action}` as any,
    data: { taskId, ...data },
    familyId,
    timestamp: new Date().toISOString(),
  });
}

export function emitFolderUpdate(familyId: string, folderId: string, action: 'created' | 'updated' | 'deleted', data?: any) {
  emitRealtimeEvent({
    type: `folder_${action}` as any,
    data: { folderId, ...data },
    familyId,
    timestamp: new Date().toISOString(),
  });
}