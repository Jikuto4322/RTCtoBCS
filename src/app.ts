import Fastify from 'fastify';
import chatPlugin from './plugins/chat';
import cors from '@fastify/cors';

// Export a function to build the Fastify app (for testing or server)
export async function buildApp() {
  const fastify = Fastify({ logger: true });
  await fastify.register(cors, { origin: true });
  await fastify.register(chatPlugin);

  // Minimal GET / route for health check or welcome message
  fastify.get('/', async (request, reply) => {
    return { message: 'ServiHub Chat API is running' };
  });

  return fastify;
}
