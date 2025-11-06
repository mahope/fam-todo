import { NextApiRequest } from 'next';
import { socketService, NextApiResponseServerIO } from '@/lib/socket/server';
import { logger } from '@/lib/logger';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    logger.info('Initializing Socket.io server...');

    const io = socketService.initialize(res.socket.server);
    res.socket.server.io = io;

    logger.info('Socket.io server initialized');
  } else {
    logger.info('Socket.io server already running');
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
}