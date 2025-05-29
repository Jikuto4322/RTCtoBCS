import { FastifyRequest } from 'fastify';
import { RawData, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

// In-memory store for demo (replace with Redis/pubsub for production)
export const clients: Set<WebSocket> = new Set();

interface WSConnection {
  socket: any;
  userId: string;
  conversationId: string;
}

const connections: WSConnection[] = [];

const prisma = new PrismaClient();

export function handleSocket(connection: { socket: WebSocket }, req: any) {
  let userId = '';
  let conversationId = '';

  connection.socket.on('message', async (raw: Buffer) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      console.log('Invalid WS message:', raw.toString());
      return;
    }
    console.log('Received WS message:', msg); // <--- Add this line

    // Handle join
    if (msg.type === 'join') {
      userId = msg.payload.userId;
      conversationId = msg.payload.conversationId;
      connections.push({ socket: connection.socket, userId, conversationId });
      console.log(`User ${userId} joined conversation ${conversationId}`);
      return;
    }

    // Handle typing event
    if (msg.type === 'typing') {
      // Broadcast to all other users in the conversation
      connections
        .filter(
          c =>
            c.conversationId === msg.payload.conversationId &&
            c.userId !== msg.payload.senderId // <-- use senderId here
        )
        .forEach(c => {
          c.socket.send(
            JSON.stringify({
              type: 'typing',
              payload: {
                senderId: msg.payload.senderId,         // <-- use senderId
                senderLabel: msg.payload.senderLabel,   // <-- forward senderLabel if needed
                isTyping: msg.payload.isTyping,
                conversationId: msg.payload.conversationId,
              },
            })
          );
        });
      return;
    }

    if (msg.type === 'message') {
      // Save message to DB
      const saved = await prisma.message.create({
        data: {
          conversationId: BigInt(msg.payload.conversationId),
          senderId: BigInt(msg.payload.senderId),
          body: msg.payload.body,
          contentType: 'TEXT',
        },
        include: {
          sender: true, 
        },
      });

      // Broadcast to all users in the conversation
      connections
        .filter(c => c.conversationId === msg.payload.conversationId)
        .forEach(c => {
          c.socket.send(
            JSON.stringify({
              type: 'message',
              payload: {
                ...saved,
                id: saved.id?.toString?.() ?? '',
                conversationId: saved.conversationId?.toString?.() ?? '',
                senderId: saved.senderId != null ? saved.senderId.toString() : null,
                sender: saved.sender ? {
                  ...saved.sender,
                  id: saved.sender.id?.toString?.() ?? '',
                } : undefined,
              },
            })
          );
        });
    }
  });

  connection.socket.on('close', () => {
    // Remove connection on disconnect
    const idx = connections.findIndex(c => c.socket === connection.socket);
    if (idx !== -1) connections.splice(idx, 1);
  });
}