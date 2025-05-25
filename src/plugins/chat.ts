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
}