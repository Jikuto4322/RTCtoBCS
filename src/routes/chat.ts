import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function (fastify: FastifyInstance) {
  fastify.post('/conversations', async (request, reply) => {
    const { customerId, businessId } = request.body as { customerId: bigint, businessId: bigint };
    let conversation = await prisma.conversation.findFirst({
      where: {
        businessId,
        participants: {
          some: { userId: customerId }
        }
      }
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId,
          type: 'DIRECT',
          participants: {
            create: [{ userId: customerId, role: 'CUSTOMER' }]
          }
        }
      });
    }
    return conversation;
  });

  fastify.get('/conversations', async (request, reply) => {
    // Optionally, filter by userId or businessId via query params
    const { userId, businessId } = request.query as { userId?: string, businessId?: string };
    const where: any = {};
    if (userId) {
      where.participants = { some: { userId: BigInt(userId) } };
    }
    if (businessId) {
      where.businessId = BigInt(businessId);
    }
    const conversations = await prisma.conversation.findMany({
      where,
      include: { participants: true, messages: true }
    });
    // Convert BigInt and Date fields to string recursively
    function serializeBigIntAndDate(obj: any): any {
      if (Array.isArray(obj)) return obj.map(serializeBigIntAndDate);
      if (obj && typeof obj === 'object') {
        if (obj instanceof Date) return obj.toISOString();
        const newObj: any = {};
        for (const key in obj) {
          if (typeof obj[key] === 'bigint') {
            newObj[key] = obj[key].toString();
          } else if (obj[key] instanceof Date) {
            newObj[key] = obj[key].toISOString();
          } else {
            newObj[key] = serializeBigIntAndDate(obj[key]);
          }
        }
        return newObj;
      }
      return obj;
    }
    return serializeBigIntAndDate(conversations);
  });
}
