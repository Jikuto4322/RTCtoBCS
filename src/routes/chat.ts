import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { clients } from '../sockets'; // Export clients set from sockets.ts
import { convertBigInts } from '../utils/convertBigInts';

const prisma = new PrismaClient();

export default async function (fastify: FastifyInstance) {
  fastify.post('/conversations', async (request, reply) => {
    const { customerId, businessId } = request.body as { customerId: string, businessId: string };
    let conversation = await prisma.conversation.findFirst({
      where: {
        businessId: BigInt(businessId),
        participants: {
          some: { userId: BigInt(customerId) }
        }
      }
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId: BigInt(businessId), // <-- convert to BigInt here
          type: 'DIRECT',
          participants: {
            create: [
              { userId: BigInt(customerId), role: 'CUSTOMER' },
              { userId: BigInt(businessId), role: 'AGENT' }
            ]
          }
        }
      });
    }
    return conversation;
  });

  fastify.get('/conversations', async (request, reply) => {
    const { userId } = request.query as { userId?: string };
    if (!userId) {
      return reply.status(400).send({ error: 'Missing userId in query' });
    }

    // Find all conversations where the agent is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: BigInt(userId),
            role: 'AGENT'
          }
        }
      },
      include: {
        participants: {
          include: { user: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // For each conversation, only include customers in the participants list
    const result = conversations.map(conv => ({
      ...conv,
      customers: conv.participants
        .filter(p => p.role === 'CUSTOMER')
        .map(p => ({
          id: p.user.id.toString(),
          name: p.user.name,
          email: p.user.email
        })),
      // Optionally, include messages or other fields as needed
      messages: conv.messages
    }));

    reply.send(result);
  });

  fastify.post('/messages', async (request, reply) => {
    const { conversationId, senderId, body } = request.body as {
      conversationId: string;
      senderId: string;
      body: string;
    };

    const message = await prisma.message.create({
      data: {
        conversationId: BigInt(conversationId),
        senderId: BigInt(senderId),
        body,
        contentType: 'TEXT',
      },
    });

    // Broadcast to all WebSocket clients
    for (const client of clients) {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(JSON.stringify({
          type: 'message',
          payload: {
            ...message,
            id: message.id.toString(),
            senderId: message.senderId?.toString(),
            conversationId: message.conversationId.toString(),
          },
        }));
      }
    }

    reply.send({
      ...message,
      id: message.id.toString(),
      senderId: message.senderId?.toString(),
      conversationId: message.conversationId.toString(),
    });
  });

  // Mark all unread messages in a conversation as read for a user
  fastify.post('/conversations/:conversationId/read', async (request, reply) => {
    const { conversationId } = request.params as { conversationId: string };
    const { userId } = request.body as { userId: string };

    // Find all unread messages for this user in the conversation
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId: BigInt(conversationId),
        senderId: { not: BigInt(userId) }, // don't mark own messages as unread
        reads: { none: { userId: BigInt(userId) } }
      },
      select: { id: true }
    });

    // Create MessageRead records for each unread message
    if (unreadMessages.length > 0) {
      await prisma.messageRead.createMany({
        data: unreadMessages.map(msg => ({
          messageId: msg.id,
          userId: BigInt(userId),
          readAt: new Date()
        })),
        skipDuplicates: true
      });
    }

    reply.send({ markedRead: unreadMessages.length });
  });
}


