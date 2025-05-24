import { PrismaClient, ConversationType, ParticipantRole, MessageContentType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Businesses
  const business1 = await prisma.business.create({
    data: { name: 'Acme Corp' },
  });
  const business2 = await prisma.business.create({
    data: { name: 'Globex Inc' },
  });

  // Create Users
  const customer = await prisma.user.create({
    data: {
      // Add other required fields as needed
      participants: {},
      messages: {},
    },
  });
  const agent = await prisma.user.create({
    data: {
      // Add other required fields as needed
      participants: {},
      messages: {},
    },
  });

  // Create a Conversation
  const conversation = await prisma.conversation.create({
    data: {
      businessId: business1.id,
      type: ConversationType.DIRECT,
      participants: {
        create: [
          {
            userId: customer.id,
            role: ParticipantRole.CUSTOMER,
          },
          {
            userId: agent.id,
            role: ParticipantRole.AGENT,
          },
        ],
      },
      messages: {
        create: [
          {
            senderId: agent.id,
            contentType: MessageContentType.TEXT,
            body: 'Hello! How can I help you today?',
          },
        ],
      },
    },
    include: { participants: true, messages: true },
  });

  console.log('Seeded data:', {
    business1,
    business2,
    customer,
    agent,
    conversation,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });