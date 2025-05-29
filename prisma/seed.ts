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
  const customer1 = await prisma.user.create({
    data: {
      name: 'John Customer',
      email: 'john.customer@gmail.com',
      passwordHash: '$2b$10$eImiTMZG4T8YQ1z5a6Z5uO9f3F7j1k5z5a6Z5uO9f3F7j1k5z5a6Z5', // hashed password for 'password123'
    },
  });
  const customer2 = await prisma.user.create({
    data: {
      name: 'Alice Customer',
      email: 'alice.customer@gmail.com',
      passwordHash: '$2b$10$eImiTMZG4T8YQ1z5a6Z5uO9f3F7j1k5z5a6Z5uO9f3F7j1k5z5a6Z5', // hashed password for 'password123'
    },
  });
  const agent = await prisma.user.create({
    data: {
      name: 'Jane Agent',
      email: 'jane.agent@gmail.com',
      passwordHash: '$2b$10$eImiTMZG4T8YQ1z5a6Z5uO9f3F7j1k5z5a6Z5uO9f3F7j1k5z5a6Z5',
    },
  });

  // Create a Conversations
  const conversation1 = await prisma.conversation.create({
    data: {
      businessId: business1.id,
      type: ConversationType.DIRECT,
      participants: {
        create: [
          {
            userId: customer1.id,
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
    const conversation2 = await prisma.conversation.create({
    data: {
      businessId: business1.id,
      type: ConversationType.DIRECT,
      participants: {
        create: [
          {
            userId: customer2.id,
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
    customer1,
    customer2,
    agent,
    conversation1,
    conversation2
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