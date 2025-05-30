import { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import { handleSocket } from './sockets';
import jwt from 'jsonwebtoken';
import { logInfo, logWarn, logError } from './utils/logger';
import Redis from 'ioredis';

// In-memory presence map (userId -> Set of sockets)
const presenceMap = new Map<string, Set<any>>();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export default async function (fastify: FastifyInstance) {
  await fastify.register(websocket);

  fastify.get('/ws', { websocket: true }, (socket, req) => {
    logInfo('Incoming WebSocket connection attempt');
    const token = (req.query as any).token;
    let userId: string | undefined;
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.id;
        logInfo(`JWT verified for userId: ${userId}`);
      } catch (err) {
        logWarn('Invalid JWT token, closing socket');
        socket.close();
        return;
      }
    }

    if (!userId) {
      logWarn('No userId provided, closing socket');
      socket.close();
      return;
    }

    // Add socket to presence map
    if (!presenceMap.has(userId)) {
      presenceMap.set(userId, new Set());
    }
    presenceMap.get(userId)!.add(socket);

    logInfo(`User ${userId} connected. Total sockets for user: ${presenceMap.get(userId)!.size}`);

    // Send the full presence state to the newly connected client
    const onlineUserIds = Array.from(presenceMap.keys());
    for (const id of onlineUserIds) {
      socket.send(
        JSON.stringify({
          type: 'presence',
          payload: { userId: id, online: true },
        })
      );
    }

    // Broadcast this user's online presence to others
    broadcastPresence(userId, true);

    // Handle socket messages (your existing logic)
    handleSocket({ socket }, req);

    // On socket close, update presence
    socket.on('close', () => {
      const userSockets = presenceMap.get(userId!);
      if (userSockets) {
        userSockets.delete(socket);
        logInfo(`Socket closed for user ${userId}. Remaining sockets: ${userSockets.size}`);
        if (userSockets.size === 0) {
          presenceMap.delete(userId!);
          logInfo(`User ${userId} is now offline`);
          broadcastPresence(userId!, false);
        }
      }
    });

    socket.on('error', (err: any) => {
      logError(`WebSocket error for user ${userId}:`, err);
    });
  });
}

// Broadcast presence to all connected sockets
function broadcastPresence(userId: string, online: boolean) {
  logInfo(`Broadcasting presence: userId=${userId}, online=${online}`);
  for (const sockets of presenceMap.values()) {
    for (const sock of sockets) {
      try {
        sock.send(
          JSON.stringify({
            type: 'presence',
            payload: { userId, online },
          })
        );
      } catch (e) {
        logWarn('Failed to send presence update', e);
      }
    }
  }
}