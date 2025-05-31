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
      console.log('Saving message to DB:', msg.payload);
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
      console.log('Message saved:', saved);

      // Find recipient(s) for the conversation
      const recipientIds = await prisma.participant.findMany({
        where: {
          conversationId: BigInt(msg.payload.conversationId),
          userId: { not: BigInt(msg.payload.senderId) },
        },
        select: { userId: true },
      });

      for (const recipient of recipientIds) {
        // Check if recipient is online (presenceMap or your connection tracking)
        const isOnline = connections.some(
          c => c.userId === recipient.userId.toString()
        );
        if (!isOnline) {
          // Trigger mock push/email
          sendMockPushNotification(recipient.userId.toString(), msg.payload.body);
        }
      }

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

// Mock push/email notification function
function sendMockPushNotification(userId: string, message: string) {
  // In production, this would call an email or push service
  console.log(`[MOCK PUSH] Would notify user ${userId}: "${message}"`);
}