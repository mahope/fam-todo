import { NextApiRequest } from 'next';
import { socketService, NextApiResponseServerIO } from '@/lib/socket/server';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    
    const io = socketService.initialize(res.socket.server);
    res.socket.server.io = io;
    
    console.log('Socket.io server initialized');
  } else {
    console.log('Socket.io server already running');
  }
  
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
}